import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as qldb from 'aws-cdk-lib/aws-qldb';
import { Construct } from 'constructs';

export class DharoharPlatformStack extends cdk.Stack {
  public readonly mediaBucket: s3.Bucket;
  public readonly assetsTable: dynamodb.Table;
  public readonly creatorsTable: dynamodb.Table;
  public readonly userPool: cognito.UserPool;
  public readonly api: apigateway.RestApi;
  public readonly sovereigntyLedger: qldb.CfnLedger;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket for media storage (voice recordings, craft videos)
    this.mediaBucket = new s3.Bucket(this, 'DharoharMediaBucket', {
      bucketName: `dharohar-media-${this.account}-${this.region}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
            s3.HttpMethods.DELETE,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
      lifecycleRules: [
        {
          id: 'DeleteIncompleteMultipartUploads',
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
        },
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // DynamoDB Tables
    this.assetsTable = new dynamodb.Table(this, 'DharoharAssetsTable', {
      tableName: 'dharohar-assets',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'type', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Add GSI for querying by creator
    this.assetsTable.addGlobalSecondaryIndex({
      indexName: 'CreatorIndex',
      partitionKey: { name: 'creatorId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
    });

    // Add GSI for querying by region
    this.assetsTable.addGlobalSecondaryIndex({
      indexName: 'RegionIndex',
      partitionKey: { name: 'region', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
    });

    this.creatorsTable = new dynamodb.Table(this, 'DharoharCreatorsTable', {
      tableName: 'dharohar-creators',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Add GSI for querying by community
    this.creatorsTable.addGlobalSecondaryIndex({
      indexName: 'CommunityIndex',
      partitionKey: { name: 'community', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'region', type: dynamodb.AttributeType.STRING },
    });

    // Cognito User Pool for authentication
    this.userPool = new cognito.UserPool(this, 'DharoharUserPool', {
      userPoolName: 'dharohar-users',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        phone: true,
      },
      autoVerify: {
        email: true,
        phone: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        phoneNumber: {
          required: false,
          mutable: true,
        },
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
      },
      customAttributes: {
        role: new cognito.StringAttribute({ mutable: true }),
        community: new cognito.StringAttribute({ mutable: true }),
        region: new cognito.StringAttribute({ mutable: true }),
        specialization: new cognito.StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      mfa: cognito.Mfa.OPTIONAL,
      mfaSecondFactor: {
        sms: true,
        otp: true,
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // User Pool Client
    const userPoolClient = this.userPool.addClient('DharoharUserPoolClient', {
      userPoolClientName: 'dharohar-client',
      generateSecret: false,
      authFlows: {
        userPassword: true,
        userSrp: true,
        custom: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
      },
    });

    // Identity Pool for AWS resource access
    const identityPool = new cognito.CfnIdentityPool(this, 'DharoharIdentityPool', {
      identityPoolName: 'dharohar_identity_pool',
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [
        {
          clientId: userPoolClient.userPoolClientId,
          providerName: this.userPool.userPoolProviderName,
        },
      ],
    });

    // IAM roles for authenticated users
    const authenticatedRole = new iam.Role(this, 'DharoharAuthenticatedRole', {
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': identityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'),
      ],
    });

    // Grant S3 permissions to authenticated users
    this.mediaBucket.grantReadWrite(authenticatedRole);

    // Attach role to identity pool
    new cognito.CfnIdentityPoolRoleAttachment(this, 'DharoharIdentityPoolRoleAttachment', {
      identityPoolId: identityPool.ref,
      roles: {
        authenticated: authenticatedRole.roleArn,
      },
    });

    // QLDB Ledger for immutable legal records
    this.sovereigntyLedger = new qldb.CfnLedger(this, 'DharoharSovereigntyLedger', {
      name: 'dharohar-sovereignty',
      permissionsMode: 'STANDARD',
      deletionProtection: true,
    });

    // Lambda execution role with necessary permissions
    const lambdaExecutionRole = new iam.Role(this, 'DharoharLambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Grant Lambda permissions to access AWS services
    lambdaExecutionRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'bedrock:InvokeModel',
          'bedrock:InvokeModelWithResponseStream',
          'rekognition:DetectCustomLabels',
          'rekognition:DetectLabels',
          'rekognition:DetectText',
          'textract:AnalyzeDocument',
          'textract:DetectDocumentText',
          'qldb:SendCommand',
          'qldb:ExecuteStatement',
        ],
        resources: ['*'],
      })
    );

    // Grant DynamoDB permissions
    this.assetsTable.grantReadWriteData(lambdaExecutionRole);
    this.creatorsTable.grantReadWriteData(lambdaExecutionRole);

    // Grant S3 permissions
    this.mediaBucket.grantReadWrite(lambdaExecutionRole);

    // API Gateway
    this.api = new apigateway.RestApi(this, 'DharoharApi', {
      restApiName: 'Dharohar Platform API',
      description: 'API for Dharohar Heritage Platform',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
      deployOptions: {
        stageName: 'v1',
      },
    });

    // Create API resource structure
    const bioApi = this.api.root.addResource('bio');
    const craftApi = this.api.root.addResource('craft');
    const passportApi = this.api.root.addResource('passport');
    const marketplaceApi = this.api.root.addResource('marketplace');
    const sovereigntyApi = this.api.root.addResource('sovereignty');

    // Output important values
    new cdk.CfnOutput(this, 'MediaBucketName', {
      value: this.mediaBucket.bucketName,
      description: 'S3 bucket for media storage',
    });

    new cdk.CfnOutput(this, 'AssetsTableName', {
      value: this.assetsTable.tableName,
      description: 'DynamoDB table for heritage assets',
    });

    new cdk.CfnOutput(this, 'CreatorsTableName', {
      value: this.creatorsTable.tableName,
      description: 'DynamoDB table for creators',
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });

    new cdk.CfnOutput(this, 'IdentityPoolId', {
      value: identityPool.ref,
      description: 'Cognito Identity Pool ID',
    });

    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: this.api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'SovereigntyLedgerName', {
      value: this.sovereigntyLedger.name!,
      description: 'QLDB Ledger for legal records',
    });
  }
}
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as path from 'path';
import { Construct } from 'constructs';

export class DharoharMvpStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ─────────────────────────────────────────────────
    // S3 BUCKETS
    // ─────────────────────────────────────────────────
    const mediaBucket = new s3.Bucket(this, 'MediaBucket', {
      bucketName: `dharohar-media-${this.account}`,
      versioned: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [{
        allowedMethods: [
          s3.HttpMethods.PUT,
          s3.HttpMethods.GET,
          s3.HttpMethods.HEAD,
        ],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
        maxAge: 3000,
      }],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const dossiersBucket = new s3.Bucket(this, 'DossiersBucket', {
      bucketName: `dharohar-dossiers-${this.account}`,
      versioned: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // ─────────────────────────────────────────────────
    // DYNAMODB TABLES
    // ─────────────────────────────────────────────────
    const assetsTable = new dynamodb.Table(this, 'AssetsTable', {
      tableName: 'dharohar-assets',
      partitionKey: {
        name: 'assetId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });
    assetsTable.addGlobalSecondaryIndex({
      indexName: 'userId-createdAt-index',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey:      { name: 'createdAt', type: dynamodb.AttributeType.STRING },
    });
    assetsTable.addGlobalSecondaryIndex({
      indexName: 'status-index',
      partitionKey: { name: 'status', type: dynamodb.AttributeType.STRING },
    });

    const creatorsTable = new dynamodb.Table(this, 'CreatorsTable', {
      tableName: 'dharohar-creators',
      partitionKey: {
        name: 'creatorId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // ─────────────────────────────────────────────────
    // COGNITO — User Authentication
    // ─────────────────────────────────────────────────

    // User Pool = the database of all your users
    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'dharohar-creators',

      // Allow creators to sign up themselves
      selfSignUpEnabled: true,

      // Sign in with email
      signInAliases: {
        email: true,
      },

      // Auto verify email after signup
      autoVerify: {
        email: true,
      },

      // Sign up Information of users we want to collect during registration.
      standardAttributes: {
        fullname: {
          required: true,
          mutable:  true,
        },
        email: {
          required: true,
          mutable:  false,
        },
      },

      // Custom attributes specific to Dharohar
      customAttributes: {
        'state':     new cognito.StringAttribute({ mutable: true }),
        'community': new cognito.StringAttribute({ mutable: true }),
        'language':  new cognito.StringAttribute({ mutable: true }),
      },

      // password rules:
      passwordPolicy: {
        minLength:        8,
        requireUppercase: true,
        requireDigits:    true,
        requireSymbols:   false,
      },

      // Email message sent to new users
      userVerification: {
        emailSubject: 'Welcome to Dharohar — Verify Your Email',
        emailBody:    'Thank you for joining Dharohar! Your verification code is {####}',
        emailStyle:   cognito.VerificationEmailStyle.CODE,
      },

      // Delete when stack is destroyed (dev mode)
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // App Client = mobile app uses to talk to Cognito
    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool,
      userPoolClientName: 'dharohar-mobile-app',

      // Allow these login methods
      authFlows: {
        userPassword:    true,  // email + password login
        userSrp:         true,  // secure login (recommended)
        adminUserPassword: true, // for testing via CLI
      },

      // Token expiry times
      accessTokenValidity:  cdk.Duration.hours(1),
      idTokenValidity:      cdk.Duration.hours(1),
      refreshTokenValidity: cdk.Duration.days(30),
    });

    // ─────────────────────────────────────────────────
    // LAMBDA FUNCTIONS
    // ─────────────────────────────────────────────────
    const bioProcessorFn = new nodejs.NodejsFunction(this, 'BioProcessor', {
      functionName: 'dharohar-bio-processor',
      runtime:      lambda.Runtime.NODEJS_20_X,
      entry:        path.join(__dirname, '../backend/lambdas/bio-processor/index.ts'),
      handler:      'handler',
      timeout:      cdk.Duration.seconds(30),
      memorySize:   256,
      environment: {
        MEDIA_BUCKET:    mediaBucket.bucketName,
        DOSSIERS_BUCKET: dossiersBucket.bucketName,
        ASSETS_TABLE:    assetsTable.tableName,
      },
    });

    mediaBucket.grantReadWrite(bioProcessorFn);
    dossiersBucket.grantReadWrite(bioProcessorFn);
    assetsTable.grantReadWriteData(bioProcessorFn);

    // ─────────────────────────────────────────────────
    // API GATEWAY  + COGNITO AUTH 
    // ─────────────────────────────────────────────────
    const api = new apigateway.RestApi(this, 'DharoharApi', {
      restApiName: 'dharohar-api',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
      deployOptions: {
        stageName: 'v1',
      },
    });

    // Cognito Authorizer — checks JWT token on every request
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this, 'CognitoAuthorizer', {
        cognitoUserPools: [userPool],
        authorizerName: 'dharohar-authorizer',
      }
    );

    // ── Route 1: POST /bio/upload (PROTECTED) ─────────
    const bioResource    = api.root.addResource('bio');
    const uploadResource = bioResource.addResource('upload');
    uploadResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(bioProcessorFn),
      {
        // Require valid Cognito token to call this endpoint
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    // ── Route 2: GET /bio/status/{assetId} (PROTECTED)─
    bioResource
      .addResource('status')
      .addResource('{assetId}')
      .addMethod(
        'GET',
        new apigateway.LambdaIntegration(bioProcessorFn),
        {
          authorizer,
          authorizationType: apigateway.AuthorizationType.COGNITO,
        }
      );

    // ── Route 3: GET /health (PUBLIC — no login needed)
    api.root
      .addResource('health')
      .addMethod('GET',
        new apigateway.MockIntegration({
          integrationResponses: [{
            statusCode: '200',
            responseTemplates: {
              'application/json': '{"status":"healthy","service":"dharohar-api"}',
            },
          }],
          passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
          requestTemplates: {
            'application/json': '{"statusCode":200}',
          },
        }),
        { methodResponses: [{ statusCode: '200' }] }
      );

    // ─────────────────────────────────────────────────
    // OUTPUTS
    // ─────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'MediaBucketName', {
      value: mediaBucket.bucketName,
    });
    new cdk.CfnOutput(this, 'DossiersBucketName', {
      value: dossiersBucket.bucketName,
    });
    new cdk.CfnOutput(this, 'AssetsTableName', {
      value: assetsTable.tableName,
    });
    new cdk.CfnOutput(this, 'CreatorsTableName', {
      value: creatorsTable.tableName,
    });
    new cdk.CfnOutput(this, 'BioProcessorFunctionName', {
      value: bioProcessorFn.functionName,
    });
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'Base URL for all API calls',
    });

    // These 3 go into your mobile app .env file
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID — save this!',
    });
    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito App Client ID — save this!',
    });
    new cdk.CfnOutput(this, 'CognitoRegion', {
      value: this.region,
      description: 'AWS Region for Cognito',
    });
  }
}
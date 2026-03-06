import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as qldb from 'aws-cdk-lib/aws-qldb';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
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
          mutable: true,
        },
        email: {
          required: true,
          mutable: false,
        },
      },

      // Custom attributes specific to Dharohar
      customAttributes: {
        'state': new cognito.StringAttribute({ mutable: true }),
        'community': new cognito.StringAttribute({ mutable: true }),
        'language': new cognito.StringAttribute({ mutable: true }),
      },

      // password rules:
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },

      // Email message sent to new users
      userVerification: {
        emailSubject: 'Welcome to Dharohar — Verify Your Email',
        emailBody: 'Thank you for joining Dharohar! Your verification code is {####}',
        emailStyle: cognito.VerificationEmailStyle.CODE,
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
        userPassword: true,  // email + password login
        userSrp: true,  // secure login (recommended)
        adminUserPassword: true, // for testing via CLI
      },

      // Token expiry times
      accessTokenValidity: cdk.Duration.hours(1),
      idTokenValidity: cdk.Duration.hours(1),
      refreshTokenValidity: cdk.Duration.days(30),
    });

    // ─────────────────────────────────────────────────
    // DYNAMODB TABLES
    // ─────────────────────────────────────────────────

    // Users Table — primary store for registered users
    const usersTable = dynamodb.Table.fromTableAttributes(this, 'UsersTable', {
      tableName: 'UsersTable',
      globalIndexes: ['email-index'],
    });

    // Assets Table — heritage asset metadata
    const assetsTable = dynamodb.Table.fromTableAttributes(this, 'AssetsTable', {
      tableName: 'AssetsTable',
      globalIndexes: ['creatorId-index'],
    });

    // Licenses Table — licensing & royalty records
    const licensesTable = dynamodb.Table.fromTableAttributes(this, 'LicensesTable', {
      tableName: 'licensesTable',
      globalIndexes: ['assetId-index'],
    });

    // ─────────────────────────────────────────────────
    // DECENTRALIZED GOVERNANCE (SMART CONTRACT LOGS & SNS)
    // ─────────────────────────────────────────────────
    // AWS QLDB is deprecated for new accounts as of July 2024.
    // We simulate an append-only ledger using DynamoDB tables.
    const licenseContractsTable = new dynamodb.Table(this, 'LicenseContractsTable', {
      tableName: 'LicenseContractsV2',
      partitionKey: { name: 'contractId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const certContractsTable = new dynamodb.Table(this, 'CertificationContractsTable', {
      tableName: 'CertificationContractsV2',
      partitionKey: { name: 'passportId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const notificationsTopic = new sns.Topic(this, 'DharoharNotifications', {
      topicName: `dharohar-notifications-${this.account}`,
    });

    // ─────────────────────────────────────────────────
    // SMART CONTRACT LAMBDAS
    // ─────────────────────────────────────────────────

    const licenseContractLambda = new lambda.Function(this, 'LicenseContractLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('backend/lambdas/license-contract'),
      handler: 'index.handler',
      environment: {
        LEDGER_TABLE: licenseContractsTable.tableName,
        NOTIFICATION_TOPIC_ARN: notificationsTopic.topicArn,
        LICENSES_TABLE: licensesTable.tableName,
      },
    });

    const certificationContractLambda = new lambda.Function(this, 'CertificationContractLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('backend/lambdas/certification-contract'),
      handler: 'index.handler',
      environment: {
        LEDGER_TABLE: certContractsTable.tableName,
        NOTIFICATION_TOPIC_ARN: notificationsTopic.topicArn,
        ASSETS_TABLE: assetsTable.tableName,
      },
    });

    // Grant permissions to the simulated Ledger tables
    licenseContractsTable.grantReadWriteData(licenseContractLambda);
    certContractsTable.grantReadWriteData(certificationContractLambda);

    // Grant Lambda permissions to publish to SNS
    notificationsTopic.grantPublish(licenseContractLambda);
    notificationsTopic.grantPublish(certificationContractLambda);

    // Grant DynamoDB Table permissions
    licensesTable.grantReadWriteData(licenseContractLambda);
    assetsTable.grantReadWriteData(certificationContractLambda);

    // ─────────────────────────────────────────────────
    // OUTPUTS
    // ─────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'MediaBucketName', {
      value: mediaBucket.bucketName,
    });
    new cdk.CfnOutput(this, 'DossiersBucketName', {
      value: dossiersBucket.bucketName,
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

    new cdk.CfnOutput(this, 'UsersTableName', {
      value: usersTable.tableName,
      description: 'DynamoDB Users Table',
    });
    new cdk.CfnOutput(this, 'AssetsTableName', {
      value: assetsTable.tableName,
      description: 'DynamoDB Assets Table',
    });
    new cdk.CfnOutput(this, 'LicensesTableName', {
      value: licensesTable.tableName,
      description: 'DynamoDB Licenses Table',
    });

    new cdk.CfnOutput(this, 'LicenseContractsLedgerTableName', {
      value: licenseContractsTable.tableName,
      description: 'DynamoDB License Contracts Ledger',
    });
    new cdk.CfnOutput(this, 'CertificationContractsLedgerTableName', {
      value: certContractsTable.tableName,
      description: 'DynamoDB Certification Contracts Ledger',
    });
    new cdk.CfnOutput(this, 'NotificationsTopicArn', {
      value: notificationsTopic.topicArn,
      description: 'SNS Notifications Topic ARN',
    });
  }
}
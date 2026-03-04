import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import { Construct } from 'constructs';

export class DharoharMvpStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ─────────────────────────────────────────────────
    // S3 BUCKETS ✅
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
    // DYNAMODB TABLES ✅
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
    // LAMBDA FUNCTION — Bio Processor (NEW ✨)
    // Handles voice upload requests from mobile app
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

    // Give Lambda permission to read/write S3
    mediaBucket.grantReadWrite(bioProcessorFn);
    dossiersBucket.grantReadWrite(bioProcessorFn);

    // Give Lambda permission to read/write DynamoDB
    assetsTable.grantReadWriteData(bioProcessorFn);

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
      description: 'Lambda that handles voice uploads',
    });
  }
}
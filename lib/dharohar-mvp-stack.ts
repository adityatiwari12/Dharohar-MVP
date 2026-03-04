import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
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
    // LAMBDA FUNCTION ✅
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
    // API GATEWAY (NEW ✨)
    // Gives Lambda a real HTTPS URL
    // ─────────────────────────────────────────────────
    const api = new apigateway.RestApi(this, 'DharoharApi', {
      restApiName: 'dharohar-api',

      // Allow mobile app to call this API
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },

      // Stage = version of your API
      deployOptions: {
        stageName: 'v1',
      },
    });

    // ── Route 1: POST /bio/upload ─────────────────────
    // Mobile calls this to get S3 upload URL
    const bioResource = api.root.addResource('bio');
    const uploadResource = bioResource.addResource('upload');

    uploadResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(bioProcessorFn, {
        requestTemplates: {
          'application/json': '{ "statusCode": "200" }',
        },
      })
    );

    // ── Route 2: GET /bio/status/{assetId} ───────────
    // Mobile calls this to check processing status
    const statusResource = bioResource
      .addResource('status')
      .addResource('{assetId}');

    statusResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(bioProcessorFn)
    );

    // ── Route 3: GET /health ──────────────────────────
    // Simple health check — confirms API is running
    const healthResource = api.root.addResource('health');
    healthResource.addMethod(
      'GET',
      new apigateway.MockIntegration({
        integrationResponses: [{
          statusCode: '200',
          responseTemplates: {
            'application/json': '{"status": "healthy", "service": "dharohar-api"}',
          },
        }],
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        requestTemplates: {
          'application/json': '{"statusCode": 200}',
        },
      }),
      {
        methodResponses: [{ statusCode: '200' }],
      }
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

    // Most important output — this is your API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'Base URL for all API calls — save this!',
    });
  }
}
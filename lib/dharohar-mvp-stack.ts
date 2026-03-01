import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DharoharMvpStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ─────────────────────────────────────────────────
    // S3 BUCKETS (already done ✅ — keeping them)
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
    // DYNAMODB TABLE 1 — Assets Table
    // One row for every heritage recording
    // ─────────────────────────────────────────────────
    const assetsTable = new dynamodb.Table(this, 'AssetsTable', {
      tableName: 'dharohar-assets',

      // Primary key — every asset has a unique ID
      partitionKey: {
        name: 'assetId',
        type: dynamodb.AttributeType.STRING,
      },

      // PAY_PER_REQUEST = only pay when you actually use it
      // Free tier: 25 GB storage + 200M requests/month
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,

      // Delete table when stack is destroyed (dev mode)
      removalPolicy: cdk.RemovalPolicy.DESTROY,

      // Stream = sends events when data changes
      // We'll use this later to trigger AI processing
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // ── GSI 1: Query assets by userId ──────────────────
    // "Show me all recordings by creator X"
    assetsTable.addGlobalSecondaryIndex({
      indexName: 'userId-createdAt-index',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: dynamodb.AttributeType.STRING,
      },
    });

    // ── GSI 2: Query assets by status ──────────────────
    // "Show me all recordings that are PENDING processing"
    assetsTable.addGlobalSecondaryIndex({
      indexName: 'status-index',
      partitionKey: {
        name: 'status',
        type: dynamodb.AttributeType.STRING,
      },
    });

    // ─────────────────────────────────────────────────
    // DYNAMODB TABLE 2 — Creators Table
    // One row for every registered creator
    // ─────────────────────────────────────────────────
    const creatorsTable = new dynamodb.Table(this, 'CreatorsTable', {
      tableName: 'dharohar-creators',

      // Primary key — creator's unique ID (from Cognito later)
      partitionKey: {
        name: 'creatorId',
        type: dynamodb.AttributeType.STRING,
      },

      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // ─────────────────────────────────────────────────
    // OUTPUTS — printed after cdk deploy
    // ─────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'MediaBucketName', {
      value: mediaBucket.bucketName,
      description: 'S3 bucket for voice recordings and QR codes',
    });

    new cdk.CfnOutput(this, 'DossiersBucketName', {
      value: dossiersBucket.bucketName,
      description: 'S3 bucket for PDFs and legal documents',
    });

    new cdk.CfnOutput(this, 'AssetsTableName', {
      value: assetsTable.tableName,
      description: 'DynamoDB table for heritage assets',
    });

    new cdk.CfnOutput(this, 'CreatorsTableName', {
      value: creatorsTable.tableName,
      description: 'DynamoDB table for creator profiles',
    });
  }
}
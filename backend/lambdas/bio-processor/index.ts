import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

// ── AWS Clients ───────────────────────────────────────
const s3 = new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' });

const dynamoClient = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(dynamoClient);

// ── Main Handler ──────────────────────────────────────
export const handler = async (event: any) => {
  console.log('Request received:', JSON.stringify(event));

  // Route based on HTTP method and path
  const method = event.httpMethod;
  const path   = event.path;

  try {

    // ── POST /bio/upload ────────────────────────────
    // Mobile calls this to get S3 upload URL
    if (method === 'POST' && path.includes('/bio/upload')) {
      return await handleUpload(event);
    }

    // ── GET /bio/status/{assetId} ───────────────────
    // Mobile calls this to check processing status
    if (method === 'GET' && path.includes('/bio/status')) {
      return await handleGetStatus(event);
    }

    return {
      statusCode: 404,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Route not found' }),
    };

  } catch (error: any) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};

// ── Handler 1: Upload Voice Recording ─────────────────
async function handleUpload(event: any) {
  const body          = JSON.parse(event.body || '{}');
  const dialect       = body.dialect       || 'hi-IN';
  const knowledgeType = body.knowledgeType || 'medicinal';
  const location      = body.location      || {};

  // Get creator ID from Cognito token
  // When user logs in, Cognito puts their ID here automatically
  const userId = event.requestContext?.authorizer?.claims?.sub || 'test-user';
  const userName = event.requestContext?.authorizer?.claims?.name || 'Unknown Creator';

  // Generate unique ID for this recording
  const assetId   = randomUUID();
  const createdAt = new Date().toISOString();
  const s3Key     = `bio/${userId}/${assetId}.webm`;

  // ── Step 1: Generate S3 upload URL ─────────────────
  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket:      process.env.MEDIA_BUCKET!,
      Key:         s3Key,
      ContentType: 'audio/webm',
    }),
    { expiresIn: 300 }
  );

  const downloadUrl = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: process.env.MEDIA_BUCKET!,
      Key:    s3Key,
    }),
    { expiresIn: 3600 }
  );

  // ── Step 2: Save record to DynamoDB ────────────────
  // This tracks the asset through its entire lifecycle
  await dynamo.send(new PutCommand({
    TableName: process.env.ASSETS_TABLE!,
    Item: {
      // Primary key
      assetId,

      // Creator info
      userId,
      userName,

      // Asset details
      type:           'BIO',
      dialect,
      knowledgeType,
      location:       JSON.stringify(location),

      // S3 location
      s3Key,
      mediaBucket:    process.env.MEDIA_BUCKET!,

      // Status tracking — this changes as asset moves through pipeline
      // PENDING_UPLOAD → UPLOADED → TRANSCRIBING → PROCESSED → CERTIFIED
      status:    'PENDING_UPLOAD',

      // Timestamps
      createdAt,
      updatedAt: createdAt,
    },
  }));

  console.log(`Asset ${assetId} created in DynamoDB with status PENDING_UPLOAD`);

  // ── Step 3: Return URLs to mobile app ──────────────
  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      success:     true,
      assetId,
      uploadUrl,
      downloadUrl,
      s3Key,
      message:    'Upload URL ready. You have 5 minutes to upload.',
    }),
  };
}

// ── Handler 2: Get Asset Status ────────────────────────
// Mobile polls this to check if processing is complete
async function handleGetStatus(event: any) {
  // Get assetId from URL path: /bio/status/{assetId}
  const assetId = event.pathParameters?.assetId;

  if (!assetId) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'assetId is required' }),
    };
  }

  // Read from DynamoDB
  const result = await dynamo.send(new GetCommand({
    TableName: process.env.ASSETS_TABLE!,
    Key: { assetId },
  }));

  if (!result.Item) {
    return {
      statusCode: 404,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Asset not found' }),
    };
  }

  // Return current status to mobile app
  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      success:   true,
      assetId:   result.Item.assetId,
      status:    result.Item.status,
      type:      result.Item.type,
      dialect:   result.Item.dialect,
      createdAt: result.Item.createdAt,
      updatedAt: result.Item.updatedAt,

      // Only show these if processing is complete
      transcript:   result.Item.transcript   || null,
      extraction:   result.Item.extraction   || null,
      passportId:   result.Item.passportId   || null,
      dossierUrl:   result.Item.dossierUrl   || null,
    }),
  };
}
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

const s3 = new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' });

export const handler = async (event: any) => {
  console.log('Request received:', JSON.stringify(event));

  try {
    const body          = JSON.parse(event.body || '{}');
    const dialect       = body.dialect       || 'hi-IN';
    const knowledgeType = body.knowledgeType || 'medicinal';
    const assetId       = randomUUID();
    const userId        = 'test-user';

    // Generate upload URL — mobile uses this to upload audio to S3
    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket:      process.env.MEDIA_BUCKET!,
        Key:         `bio/${userId}/${assetId}.webm`,
        ContentType: 'audio/webm',
      }),
      { expiresIn: 300 }
    );

    // Generate download URL — mobile uses this to play audio back
    const downloadUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.MEDIA_BUCKET!,
        Key:    `bio/${userId}/${assetId}.webm`,
      }),
      { expiresIn: 3600 }
    );

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        assetId,
        uploadUrl,
        downloadUrl,
        message: 'You have 5 minutes to upload your recording',
      }),
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
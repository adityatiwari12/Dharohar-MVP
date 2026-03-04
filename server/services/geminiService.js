const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

const MAX_INLINE_BYTES = 10 * 1024 * 1024; // 10 MB cap for inline media

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ── Fetch an S3 file as a base64 buffer ──────────────────────────────────
const fetchMediaFromS3 = async (mediaFileId) => {
    try {
        const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
        const s3 = new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' });
        const BUCKET_NAME = process.env.MEDIA_BUCKET || 'dharohar-media';

        const response = await s3.send(new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: mediaFileId
        }));

        const chunks = [];
        for await (const chunk of response.Body) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        if (buffer.length > MAX_INLINE_BYTES) {
            logger.warn(`[GeminiService] Media file ${mediaFileId} is ${Math.round(buffer.length / 1024 / 1024)}MB — exceeds 10MB cap. Skipping inline media analysis.`);
            return null;
        }

        return {
            base64: buffer.toString('base64'),
            mimeType: response.ContentType || 'audio/mpeg',
            sizeKB: Math.round(buffer.length / 1024)
        };
    } catch (err) {
        logger.error(`[GeminiService] S3 fetch failed: ${err.message}`);
        return null;
    }
};

// ── Build the structured text prompt ───────────────────────────────────────
const buildPrompt = (assetData, hasMedia) => {
    const {
        title, description, type, communityName, recordeeName,
        riskTier, transcript, metadata
    } = assetData;

    const metadataSection = metadata && Object.keys(metadata).length > 0
        ? Object.entries(metadata).map(([k, v]) => `  - ${k}: ${v}`).join('\n')
        : '  (none provided)';

    const knowledgeSection = transcript
        ? `${description}\n\nOral History Transcript:\n${transcript}`
        : description;

    const mediaNote = hasMedia
        ? 'A media file (audio/video recording of this cultural asset) has also been provided inline for your analysis. Consider its sonic character, sentiment, and cultural indicators.'
        : 'No media file was provided for this submission. Base your analysis solely on the text description.';

    return `You are an institutional cultural governance AI assistant working for DHAROHAR, a platform that protects indigenous cultural knowledge.

Analyse the following cultural asset submission and return structured governance metadata.

--- ASSET DETAILS ---
Title: ${title || '(untitled)'}
Asset Type: ${type === 'BIO' ? 'DHAROHAR-BIO (Biological/Ecological Knowledge)' : 'DHAROHAR-SONIC (Sonic/Musical Heritage)'}
Community of Origin: ${communityName || '(unknown)'}
Recordee / Knowledge Holder: ${recordeeName || '(unknown)'}
Submitted Risk Tier (community self-assessment): ${riskTier || 'LOW'}

--- SUBMITTED METADATA ---
${metadataSection}

--- KNOWLEDGE DESCRIPTION / TRANSCRIPT ---
${knowledgeSection || '(no description provided)'}

--- MEDIA ANALYSIS ---
${mediaNote}

--- OUTPUT INSTRUCTIONS ---
Return ONLY valid JSON in EXACTLY this format. No explanation text. No code fences.

{
  "domainClassification": "Biological | Ecological | Ritual | Musical | Agricultural | Medicinal | Other",
  "riskTierSuggestion": "LOW | MEDIUM | HIGH",
  "suggestedLicenseType": "RESEARCH | COMMERCIAL | MEDIA",
  "summary": "Concise 3-4 sentence institutional summary of this submission",
  "sensitiveContentFlag": true,
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}`;
};

// ── Main export ──────────────────────────────────────────────────────────────
/**
 * Generates structured AI governance metadata for a submitted asset.
 * Supports multimodal input: includes the actual media file if available.
 * NEVER throws — returns { aiMetadata: null, aiProcessed: false } on any error.
 *
 * @param {object} assetData - Full asset submission payload
 * @returns {{ aiMetadata: object|null, aiProcessed: boolean }}
 */
const generateAssetMetadata = async (assetData) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            logger.warn('[GeminiService] GEMINI_API_KEY not set — skipping AI analysis.');
            return { aiMetadata: null, aiProcessed: false };
        }

        // 1. Try to fetch media for inline analysis
        let mediaPart = null;
        if (assetData.mediaFileId) {
            logger.info(`[GeminiService] Fetching media file ${assetData.mediaFileId} from S3...`);
            const media = await fetchMediaFromS3(assetData.mediaFileId);
            if (media) {
                mediaPart = { inlineData: { data: media.base64, mimeType: media.mimeType } };
                logger.info(`[GeminiService] Media attached for analysis (${media.sizeKB}KB, ${media.mimeType})`);
            }
        }

        // 2. Build the content parts array (text + optional media)
        const textPart = { text: buildPrompt(assetData, !!mediaPart) };
        const parts = mediaPart ? [textPart, mediaPart] : [textPart];

        // 3. Call Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(parts);
        const responseText = result.response.text();

        // 4. Strip any accidental markdown code fences
        const cleaned = responseText
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```\s*$/i, '')
            .trim();

        const aiMetadata = JSON.parse(cleaned);

        // 5. Validate required keys
        const required = ['domainClassification', 'riskTierSuggestion', 'suggestedLicenseType', 'summary', 'sensitiveContentFlag', 'keywords'];
        for (const key of required) {
            if (!(key in aiMetadata)) throw new Error(`Missing key in AI response: ${key}`);
        }

        logger.info(`[GeminiService] ✓ AI metadata generated successfully. Domain: ${aiMetadata.domainClassification}, Risk: ${aiMetadata.riskTierSuggestion}`);
        return { aiMetadata, aiProcessed: true };

    } catch (error) {
        logger.error(`[GeminiService] ✗ AI metadata generation failed: ${error.message}`);
        return { aiMetadata: null, aiProcessed: false };
    }
};

module.exports = { generateAssetMetadata };

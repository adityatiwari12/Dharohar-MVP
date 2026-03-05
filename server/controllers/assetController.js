const assetService = require('../services/assetService');
const assetDynamoService = require('../services/assetDynamoService');
const { transcribeAudio } = require('../services/transcribeService');
const { analyseAsset } = require('../services/bedrockService');
const logger = require('../utils/logger');

const createAsset = async (req, res, next) => {
    try {
        const asset = await assetService.createAsset(
            req.body,
            req.user.id,
            req.user.communityName
        );
        res.status(201).json(asset);
    } catch (error) {
        next(error);
    }
};

const getMyAssets = async (req, res, next) => {
    try {
        const assets = await assetService.getMyAssets(req.user.id);
        res.status(200).json(assets);
    } catch (error) {
        next(error);
    }
};

const getPendingAssets = async (req, res, next) => {
    try {
        const assets = await assetService.getPendingAssets();
        res.status(200).json(assets);
    } catch (error) {
        next(error);
    }
};

const getPublicAssets = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const result = await assetService.getPublicAssets(page, limit);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const approveAsset = async (req, res, next) => {
    try {
        const asset = await assetService.approveAsset(req.params.id, req.user.id);
        res.status(200).json(asset);
    } catch (error) {
        next(error);
    }
};

const rejectAsset = async (req, res, next) => {
    try {
        const { reviewComment } = req.body;
        const asset = await assetService.rejectAsset(req.params.id, reviewComment, req.user.id);
        res.status(200).json(asset);
    } catch (error) {
        next(error);
    }
};

const getReviewedAssets = async (req, res, next) => {
    try {
        const assets = await assetService.getReviewedAssets();
        res.status(200).json(assets);
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /assets/:id/process
 * Triggers the AI processing pipeline for an asset:
 *   1. Transcribes the asset's audio file via Amazon Transcribe
 *   2. Analyses the transcript with AWS Bedrock (Claude 3 Haiku)
 *   3. Saves results back to DynamoDB
 * Restricted to review / admin roles.
 */
const processAsset = async (req, res, next) => {
    try {
        const assetId = req.params.id;

        // 1. Load the asset
        const asset = await assetDynamoService.getById(assetId);
        if (!asset) {
            return res.status(404).json({ message: 'Asset not found' });
        }
        if (!asset.mediaFileId) {
            return res.status(400).json({ message: 'Asset has no media file to transcribe' });
        }
        if (asset.aiProcessed) {
            return res.status(409).json({ message: 'Asset has already been AI-processed', asset });
        }

        logger.info(`[processAsset] Starting AI pipeline for asset ${assetId} (file: ${asset.mediaFileId})`);

        // 2. Transcribe the audio
        const { transcript } = await transcribeAudio(asset.mediaFileId);

        // 3. Analyse with Bedrock
        const { aiMetadata, aiProcessed } = await analyseAsset(asset, transcript);

        // 4. Persist results to DynamoDB
        const updated = await assetDynamoService.update(assetId, {
            transcript,
            aiMetadata,
            aiProcessed,
            processedAt: new Date().toISOString(),
            processedBy: req.user.id
        });

        logger.info(`[processAsset] ✓ Asset ${assetId} processed. aiProcessed: ${aiProcessed}`);
        res.status(200).json(updated);

    } catch (error) {
        logger.error(`[processAsset] ✗ Pipeline failed: ${error.message}`);
        next(error);
    }
};

module.exports = {
    createAsset,
    getMyAssets,
    getPendingAssets,
    getPublicAssets,
    approveAsset,
    rejectAsset,
    getReviewedAssets,
    processAsset
};

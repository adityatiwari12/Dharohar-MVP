/**
 * Asset service — DynamoDB-backed.
 * Drop-in replacement for the former Mongoose-backed assetService.js.
 * All public function signatures are preserved so controllers need no changes.
 */
const assetDynamoService = require('./assetDynamoService');
const { generateAssetMetadata } = require('./geminiService');
const logger = require('../utils/logger');

const createAsset = async (assetData, userId, communityName) => {
    // Call Gemini AI before DB write (failure must not block the write)
    let aiMetadata;
    let aiProcessed = false;
    try {
        ({ aiMetadata, aiProcessed } = await generateAssetMetadata(assetData));
    } catch (aiErr) {
        logger.warn(`Gemini metadata generation failed (non-fatal): ${aiErr.message}`);
    }

    const asset = await assetDynamoService.createAsset(
        { ...assetData, aiMetadata: aiMetadata || undefined, aiProcessed },
        userId,
        communityName
    );
    return asset;
};

const getMyAssets = async (userId) => {
    return await assetDynamoService.getMyAssets(userId);
};

const getPendingAssets = async () => {
    return await assetDynamoService.getPendingAssets();
};

const getPublicAssets = async (page = 1, limit = 12) => {
    return await assetDynamoService.getPublicAssets(page, limit);
};

const approveAsset = async (assetId, reviewerId) => {
    return await assetDynamoService.approveAsset(assetId, reviewerId);
};

const rejectAsset = async (assetId, reviewComment, reviewerId) => {
    return await assetDynamoService.rejectAsset(assetId, reviewComment, reviewerId);
};

const getReviewedAssets = async () => {
    return await assetDynamoService.getReviewedAssets();
};

module.exports = {
    createAsset,
    getMyAssets,
    getPendingAssets,
    getPublicAssets,
    approveAsset,
    rejectAsset,
    getReviewedAssets
};

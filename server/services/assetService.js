const Asset = require('../models/Asset');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { generateAssetMetadata } = require('./geminiService');
const blockchainService = require('./blockchainService');
const { ethers } = require('ethers');

// Helper: attach computed mediaUrl to an asset plain object
const withMediaUrl = (asset) => {
    const obj = asset.toObject ? asset.toObject() : asset;
    if (obj.mediaFileId) {
        // Must be an ABSOLUTE URL — relative paths get resolved against the
        // frontend origin (e.g. localhost:5173) by the browser, not the backend.
        const origin = process.env.SERVER_ORIGIN || `http://localhost:${process.env.PORT || 5000}`;
        obj.mediaUrl = `${origin}/storage/${obj.mediaFileId}`;
    }
    return obj;
};


// Helper for arrays
const withMediaUrls = (assets) => assets.map(withMediaUrl);

const createAsset = async (assetData, userId, communityName) => {
    // ── Step 1: Call Gemini AI (outside transaction — AI failure must never block DB write)
    const { aiMetadata, aiProcessed } = await generateAssetMetadata(assetData);

    // ── Step 2: Persist asset in a transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const asset = new Asset({
            ...assetData,
            createdBy: userId,
            communityName: communityName,
            approvalStatus: 'PENDING',
            reviewComment: null,
            aiMetadata: aiMetadata || undefined,
            aiProcessed
        });

        if (assetData.mediaFileId) {
            asset.mediaFileId = assetData.mediaFileId;
        }

        const savedAsset = await asset.save({ session });

        await AuditLog.create([{
            userId,
            userRole: 'community',
            action: 'ASSET_CREATE',
            resourceId: savedAsset._id,
            details: `Asset created: ${savedAsset.title} | AI processed: ${aiProcessed}`,
        }], { session });

        await session.commitTransaction();
        return savedAsset;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const getMyAssets = async (userId) => {
    const assets = await Asset.find({ createdBy: userId }).sort({ createdAt: -1 });
    return withMediaUrls(assets);
};

const getPendingAssets = async () => {
    const assets = await Asset.find({ approvalStatus: 'PENDING' })
        .populate('createdBy', 'name email communityName')
        .sort({ createdAt: -1 });
    return withMediaUrls(assets);
};

const getPublicAssets = async (page = 1, limit = 12) => {
    const skip = (page - 1) * limit;
    const [assets, total] = await Promise.all([
        Asset.find({ approvalStatus: 'APPROVED' })
            .select('-transcript -metadata')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Asset.countDocuments({ approvalStatus: 'APPROVED' })
    ]);
    return {
        assets: withMediaUrls(assets),
        total,
        page,
        hasMore: skip + assets.length < total
    };
};

const approveAsset = async (assetId, reviewerId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const asset = await Asset.findById(assetId).session(session);
        if (!asset) throw new Error('Asset not found');

        if (asset.approvalStatus !== 'PENDING') {
            const err = new Error(`Cannot approve asset with status "${asset.approvalStatus}"`);
            err.statusCode = 409;
            throw err;
        }

        asset.approvalStatus = 'APPROVED';
        asset.reviewComment = null;

        // ── Blockchain Sovereignty Vault Registration ──
        // This provides immutable proof of origin.
        const blockchainResult = await blockchainService.registerAsset(
            asset._id.toString(),
            asset.mediaFileId ? asset.mediaFileId.toString() : 'no-media',
            ethers.ZeroAddress // Placeholder until community wallet is verified
        );

        asset.blockchainMetadata = {
            txHash: blockchainResult.txHash,
            onChainId: blockchainResult.onChainId,
            registeredAt: new Date()
        };

        const savedAsset = await asset.save({ session });

        await AuditLog.create([{
            userId: reviewerId,
            userRole: 'review',
            action: 'ASSET_APPROVE',
            resourceId: savedAsset._id,
            details: `Asset approved: ${savedAsset.title}`,
        }], { session });

        await session.commitTransaction();
        return savedAsset;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const rejectAsset = async (assetId, reviewComment, reviewerId) => {
    if (!reviewComment || reviewComment.trim() === '') {
        const err = new Error('Rejection requires a review comment');
        err.statusCode = 400;
        throw err;
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const asset = await Asset.findById(assetId).session(session);
        if (!asset) throw new Error('Asset not found');

        if (asset.approvalStatus !== 'PENDING') {
            const err = new Error(`Cannot reject asset with status "${asset.approvalStatus}"`);
            err.statusCode = 409;
            throw err;
        }

        asset.approvalStatus = 'REJECTED';
        asset.reviewComment = reviewComment;
        const savedAsset = await asset.save({ session });

        await AuditLog.create([{
            userId: reviewerId,
            userRole: 'review',
            action: 'ASSET_REJECT',
            resourceId: savedAsset._id,
            details: `Asset rejected. Reason: ${reviewComment}`,
        }], { session });

        await session.commitTransaction();
        return savedAsset;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const getReviewedAssets = async () => {
    const assets = await Asset.find({ approvalStatus: { $in: ['APPROVED', 'REJECTED'] } })
        .populate('createdBy', 'name email communityName')
        .sort({ updatedAt: -1 });
    return withMediaUrls(assets);
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

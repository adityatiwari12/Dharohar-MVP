const Asset = require('../models/Asset');

const createAsset = async (assetData, userId, communityName) => {
    const asset = new Asset({
        ...assetData,
        createdBy: userId,
        communityName: communityName,
        approvalStatus: 'PENDING',
        reviewComment: null
    });
    return await asset.save();
};

const getMyAssets = async (userId) => {
    return await Asset.find({ createdBy: userId }).sort({ createdAt: -1 });
};

const getPendingAssets = async () => {
    return await Asset.find({ approvalStatus: 'PENDING' })
        .populate('createdBy', 'name email communityName')
        .sort({ createdAt: -1 });
};

const getPublicAssets = async () => {
    // ONLY APPROVED assets exposed publicly — no transcript, no sensitive data
    return await Asset.find({ approvalStatus: 'APPROVED' })
        .select('-transcript -metadata')
        .sort({ createdAt: -1 });
};

const approveAsset = async (assetId) => {
    const asset = await Asset.findById(assetId);
    if (!asset) throw new Error('Asset not found');

    // STATE MACHINE ENFORCEMENT: Only PENDING can be approved
    if (asset.approvalStatus !== 'PENDING') {
        const err = new Error(`Cannot approve asset with status "${asset.approvalStatus}". Only PENDING assets can be approved.`);
        err.statusCode = 409;
        throw err;
    }

    asset.approvalStatus = 'APPROVED';
    asset.reviewComment = null;
    return await asset.save();
};

const rejectAsset = async (assetId, reviewComment) => {
    if (!reviewComment || reviewComment.trim() === '') {
        const err = new Error('Rejection requires a review comment');
        err.statusCode = 400;
        throw err;
    }

    const asset = await Asset.findById(assetId);
    if (!asset) throw new Error('Asset not found');

    // STATE MACHINE ENFORCEMENT: Only PENDING can be rejected
    if (asset.approvalStatus !== 'PENDING') {
        const err = new Error(`Cannot reject asset with status "${asset.approvalStatus}". Only PENDING assets can be rejected.`);
        err.statusCode = 409;
        throw err;
    }

    asset.approvalStatus = 'REJECTED';
    asset.reviewComment = reviewComment;
    return await asset.save();
};

const getReviewedAssets = async () => {
    return await Asset.find({ approvalStatus: { $in: ['APPROVED', 'REJECTED'] } })
        .populate('createdBy', 'name email communityName')
        .sort({ updatedAt: -1 });
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

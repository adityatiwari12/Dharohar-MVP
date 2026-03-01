const Asset = require('../models/Asset');

const createAsset = async (assetData, userId, communityName) => {
    const asset = new Asset({
        ...assetData,
        createdBy: userId,
        communityName: communityName,
        approvalStatus: 'PENDING'
    });
    return await asset.save();
};

const getMyAssets = async (userId) => {
    return await Asset.find({ createdBy: userId });
};

const getPendingAssets = async () => {
    return await Asset.find({ approvalStatus: 'PENDING' }).populate('createdBy', 'name email');
};

const getPublicAssets = async () => {
    // Public Endpoint: Only APPROVED assets, no transcript exposed
    return await Asset.find({ approvalStatus: 'APPROVED' }).select('-transcript');
};

const approveAsset = async (assetId) => {
    const asset = await Asset.findByIdAndUpdate(
        assetId,
        { approvalStatus: 'APPROVED' },
        { new: true }
    );
    if (!asset) throw new Error('Asset not found');
    return asset;
};

const rejectAsset = async (assetId, reviewComment) => {
    if (!reviewComment) {
        throw new Error('Rejection requires a review comment');
    }
    const asset = await Asset.findByIdAndUpdate(
        assetId,
        { approvalStatus: 'REJECTED', reviewComment },
        { new: true }
    );
    if (!asset) throw new Error('Asset not found');
    return asset;
};

module.exports = {
    createAsset,
    getMyAssets,
    getPendingAssets,
    getPublicAssets,
    approveAsset,
    rejectAsset
};

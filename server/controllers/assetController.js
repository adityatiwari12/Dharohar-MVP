const assetService = require('../services/assetService');

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
        const assets = await assetService.getPublicAssets();
        res.status(200).json(assets);
    } catch (error) {
        next(error);
    }
};

const approveAsset = async (req, res, next) => {
    try {
        const asset = await assetService.approveAsset(req.params.id);
        res.status(200).json(asset);
    } catch (error) {
        if (error.statusCode) res.status(error.statusCode);
        next(error);
    }
};

const rejectAsset = async (req, res, next) => {
    try {
        const { reviewComment } = req.body;
        const asset = await assetService.rejectAsset(req.params.id, reviewComment);
        res.status(200).json(asset);
    } catch (error) {
        if (error.statusCode) res.status(error.statusCode);
        next(error);
    }
};

module.exports = {
    createAsset,
    getMyAssets,
    getPendingAssets,
    getPublicAssets,
    approveAsset,
    rejectAsset
};

const assetService = require('../services/assetService');
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

module.exports = {
    createAsset,
    getMyAssets,
    getPendingAssets,
    getPublicAssets,
    approveAsset,
    rejectAsset,
    getReviewedAssets
};

const licenseService = require('../services/licenseService');
const logger = require('../utils/logger');

const applyForLicense = async (req, res, next) => {
    try {
        const license = await licenseService.applyForLicense(req.body, req.user.id);
        res.status(201).json(license);
    } catch (error) {
        next(error);
    }
};

const getMyLicenses = async (req, res, next) => {
    try {
        const licenses = await licenseService.getMyLicenses(req.user.id);
        res.status(200).json(licenses);
    } catch (error) {
        next(error);
    }
};

const getPendingLicenses = async (req, res, next) => {
    try {
        const licenses = await licenseService.getPendingLicenses();
        res.status(200).json(licenses);
    } catch (error) {
        next(error);
    }
};

const getAllLicenses = async (req, res, next) => {
    try {
        const licenses = await licenseService.getAllLicenses();
        res.status(200).json(licenses);
    } catch (error) {
        next(error);
    }
};

const getLicensesForAsset = async (req, res, next) => {
    try {
        const licenses = await licenseService.getLicensesForAsset(req.params.assetId);
        res.status(200).json(licenses);
    } catch (error) {
        next(error);
    }
};

const approveLicense = async (req, res, next) => {
    try {
        const license = await licenseService.approveLicense(req.params.id, req.user.id);
        res.status(200).json(license);
    } catch (error) {
        next(error);
    }
};

const rejectLicense = async (req, res, next) => {
    try {
        const { adminComment } = req.body;
        const license = await licenseService.rejectLicense(req.params.id, adminComment, req.user.id);
        res.status(200).json(license);
    } catch (error) {
        next(error);
    }
};

const requestModification = async (req, res, next) => {
    try {
        const { adminComment } = req.body;
        const license = await licenseService.requestModification(req.params.id, adminComment, req.user.id);
        res.status(200).json(license);
    } catch (error) {
        next(error);
    }
};

const resubmitLicense = async (req, res, next) => {
    try {
        const license = await licenseService.resubmitLicense(
            req.params.id,
            req.body,
            req.user.id
        );
        res.status(200).json(license);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    applyForLicense,
    getMyLicenses,
    getPendingLicenses,
    getAllLicenses,
    getLicensesForAsset,
    approveLicense,
    rejectLicense,
    requestModification,
    resubmitLicense
};

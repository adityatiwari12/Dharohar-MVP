const licenseService = require('../services/licenseService');

const applyForLicense = async (req, res, next) => {
    try {
        const license = await licenseService.applyForLicense(req.body, req.user.id);
        res.status(201).json(license);
    } catch (error) {
        res.status(400);
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

const approveLicense = async (req, res, next) => {
    try {
        const license = await licenseService.approveLicense(req.params.id);
        res.status(200).json(license);
    } catch (error) {
        next(error);
    }
};

const rejectLicense = async (req, res, next) => {
    try {
        const license = await licenseService.rejectLicense(req.params.id);
        res.status(200).json(license);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    applyForLicense,
    getMyLicenses,
    getPendingLicenses,
    approveLicense,
    rejectLicense
};

const License = require('../models/License');
const Asset = require('../models/Asset');
const { generateAgreementText } = require('./agreementService');

const applyForLicense = async (licenseData, userId) => {
    const asset = await Asset.findById(licenseData.assetId);
    if (!asset) {
        throw new Error('Asset not found');
    }
    if (asset.approvalStatus !== 'APPROVED') {
        throw new Error('Can only apply for licenses on approved assets');
    }

    const license = new License({
        ...licenseData,
        applicantId: userId,
        status: 'PENDING'
    });

    return await license.save();
};

const getMyLicenses = async (userId) => {
    return await License.find({ applicantId: userId }).populate('assetId', 'title type');
};

const getPendingLicenses = async () => {
    return await License.find({ status: 'PENDING' }).populate('assetId applicantId');
};

const approveLicense = async (licenseId) => {
    const license = await License.findById(licenseId).populate('assetId');
    if (!license) throw new Error('License not found');

    const agreementText = generateAgreementText(
        license.assetId.title,
        license.assetId.communityName,
        license.licenseType
    );

    license.status = 'APPROVED';
    license.agreementText = agreementText;
    await license.save();

    return license;
};

const rejectLicense = async (licenseId) => {
    const license = await License.findByIdAndUpdate(
        licenseId,
        { status: 'REJECTED' },
        { new: true }
    );
    if (!license) throw new Error('License not found');
    return license;
};

module.exports = {
    applyForLicense,
    getMyLicenses,
    getPendingLicenses,
    approveLicense,
    rejectLicense
};

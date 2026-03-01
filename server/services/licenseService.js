const License = require('../models/License');
const Asset = require('../models/Asset');
const { generateAgreementText } = require('./agreementService');

// Helper: enforce state transitions
const enforceTransition = (currentStatus, allowedFrom, targetStatus) => {
    if (!allowedFrom.includes(currentStatus)) {
        const err = new Error(
            `Invalid state transition: Cannot move from "${currentStatus}" to "${targetStatus}". ` +
            `Only allowed from: [${allowedFrom.join(', ')}].`
        );
        err.statusCode = 409;
        throw err;
    }
};

const applyForLicense = async (licenseData, userId) => {
    const asset = await Asset.findById(licenseData.assetId);
    if (!asset) throw new Error('Asset not found');
    if (asset.approvalStatus !== 'APPROVED') {
        throw new Error('Can only apply for licenses on approved assets');
    }

    const license = new License({
        ...licenseData,
        applicantId: userId,
        status: 'PENDING',
        adminComment: null
    });
    return await license.save();
};

const getMyLicenses = async (userId) => {
    return await License.find({ applicantId: userId })
        .populate('assetId', 'title type communityName')
        .sort({ createdAt: -1 });
};

const getPendingLicenses = async () => {
    // Admin sees PENDING + MODIFICATION_REQUIRED that have been resubmitted (i.e., back to PENDING)
    return await License.find({ status: 'PENDING' })
        .populate('assetId', 'title type communityName')
        .populate('applicantId', 'name email')
        .sort({ updatedAt: -1 });
};

const getAllLicenses = async () => {
    return await License.find()
        .populate('assetId', 'title type communityName')
        .populate('applicantId', 'name email')
        .sort({ updatedAt: -1 });
};

// Get licenses for a specific asset (community visibility — who has been granted a license)
const getLicensesForAsset = async (assetId) => {
    return await License.find({ assetId, status: 'APPROVED' })
        .populate('applicantId', 'name email')
        .sort({ updatedAt: -1 });
};

// ADMIN: PENDING → APPROVED
const approveLicense = async (licenseId) => {
    const license = await License.findById(licenseId).populate('assetId');
    if (!license) throw new Error('License not found');

    enforceTransition(license.status, ['PENDING'], 'APPROVED');

    const agreementText = generateAgreementText(
        license.assetId.title,
        license.assetId.communityName,
        license.licenseType
    );

    license.status = 'APPROVED';
    license.adminComment = null;
    license.agreementText = agreementText;
    return await license.save();
};

// ADMIN: PENDING → REJECTED (comment required)
const rejectLicense = async (licenseId, adminComment) => {
    if (!adminComment || adminComment.trim() === '') {
        const err = new Error('Rejection requires an admin comment explaining the reason');
        err.statusCode = 400;
        throw err;
    }

    const license = await License.findById(licenseId);
    if (!license) throw new Error('License not found');

    enforceTransition(license.status, ['PENDING'], 'REJECTED');

    license.status = 'REJECTED';
    license.adminComment = adminComment;
    return await license.save();
};

// ADMIN: PENDING → MODIFICATION_REQUIRED (comment required)
const requestModification = async (licenseId, adminComment) => {
    if (!adminComment || adminComment.trim() === '') {
        const err = new Error('Modification request requires a comment explaining what needs to be changed');
        err.statusCode = 400;
        throw err;
    }

    const license = await License.findById(licenseId);
    if (!license) throw new Error('License not found');

    enforceTransition(license.status, ['PENDING'], 'MODIFICATION_REQUIRED');

    license.status = 'MODIFICATION_REQUIRED';
    license.adminComment = adminComment;
    return await license.save();
};

// GENERAL USER: MODIFICATION_REQUIRED → PENDING (clears adminComment, updates fields)
const resubmitLicense = async (licenseId, updateData, userId) => {
    const license = await License.findById(licenseId);
    if (!license) throw new Error('License not found');

    // Only the original applicant can resubmit
    if (license.applicantId.toString() !== userId) {
        const err = new Error('Unauthorized: You can only resubmit your own license application');
        err.statusCode = 403;
        throw err;
    }

    enforceTransition(license.status, ['MODIFICATION_REQUIRED'], 'PENDING');

    // Update editable fields
    if (updateData.purpose) license.purpose = updateData.purpose;
    if (updateData.documentation) license.documentation = updateData.documentation;
    if (updateData.fee !== undefined) license.fee = updateData.fee;

    license.status = 'PENDING';
    license.adminComment = null;  // Clear the modification request comment
    return await license.save();
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

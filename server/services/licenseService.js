const License = require('../models/License');
const Asset = require('../models/Asset');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

const applyForLicense = async (licenseData, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const asset = await Asset.findById(licenseData.assetId).session(session);
        if (!asset) throw new Error('Asset not found');

        if (asset.approvalStatus !== 'APPROVED') {
            const err = new Error('Can only apply for licenses on approved assets');
            err.statusCode = 403;
            throw err;
        }

        const license = new License({
            ...licenseData,
            applicantId: userId,
            status: 'PENDING'
        });

        if (licenseData.documentationFileId) {
            license.documentationFileId = licenseData.documentationFileId;
        }

        const savedLicense = await license.save({ session });

        await AuditLog.create([{
            userId,
            userRole: 'general',
            action: 'LICENSE_APPLY',
            resourceId: savedLicense._id,
            details: `License applied for Asset ${license.assetId}. Type: ${license.licenseType}`,
        }], { session });

        await session.commitTransaction();
        return savedLicense;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const getMyLicenses = async (userId) => {
    return await License.find({ applicantId: userId })
        .populate('assetId', 'title communityName')
        .sort({ createdAt: -1 });
};

const getPendingLicenses = async () => {
    return await License.find({ status: 'PENDING' })
        .populate('assetId', 'title communityName')
        .populate('applicantId', 'name email')
        .sort({ updatedAt: -1 });
};

const getAllLicenses = async () => {
    return await License.find()
        .populate('assetId', 'title communityName')
        .populate('applicantId', 'name email')
        .sort({ updatedAt: -1 });
};

const getLicensesForAsset = async (assetId) => {
    return await License.find({ assetId })
        .populate('applicantId', 'name email')
        .sort({ updatedAt: -1 });
};

const approveLicense = async (licenseId, adminId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const license = await License.findById(licenseId).populate('assetId').session(session);
        if (!license) throw new Error('License application not found');

        if (license.status !== 'PENDING') {
            const err = new Error(`Cannot approve license with status "${license.status}"`);
            err.statusCode = 409;
            throw err;
        }

        license.status = 'APPROVED';
        license.adminComment = null;
        license.agreementText = `This agreement is between the Community and the Applicant for the use of ${license.assetId.title}. [Standard Agreement Terms Apply]`;
        const savedLicense = await license.save({ session });

        await AuditLog.create([{
            userId: adminId,
            userRole: 'admin',
            action: 'LICENSE_APPROVE',
            resourceId: savedLicense._id,
            details: `License approved for Asset ${license.assetId._id}`,
        }], { session });

        await session.commitTransaction();
        return savedLicense;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const rejectLicense = async (licenseId, adminComment, adminId) => {
    if (!adminComment || adminComment.trim() === '') {
        const err = new Error('Rejection requires an admin comment');
        err.statusCode = 400;
        throw err;
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const license = await License.findById(licenseId).session(session);
        if (!license) throw new Error('License application not found');

        if (license.status !== 'PENDING') {
            const err = new Error(`Cannot reject license with status "${license.status}"`);
            err.statusCode = 409;
            throw err;
        }

        license.status = 'REJECTED';
        license.adminComment = adminComment;
        const savedLicense = await license.save({ session });

        await AuditLog.create([{
            userId: adminId,
            userRole: 'admin',
            action: 'LICENSE_REJECT',
            resourceId: savedLicense._id,
            details: `License rejected. Reason: ${adminComment}`,
        }], { session });

        await session.commitTransaction();
        return savedLicense;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const requestModification = async (licenseId, adminComment, adminId) => {
    if (!adminComment || adminComment.trim() === '') {
        const err = new Error('Modification request requires a comment');
        err.statusCode = 400;
        throw err;
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const license = await License.findById(licenseId).session(session);
        if (!license) throw new Error('License application not found');

        if (license.status !== 'PENDING') {
            const err = new Error(`Cannot request modification for license with status "${license.status}"`);
            err.statusCode = 409;
            throw err;
        }

        license.status = 'MODIFICATION_REQUIRED';
        license.adminComment = adminComment;
        const savedLicense = await license.save({ session });

        await AuditLog.create([{
            userId: adminId,
            userRole: 'admin',
            action: 'LICENSE_MOD_REQ',
            resourceId: savedLicense._id,
            details: `License modification requested. Comment: ${adminComment}`,
        }], { session });

        await session.commitTransaction();
        return savedLicense;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const resubmitLicense = async (licenseId, updateData, userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const license = await License.findById(licenseId).session(session);
        if (!license) throw new Error('License application not found');

        if (license.applicantId.toString() !== userId.toString()) {
            const err = new Error('Unauthorized');
            err.statusCode = 403;
            throw err;
        }

        if (license.status !== 'MODIFICATION_REQUIRED') {
            const err = new Error('Resubmission only allowed for licenses requiring modification');
            err.statusCode = 409;
            throw err;
        }

        // Update editable fields
        if (updateData.purpose) license.purpose = updateData.purpose;
        if (updateData.documentation) license.documentation = updateData.documentation;
        if (updateData.documentationFileId) license.documentationFileId = updateData.documentationFileId;

        license.status = 'PENDING';
        license.adminComment = null;
        const savedLicense = await license.save({ session });

        await AuditLog.create([{
            userId,
            userRole: 'general',
            action: 'LICENSE_APPLY',
            resourceId: savedLicense._id,
            details: `License resubmitted for Asset ${license.assetId}`,
        }], { session });

        await session.commitTransaction();
        return savedLicense;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
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

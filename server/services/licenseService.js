/**
 * License service — DynamoDB-backed.
 * Drop-in replacement for the former Mongoose-backed licenseService.js.
 * All public function signatures are preserved so controllers need no changes.
 */
const licenseDynamoService = require('./licenseDynamoService');
const assetDynamoService = require('./assetDynamoService');

const applyForLicense = async (licenseData, userId) => {
    // Verify asset exists and is APPROVED
    const asset = await assetDynamoService.getById(licenseData.assetId);
    if (!asset) throw Object.assign(new Error('Asset not found'), { statusCode: 404 });

    if (asset.approvalStatus !== 'APPROVED') {
        throw Object.assign(
            new Error('Can only apply for licenses on approved assets'),
            { statusCode: 403 }
        );
    }

    return await licenseDynamoService.createLicense(licenseData, userId);
};

const getMyLicenses = async (userId) => {
    const licenses = await licenseDynamoService.getByApplicantId(userId);

    // Enrich each license with a minimal asset snapshot (mirrors the .populate('assetId') behaviour)
    return await Promise.all(
        licenses
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(async (l) => {
                const asset = await assetDynamoService.getById(l.assetId);
                if (asset) {
                    const origin = process.env.SERVER_ORIGIN || `http://localhost:${process.env.PORT || 5000}`;
                    return {
                        ...l,
                        assetId: {
                            id: asset.id,
                            title: asset.title,
                            communityName: asset.communityName,
                            type: asset.type,
                            riskTier: asset.riskTier,
                            mediaFileId: asset.mediaFileId,
                            mediaUrl: asset.mediaFileId ? `${origin}/storage/${asset.mediaFileId}` : null
                        }
                    };
                }
                return l;
            })
    );
};

const getPendingLicenses = async () => {
    const licenses = await licenseDynamoService.getPending();
    return await _enrichLicenses(licenses);
};

const getAllLicenses = async () => {
    const licenses = await licenseDynamoService.getAll();
    return await _enrichLicenses(licenses);
};

const getLicensesForAsset = async (assetId) => {
    return await licenseDynamoService.getByAssetId(assetId);
};

const approveLicense = async (licenseId, adminId) => {
    const license = await licenseDynamoService.getById(licenseId);
    const asset = license ? await assetDynamoService.getById(license.assetId) : null;
    return await licenseDynamoService.approveLicense(licenseId, adminId, asset?.title);
};

const rejectLicense = async (licenseId, adminComment, adminId) => {
    return await licenseDynamoService.rejectLicense(licenseId, adminComment, adminId);
};

const requestModification = async (licenseId, adminComment, adminId) => {
    return await licenseDynamoService.requestModification(licenseId, adminComment, adminId);
};

const resubmitLicense = async (licenseId, updateData, userId) => {
    return await licenseDynamoService.resubmitLicense(licenseId, updateData, userId);
};

// ── Private helpers ───────────────────────────────────────────────────────────

async function _enrichLicenses(licenses) {
    const origin = process.env.SERVER_ORIGIN || `http://localhost:${process.env.PORT || 5000}`;

    return await Promise.all(
        licenses
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .map(async (l) => {
                const asset = await assetDynamoService.getById(l.assetId);
                if (asset) {
                    return {
                        ...l,
                        assetId: {
                            id: asset.id,
                            title: asset.title,
                            communityName: asset.communityName,
                            type: asset.type,
                            riskTier: asset.riskTier,
                            mediaFileId: asset.mediaFileId,
                            mediaUrl: asset.mediaFileId ? `${origin}/storage/${asset.mediaFileId}` : null
                        }
                    };
                }
                return l;
            })
    );
}

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

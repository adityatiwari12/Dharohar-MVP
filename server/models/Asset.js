const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['BIO', 'SONIC'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    communityName: {
        type: String,
        required: true
    },
    recordeeName: {
        type: String,
        required: true
    },
    transcript: {
        type: String
    },
    metadata: {
        type: Object
    },
    fingerprint: {
        type: String
    },
    riskTier: {
        type: String
    },
    suggestedLicenseType: {
        type: String
    },
    approvalStatus: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    reviewComment: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Asset', AssetSchema);

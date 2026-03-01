const mongoose = require('mongoose');

const LicenseSchema = new mongoose.Schema({
    assetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset',
        required: true
    },
    applicantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    licenseType: {
        type: String,
        enum: ['RESEARCH', 'COMMERCIAL', 'MEDIA'],
        required: true
    },
    purpose: {
        type: String,
        required: true
    },
    documentation: {
        type: String  // URL or description of supporting documents
    },
    fee: {
        type: Number
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'MODIFICATION_REQUIRED'],
        default: 'PENDING'
    },
    adminComment: {
        type: String,
        default: null
    },
    agreementText: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('License', LicenseSchema);

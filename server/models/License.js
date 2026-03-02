const mongoose = require('mongoose');

const LicenseSchema = new mongoose.Schema({
    assetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset',
        required: true,
        index: true
    },
    applicantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    licenseType: {
        type: String,
        enum: ['RESEARCH', 'COMMERCIAL', 'MEDIA'],
        required: true,
        index: true
    },

    // ── Core fields (all types) ─────────────────────────────
    purpose: {
        type: String,
        required: [true, 'Purpose of use is required'],
        maxlength: [1000, 'Purpose cannot exceed 1000 characters']
    },
    documentation: {
        type: String   // Legacy / External
    },
    documentationFileId: {
        type: mongoose.Schema.Types.ObjectId, // GridFS ID for supporting docs
        index: true
    },

    // ── BIO-RESEARCH specific ───────────────────────────────
    institutionName: { type: String, trim: true },
    researchTitle: { type: String, trim: true },
    researchObjective: { type: String, maxlength: 2000 },
    leadResearcher: { type: String, trim: true },
    irb_ethics_approval: { type: String },
    expectedDuration: { type: String },
    publicationPlan: { type: String },

    // ── BIO-COMMERCIAL specific ─────────────────────────────
    companyName: { type: String, trim: true },
    companyRegistration: { type: String },
    commercialUseDescription: { type: String, maxlength: 2000 },
    productName: { type: String },
    expectedRevenue: { type: String },
    communityBenefitPlan: { type: String },
    proposedRoyaltyRate: { type: String },

    // ── MEDIA (SONIC) specific ──────────────────────────────
    projectTitle: { type: String, trim: true },
    mediaType: { type: String },         // e.g. Film, Documentary, Podcast
    distributionPlatform: { type: String },
    estimatedAudience: { type: String },
    creditingPlan: { type: String },

    // ── Financials ──────────────────────────────────────────
    fee: {
        type: Number,
        min: [0, 'Fee cannot be negative']
    },
    currency: {
        type: String,
        default: 'INR'
    },

    // ── Governance ──────────────────────────────────────────
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'MODIFICATION_REQUIRED'],
        default: 'PENDING',
        index: true
    },
    adminComment: {
        type: String,
        maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    agreementText: {
        type: String
    }
}, { timestamps: true });

// Compound index for application tracking
LicenseSchema.index({ applicantId: 1, assetId: 1 });

module.exports = mongoose.model('License', LicenseSchema);

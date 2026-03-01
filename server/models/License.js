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

    // ── Core fields (all types) ─────────────────────────────
    purpose: {
        type: String,
        required: true
    },
    documentation: {
        type: String   // URL or path to uploaded docs
    },

    // ── BIO-RESEARCH specific ───────────────────────────────
    institutionName: { type: String },
    researchTitle: { type: String },
    researchObjective: { type: String },
    leadResearcher: { type: String },
    irb_ethics_approval: { type: String },   // IRB/ethics board reference or doc
    expectedDuration: { type: String },
    publicationPlan: { type: String },

    // ── BIO-COMMERCIAL specific ─────────────────────────────
    companyName: { type: String },
    companyRegistration: { type: String },
    commercialUseDescription: { type: String },
    productName: { type: String },
    expectedRevenue: { type: String },
    communityBenefitPlan: { type: String },
    proposedRoyaltyRate: { type: String },

    // ── MEDIA (SONIC) specific ──────────────────────────────
    projectTitle: { type: String },
    mediaType: { type: String },         // e.g. Film, Documentary, Podcast
    distributionPlatform: { type: String },
    estimatedAudience: { type: String },
    creditingPlan: { type: String },

    // ── Financials ──────────────────────────────────────────
    fee: { type: Number },

    // ── Governance ──────────────────────────────────────────
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

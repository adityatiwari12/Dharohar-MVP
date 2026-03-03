const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: {
            values: ['BIO', 'SONIC'],
            message: '{VALUE} is not a valid asset type'
        },
        required: [true, 'Asset type is required'],
        index: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    communityName: {
        type: String,
        required: [true, 'Community name is required']
    },
    recordeeName: {
        type: String,
        required: [true, 'Recordee name is required']
    },
    transcript: {
        type: String
    },
    mediaUrl: {
        type: String   // Legacy support / External links
    },
    mediaFileId: {
        type: mongoose.Schema.Types.ObjectId, // GridFS File ID
        index: true
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    riskTier: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'LOW',
        index: true
    },
    approvalStatus: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING',
        index: true
    },
    reviewComment: {
        type: String,
        maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // ── Gemini AI Governance Metadata ──────────────────────────
    aiMetadata: {
        domainClassification: { type: String },
        riskTierSuggestion: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'] },
        suggestedLicenseType: { type: String, enum: ['RESEARCH', 'COMMERCIAL', 'MEDIA'] },
        summary: { type: String },
        sensitiveContentFlag: { type: Boolean },
        keywords: [{ type: String }]
    },
    aiProcessed: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Text index for site-wide search
AssetSchema.index({ title: 'text', description: 'text', communityName: 'text' });

module.exports = mongoose.model('Asset', AssetSchema);

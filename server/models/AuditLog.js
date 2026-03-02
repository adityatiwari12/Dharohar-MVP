const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userRole: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'LOGIN', 'LOGOUT',
            'ASSET_CREATE', 'ASSET_APPROVE', 'ASSET_REJECT',
            'LICENSE_APPLY', 'LICENSE_APPROVE', 'LICENSE_REJECT', 'LICENSE_MOD_REQ',
            'MEDIA_ACCESS'
        ]
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    details: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, { timestamps: true });

// Optimize for common governance queries
AuditLogSchema.index({ userId: 1, action: 1 });
AuditLogSchema.index({ resourceId: 1 });
AuditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);

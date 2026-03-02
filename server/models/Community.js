const mongoose = require('mongoose');

const CommunitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Community name is required'],
        trim: true,
        unique: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    location: {
        type: String,
        required: [true, 'Location/Region is required']
    },
    contactInfo: {
        type: String,
        required: [true, 'Contact info is required']
    },
    leadMember: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    memberCount: {
        type: Number,
        default: 0
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Index for search
CommunitySchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Community', CommunitySchema);

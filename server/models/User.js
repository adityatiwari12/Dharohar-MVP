const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required'],
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: {
      values: ['community', 'review', 'admin', 'general'],
      message: '{VALUE} is not a valid role'
    },
    required: true,
    index: true // Faster RBAC queries
  },
  communityName: {
    type: String,
    trim: true
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
  }
}, { timestamps: true });

// Index for email search (already unique)
module.exports = mongoose.model('User', UserSchema);

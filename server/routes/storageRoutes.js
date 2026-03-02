const express = require('express');
const router = express.Router();
const storageController = require('../controllers/storageController');
const upload = require('../middleware/upload');
const { protect, roleGuard } = require('../middleware/auth');

// Upload file (Any role can upload, but restricted by auth)
router.post('/upload', protect, upload.single('file'), storageController.uploadFile);

// Retrieve/Stream file (Requires auth)
router.get('/:id', protect, storageController.getFile);

// Delete file (Admin only)
router.delete('/:id', protect, roleGuard('admin'), storageController.deleteFile);

module.exports = router;

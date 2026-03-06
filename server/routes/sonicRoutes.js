const express = require('express');
const sonicController = require('../controllers/sonicController');
const { protect, roleGuard } = require('../middleware/auth');

const router = express.Router();

// Playback route (Public for previews)
router.get('/:assetId/play', sonicController.getPlayUrl);

// Require auth for typical uploads
router.use(protect);

router.post('/upload-url', roleGuard(['community']), sonicController.getUploadUrl);
router.post('/metadata', roleGuard(['community']), sonicController.submitMetadata);

module.exports = router;

const express = require('express');
const assetController = require('../controllers/assetController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

const router = express.Router();

// Public endpoint
router.get('/public', assetController.getPublicAssets);

// All routes below require auth
router.use(auth);

// Community role only
router.post('/', roleGuard(['community']), assetController.createAsset);
router.get('/mine', roleGuard(['community']), assetController.getMyAssets);

// Review role only
router.get('/pending', roleGuard(['review']), assetController.getPendingAssets);
router.get('/reviewed', roleGuard(['review']), assetController.getReviewedAssets);
router.patch('/:id/approve', roleGuard(['review']), assetController.approveAsset);
router.patch('/:id/reject', roleGuard(['review']), assetController.rejectAsset);

module.exports = router;

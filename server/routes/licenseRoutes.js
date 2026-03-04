const express = require('express');
const licenseController = require('../controllers/licenseController');
const { protect, roleGuard } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// ── GENERAL user routes ──────────────────────────────────────────────────────
// Apply for license on an approved asset
router.post('/apply', roleGuard(['general']), licenseController.applyForLicense);

// View own license applications (all statuses)
router.get('/mine', roleGuard(['general']), licenseController.getMyLicenses);

// Resubmit after MODIFICATION_REQUIRED
router.patch('/:id/resubmit', roleGuard(['general']), licenseController.resubmitLicense);

// ── COMMUNITY user routes ────────────────────────────────────────────────────
// See which licenses have been granted for their assets
router.get('/for-asset/:assetId', roleGuard(['community']), licenseController.getLicensesForAsset);

// ── ADMIN user routes ────────────────────────────────────────────────────────
// View all pending license applications
router.get('/pending', roleGuard(['admin']), licenseController.getPendingLicenses);

// View all license applications (full admin oversight)
router.get('/all', roleGuard(['admin']), licenseController.getAllLicenses);

// Approve a license application
router.patch('/:id/approve', roleGuard(['admin']), licenseController.approveLicense);

// Reject a license application (adminComment required)
router.patch('/:id/reject', roleGuard(['admin']), licenseController.rejectLicense);

// Request modification (adminComment required — explains what needs to change)
router.patch('/:id/request-modification', roleGuard(['admin']), licenseController.requestModification);

module.exports = router;

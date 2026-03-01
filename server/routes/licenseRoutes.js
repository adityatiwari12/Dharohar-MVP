const express = require('express');
const licenseController = require('../controllers/licenseController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

const router = express.Router();

// All routes require auth
router.use(auth);

// General role only
router.post('/apply', roleGuard(['general']), licenseController.applyForLicense);
router.get('/mine', roleGuard(['general']), licenseController.getMyLicenses);

// Admin role only
router.get('/pending', roleGuard(['admin']), licenseController.getPendingLicenses);
router.patch('/:id/approve', roleGuard(['admin']), licenseController.approveLicense);
router.patch('/:id/reject', roleGuard(['admin']), licenseController.rejectLicense);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getPendingChefs, updateChefVerification } = require('../controllers/adminController');

router.get('/pending-chefs', protect, authorize('Admin'), getPendingChefs);
router.put('/verify-chef', protect, authorize('Admin'), updateChefVerification);

module.exports = router;
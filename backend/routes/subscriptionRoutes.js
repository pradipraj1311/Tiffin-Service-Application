const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { createOrder, verifyPayment } = require('../controllers/subscriptionController');

router.post('/create-order', protect, authorize('Chef'), createOrder);
router.post('/verify-payment', protect, authorize('Chef'), verifyPayment);

module.exports = router;
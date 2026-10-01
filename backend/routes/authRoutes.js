const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyEmail, resendVerification,getMe } = require('../controllers/authController');
const {protect} = require('../middleware/authMiddleware');

router.get('/me', protect, getMe);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
module.exports = router;
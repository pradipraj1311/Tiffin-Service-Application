const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyEmail, resendVerification } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
module.exports = router;
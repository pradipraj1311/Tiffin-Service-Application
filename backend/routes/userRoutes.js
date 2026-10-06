const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { updateUserProfile,addToWaitlist } = require('../controllers/userController');

router.put('/profile', protect, updateUserProfile);
router.post('/waitlist', protect, addToWaitlist);
module.exports = router;

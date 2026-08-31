const express = require('express');
const router = express.Router();
const { getTiffins, getTiffinById, createTiffin } = require('../controllers/tiffinController');
const { protect, authorize } = require('../middleware/authMiddleware');

//  /api/tiffins
router.route('/')
  .get(getTiffins)
  .post(protect, authorize('Chef', 'Admin'), createTiffin);

// /api/tiffins/:id
router.route('/:id')
  .get(getTiffinById);

module.exports = router;

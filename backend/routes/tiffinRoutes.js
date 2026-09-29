const express = require('express');
const router = express.Router();
<<<<<<< Updated upstream
const { getTiffins, getTiffinById, createTiffin } = require('../controllers/tiffinController');
const { protect, authorize } = require('../middleware/authMiddleware');
=======
const {getGlobalFoodItems,updateTiffin,deleteTiffin} = require("../controllers/tiffinController");
const {
  getTiffins,
  getTiffinById,
  createTiffin,
} = require("../controllers/tiffinController");
const { protect, authorize } = require("../middleware/authMiddleware");
>>>>>>> Stashed changes

//  /api/tiffins
router.route('/')
  .get(getTiffins)
<<<<<<< Updated upstream
  .post(protect, authorize('Chef', 'Admin'), createTiffin);

// /api/tiffins/:id
router.route('/:id')
  .get(getTiffinById);
=======
  .post(protect, authorize("Chef", "Admin"), createTiffin);
  


router.route("/food-items").get(getGlobalFoodItems);
router.route("/:id").get(getTiffinById);
router.route("/:id").put(protect, authorize('Chef', 'Admin'), updateTiffin)
router.route(":id").delete(protect, authorize('Chef', 'Admin'), deleteTiffin);

>>>>>>> Stashed changes

module.exports = router;

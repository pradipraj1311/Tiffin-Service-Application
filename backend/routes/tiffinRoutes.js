const express = require("express");
const router = express.Router();
const { getGlobalFoodItems, updateTiffin, deleteTiffin } = require("../controllers/tiffinController");
const {
  getTiffins,
  getTiffinById,
  createTiffin,
} = require("../controllers/tiffinController");
const { protect, authorize, checkChefAccess } = require("../middleware/authMiddleware");

router.route("/food-items").get(getGlobalFoodItems);


router
  .route("/")
  .get(getTiffins)
  .post(protect, authorize('Chef', 'Admin'), createTiffin);

router.route('/:id')
  .get(getTiffinById);
router.route(':id').post(protect, authorize("Chef", "Admin"), createTiffin);



router.route("/:id").get(getTiffinById);
router.route("/:id").put(protect, authorize('Chef', 'Admin'), updateTiffin)
router.route(":id").delete(protect, authorize('Chef', 'Admin'), deleteTiffin);


router.route("/:id").get(getTiffinById);

module.exports = router;

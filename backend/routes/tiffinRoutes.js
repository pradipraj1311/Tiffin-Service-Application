const express = require("express");
const router = express.Router();
const { 
  getGlobalFoodItems, 
  updateTiffin, 
  deleteTiffin, 
  getNearbyTiffins,
  getTiffinById,
  createTiffin ,
  getChefTiffins
} = require("../controllers/tiffinController");
const { protect, authorize, checkChefAccess } = require("../middleware/authMiddleware");

router.route("/food-items").get(getGlobalFoodItems);
router.route("/nearby").get(protect, authorize('Customer'), getNearbyTiffins);

router.route("/")
  .post(protect, authorize('Chef', 'Admin'), checkChefAccess, createTiffin);

router.route("/:id")
  .get(getTiffinById)
  .put(protect, authorize('Chef', 'Admin'), updateTiffin)
  .delete(protect, authorize('Chef', 'Admin'), deleteTiffin);
router.get("/", protect, authorize('Chef', 'Admin'), getChefTiffins);

module.exports = router;
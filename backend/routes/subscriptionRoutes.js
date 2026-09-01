const express = require("express");
const router = express.Router();
const {
  getPlans,
  subscribe,
  getSubscription,
  getSubscriptionStatus,
  cancelSubscription,
} = require("../controllers/subscriptionController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.route("/plans").get(getPlans);

router.route("/").post(protect, authorize("Chef"), subscribe);

router.route("/:id").get(protect, getSubscription);

router.route("/:id/status").get(protect, getSubscriptionStatus);

router.route("/:id/cancel").put(protect, cancelSubscription);

module.exports = router;

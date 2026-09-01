const express = require("express");
const router = express.Router();
const {
  createPayment,
  getPaymentById,
  getPaymentStatus,
  refundPayment,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").post(protect, createPayment);

router.route("/:id").get(protect, getPaymentById);

router.route("/:id/status").get(protect, getPaymentStatus);

router.route("/:id/refund").post(protect, refundPayment);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/authMiddleware");

router
  .route("/")
  .post(protect, authorize("Customer"), createOrder)
  .get(protect, authorize("Customer"), getUserOrders);

router.route("/:id").get(protect, getOrderById).delete(protect, cancelOrder);

module.exports = router;

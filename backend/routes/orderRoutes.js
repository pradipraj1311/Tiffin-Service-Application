const express = require("express");
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getChefOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/authMiddleware");


router.route("/chef").get(protect, authorize("Chef","Admin"), getChefOrders);
router.route('/').post(protect, createOrder).get(protect, getUserOrders);
router.route('/:id').delete(protect, cancelOrder);

router.route('/:id/status').put(protect, authorize('Chef', 'Admin'), updateOrderStatus);
router
  .route("/")
  .post(protect, authorize("Customer"), createOrder)
  .get(protect, authorize("Customer"), getUserOrders);

router.route("/:id").get(protect, getOrderById).delete(protect, cancelOrder);

module.exports = router;

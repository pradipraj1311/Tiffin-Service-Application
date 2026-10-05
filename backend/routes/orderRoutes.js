const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { 
  initiateOrder, 
  verifyAndPlaceOrder, 
  placeCODOrder,
  getUserOrders, 
  getChefOrders, 
  updateOrderStatus ,rateOrder,
  cancelOrder,clearOrderHistory,clearChefOrderHistory
} = require("../controllers/orderController");


router.post("/initiate", protect, authorize('Customer'), initiateOrder);

router.post("/verify", protect, authorize('Customer'), verifyAndPlaceOrder);
router.post("/cod", protect, authorize('Customer'), placeCODOrder);

router.get("/my-orders", protect, authorize('Customer'), getUserOrders);
router.post("/:id/rate", protect, authorize('Customer'), rateOrder);

router.delete("/history/clear", protect, authorize('Customer'), clearOrderHistory);
router.delete("/:id", protect, authorize('Customer'), cancelOrder);



router.get("/chef", protect, authorize('Chef', 'Admin'), getChefOrders);

router.put("/:id/status", protect, authorize('Chef', 'Admin'), updateOrderStatus);
router.delete("/chef/history/clear", protect, authorize('Chef', 'Admin'),clearChefOrderHistory);

module.exports = router;
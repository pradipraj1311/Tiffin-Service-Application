const Order = require("../models/Order");
const Menu = require("../models/Menu");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET
});

exports.initiateOrder = async (req, res) => {
  try {
    const { menuId, orderQuantity } = req.body;
    const menu = await Menu.findById(menuId);
    if (!menu) return res.status(404).json({ message: "Menu not found." });
    if (menu.capacity < orderQuantity) return res.status(400).json({ message: `Only ${menu.capacity} tiffins left!` });

    const amount = menu.price * orderQuantity * 100;
    const options = { amount, currency: "INR", receipt: `receipt_order_${req.user._id}_${Date.now()}` };
    const razorpayOrder = await razorpay.orders.create(options);
    
    res.status(200).json({ razorpayOrder, amount, menu });
  } catch (error) {
    res.status(500).json({ message: "Failed to initiate Razorpay order", error: error.message });
  }
};

exports.verifyAndPlaceOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, menuId, orderQuantity } = req.body;
    const secret = process.env.RAZORPAY_SECRET || 'dummy_secret';
    const expectedSignature = crypto.createHmac("sha256", secret).update(razorpay_order_id + "|" + razorpay_payment_id).digest("hex");

    
    if (expectedSignature !== razorpay_signature) return res.status(400).json({ message: "Invalid payment signature." });

    const deliveryOTP = Math.floor(1000 + Math.random() * 9000).toString();
    const newOrder = await Order.create({
      CustomerId: req.user._id || req.user.id,
      post_MenuId: menuId, orderQuantity, deliveryOTP,
      status: 'Pending', paymentId: razorpay_payment_id
    });

    const menu = await Menu.findById(menuId).populate('CustomerId');
    menu.capacity -= orderQuantity;
    await menu.save();

    await Notification.create({
      userId: menu.CustomerId._id,
      message: `💳 New Paid Order! ${req.user.name} ordered ${orderQuantity}x ${menu.MealTypes.join(', ')}.`,
      relatedOrderId: newOrder._id
    });

    res.status(201).json({ message: "Order placed successfully!", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Payment verified but failed to save order.", error: error.message });
  }
};

exports.placeCODOrder = async (req, res) => {
  try {
    const { menuId, orderQuantity } = req.body;
    const menu = await Menu.findById(menuId);
    if (!menu) return res.status(404).json({ message: "Menu not found." });
    if (menu.capacity < orderQuantity) return res.status(400).json({ message: `Only ${menu.capacity} left!` });

    const deliveryOTP = Math.floor(1000 + Math.random() * 9000).toString();
    const newOrder = await Order.create({
      CustomerId: req.user._id || req.user.id,
      post_MenuId: menuId, orderQuantity, deliveryOTP,
      status: 'Pending', paymentId: 'COD'
    });

    menu.capacity -= orderQuantity;
    await menu.save();

    await Notification.create({
      userId: menu.CustomerId, 
      message: `🔔 New COD Order! ${req.user.name} ordered ${orderQuantity}x ${menu.MealTypes.join(', ')}.`,
      relatedOrderId: newOrder._id
    });

    res.status(201).json({ message: "COD Order placed successfully!", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Failed to process COD order.", error: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ CustomerId: req.user._id || req.user.id, customerVisible: { $ne: false } })
      .populate({ path: "post_MenuId", populate: { path: "CustomerId", select: "businessName name" }})
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getChefOrders = async (req, res) => {
  try {
    const chefMenus = await Menu.find({ CustomerId: req.user._id || req.user.id }).select("_id");
    const menuIds = chefMenus.map((menu) => menu._id);

    const orders = await Order.find({ post_MenuId: { $in: menuIds }, chefVisible: {$ne: false } })
      .populate("CustomerId") 
      .populate("post_MenuId", "MealTypes price deliveryDate")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, otp } = req.body;
    const order = await Order.findById(req.params.id).populate('CustomerId').populate('post_MenuId');
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (status === "Delivered") {
      const dbOTP = String(order.deliveryOTP).trim();
      const providedOTP = String(otp || '').trim();
      if (dbOTP !== providedOTP) return res.status(400).json({ message: "Invalid Delivery OTP." });
    }

    order.status = status;
    await order.save();

    await Notification.create({
      userId: order.CustomerId._id,
      message: `🍲 Order Update: Your food is now '${status}'.`,
      relatedOrderId: order._id
    });

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('post_MenuId');
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = 'Cancelled';
    await order.save();

    if (order.post_MenuId) {
      order.post_MenuId.capacity += order.orderQuantity;
      await order.post_MenuId.save();
      await Notification.create({
        userId: order.post_MenuId.CustomerId,
        message: `❌ Order Cancelled: Customer cancelled ${order.orderQuantity}x tiffins.`,
        relatedOrderId: order._id
      });
    }
    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.rateOrder = async (req, res) => {
  try {
    const { rating } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order || order.status !== 'Delivered' || order.isRated) return res.status(400).json({ message: "Invalid request." });

    order.isRated = true;
    await order.save();

    const menu = await Menu.findById(order.post_MenuId);
    const chef = await User.findById(menu.CustomerId);

    const newTotal = (chef.totalRatings || 0) + 1;
    const currentAvg = chef.averageRating || 0;
    chef.averageRating = Number((((currentAvg * (chef.totalRatings || 0)) + Number(rating)) / newTotal).toFixed(1));
    chef.totalRatings = newTotal;
    await chef.save();

    res.status(200).json({ message: "Thank you! Rating submitted." });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit rating", error: error.message });
  }
};

exports.clearOrderHistory = async (req, res) => {
  try {
    await Order.updateMany(
      { CustomerId: req.user._id || req.user.id, status: { $in: ['Delivered', 'Cancelled'] } },
      { $set: { customerVisible: false } }
    );
    res.status(200).json({ message: "Customer history cleared." });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.clearChefOrderHistory = async (req, res) => {
  try {
    const chefMenus = await Menu.find({ CustomerId: req.user._id || req.user.id }).select("_id");
    const menuIds = chefMenus.map(m => m._id);

    const clientToday = req.body.today ? new Date(req.body.today) : new Date();
    clientToday.setHours(0, 0, 0, 0);

    await Order.updateMany(
      { post_MenuId: { $in: menuIds }, createdAt: {$lt: clientToday } },
      { $set: { chefVisible: false } }
    );
    res.status(200).json({ message: "Chef history cleared." });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
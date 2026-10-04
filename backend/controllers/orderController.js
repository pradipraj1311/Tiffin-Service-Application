const Order = require("../models/Order");
const Menu = require("../models/Menu");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'VITE_RAZOR_PAY',
  key_secret: process.env.RAZORPAY_SECRET || 'VITE_RAZOR_PAY_SECRET',
});

exports.initiateOrder = async (req, res) => {
  try {
    const { menuId, orderQuantity } = req.body;

    const menu = await Menu.findById(menuId);
    if (!menu) return res.status(404).json({ message: "Menu not found." });

    if (menu.capacity < orderQuantity) {
      return res.status(400).json({ message: `Only ${menu.capacity} tiffins left!` });
    }

    const amount = menu.price * orderQuantity * 100;

    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_order_${req.user._id}_${Date.now()}`
    };

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
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature. Transaction tampered." });
    }

    const deliveryOTP = Math.floor(1000 + Math.random() * 9000).toString();

    const newOrder = await Order.create({
      CustomerId: req.user._id || req.user.id,
      post_MenuId: menuId,
      orderQuantity,
      deliveryOTP,
      status: 'Pending',
      paymentId: razorpay_payment_id
    });

    const menu = await Menu.findById(menuId).populate('CustomerId');
    menu.capacity -= orderQuantity;
    await menu.save();

    await Notification.create({
      userId: menu.CustomerId._id,
      orderId: newOrder._id,
      message: `🔔 New Order! You received an order for ${orderQuantity} tiffins. Order ID: ${newOrder._id.toString().slice(-6).toUpperCase()}`
    });

    res.status(201).json({ message: "Order placed successfully!", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Payment verified but failed to save order.", error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, otp } = req.body;
    const order = await Order.findById(req.params.id).populate('CustomerId');
    
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (status === "Delivered") {
      if (order.deliveryOTP !== otp) {
        return res.status(400).json({ message: "Invalid Delivery OTP. Ask the customer for the correct 4-digit code." });
      }
    }

    order.status = status;
    await order.save();

    await Notification.create({
      userId: order.CustomerId._id,
      orderId: order._id,
      message: `📦 Your order status has been updated to: ${status}`
    });

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getChefOrders = async (req, res) => {
  try {
    const chefMenus = await Menu.find({ CustomerId: req.user._id || req.user.id }).select("_id");
    const menuIds = chefMenus.map((menu) => menu._id);

    const orders = await Order.find({ post_MenuId: { $in: menuIds } })
      .populate("CustomerId", "name PhoneNumber address")
      .populate("post_MenuId", "MealTypes price deliveryDate")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ CustomerId: req.user._id || req.user.id })
      .populate("post_MenuId")
      .sort({ createdAt: -1 });
      
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
exports.rateOrder = async (req, res) => {
  try {
    const { rating } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== 'Delivered') return res.status(400).json({ message: "You can only rate delivered orders." });
    if (order.isRated) return res.status(400).json({ message: "You have already rated this order." });

    order.isRated = true;
    await order.save();

    const menu = await Menu.findById(order.post_MenuId);
    const chef = await User.findById(menu.CustomerId);

    const newTotal = (chef.totalRatings || 0) + 1;
    const currentAvg = chef.averageRating || 0;
    const newAvg = ((currentAvg * (chef.totalRatings || 0)) + Number(rating)) / newTotal;

    chef.totalRatings = newTotal;
    chef.averageRating = Number(newAvg.toFixed(1));
    await chef.save();

    res.status(200).json({ message: "Thank you! Rating submitted." });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit rating", error: error.message });
  }
};
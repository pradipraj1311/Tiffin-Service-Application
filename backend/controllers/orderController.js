const Order = require("../models/Order");
const Customer = require("../models/Customer");

exports.createOrder = async (req, res) => {
  try {
    const { post_MenuId, orderQuantity } = req.body;

    // Find the Customer profile linked to the logged-in User
    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) {
      return res.status(404).json({
        message: "Customer profile not found. Only customers can place orders.",
      });
    }

    const newOrder = await Order.create({
      CustomerId: customer._id,
      post_MenuId,
      orderQuantity,
    });

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) {
      return res.status(404).json({ message: "Customer profile not found" });
    }

    const orders = await Order.find({ CustomerId: customer._id }).populate(
      "post_MenuId",
    );
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("post_MenuId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res
      .status(200)
      .json({ message: "Order successfully cancelled and deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
<<<<<<< Updated upstream
=======

//  Generate OTP during creation
exports.createOrder = async (req, res) => {
  try {
    const { post_MenuId, orderQuantity } = req.body;
    const deliveryOTP = Math.floor(1000 + Math.random() * 9000).toString(); // Random 4 digits

    const order = await Order.create({
      CustomerId: req.user._id,
      post_MenuId,
      orderQuantity,
      deliveryOTP,
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//  Verify OTP during status update
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, otp } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (status === "Delivered") {
      if (order.deliveryOTP !== otp) {
        return res.status(400).json({
          message:
            "Invalid Delivery OTP. Customer must provide the correct code.",
        });
      }
    }

    order.status = status;
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
exports.getChefOrders = async (req, res) => {
  try {
    const chefMenus = await Menu.find({ CustomerId: req.user._id }).select(
      "_id",
    );
    const menuIds = chefMenus.map((menu) => menu._id);

    const orders = await Order.find({ post_MenuId: { $in: menuIds } })
      .populate("CustomerId", "name PhoneNumber address")
      .populate("post_MenuId", "MealTypes price")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
>>>>>>> Stashed changes

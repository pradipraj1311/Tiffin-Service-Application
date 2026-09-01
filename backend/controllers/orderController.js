const Order = require("../models/Order");
const Customer = require("../models/Customer");

exports.createOrder = async (req, res) => {
  try {
    const { post_MenuId, orderQuantity } = req.body;

    // Find the Customer profile linked to the logged-in User
    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) {
      return res
        .status(404)
        .json({
          message:
            "Customer profile not found. Only customers can place orders.",
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

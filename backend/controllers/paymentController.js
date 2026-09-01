const Payment = require("../models/Payment");
const Order = require("../models/Order");

exports.createPayment = async (req, res) => {
  try {
    const { order_Id, payment_type } = req.body;

    const orderExists = await Order.findById(order_Id);
    if (!orderExists) {
      return res.status(404).json({ message: "Order not found" });
    }

    const payment = await Payment.create({
      order_Id,
      payment_type,
      Payment_Status: true, // Simulating a successful payment
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("order_Id");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({
      paymentId: payment._id,
      status: payment.Payment_Status ? "Paid" : "Pending/Refunded",
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.Payment_Status = false;
    await payment.save();

    res.status(200).json({ message: "Payment successfully refunded", payment });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

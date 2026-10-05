const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

const razorpay = new Razorpay({
key_id: process.env.RAZORPAY_KEY || RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET || RAZORPAY_SECRET
});

exports.createOrder = async (req, res) => {
  try {
    const options = {
      amount: 1999 * 100, 
      currency: "INR",
      receipt: `receipt_${req.user._id}`
    };
    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Razorpay order creation failed', error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isSubscribed: true, subscriptionTier: 'Premium', subscriptionExpiresAt: expiresAt },
      { new: true }
    );

    res.status(200).json({ message: 'Payment successful! Subscription active.', user });
  } catch (error) {
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
};
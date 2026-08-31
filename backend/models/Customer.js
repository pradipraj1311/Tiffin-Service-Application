const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    orderId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    chefId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chef' }],
    PaymentId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
    cancle_Order: { type: Boolean, default: false },
    payment_date: { type: Date },
    Rating: {
      type: Number,
      enum: [1, 2, 3, 4, 5] 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', customerSchema);
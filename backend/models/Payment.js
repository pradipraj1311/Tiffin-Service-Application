const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    PaymentDate: { type: Date, default: Date.now },
    order_Id: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    payment_type: {
      type: String,
      enum: ["Subscription", "Order"],
      required: true,
    },
    Payment_Status: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    CustomerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    OrderDate: { type: Date, default: Date.now },
    post_MenuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      required: true,
    },
    orderQuantity: { type: Number, required: true, default: 1 },
    orderStatus: { type: Boolean, default: false },
    status: {
      type: String,
      enum: [
        "Pending",
        "Preparing",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
    deliveryOTP: { type: String, required: true },
  },

status: { 
    type: String, 
    enum: ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  }},
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);

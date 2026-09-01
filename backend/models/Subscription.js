const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    Subscription_Status: { type: Boolean, default: true },
    chefId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chef",
      required: true,
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Subscription", subscriptionSchema);

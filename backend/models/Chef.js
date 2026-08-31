const mongoose = require('mongoose');

const chefSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    SubscriptionId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' }],
    PaymentId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
    PaymentDate: { type: Date },
    cancelSubscription: { type: Boolean, default: false },
    CustomerId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chef', chefSchema);
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    CustomerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    chefId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chef' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // The user receiving the notification (Can be Chef or Customer)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Optional reference to the specific order
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
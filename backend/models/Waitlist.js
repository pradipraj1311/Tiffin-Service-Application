const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  locationName: { 
    type: String, 
    required: true 
  },
  lat: { 
    type: Number, 
    required: true 
  },
  lng: { 
    type: Number, 
    required: true 
  },
  status: {
    type: String,
    enum: ['Waiting', 'Notified'],
    default: 'Waiting'
  }
}, { timestamps: true });

waitlistSchema.index({ customerId: 1, locationName: 1 }, { unique: true });

module.exports = mongoose.model('Waitlist', waitlistSchema);
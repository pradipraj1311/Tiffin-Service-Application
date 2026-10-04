const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['Admin', 'Chef', 'Customer'],
      required: true
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    isEmailVerified: { type: Boolean, default: false },
  emailVerifyToken: { type: String },
    password: { type: String, required: true },
    PhoneNumber: { type: Number, required: true },
    address: {
      Street: { type: String },
      City: { type: String }
    },
    businessName: { type: String }, 
  lat: { type: Number },         
  lng: { type: Number },          
  deliveryRadius: { type: Number },
  fssai: { type: String, minlength: 14, maxlength: 14 },
  isProfileComplete: { type: Boolean, default: false },
  verificationStatus: { 
    type: String, 
    enum: ['Incomplete', 'Pending', 'Approved', 'Rejected'], 
    default: 'Incomplete' 
  },
  
  isSubscribed: { type: Boolean, default: false },
  subscriptionExpiresAt: { type: Date },
  
  landmark: { type: String },
  altPhone: { type: Number },
  deliveryNotes: { type: String },
  dietaryTags: [{ type: String }],
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
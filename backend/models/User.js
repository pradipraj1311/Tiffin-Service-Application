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
    password: { type: String, required: true },
    PhoneNumber: { type: Number, required: true },
    address: {
      Street: { type: String },
      City: { type: String }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
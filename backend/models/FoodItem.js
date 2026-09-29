const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true }
});

module.exports = mongoose.model('FoodItem', foodItemSchema);
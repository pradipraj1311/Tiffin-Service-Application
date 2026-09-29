const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema(
  {
    CustomerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    MenuList: [
      {
        veg: { type: Boolean, required: true },
        MealNames: [{ type: String }]
      }
    ],
    MealTypes: [
      {
        type: String,
        enum: ['Breakfast', 'Lunch', 'Dinner']
      }
    ],
  
  price: { type: Number, required: true, min: 0 },
  deliveryDate: { type: Date, required: true },
  orderCutoff: { type: String, required: true },
  capacity: { type: Number, required: true, min: 1 },
  soldOut: { type: Boolean, default: false },
  },
  { timestamps: true },
 );


module.exports = mongoose.model('Menu', menuSchema);
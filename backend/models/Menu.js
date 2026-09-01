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
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Menu', menuSchema);
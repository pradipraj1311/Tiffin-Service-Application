const Menu = require('../models/Menu');

//  /api/tiffins
exports.createTiffin = async (req, res) => {
  try {
    const { MenuList, MealTypes } = req.body;

    const newMenu = await Menu.create({
      CustomerId: req.user._id, 
      MenuList,
      MealTypes
    });

    res.status(201).json(newMenu);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
}
exports.getTiffins = async (req, res) => {
  try {
    const menus = await Menu.find();
    res.status(200).json(menus);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

//   GET /api/tiffins/:id
exports.getTiffinById = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    
    if (!menu) {
      return res.status(404).json({ message: 'Tiffin not found' });
    }
    
    res.status(200).json(menu);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
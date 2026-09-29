const Menu = require('../models/Menu');
const FoodItem = require('../models/FoodItem');
const Order = require('../models/Order');

exports.createTiffin = async (req, res) => {
  try {
    const { MenuList, MealTypes,price, deliveryDate,orderCutoff, capacity } = req.body;
const submittedItems = MenuList.reduce((acc, curr) => acc.concat(curr.MealNames), []);

for (const item of submittedItems) {
      const exists = await FoodItem.findOne({ name: { $regex: new RegExp(`^${item}$`, 'i') } });
      if (!exists) {
        await FoodItem.create({ name: item });
      }
    }

    const newMenu = await Menu.create({
      CustomerId: req.user._id, 
      MenuList,
      MealTypes,
      price,
      deliveryDate,
      orderCutoff,
      capacity
    });

    res.status(201).json(newMenu);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
}

const getDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

exports.getTiffins = async (req, res) => {
  try {
    const { lat, lng, search } = req.query;

    let tiffins = await Menu.find().populate('CustomerId', 'name businessName PhoneNumber lat lng deliveryRadius').sort({ createdAt: -1 });

    if (search) {
      const lowerSearch = search.toLowerCase();
      tiffins = tiffins.filter(t => 
        (t.CustomerId?.businessName && t.CustomerId.businessName.toLowerCase().includes(lowerSearch)) ||
        t.MealTypes.some(type => type.toLowerCase().includes(lowerSearch))
      );
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    const processedTiffins = tiffins.map(tiffin => {
      const chef = tiffin.CustomerId;
      let distance = null;
      let isDeliverable = true;

      if (userLat && userLng && chef?.lat && chef?.lng) {
        distance = getDistance(userLat, userLng, chef.lat, chef.lng);
        if (chef.deliveryRadius && distance > chef.deliveryRadius) {
          isDeliverable = false;
        }
      }

      return {
        ...tiffin.toObject(),
        calculatedDistance: distance,
        isDeliverable
      };
    });

    const finalTiffins = processedTiffins.filter(t => t.isDeliverable);

    res.status(200).json(finalTiffins);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
exports.updateTiffin = async (req, res) => {
  try {
    const updatedMenu = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedMenu) return res.status(404).json({ message: 'Menu not found' });
    res.status(200).json(updatedMenu);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.deleteTiffin = async (req, res) => {
  try {
    const deletedMenu = await Menu.findByIdAndDelete(req.params.id);
    if (!deletedMenu) return res.status(404).json({ message: 'Menu not found' });
    res.status(200).json({ message: 'Menu deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getGlobalFoodItems = async (req, res) => {
  try {
    const items = await FoodItem.find().sort({ name: 1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
// exports.getTiffins = async (req, res) => {
//   try {
//     const menus = await Menu.find();
//     res.status(200).json(menus);
//   } catch (error) {
//     res.status(500).json({ message: 'Server Error', error: error.message });
//   }
// };

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
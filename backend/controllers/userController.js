const User = require('../models/User');
const Waitlist = require('../models/Waitlist');

exports.updateUserProfile = async (req, res) => {
  try {
    const { 
      name, PhoneNumber, altPhone, address, landmark, deliveryNotes, 
      businessName, fssai, isProfileComplete, verificationStatus,
      lat, lng, maxDeliveryRadius, dietaryPreferences
    } = req.body;

    const user = await User.findById(req.user._id || req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (PhoneNumber) user.PhoneNumber = PhoneNumber;
    if (altPhone !== undefined) user.altPhone = altPhone === '' ? null : altPhone;
    
    if (address) {
      const currentAddress = user.address || {}; 
      
      user.address = {
        street: address.street !== undefined ? address.street : currentAddress.street || '',
        city: address.city !== undefined ? address.city : currentAddress.city || '',
        pincode: address.pincode !== undefined ? address.pincode : currentAddress.pincode || '',
        full: address.full !== undefined ? address.full : currentAddress.full || ''
      };
      
      user.markModified('address'); 
    }
    
    if (lat !== undefined) user.lat = lat;
    if (lng !== undefined) user.lng = lng;

    if (landmark !== undefined) user.landmark = landmark;
    if (deliveryNotes !== undefined) user.deliveryNotes = deliveryNotes;
    
    if (businessName) user.businessName = businessName;
    if (fssai) user.fssai = fssai;
    
    if (maxDeliveryRadius !== undefined) user.maxDeliveryRadius = maxDeliveryRadius;
    if (dietaryPreferences !== undefined) user.dietaryPreferences = dietaryPreferences;

    if (isProfileComplete !== undefined) user.isProfileComplete = isProfileComplete;
    if (verificationStatus !== undefined) user.verificationStatus = verificationStatus;

    await user.save();
    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error("🚨 PROFILE UPDATE CRASH:", error);
    res.status(500).json({ message: `Database error: ${error.message}`, error: error.message });
  }
};

exports.addToWaitlist = async (req, res) => {
  try {
    const { locationName, lat, lng } = req.body;
    
    if (!locationName || !lat || !lng) {
      return res.status(400).json({ message: 'Location data is missing.' });
    }

    const user = await User.findById(req.user._id || req.user.id);

    try {
      await Waitlist.create({
        customerId: user._id,
        email: user.email,
        locationName,
        lat,
        lng
      });
      res.status(201).json({ message: 'Added to waitlist successfully.' });
    } catch (dbError) {
      if (dbError.code === 11000) { 
        return res.status(400).json({ message: 'You are already on the waitlist for this area.' });
      }
      throw dbError;
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error adding to waitlist.', error: error.message });
  }
};
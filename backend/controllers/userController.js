const User = require('../models/User');

exports.updateUserProfile = async (req, res) => {
  try {
    const { 
      name, PhoneNumber, altPhone, address, landmark, deliveryNotes, 
      businessName, fssai, isProfileComplete, verificationStatus,
      lat, lng 
    } = req.body;

    const user = await User.findById(req.user._id || req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (PhoneNumber) user.PhoneNumber = PhoneNumber;
    if (altPhone !== undefined) user.altPhone = altPhone === '' ? null : altPhone;
    
    if (address !== undefined) user.address = address; 
    
    if (lat !== undefined) user.lat = lat;
    if (lng !== undefined) user.lng = lng;

    if (landmark !== undefined) user.landmark = landmark;
    if (deliveryNotes !== undefined) user.deliveryNotes = deliveryNotes;
    if (businessName !== undefined) user.businessName = businessName;
    if (fssai !== undefined) user.fssai = fssai;

    if (isProfileComplete !== undefined) user.isProfileComplete = isProfileComplete;
    if (verificationStatus !== undefined) user.verificationStatus = verificationStatus;

    await user.save();
    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error("🚨 PROFILE UPDATE CRASH:", error);
    res.status(500).json({ message: `Database error: ${error.message}`, error: error.message });
  }
};
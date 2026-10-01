const User = require('../models/User');

exports.getPendingChefs = async (req, res) => {
  try {
    const pendingChefs = await User.find({ 
      role: 'Chef', 
      verificationStatus: 'Pending' 
    }).select('-password'); 
    
    res.status(200).json(pendingChefs);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching chefs', error: error.message });
  }
};

exports.updateChefVerification = async (req, res) => {
  try {
    const { chefId, status } = req.body; 

    if (!chefId || !status) {
      return res.status(400).json({ message: 'Missing chef ID or status.' });
    }

    const result = await User.updateOne(
      { _id: chefId },
      { $set: { verificationStatus: status } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Chef not found in database.' });
    }
    
    res.status(200).json({ message: `Chef successfully ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error during verification' });
  }
};
const User = require('../models/User');
const Waitlist = require('../models/Waitlist');
const nodemailer = require('nodemailer');

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
const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
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
    if(status === 'Approved') {
      const chef = await User.findById(chefId);
      if(chef && chef.lat && chef.lng) {
        const waitlistEntries = await Waitlist.find({satus:'Waiting'});
        const chefRadius =chef.maxDeliveryRadius || 7;
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        for (const waiter of waitlistUsers) {
          const distance = getDistanceInKm(chef.lat, chef.lng, waiter.lat, waiter.lng);

          if (distance <= chefRadius) {
            try {
              await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: waiter.email,
                subject: '🎉 A New Kitchen Just Opened Near You!',
                html: `
                  <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2 style="color: #28a745;">Great news, foodie!</h2>
                    <p>A new verified premium chef, <strong>${chef.businessName || 'a local kitchen'}</strong>, is now delivering to <strong>${waiter.locationName}</strong>!</p>
                    <p style="margin-top: 20px;">
                      <a href="http://localhost:5173/dashboard" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Order Your Tiffin Now</a>
                    </p>
                  </div>
                `
              });

              waiter.status = 'Notified';
              await waiter.save();
            } catch (emailErr) {
              console.error("Waitlist email failed for", waiter.email, emailErr);
            }
          }
        }
      }
    }
    
    res.status(200).json({ message: `Chef successfully ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error during verification' });
  }
};
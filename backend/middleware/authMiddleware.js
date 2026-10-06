const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      next(); 

    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};



exports.checkChefAccess = (req, res, next) => {
  if (req.user.role === 'Chef') {
    if (!req.user.isProfileComplete) {
      return res.status(403).json({ message: 'Action blocked: Kitchen profile incomplete.' });
    }
    if (req.user.verificationStatus !== 'Approved') {
      return res.status(403).json({ message: 'Action blocked: Awaiting Admin FSSAI verification.' });
    }
    const isExpired = req.user.subscriptionExpiresAt && new Date(req.user.subscriptionExpiresAt) < new Date();
    if (!req.user.isSubscribed || isExpired) {
      return res.status(403).json({ message: 'Action blocked: Active ₹1999 Premium Subscription required.' });
    }
  }
  next();
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }
    next();
  };
};
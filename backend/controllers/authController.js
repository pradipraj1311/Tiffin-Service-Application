const User = require('../models/User');
const Customer = require('../models/Customer');
const Chef = require('../models/Chef');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); 
require('dotenv').config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};


const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  }
});

exports.registerUser = async (req, res) => {
  try {
    const { role, name, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verifyToken = crypto.randomBytes(20).toString('hex');

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      PhoneNumber: phone,
      emailVerifyToken: verifyToken,
      businessName: name 
    });

    if (role === 'Customer') {
      await Customer.create({ userId: user._id });
    } else if (role === 'Chef') {
      await Chef.create({ userId: user._id });
    }

    try {
      const verificationUrl = `http://localhost:5173/verify-email/${verifyToken}`;
      await transporter.sendMail({
        to: user.email,
        subject: 'Verify your Tiffin Service Account',
        html: `<h3>Welcome ${user.name}!</h3>
               <p>Please verify your email address by clicking the link below:</p>
               <a href="${verificationUrl}" style="background:#28a745;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Verify Email</a>`
      });
    } catch (emailErr) {
      console.error("Nodemailer failed. Check .env credentials.", emailErr);
    }

    res.status(201).json({ message: 'Registration successful! Please check your email to verify your account.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.isEmailVerified) return res.status(400).json({ message: 'Email is already verified.' });

    const verifyToken = crypto.randomBytes(20).toString('hex');
    user.emailVerifyToken = verifyToken;
    await user.save();

    const verificationUrl = `http://localhost:5173/verify-email/${verifyToken}`;
    await transporter.sendMail({
      to: user.email,
      subject: 'Resend: Verify your Tiffin Service Account',
      html: `<h3>Welcome ${user.name}!</h3>
             <p>Please verify your email address by clicking the link below:</p>
             <a href="${verificationUrl}" style="background:#28a745;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Verify Email</a>`
    });

    res.status(200).json({ message: 'Verification email resent successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ emailVerifyToken: req.params.token });
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification token' });

    user.isEmailVerified = true;
    user.emailVerifyToken = undefined; 
    await user.save();

    res.status(200).json({ message: 'Email verified successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && !user.isEmailVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
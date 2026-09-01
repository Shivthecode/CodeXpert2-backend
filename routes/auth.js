const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

// 1. SIGNUP API
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'member'
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. LOGIN API
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GOOGLE LOGIN / SIGNUP API
router.post('/google-login', async (req, res) => {
  try {
    const { name, email, role } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      const dummyPassword = "GoogleAuthUser123!@#" + Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedDummyPassword = await bcrypt.hash(dummyPassword, salt);

      user = new User({
        name,
        email,
        password: hashedDummyPassword, 
        role: role || 'member'
      });
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.log("Google Login Backend Error: ", error);
    res.status(500).json({ error: error.message });
  }
});

// 4. FORGOT PASSWORD - SEND OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist." });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; 
    await user.save();

    await sendEmail(user.email, otp);

    res.status(200).json({ message: "OTP sent successfully to your email." });
  } catch (error) {
    console.error("Forgot Password Error: ", error);
    res.status(500).json({ error: error.message });
  }
});

// 5. VERIFY OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ 
      email, 
      resetPasswordOtp: otp,
      resetPasswordExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid OTP or OTP has expired." });
    }

    res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    console.error("Verify OTP Error: ", error);
    res.status(500).json({ error: error.message });
  }
});

// 6. RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    res.status(200).json({ message: "Password updated successfully. You can now login." });
  } catch (error) {
    console.error("Reset Password Error: ", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
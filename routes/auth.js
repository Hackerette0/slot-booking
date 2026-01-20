// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');          // ← make sure this is installed (npm i bcryptjs)
const jwt = require('jsonwebtoken');         // ← npm i jsonwebtoken
const User = require('../models/User');      // ← adjust path to your User model

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
    console.log('REGISTER ROUTE HIT - Incoming Body:', JSON.stringify(req.body, null, 2));
  try {
    console.log('REGISTER ROUTE REACHED → Body:', req.body);

    const { name, email, password } = req.body;

    // 1. Basic input validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        msg: 'Name, email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        msg: 'Password must be at least 6 characters long'
      });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        msg: 'User with this email already exists'
      });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create new user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      // role: 'user',           // ← add if your schema has it
      // createdAt: Date.now()   // ← usually automatic via schema timestamps
    });

    // 5. (Optional but recommended) Generate JWT token
    const payload = {
      id: user._id,
      email: user.email,
      // role: user.role,      // if you have roles
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }     // or '1h', '30d' — your preference
    );

    // 6. Send success response (don't send password back!)
    res.status(201).json({
      success: true,
      msg: 'User registered successfully',
      token,                      // send token so frontend can log in automatically
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        // role: user.role,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('REGISTER ERROR - FULL DETAILS:');
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack || '(no stack)');
  console.error('Error code:', error.code);
  console.error('Full error:', JSON.stringify(error, null, 2));  // ← captures everything
    // Handle specific Mongoose / MongoDB errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        msg: 'Validation error',
        errors
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        msg: 'Email already in use'
      });
    }

    // Generic fallback
    res.status(500).json({
      success: false,
      msg: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login route (keeping the controller version you had)
const { login } = require('../controllers/authController');
router.post('/login', login);

module.exports = router;
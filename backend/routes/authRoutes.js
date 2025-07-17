const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/User');


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key"; 

//  SIGNUP 
router.post('/signup', async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;

    
    if (!name || !username || !email || !password) {
      return res.status(400).json({ error: 'Please fill in all fields' });
    }

    // 2. Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // 3. Validate username
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return res.status(400).json({
        error: 'Username must be 3-20 characters long and can only contain letters, numbers, or underscores',
      });
    }

    // 4. Validate password strength
    const strongPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
    if (!strongPassword.test(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
      });
    }

    // 5. for existing email and username
    const [emailExists, usernameExists] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ username }),
    ]);

    if (emailExists) return res.status(400).json({ error: 'Email already in use' });
    if (usernameExists) return res.status(400).json({ error: 'Username already exists' });

    // 6. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 7. Create and save user
    const newUser = new User({
      name: validator.escape(name),
      username: validator.escape(username),
      email: validator.normalizeEmail(email),
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'user',
    });

    await newUser.save();
    return res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    console.error('[SIGNUP ERROR]', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

//  LOGIN 
router.post('/login', async (req, res) => {
  try {
    const { loginInput, password, role } = req.body;

    if (!loginInput || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await User.findOne({
      $or: [
        { email: validator.normalizeEmail(loginInput) },
        { username: loginInput },
      ],
    }).select('+password');

    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role !== role) {
      return res.status(403).json({ error: 'Incorrect role selected' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

    
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

   
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

module.exports = router;

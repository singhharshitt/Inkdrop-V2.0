const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Request = require('../models/Request');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');
const Download = require('../models/Download');


router.get('/dashboard/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).select('-password');
    const uploadedBooks = await Book.find({ uploadedBy: userId }).sort({ uploadedAt: -1 }).limit(5);
    const requests = await Request.find({ requestedBy: userId }).sort({ createdAt: -1 }).limit(5);
    const totalBooks = await Book.countDocuments({ uploadedBy: userId });
    const totalRequests = await Request.countDocuments({ requestedBy: userId });
    const booksDownloaded = await Download.countDocuments({ user: userId });

    return res.status(200).json({
      user,
      uploadedBooks,
      requests,
      stats: {
        totalBooks,
        totalRequests,
        booksDownloaded,
        lastLogin: user?.lastLogin
      }
    });
  } catch (err) {
    console.error('[DASHBOARD ERROR]', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});


router.patch('/update-email', protect, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const user = await User.findByIdAndUpdate(req.user.id, { email }, { new: true, runValidators: true });
    res.json({ message: 'Email updated', email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update email' });
  }
});


router.patch('/update-password', protect, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password is required' });
    const hashed = await bcrypt.hash(password, 12);
    await User.findByIdAndUpdate(req.user.id, { password: hashed });
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password' });
  }
});


router.delete('/delete-account', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    await User.findByIdAndDelete(userId);
    
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;

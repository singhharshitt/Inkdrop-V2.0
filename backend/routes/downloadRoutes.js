const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Download = require('../models/Download');

// ✅ @desc    Record a new download
// ✅ @route   POST /api/downloads
// ✅ @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required' });
    }

    const newDownload = await Download.create({
      user: req.user.id,
      book: bookId,
    });

    res.status(201).json(newDownload);
  } catch (err) {
    console.error('[DOWNLOAD ERROR]', err);
    res.status(500).json({ error: 'Failed to record download' });
  }
});

// ✅ @desc    Get all downloads by the logged-in user
// ✅ @route   GET /api/downloads/my-downloads
// ✅ @access  Private
router.get('/my-downloads', protect, async (req, res) => {
  try {
    const downloads = await Download.find({ user: req.user.id }).populate('book');
    res.json(downloads);
  } catch (err) {
    console.error('[FETCH MY DOWNLOADS ERROR]', err);
    res.status(500).json({ error: 'Failed to fetch downloads' });
  }
});

// ✅ @desc    Admin/debug route: Get recent 100 downloads
// ✅ @route   GET /api/downloads/logs
// ✅ @access  Public (You can protect it later with admin middleware)
router.get('/logs', async (req, res) => {
  try {
    const logs = await Download.find()
      .populate('book user')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  } catch (err) {
    console.error('[FETCH DOWNLOAD LOGS ERROR]', err);
    res.status(500).json({ error: 'Error fetching logs' });
  }
});

module.exports = router;

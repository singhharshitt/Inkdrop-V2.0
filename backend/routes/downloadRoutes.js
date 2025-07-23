const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Download = require('../models/Download');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase config (you can move this to supabaseClient.js later)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ✅ @desc    Record a new download
// ✅ @route   POST /api/downloads
// ✅ @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { bookId, filePath, fileName } = req.body;

    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required' });
    }

    // If file details are provided and local file exists, upload to Supabase
    if (filePath && fileName && fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      const { data, error } = await supabase.storage
        .from('inkdroop3') // replace with your actual bucket name
        .upload(`uploads/${fileName}`, fileBuffer, {
          contentType: 'application/octet-stream'
        });

      if (error) {
        console.error('[SUPABASE UPLOAD ERROR]', error);
        return res.status(500).json({ error: 'Failed to upload file to Supabase' });
      }

      console.log(`[✅] Uploaded to Supabase: ${data.path}`);
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

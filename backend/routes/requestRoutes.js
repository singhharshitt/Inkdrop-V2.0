const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Request = require('../models/Request');
const { protect } = require('../middleware/authMiddleware'); 

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });


router.post('/upload', protect, upload.none(), async (req, res) => {
  try {
    const { title, author, category, additionalNotes } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    const request = new Request({
      title,
      author,
      category,
      additionalNotes,
      requestedBy: req.user.id,
    });

    await request.save();
    res.status(201).json({ message: 'Request submitted successfully', request });
  } catch (err) {
    console.error('[UPLOAD REQUEST ERROR]', err);
    res.status(500).json({ error: 'Failed to upload request' });
  }
});


router.get('/myrequests', protect, async (req, res) => {
  try {
    const requests = await Request.find({ requestedBy: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    console.error('[FETCH MY REQUESTS ERROR]', err);
    res.status(500).json({ error: 'Failed to fetch your requests' });
  }
});


router.get('/all', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }

    const requests = await Request.find().populate('requestedBy', 'username email').sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    console.error('[FETCH ALL REQUESTS ERROR]', err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

module.exports = router;

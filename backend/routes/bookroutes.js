const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Book = require('../models/Book');
const { protect } = require('../middleware/authMiddleware'); 

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });


router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    const { title, author, category } = req.body;

    if (!title || !author || !category || !req.file) {
      return res.status(400).json({ error: 'All fields including file are required' });
    }

    const newBook = new Book({
      title,
      author,
      category,
      uploadedBy: req.user.id,
      fileUrl: `/uploads/${req.file.filename}`,
    });

    await newBook.save();

    return res.status(201).json({ message: 'Book uploaded successfully', book: newBook });
  } catch (err) {
    console.error('[UPLOAD ERROR]', err);
    res.status(500).json({ error: 'Server error during book upload' });
  }
});

router.get('/mybooks', protect, async (req, res) => {
  try {
    const books = await Book.find({ uploadedBy: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(books);
  } catch (err) {
    console.error('[FETCH MY BOOKS ERROR]', err);
    res.status(500).json({ error: 'Failed to fetch your books' });
  }
});


router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.status(200).json(books);
  } catch (err) {
    console.error('[FETCH ALL BOOKS ERROR]', err);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

module.exports = router;

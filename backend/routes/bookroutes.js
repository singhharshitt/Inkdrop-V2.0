const express = require('express');
const router = express.Router();
const multer = require('multer');
const Book = require('../models/Book');
const { protect } = require('../middleware/authMiddleware');
const supabase = require('../utils/supabase'); // import supabase client
const { v4: uuidv4 } = require('uuid'); // for unique filename

// Use memory storage for multer (buffer instead of writing to disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    const { title, author, category } = req.body;

    if (!title || !author || !category || !req.file) {
      return res.status(400).json({ error: 'All fields including file are required' });
    }

    const file = req.file;
    const filename = `${Date.now()}-${uuidv4()}-${file.originalname}`;
    
    // Upload to Supabase bucket
    const { error: uploadError } = await supabase.storage
      .from('inkdroop3') // use your actual bucket
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      console.error('[SUPABASE UPLOAD ERROR]', uploadError);
      return res.status(500).json({ error: 'File upload to Supabase failed' });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from('inkdroop3').getPublicUrl(filename);

    const newBook = new Book({
      title,
      author,
      category,
      uploadedBy: req.user.id,
      fileUrl: publicUrl,
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

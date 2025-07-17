const Download = require('../models/Download');
const Book = require('../models/Book');

const createDownload = async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required' });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const existingDownload = await Download.findOne({ user: req.user.id, book: bookId });
    if (existingDownload) {
      return res.status(200).json({ message: 'Book already downloaded', download: existingDownload });
    }

    const newDownload = await Download.create({
      user: req.user.id,
      book: bookId,
    });

    const populatedDownload = await Download.findById(newDownload._id).populate('book');

    res.status(201).json(populatedDownload);
  } catch (error) {
    console.error('Download creation error:', error.message || error);
    res.status(500).json({ error: 'Server error while creating download' });
  }
};

module.exports = {
  createDownload,
};

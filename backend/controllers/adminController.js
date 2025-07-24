const Book = require('../models/Book');
const Request = require('../models/Request');
const Category = require('../models/Category');
const User = require('../models/User');
const Download = require('../models/Download');
const cloudinary = require('../utils/cloudinary');
const mongoose = require('mongoose');

// =====================
// Upload new book
// =====================
const uploadBook = async (req, res) => {
  try {
    const { title, author, category, description, pdfUrl, coverUrl } = req.body;
    const pdfFile = req.files?.['pdf']?.[0];
    const coverImage = req.files?.['cover']?.[0];
    const fs = require('fs');

    if (!title || !author || !category || !description) {
      return res.status(400).json({ message: 'Title, author, category, and description are required' });
    }

    // At least one method (file or URL) must be provided
    if (!pdfFile && !pdfUrl) {
      return res.status(400).json({ message: 'Either a PDF file or PDF URL is required' });
    }

    if (!coverImage && !coverUrl) {
      return res.status(400).json({ message: 'Either a cover image file or cover image URL is required' });
    }

    // Upload PDF to Cloudinary or use existing URL
    let resultPDF = {};
    if (pdfFile) {
      resultPDF = await cloudinary.uploader.upload(pdfFile.path, {
        resource_type: 'raw',
        folder: 'pdfs',
      });
    } else if (pdfUrl) {
      resultPDF.secure_url = pdfUrl;
    }

    // Upload cover image to Cloudinary or use existing URL
    let resultImage = {};
    if (coverImage) {
      resultImage = await cloudinary.uploader.upload(coverImage.path, {
        folder: 'covers',
      });
    } else if (coverUrl) {
      resultImage.secure_url = coverUrl;
    }

    // File size: only if local file
    let fileSize = 0;
    if (pdfFile) {
      try {
        fileSize = fs.statSync(pdfFile.path).size;
      } catch (err) {
        console.warn('[WARNING] Failed to get file size for local PDF:', err.message);
        fileSize = 1; // Set to 1 to pass validation if file exists in Cloudinary
      }
    } else if (pdfUrl) {
      fileSize = 1; // Set a default value for remote files
    }

    const uploadedBy = req.user && (req.user.id || req.user._id) ? (req.user.id || req.user._id) : null;
    if (!uploadedBy) {
      return res.status(400).json({ message: 'User not authenticated' });
    }

    const newBook = new Book({
      title,
      author,
      category,
      description,
      fileUrl: resultPDF.secure_url,
      coverImageUrl: resultImage.secure_url,
      fileSize,
      uploadedBy,
    });

    await newBook.save();
    res.status(201).json({ message: 'Book uploaded successfully', book: newBook });

  } catch (error) {
    console.error('[UPLOAD BOOK ERROR]', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// =====================
// Get all categories
// =====================
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json(categories);
  } catch (error) {
    console.error('[GET CATEGORIES ERROR]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// =====================
// Add new category
// =====================
const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const newCategory = new Category({ name });
    await newCategory.save();
    res.status(201).json({ message: 'Category added successfully', category: newCategory });
  } catch (error) {
    console.error('[ADD CATEGORY ERROR]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// =====================
// Get all book requests
// =====================
const getRequests = async (req, res) => {
  try {
    const requests = await Request.find({}).populate('requestedBy', 'username email');
    res.status(200).json(requests);
  } catch (error) {
    console.error('[GET REQUESTS ERROR]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// =====================
// Update request status
// =====================
const updateRequestStatus = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status } = req.body;

    if (!['Pending', 'Fulfilled', 'Declined'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const request = await Request.findByIdAndUpdate(requestId, { status }, { new: true });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.status(200).json({ message: 'Status updated', request });
  } catch (error) {
    console.error('[UPDATE REQUEST STATUS ERROR]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// =====================
// Get admin dashboard summary
// =====================
const getAdminDashboard = async (req, res) => {
  try {
    const books = await Book.countDocuments();
    const users = await User.countDocuments();
    const requests = await Request.countDocuments();
    res.status(200).json({ books, users, requests });
  } catch (error) {
    console.error('[GET DASHBOARD ERROR]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// =====================
// Get all books
// =====================
const getAllUploadedBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.status(200).json(books);
  } catch (error) {
    console.error('[GET ALL BOOKS ERROR]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// =====================
// Get detailed stats
// =====================
const getAdminDashboardStats = async (req, res) => {
  try {
    const bookStats = await Book.aggregate([
      { $group: { _id: '$category', total: { $sum: 1 } } },
    ]);

    const userStats = await User.aggregate([
      { $group: { _id: '$role', total: { $sum: 1 } } },
    ]);

    const requestStats = await Request.aggregate([
      { $group: { _id: '$status', total: { $sum: 1 } } },
    ]);

    res.status(200).json({
      bookStats,
      userStats,
      requestStats,
    });
  } catch (error) {
    console.error('[GET STATS ERROR]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// =====================
// Utility: Extract Cloudinary public ID from URL
// =====================
const extractCloudinaryPublicId = (url, type = 'image') => {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    const folder = type === 'raw' ? 'pdfs' : 'covers';
    const folderIndex = pathSegments.indexOf(folder);
    if (folderIndex === -1) return null;
    const publicIdParts = pathSegments.slice(folderIndex);
    const last = publicIdParts[publicIdParts.length - 1];
    publicIdParts[publicIdParts.length - 1] = last.replace(/\.[^/.]+$/, '');
    return publicIdParts.join('/');
  } catch (err) {
    console.error('[EXTRACT PUBLIC ID ERROR]', err);
    return null;
  }
};

// =====================
// Cloudinary Cleanup Helper
// =====================
const deleteCloudResources = async (book) => {
  try {
    if (book.coverImage?.public_id) {
      await cloudinary.uploader.destroy(book.coverImage.public_id);
    } else if (book.coverImage?.url) {
      const pid = extractCloudinaryPublicId(book.coverImage.url, 'image');
      if (pid) await cloudinary.uploader.destroy(pid);
    }

    if (book.pdf?.public_id) {
      await cloudinary.uploader.destroy(book.pdf.public_id, { resource_type: 'raw' });
    } else if (book.pdf?.url) {
      const pid = extractCloudinaryPublicId(book.pdf.url, 'raw');
      if (pid) await cloudinary.uploader.destroy(pid, { resource_type: 'raw' });
    }
  } catch (err) {
    console.error('[CLOUDINARY DELETE ERROR]', err);
  }
};

// =====================
// Delete book by ID
// =====================
const deleteBook = async (req, res) => {
  console.log("DELETE /api/admin/books/:id called", req.params.id);
  try {
    const bookId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      console.log("Invalid book ID");
      return res.status(400).json({ message: 'Invalid book ID' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      console.log("Book not found");
      return res.status(404).json({ message: 'Book not found' });
    }

    console.log("Book found, attempting Cloudinary delete...");
    await deleteCloudResources(book);

    console.log("Deleting downloads related to this book...");
    await Download.deleteMany({ book: bookId });

    console.log("Deleting book from DB...");
    await Book.findByIdAndDelete(bookId);

    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('[DELETE BOOK ERROR]', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// =====================
// Exports
// =====================
module.exports = {
  uploadBook,
  getCategories,
  addCategory,
  getRequests,
  updateRequestStatus,
  getAdminDashboard,
  getAdminDashboardStats,
  getAllUploadedBooks,
  deleteCloudResources,
  deleteBook,
};

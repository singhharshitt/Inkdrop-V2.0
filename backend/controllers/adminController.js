const Book = require("../models/Book");
const Category = require("../models/Category");
const Request = require("../models/Request");
const User = require("../models/User");
const Download = require("../models/Download");
const mongoose = require("mongoose");

const getAdminDashboard = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalUsers = await User.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: "pending" });

    res.json({
      totalBooks,
      totalUsers,
      pendingRequests,
    });
  } catch (error) {
    console.error('[ADMIN DASHBOARD ERROR]', error);
    res.status(500).json({ message: 'Failed to load dashboard data' });
  }
};

const uploadBook = async (req, res) => {
  try {
    const { title, author, category, description } = req.body;
    const cover = req.files.cover?.[0];
    const pdf = req.files.pdf?.[0];

    if (!title || !author || !category || !description || !cover || !pdf) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check or create category
    let foundCategory = await Category.findOne({ name: category });
    if (!foundCategory) {
      foundCategory = await Category.create({ name: category });
    }

    // Fallback if req.user is not available
    const uploadedBy = req.user?._id || new mongoose.Types.ObjectId("64b93d56b7fdc610e06e1c41");

    // Use Cloudinary secure URL
    const book = await Book.create({
      title,
      author,
      category: foundCategory.name,
      description,
      fileUrl: pdf.path, // Cloudinary URL
      fileSize: pdf.size,
      coverImageUrl: cover.path, // Cloudinary URL
      uploadedBy,
    });

    res.status(201).json(book);
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Error fetching categories" });
  }
};

const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const existing = await Category.findOne({ name });
    if (existing) return res.status(400).json({ message: "Category already exists" });

    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: "Error adding category" });
  }
};

const getRequests = async (req, res) => {
  try {
    const requests = await Request.find().sort({ date: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Error fetching requests" });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: "Error updating request" });
  }
};

const getAdminDashboardStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalDownloads = await Download.countDocuments();
    const totalRequests = await Request.countDocuments();

    res.json({
      totalBooks,
      totalUsers,
      totalDownloads,
      totalRequests,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
};

const getAllUploadedBooks = async (req, res) => {
  try {
    const books = await Book.find().populate("uploadedBy", "name email");
    res.json(books);
  } catch (err) {
    console.error("Error fetching uploaded books:", err);
    res.status(500).json({ message: "Error fetching uploaded books" });
  }
};

module.exports = {
  uploadBook,
  getCategories,
  addCategory,
  getRequests,
  updateRequestStatus,
  getAdminDashboard,
  getAdminDashboardStats,
  getAllUploadedBooks
};

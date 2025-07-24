const express = require("express");
const {
  uploadBook: uploadBookController,
  getCategories,
  addCategory,
  getRequests,
  updateRequestStatus,
  getAllUploadedBooks,
  getAdminDashboard,
  deleteCloudResources,
  deleteBook
} = require("../controllers/adminController");

const {
  uploadBook,
  handleUploadErrors
} = require("../middleware/Upload");

const { protect, isAdmin } = require("../middleware/authMiddleware");
const Category = require("../models/Category");
const Book = require("../models/Book"); // Needed for deleting book from DB

const router = express.Router();

// Upload Book (PDF + cover image)
router.post(
  "/upload",
  protect,
  isAdmin,
  uploadBook,
  handleUploadErrors,
  uploadBookController
);

// Get all categories
router.get("/categories", protect, isAdmin, getCategories);

// Add new category
router.post("/categories", protect, isAdmin, addCategory);

// Delete category by ID
router.delete("/categories/:id", protect, isAdmin, async (req, res) => {
  console.log("DELETE /api/admin/categories/:id called", req.params.id);
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      console.log("Category not found");
      return res.status(404).json({ error: "Category not found" });
    }
    console.log("Category deleted from DB");
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("[DELETE CATEGORY ERROR]", err);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

// Get all book requests
router.get("/requests", protect, isAdmin, getRequests);

// Update request status (fulfilled, declined, etc.)
router.patch("/requests/:id", protect, isAdmin, updateRequestStatus);

// Get all uploaded books
router.get("/books", protect, isAdmin, getAllUploadedBooks);

// Delete book by ID
router.delete("/books/:id", protect, isAdmin, deleteBook);

// Cleanup all PDFs and Images from Cloudinary
router.delete("/delete-cloud-resources", protect, isAdmin, deleteCloudResources);

// Admin dashboard stats
router.get("/dashboard", protect, isAdmin, getAdminDashboard);

module.exports = router;

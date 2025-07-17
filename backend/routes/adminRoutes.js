const express = require("express");
const {
  uploadBook: uploadBookController,
  getCategories,
  addCategory,
  getRequests,
  updateRequestStatus,
  getAllUploadedBooks,
  getAdminDashboard 
} = require("../controllers/adminController");

const {
  uploadBook,
  handleUploadErrors
} = require("../middleware/Upload");

const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/upload",
  protect,
  isAdmin,
  uploadBook,
  handleUploadErrors,
  uploadBookController,
);

router.get("/categories", protect, isAdmin, getCategories);
router.post("/categories", protect, isAdmin, addCategory);

router.get("/requests", protect, isAdmin, getRequests);
router.patch("/requests/:id", protect, isAdmin, updateRequestStatus);

router.get("/books", protect, isAdmin, getAllUploadedBooks);


router.get("/dashboard", protect, isAdmin, getAdminDashboard); 

module.exports = router;

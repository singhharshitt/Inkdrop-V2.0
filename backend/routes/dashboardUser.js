
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const Book = require("../models/Book");
const Download = require("../models/Download");

router.get("/:userId", protect, async (req, res) => {
  try {
    const userId = req.params.userId;

    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const totalDownloads = await Download.countDocuments({ user: userId });
    const downloads = await Download.find({ user: userId }).populate("book");

    res.json({
      totalDownloads,
      downloads,
    });
  } catch (error) {
    console.error("Error loading user dashboard:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;

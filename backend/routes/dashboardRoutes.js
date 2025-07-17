const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); 

const Book = require('../models/Book');
const Request = require('../models/Request');
const User = require('../models/User');

// @route    GET /api/dashboard
// @desc     Get real-time dashboard stats for a logged-in user
// @access   Private
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    
    const user = await User.findById(userId).select('-password');

    
    const userBooks = await Book.find({ uploadedBy: userId }).sort({ uploadDate: -1 }).limit(5);

    
    const downloadStats = await Book.aggregate([
      { $match: { uploadedBy: user._id } },
      {
        $group: {
          _id: null,
          totalDownloads: { $sum: "$downloadCount" },
        }
      }
    ]);

    
    const recentlyDownloadedBooks = await Book.find({ downloadedBy: userId })
      .sort({ lastDownloadedAt: -1 })
      .limit(5);

   
    const userRequests = await Request.find({ requestedBy: userId }).sort({ createdAt: -1 }).limit(5);

    
    const totalRequests = await Request.countDocuments({ requestedBy: userId });

    
    let adminData = {};
    if (userRole === 'admin') {
      const totalBooks = await Book.countDocuments();
      const totalUsers = await User.countDocuments();
      const pendingRequests = await Request.countDocuments({ status: 'Pending' });
      adminData = { totalBooks, totalUsers, pendingRequests };
    }

    res.status(200).json({
      user,
      userBooks,
      recentlyDownloadedBooks,
      userRequests,
      totalRequests,
      totalDownloads: downloadStats[0]?.totalDownloads || 0,
      adminData,
    });

  } catch (error) {
    console.error('[Dashboard Error]', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;

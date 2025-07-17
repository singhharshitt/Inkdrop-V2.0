const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware'); 


router.get('/:userId', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    console.error('[NOTIFICATIONS FETCH ERROR]', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { message, type = 'info' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const notification = new Notification({
      user: req.user.id,
      message,
      type,
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    console.error('[NOTIFICATION CREATE ERROR]', err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

module.exports = router;

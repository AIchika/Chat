const express = require('express');
const User = require('../models/User');
const Stream = require('../models/Stream');
const Chat = require('../models/Chat');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments();

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ban user
router.post('/users/:userId/ban', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isBanned = true;
    await user.save();

    res.json({ message: 'User banned successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unban user
router.post('/users/:userId/unban', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isBanned = false;
    await user.save();

    res.json({ message: 'User unbanned successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all streams
router.get('/streams', adminAuth, async (req, res) => {
  try {
    const streams = await Stream.find()
      .populate('streamer', 'username')
      .sort({ createdAt: -1 });

    res.json({ streams });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove stream
router.delete('/streams/:streamId', adminAuth, async (req, res) => {
  try {
    await Stream.findByIdAndDelete(req.params.streamId);
    res.json({ message: 'Stream removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

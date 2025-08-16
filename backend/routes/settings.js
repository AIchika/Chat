const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user settings
router.get('/', auth, async (req, res) => {
  try {
    res.json({ settings: req.user.settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user settings
router.put('/', auth, async (req, res) => {
  try {
    const { theme, chatColor, videoQuality, notifications } = req.body;
    
    if (theme) req.user.settings.theme = theme;
    if (chatColor) req.user.settings.chatColor = chatColor;
    if (videoQuality) req.user.settings.videoQuality = videoQuality;
    if (notifications) req.user.settings.notifications = notifications;

    await req.user.save();

    res.json({
      message: 'Settings updated successfully',
      settings: req.user.settings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

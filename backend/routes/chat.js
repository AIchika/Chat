const express = require('express');
const Chat = require('../models/Chat');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get chat messages for a stream
router.get('/:streamId', async (req, res) => {
  try {
    const { limit = 100, page = 1 } = req.query;
    
    const messages = await Chat.find({ streamId: req.params.streamId })
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send chat message
router.post('/:streamId', auth, async (req, res) => {
  try {
    const { message, messageType = 'text', interactionData } = req.body;
    
    const chatMessage = new Chat({
      streamId: req.params.streamId,
      userId: req.user._id,
      username: req.user.username,
      message,
      messageType,
      interactionData
    });

    await chatMessage.save();

    res.status(201).json({
      message: 'Message sent successfully',
      chatMessage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require('express');
const Interactive = require('../models/Interactive');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create voting poll
router.post('/:streamId/vote', auth, async (req, res) => {
  try {
    const { question, options, duration } = req.body;
    
    const vote = new Interactive({
      streamId: req.params.streamId,
      type: 'vote',
      userId: req.user._id,
      username: req.user.username,
      data: { question, options, duration },
      voteOptions: options.map(option => ({ option, votes: 0, voters: [] })),
      expiresAt: new Date(Date.now() + (duration * 60 * 1000))
    });

    await vote.save();

    res.status(201).json({
      message: 'Vote created successfully',
      vote
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit vote
router.post('/:streamId/vote/:voteId', auth, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    
    const vote = await Interactive.findById(req.params.voteId);
    if (!vote || vote.type !== 'vote') {
      return res.status(404).json({ error: 'Vote not found' });
    }

    if (vote.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Vote has expired' });
    }

    // Remove previous vote if exists
    vote.voteOptions.forEach(option => {
      option.voters = option.voters.filter(id => id.toString() !== req.user._id.toString());
    });

    // Add new vote
    vote.voteOptions[optionIndex].votes += 1;
    vote.voteOptions[optionIndex].voters.push(req.user._id);

    await vote.save();

    res.json({ message: 'Vote submitted successfully', vote });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send power-up
router.post('/:streamId/powerup', auth, async (req, res) => {
  try {
    const { powerUpType, targetUserId } = req.body;
    
    const powerUp = new Interactive({
      streamId: req.params.streamId,
      type: 'power-up',
      userId: req.user._id,
      username: req.user.username,
      data: { powerUpType, targetUserId },
      powerUpType,
      powerUpEffect: powerUpType === 'boost' ? 'positive' : 'negative'
    });

    await powerUp.save();

    res.status(201).json({
      message: 'Power-up sent successfully',
      powerUp
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change soundscape
router.post('/:streamId/soundscape', auth, async (req, res) => {
  try {
    const { mode, backgroundMusic, soundEffects, duration } = req.body;
    
    const soundscape = new Interactive({
      streamId: req.params.streamId,
      type: 'soundscape-change',
      userId: req.user._id,
      username: req.user.username,
      data: { mode, backgroundMusic, soundEffects, duration },
      soundscapeChange: {
        from: 'current',
        to: mode,
        duration: duration || 300
      }
    });

    await soundscape.save();

    res.status(201).json({
      message: 'Soundscape changed successfully',
      soundscape
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active interactions for a stream
router.get('/:streamId', async (req, res) => {
  try {
    const interactions = await Interactive.find({
      streamId: req.params.streamId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    res.json({ interactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

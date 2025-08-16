const express = require('express');
const Stream = require('../models/Stream');
const { auth, streamerAuth } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// Generate unique stream key
const generateStreamKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Create new stream
router.post('/', streamerAuth, async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;
    
    const stream = new Stream({
      title,
      description,
      category,
      tags: tags || [],
      streamer: req.user._id,
      streamKey: generateStreamKey(),
      rtmpUrl: process.env.RTMP_URL || 'rtmp://localhost/live'
    });

    await stream.save();

    res.status(201).json({
      message: 'Stream created successfully',
      stream: {
        id: stream._id,
        title: stream.title,
        streamKey: stream.streamKey,
        rtmpUrl: stream.rtmpUrl
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start stream
router.post('/:streamId/start', streamerAuth, async (req, res) => {
  try {
    const stream = await Stream.findOne({
      _id: req.params.streamId,
      streamer: req.user._id
    });

    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    if (stream.isLive) {
      return res.status(400).json({ error: 'Stream is already live' });
    }

    stream.isLive = true;
    stream.startedAt = new Date();
    await stream.save();

    // Update user stats
    req.user.totalStreams += 1;
    await req.user.save();

    res.json({
      message: 'Stream started successfully',
      stream: {
        id: stream._id,
        title: stream.title,
        isLive: stream.isLive,
        startedAt: stream.startedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// End stream
router.post('/:streamId/end', streamerAuth, async (req, res) => {
  try {
    const stream = await Stream.findOne({
      _id: req.params.streamId,
      streamer: req.user._id
    });

    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    if (!stream.isLive) {
      return res.status(400).json({ error: 'Stream is not live' });
    }

    stream.isLive = false;
    stream.endedAt = new Date();
    stream.peakViewers = Math.max(stream.peakViewers, stream.currentViewers);
    await stream.save();

    res.json({
      message: 'Stream ended successfully',
      stream: {
        id: stream._id,
        title: stream.title,
        duration: stream.duration,
        peakViewers: stream.peakViewers,
        totalViewers: stream.totalViewers
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all live streams
router.get('/live', async (req, res) => {
  try {
    const { category, limit = 20, page = 1 } = req.query;
    
    const query = { isLive: true };
    if (category) query.category = category;

    const streams = await Stream.find(query)
      .populate('streamer', 'username avatar')
      .populate('coHosts', 'username avatar')
      .sort({ currentViewers: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Stream.countDocuments(query);

    res.json({
      streams,
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

// Get stream by ID
router.get('/:streamId', async (req, res) => {
  try {
    const stream = await Stream.findById(req.params.streamId)
      .populate('streamer', 'streamer', 'username avatar bio followers')
      .populate('coHosts', 'username avatar');

    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    res.json({ stream });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update stream settings
router.put('/:streamId', streamerAuth, async (req, res) => {
  try {
    const { title, description, category, tags, gamingMode, soundscape, aiFeatures } = req.body;
    
    const stream = await Stream.findOne({
      _id: req.params.streamId,
      streamId,
      streamer: req.user._id
    });

    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    // Update fields
    if (title) stream.title = title;
    if (description) stream.description = description;
    if (category) stream.category = category;
    if (tags) stream.tags = tags;
    if (gamingMode) stream.gamingMode = gamingMode;
    if (soundscape) stream.soundscape = soundscape;
    if (aiFeatures) stream.aiFeatures = aiFeatures;

    await stream.save();

    res.json({
      message: 'Stream updated successfully',
      stream
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add co-host
router.post('/:streamId/cohost', streamerAuth, async (req, res) => {
  try {
    const { coHostId } = req.body;
    
    const stream = await Stream.findOne({
      _id: req.params.streamId,
      streamer: req.user._id
    });

    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    if (stream.coHosts.includes(coHostId)) {
      return res.status(400).json({ error: 'User is already a co-host' });
    }

    stream.coHosts.push(coHostId);
    await stream.save();

    res.json({
      message: 'Co-host added successfully',
      stream
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove co-host
router.delete('/:streamId/cohost/:coHostId', streamerAuth, async (req, res) => {
  try {
    const stream = await Stream.findOne({
      _id: req.params.streamId,
      streamId,
      streamer: req.user._id
    });

    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    stream.coHosts = stream.coHosts.filter(id => id.toString() !== req.params.coHostId);
    await stream.save();

    res.json({
      message: 'Co-host removed successfully',
      stream
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

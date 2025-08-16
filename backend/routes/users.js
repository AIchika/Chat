const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;
    
    if (username) req.user.username = username;
    if (bio) req.user.bio = bio;
    if (avatar) req.user.avatar = avatar;

    await req.user.save();

    res.json({
      message: 'Profile updated successfully',
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Follow user
router.post('/:userId/follow', auth, async (req, res) => {
  try {
    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const userToFollow = await User.findById(req.params.userId);
    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.user.following.includes(req.params.userId)) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    req.user.following.push(req.params.userId);
    userToFollow.followers.push(req.user._id);

    await Promise.all([req.user.save(), userToFollow.save()]);

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unfollow user
router.delete('/:userId/follow', auth, async (req, res) => {
  try {
    req.user.following = req.user.following.filter(id => id.toString() !== req.params.userId);
    await req.user.save();

    const userToUnfollow = await User.findById(req.params.userId);
    if (userToUnfollow) {
      userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== req.user._id.toString());
      await userToUnfollow.save();
    }

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

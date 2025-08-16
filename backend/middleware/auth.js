const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'Account is banned.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {});
    
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    
    next();
  } catch (error) {
    res.status(403).json({ error: 'Admin access required.' });
  }
};

const streamerAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {});
    
    if (!req.user.isStreamer) {
      return res.status(403).json({ error: 'Streamer access required.' });
    }
    
    next();
  } catch (error) {
    res.status(403).json({ error: 'Streamer access required.' });
  }
};

module.exports = { auth, adminAuth, streamerAuth };

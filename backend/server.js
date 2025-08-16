const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:8081",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:8081",
  credentials: true
}));
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatt-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Basic routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Chatt Backend API' });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Chatt API is running', 
    timestamp: new Date() 
  });
});

// Live streaming routes
app.post('/api/streams/start', (req, res) => {
  const { userId, title, description, category } = req.body;
  // TODO: Save stream to database
  res.json({ 
    success: true, 
    streamId: `stream_${Date.now()}`,
    message: 'Stream started successfully' 
  });
});

app.post('/api/streams/end', (req, res) => {
  const { streamId } = req.body;
  // TODO: End stream in database
  res.json({ 
    success: true, 
    message: 'Stream ended successfully' 
  });
});

// WebRTC signaling routes
app.post('/api/webrtc/offer', (req, res) => {
  const { streamId, offer, userId } = req.body;
  // TODO: Handle WebRTC offer
  res.json({ success: true, message: 'Offer received' });
});

app.post('/api/webrtc/answer', (req, res) => {
  const { streamId, answer, userId } = req.body;
  // TODO: Handle WebRTC answer
  res.json({ success: true, message: 'Answer received' });
});

app.post('/api/webrtc/ice-candidate', (req, res) => {
  const { streamId, candidate, userId } = req.body;
  // TODO: Handle ICE candidate
  res.json({ success: true, message: 'ICE candidate received' });
});

// Socket.io connection handling with WebRTC support
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Join a stream room
  socket.on('join-stream', (data) => {
    const { streamId, userId, userType } = data;
    socket.join(streamId);
    socket.to(streamId).emit('user-joined', { userId, userType, socketId: socket.id });
    console.log(`👥 User ${userId} (${userType}) joined stream ${streamId}`);
  });

  // Leave a stream room
  socket.on('leave-stream', (data) => {
    const { streamId, userId } = data;
    socket.leave(streamId);
    socket.to(streamId).emit('user-left', { userId, socketId: socket.id });
    console.log(`👋 User ${userId} left stream ${streamId}`);
  });

  // WebRTC signaling events
  socket.on('webrtc-offer', (data) => {
    const { streamId, offer, fromUserId, toUserId } = data;
    socket.to(streamId).emit('webrtc-offer', { offer, fromUserId, toUserId });
    console.log(`📡 WebRTC offer from ${fromUserId} to ${toUserId} in stream ${streamId}`);
  });

  socket.on('webrtc-answer', (data) => {
    const { streamId, answer, fromUserId, toUserId } = data;
    socket.to(streamId).emit('webrtc-answer', { answer, fromUserId, toUserId });
    console.log(`📡 WebRTC answer from ${fromUserId} to ${toUserId} in stream ${streamId}`);
  });

  socket.on('webrtc-ice-candidate', (data) => {
    const { streamId, candidate, fromUserId, toUserId } = data;
    socket.to(streamId).emit('webrtc-ice-candidate', { candidate, fromUserId, toUserId });
    console.log(`🧊 ICE candidate from ${fromUserId} to ${toUserId} in stream ${streamId}`);
  });

  // Chat functionality
  socket.on('chat-message', (data) => {
    const { streamId, userId, message, timestamp } = data;
    io.to(streamId).emit('new-chat-message', { userId, message, timestamp: timestamp || new Date() });
    console.log(`💬 Chat message from ${userId} in stream ${streamId}: ${message}`);
  });

  // Live streaming controls
  socket.on('stream-control', (data) => {
    const { streamId, controlType, value, userId } = data;
    io.to(streamId).emit('stream-control-update', { controlType, value, userId });
    console.log(`🎮 Stream control: ${controlType} = ${value} by ${userId} in stream ${streamId}`);
  });

  // Viewer interactions (gaming, power-ups, etc.)
  socket.on('viewer-interaction', (data) => {
    const { streamId, type, data: interactionData, userId } = data;
    io.to(streamId).emit('viewer-interaction', { type, data: interactionData, userId });
    console.log(`🎯 Viewer interaction: ${type} by ${userId} in stream ${streamId}`);
  });

  // Multi-view camera switching
  socket.on('camera-switch', (data) => {
    const { streamId, cameraType, userId } = data;
    io.to(streamId).emit('camera-switched', { cameraType, userId });
    console.log(`📹 Camera switched to ${cameraType} by ${userId} in stream ${streamId}`);
  });

  // Dynamic soundscape controls
  socket.on('soundscape-control', (data) => {
    const { streamId, mode, intensity, userId } = data;
    io.to(streamId).emit('soundscape-update', { mode, intensity, userId });
    console.log(`🎵 Soundscape: ${mode} mode at intensity ${intensity} by ${userId} in stream ${streamId}`);
  });

  // Co-host management
  socket.on('cohost-invite', (data) => {
    const { streamId, fromUserId, toUserId } = data;
    socket.to(streamId).emit('cohost-invitation', { fromUserId, toUserId });
    console.log(`🤝 Co-host invitation from ${fromUserId} to ${toUserId} in stream ${streamId}`);
  });

  socket.on('cohost-accept', (data) => {
    const { streamId, userId } = data;
    io.to(streamId).emit('cohost-joined', { userId });
    console.log(`✅ Co-host ${userId} accepted invitation in stream ${streamId}`);
  });

  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`🚀 Chatt Backend Server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready for real-time connections`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8081'}`);
  console.log(`🔌 WebRTC signaling ready for live streaming`);
  console.log(`💬 Real-time chat and interactions enabled`);
});

module.exports = { app, server, io };

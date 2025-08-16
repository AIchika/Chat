const mongoose = require('mongoose');

const streamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['gaming', 'just-chatting', 'music', 'art', 'education', 'sports', 'other']
  },
  streamer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coHosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isLive: {
    type: Boolean,
    default: false
  },
  startedAt: {
    type: Date
  },
  endedAt: {
    type: Date
  },
  currentViewers: {
    type: Number,
    default: 0
  },
  peakViewers: {
    type: Number,
    default: 0
  },
  totalViewers: {
    type: Number,
    default: 0
  },
  streamKey: {
    type: String,
    required: true,
    unique: true
  },
  rtmpUrl: {
    type: String,
    default: ''
  },
  thumbnail: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  // Multi-view camera support
  cameras: {
    main: { type: String, default: '' },
    closeUp: { type: String, default: '' },
    keyboardCam: { type: String, default: '' },
    directorsCut: { type: String, default: '' }
  },
  // Dynamic soundscapes
  soundscape: {
    mode: {
      type: String,
      enum: ['normal', 'horror', 'chill', 'energetic', 'focus'],
      default: 'normal'
    },
    backgroundMusic: { type: String, default: '' },
    soundEffects: { type: String, default: '' }
  },
  // Gaming interaction settings
  gamingMode: {
    enabled: { type: Boolean, default: false },
    gameType: { type: String, default: '' },
    allowViewerParticipation: { type: Boolean, default: false },
    votingEnabled: { type: Boolean, default: false },
    powerUpsEnabled: { type: Boolean, default: false }
  },
  // AI features
  aiFeatures: {
    subtitles: { type: Boolean, default: false },
    translation: { type: Boolean, default: false },
    languages: [{ type: String, default: 'en' }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
streamSchema.index({ isLive: 1, category: 1 });
streamSchema.index({ streamer: 1, isLive: 1 });
streamSchema.index({ tags: 1 });

// Virtual for duration
streamSchema.virtual('duration').get(function() {
  if (!this.startedAt) return 0;
  const endTime = this.endedAt || new Date();
  return Math.floor((endTime - this.startedAt) / 1000);
});

// Virtual for average viewers
streamSchema.virtual('averageViewers').get(function() {
  if (this.totalViewers === 0) return 0;
  return Math.round(this.totalViewers / this.duration * 60);
});

// Ensure virtual fields are serialized
streamSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Stream', streamSchema);

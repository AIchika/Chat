const mongoose = require('mongoose');

const interactiveSchema = new mongoose.Schema({
  streamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stream',
    required: true
  },
  type: {
    type: String,
    enum: ['vote', 'power-up', 'gaming-participation', 'soundscape-change', 'camera-switch'],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  username: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  // For voting
  voteOptions: [{
    option: String,
    votes: Number,
    voters: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  // For power-ups
  powerUpType: {
    type: String,
    enum: ['boost', 'hinder', 'special', 'gift']
  },
  powerUpEffect: {
    type: String,
    enum: ['positive', 'negative', 'neutral']
  },
  // For gaming
  gameAction: {
    type: String
  },
  gameResult: {
    type: mongoose.Schema.Types.Mixed
  },
  // For soundscapes
  soundscapeChange: {
    from: String,
    to: String,
    duration: Number
  },
  // For camera switching
  cameraChange: {
    from: String,
    to: String,
    reason: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
interactiveSchema.index({ streamId: 1, type: 1, isActive: 1 });
interactiveSchema.index({ userId: 1, createdAt: -1 });
interactiveSchema.index({ expiresAt: 1 });

// Virtual for total votes
interactiveSchema.virtual('totalVotes').get(function() {
  if (this.type === 'vote' && this.voteOptions) {
    return this.voteOptions.reduce((total, option) => total + option.votes, 0);
  }
  return 0;
});

// Ensure virtual fields are serialized
interactiveSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Interactive', interactiveSchema);

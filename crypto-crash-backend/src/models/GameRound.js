const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true
  },
  usdAmount: {
    type: Number,
    required: true,
    min: 0
  },
  cryptoAmount: {
    type: Number,
    required: true,
    min: 0
  },
  cryptocurrency: {
    type: String,
    required: true,
    enum: ['bitcoin', 'ethereum']
  },
  priceAtTime: {
    type: Number,
    required: true,
    min: 0
  },
  cashedOut: {
    type: Boolean,
    default: false
  },
  cashoutMultiplier: {
    type: Number,
    default: null,
    min: 1
  },
  cashoutAmount: {
    type: Number,
    default: null,
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const gameRoundSchema = new mongoose.Schema({
  roundId: {
    type: String,
    required: true,
    unique: true
  },
  seed: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true
  },
  crashPoint: {
    type: Number,
    required: true,
    min: 1
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'crashed', 'completed'],
    default: 'waiting'
  },
  bets: [betSchema],
  maxMultiplier: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GameRound', gameRoundSchema);


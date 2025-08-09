const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  bitcoin: {
    type: Number,
    default: 0,
    min: 0
  },
  ethereum: {
    type: Number,
    default: 0,
    min: 0
  }
});

const playerSchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  wallet: walletSchema,
  totalBets: {
    type: Number,
    default: 0
  },
  totalWins: {
    type: Number,
    default: 0
  },
  totalLosses: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Player', playerSchema);


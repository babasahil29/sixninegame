const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  playerId: {
    type: String,
    required: true
  },
  roundId: {
    type: String,
    required: true
  },
  transactionType: {
    type: String,
    enum: ['bet', 'cashout', 'deposit', 'withdrawal'],
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
  transactionHash: {
    type: String,
    required: true
  },
  multiplier: {
    type: Number,
    default: null,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);


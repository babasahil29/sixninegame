const express = require('express');
const router = express.Router();
const WalletController = require('../controllers/WalletController');
const { 
  validatePlayerCreation, 
  validateWalletTransaction, 
  validateTransferRequest,
  validatePagination 
} = require('../middleware/validation');
const { limiters } = require('../middleware/rateLimiter');

// Create new player
router.post('/player', limiters.strict, validatePlayerCreation, WalletController.createPlayer);

// Get player wallet balance
router.get('/balance/:playerId', limiters.general, WalletController.getWalletBalance);

// Deposit cryptocurrency
router.post('/deposit', limiters.walletOperations, validateWalletTransaction, WalletController.depositCrypto);

// Withdraw cryptocurrency
router.post('/withdraw', limiters.walletOperations, validateWalletTransaction, WalletController.withdrawCrypto);

// Transfer cryptocurrency between players
router.post('/transfer', limiters.walletOperations, validateTransferRequest, WalletController.transferCrypto);

// Get transaction history
router.get('/transactions/:playerId', limiters.general, validatePagination, WalletController.getTransactionHistory);

// Get all players
router.get('/players', limiters.general, validatePagination, WalletController.getAllPlayers);

// Update player status
router.put('/player/:playerId/status', limiters.strict, WalletController.updatePlayerStatus);

module.exports = router;


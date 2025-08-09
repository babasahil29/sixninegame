const express = require('express');
const router = express.Router();
const GameController = require('../controllers/GameController');
const { validateBetRequest, validateCashoutRequest, validatePagination } = require('../middleware/validation');
const { limiters } = require('../middleware/rateLimiter');

// Get current game state
router.get('/state', limiters.general, GameController.getGameState);

// Place a bet
router.post('/bet', limiters.gameActions, validateBetRequest, GameController.placeBet);

// Cash out
router.post('/cashout', limiters.gameActions, validateCashoutRequest, GameController.cashOut);

// Get game history
router.get('/history', limiters.general, validatePagination, GameController.getGameHistory);

// Get round details
router.get('/round/:roundId', limiters.general, GameController.getRoundDetails);

// Verify round (provably fair)
router.post('/verify', limiters.strict, GameController.verifyRound);

module.exports = router;


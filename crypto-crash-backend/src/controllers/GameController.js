const GameRound = require('../models/GameRound');
const CryptoUtils = require('../utils/cryptoUtils');

class GameController {
  /**
   * Get current game state
   */
  static async getGameState(req, res) {
    try {
      // This will be injected by the server when GameService is available
      const gameService = req.app.locals.gameService;
      
      if (!gameService) {
        return res.status(500).json({
          success: false,
          message: 'Game service not available'
        });
      }

      const gameState = gameService.getCurrentGameState();
      
      res.json({
        success: true,
        data: gameState
      });
    } catch (error) {
      console.error('Error getting game state:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Place a bet
   */
  static async placeBet(req, res) {
    try {
      const { playerId, usdAmount, cryptocurrency } = req.body;

      // Validation
      if (!playerId || !usdAmount || !cryptocurrency) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: playerId, usdAmount, cryptocurrency'
        });
      }

      if (usdAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Bet amount must be positive'
        });
      }

      if (!['bitcoin', 'ethereum'].includes(cryptocurrency)) {
        return res.status(400).json({
          success: false,
          message: 'Cryptocurrency must be bitcoin or ethereum'
        });
      }

      const gameService = req.app.locals.gameService;
      if (!gameService) {
        return res.status(500).json({
          success: false,
          message: 'Game service not available'
        });
      }

      const result = await gameService.placeBet(playerId, usdAmount, cryptocurrency);
      
      res.json({
        success: true,
        message: 'Bet placed successfully',
        data: result
      });
    } catch (error) {
      console.error('Error placing bet:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Cash out
   */
  static async cashOut(req, res) {
    try {
      const { playerId } = req.body;

      if (!playerId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required field: playerId'
        });
      }

      const gameService = req.app.locals.gameService;
      if (!gameService) {
        return res.status(500).json({
          success: false,
          message: 'Game service not available'
        });
      }

      const result = await gameService.cashOut(playerId);
      
      res.json({
        success: true,
        message: 'Cashed out successfully',
        data: result
      });
    } catch (error) {
      console.error('Error cashing out:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get game history
   */
  static async getGameHistory(req, res) {
    try {
      const { limit = 20, page = 1 } = req.query;
      const skip = (page - 1) * limit;

      const rounds = await GameRound.find({ status: 'completed' })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .select('roundId crashPoint startTime endTime bets maxMultiplier');

      const total = await GameRound.countDocuments({ status: 'completed' });

      res.json({
        success: true,
        data: {
          rounds,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting game history:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get round details
   */
  static async getRoundDetails(req, res) {
    try {
      const { roundId } = req.params;

      const round = await GameRound.findOne({ roundId });
      
      if (!round) {
        return res.status(404).json({
          success: false,
          message: 'Round not found'
        });
      }

      res.json({
        success: true,
        data: round
      });
    } catch (error) {
      console.error('Error getting round details:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Verify round (provably fair)
   */
  static async verifyRound(req, res) {
    try {
      const { roundId, seed, crashPoint } = req.body;

      if (!roundId || !seed || !crashPoint) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: roundId, seed, crashPoint'
        });
      }

      const round = await GameRound.findOne({ roundId });
      
      if (!round) {
        return res.status(404).json({
          success: false,
          message: 'Round not found'
        });
      }

      // Extract round number from roundId
      const roundNumber = parseInt(roundId.split('_')[2]) || 0;
      
      // Verify the crash point
      const isValid = CryptoUtils.verifyCrashPoint(seed, roundNumber, crashPoint);
      const calculatedCrashPoint = CryptoUtils.generateCrashPoint(seed, roundNumber);
      const calculatedHash = CryptoUtils.generateHash(seed, roundNumber);

      res.json({
        success: true,
        data: {
          roundId,
          isValid,
          providedSeed: seed,
          providedCrashPoint: crashPoint,
          calculatedCrashPoint,
          calculatedHash,
          storedHash: round.hash,
          storedCrashPoint: round.crashPoint,
          hashMatches: calculatedHash === round.hash,
          crashPointMatches: Math.abs(calculatedCrashPoint - round.crashPoint) < 0.01
        }
      });
    } catch (error) {
      console.error('Error verifying round:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = GameController;


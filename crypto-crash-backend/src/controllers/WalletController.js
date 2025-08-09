const WalletService = require('../services/WalletService');

class WalletController {
  /**
   * Create a new player
   */
  static async createPlayer(req, res) {
    try {
      const { playerId, username, initialBalance } = req.body;

      if (!playerId || !username) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: playerId, username'
        });
      }

      // Validate playerId format (alphanumeric and underscores only)
      if (!/^[a-zA-Z0-9_]+$/.test(playerId)) {
        return res.status(400).json({
          success: false,
          message: 'Player ID must contain only letters, numbers, and underscores'
        });
      }

      // Validate username length
      if (username.length < 3 || username.length > 20) {
        return res.status(400).json({
          success: false,
          message: 'Username must be between 3 and 20 characters'
        });
      }

      const walletService = new WalletService();
      const player = await walletService.createPlayer(playerId, username, initialBalance);
      
      res.status(201).json({
        success: true,
        message: 'Player created successfully',
        data: player
      });
    } catch (error) {
      console.error('Error creating player:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get player wallet balance
   */
  static async getWalletBalance(req, res) {
    try {
      const { playerId } = req.params;

      if (!playerId) {
        return res.status(400).json({
          success: false,
          message: 'Player ID is required'
        });
      }

      const walletService = new WalletService();
      const balance = await walletService.getWalletBalance(playerId);
      
      res.json({
        success: true,
        data: balance
      });
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      const statusCode = error.message === 'Player not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Deposit cryptocurrency
   */
  static async depositCrypto(req, res) {
    try {
      const { playerId, amount, cryptocurrency } = req.body;

      if (!playerId || !amount || !cryptocurrency) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: playerId, amount, cryptocurrency'
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be positive'
        });
      }

      if (!['bitcoin', 'ethereum'].includes(cryptocurrency)) {
        return res.status(400).json({
          success: false,
          message: 'Cryptocurrency must be bitcoin or ethereum'
        });
      }

      const walletService = new WalletService();
      const result = await walletService.depositCrypto(playerId, amount, cryptocurrency);
      
      res.json({
        success: true,
        message: 'Deposit successful',
        data: result
      });
    } catch (error) {
      console.error('Error depositing crypto:', error);
      const statusCode = error.message === 'Player not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Withdraw cryptocurrency
   */
  static async withdrawCrypto(req, res) {
    try {
      const { playerId, amount, cryptocurrency } = req.body;

      if (!playerId || !amount || !cryptocurrency) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: playerId, amount, cryptocurrency'
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be positive'
        });
      }

      if (!['bitcoin', 'ethereum'].includes(cryptocurrency)) {
        return res.status(400).json({
          success: false,
          message: 'Cryptocurrency must be bitcoin or ethereum'
        });
      }

      const walletService = new WalletService();
      const result = await walletService.withdrawCrypto(playerId, amount, cryptocurrency);
      
      res.json({
        success: true,
        message: 'Withdrawal successful',
        data: result
      });
    } catch (error) {
      console.error('Error withdrawing crypto:', error);
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Transfer cryptocurrency between players
   */
  static async transferCrypto(req, res) {
    try {
      const { fromPlayerId, toPlayerId, amount, cryptocurrency } = req.body;

      if (!fromPlayerId || !toPlayerId || !amount || !cryptocurrency) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: fromPlayerId, toPlayerId, amount, cryptocurrency'
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be positive'
        });
      }

      if (!['bitcoin', 'ethereum'].includes(cryptocurrency)) {
        return res.status(400).json({
          success: false,
          message: 'Cryptocurrency must be bitcoin or ethereum'
        });
      }

      const walletService = new WalletService();
      const result = await walletService.transferCrypto(fromPlayerId, toPlayerId, amount, cryptocurrency);
      
      res.json({
        success: true,
        message: 'Transfer successful',
        data: result
      });
    } catch (error) {
      console.error('Error transferring crypto:', error);
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get transaction history
   */
  static async getTransactionHistory(req, res) {
    try {
      const { playerId } = req.params;
      const { limit, page, type } = req.query;

      if (!playerId) {
        return res.status(400).json({
          success: false,
          message: 'Player ID is required'
        });
      }

      const walletService = new WalletService();
      const history = await walletService.getTransactionHistory(playerId, {
        limit,
        page,
        type
      });
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Error getting transaction history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get transaction history'
      });
    }
  }

  /**
   * Get all players
   */
  static async getAllPlayers(req, res) {
    try {
      const { limit, page, active } = req.query;

      const walletService = new WalletService();
      const players = await walletService.getAllPlayers({
        limit,
        page,
        active: active !== undefined ? active === 'true' : null
      });
      
      res.json({
        success: true,
        data: players
      });
    } catch (error) {
      console.error('Error getting all players:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get players'
      });
    }
  }

  /**
   * Update player status
   */
  static async updatePlayerStatus(req, res) {
    try {
      const { playerId } = req.params;
      const { isActive } = req.body;

      if (!playerId) {
        return res.status(400).json({
          success: false,
          message: 'Player ID is required'
        });
      }

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'isActive must be a boolean value'
        });
      }

      const walletService = new WalletService();
      const player = await walletService.updatePlayerStatus(playerId, isActive);
      
      res.json({
        success: true,
        message: 'Player status updated successfully',
        data: player
      });
    } catch (error) {
      console.error('Error updating player status:', error);
      const statusCode = error.message === 'Player not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = WalletController;


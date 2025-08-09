const Player = require('../models/Player');
const Transaction = require('../models/Transaction');
const CryptoService = require('./CryptoService');
const CryptoUtils = require('../utils/cryptoUtils');

class WalletService {
  constructor() {
    this.cryptoService = new CryptoService();
  }

  /**
   * Create a new player with initial wallet
   * @param {string} playerId - Unique player ID
   * @param {string} username - Player username
   * @param {Object} initialBalance - Initial crypto balances
   * @returns {Promise<Object>} Created player
   */
  async createPlayer(playerId, username, initialBalance = {}) {
    try {
      const existingPlayer = await Player.findOne({ 
        $or: [{ playerId }, { username }] 
      });

      if (existingPlayer) {
        throw new Error('Player ID or username already exists');
      }

      const player = new Player({
        playerId,
        username,
        wallet: {
          bitcoin: initialBalance.bitcoin || 0,
          ethereum: initialBalance.ethereum || 0
        }
      });

      await player.save();

      console.log(`Created player: ${playerId} (${username})`);
      return player;
    } catch (error) {
      console.error('Error creating player:', error);
      throw error;
    }
  }

  /**
   * Get player wallet balance
   * @param {string} playerId - Player ID
   * @returns {Promise<Object>} Wallet balance with USD equivalents
   */
  async getWalletBalance(playerId) {
    try {
      const player = await Player.findOne({ playerId });
      
      if (!player) {
        throw new Error('Player not found');
      }

      // Get current crypto prices
      const prices = await this.cryptoService.getCurrentPrices();

      // Calculate USD equivalents
      const balanceWithUsd = {
        bitcoin: {
          amount: player.wallet.bitcoin,
          usdValue: player.wallet.bitcoin * prices.bitcoin
        },
        ethereum: {
          amount: player.wallet.ethereum,
          usdValue: player.wallet.ethereum * prices.ethereum
        }
      };

      const totalUsdValue = balanceWithUsd.bitcoin.usdValue + balanceWithUsd.ethereum.usdValue;

      return {
        playerId,
        username: player.username,
        wallet: balanceWithUsd,
        totalUsdValue,
        prices,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      throw error;
    }
  }

  /**
   * Deposit cryptocurrency to player wallet
   * @param {string} playerId - Player ID
   * @param {number} amount - Amount to deposit
   * @param {string} cryptocurrency - Cryptocurrency type
   * @returns {Promise<Object>} Transaction result
   */
  async depositCrypto(playerId, amount, cryptocurrency) {
    try {
      if (amount <= 0) {
        throw new Error('Deposit amount must be positive');
      }

      if (!['bitcoin', 'ethereum'].includes(cryptocurrency)) {
        throw new Error('Unsupported cryptocurrency');
      }

      const player = await Player.findOne({ playerId });
      if (!player) {
        throw new Error('Player not found');
      }

      // Add to wallet
      player.wallet[cryptocurrency] += amount;
      await player.save();

      // Get current price for transaction record
      const price = await this.cryptoService.getCurrentPrice(cryptocurrency);
      const usdValue = amount * price;

      // Create transaction record
      const transaction = new Transaction({
        transactionId: CryptoUtils.generateTransactionHash(),
        playerId,
        roundId: 'deposit', // Special round ID for deposits
        transactionType: 'deposit',
        usdAmount: usdValue,
        cryptoAmount: amount,
        cryptocurrency,
        priceAtTime: price,
        transactionHash: CryptoUtils.generateTransactionHash()
      });

      await transaction.save();

      console.log(`Deposited ${amount} ${cryptocurrency} to player ${playerId}`);

      return {
        success: true,
        transaction: transaction.transactionId,
        newBalance: player.wallet[cryptocurrency],
        usdValue,
        priceAtTime: price
      };
    } catch (error) {
      console.error('Error depositing crypto:', error);
      throw error;
    }
  }

  /**
   * Withdraw cryptocurrency from player wallet
   * @param {string} playerId - Player ID
   * @param {number} amount - Amount to withdraw
   * @param {string} cryptocurrency - Cryptocurrency type
   * @returns {Promise<Object>} Transaction result
   */
  async withdrawCrypto(playerId, amount, cryptocurrency) {
    try {
      if (amount <= 0) {
        throw new Error('Withdrawal amount must be positive');
      }

      if (!['bitcoin', 'ethereum'].includes(cryptocurrency)) {
        throw new Error('Unsupported cryptocurrency');
      }

      const player = await Player.findOne({ playerId });
      if (!player) {
        throw new Error('Player not found');
      }

      if (player.wallet[cryptocurrency] < amount) {
        throw new Error('Insufficient balance');
      }

      // Deduct from wallet
      player.wallet[cryptocurrency] -= amount;
      await player.save();

      // Get current price for transaction record
      const price = await this.cryptoService.getCurrentPrice(cryptocurrency);
      const usdValue = amount * price;

      // Create transaction record
      const transaction = new Transaction({
        transactionId: CryptoUtils.generateTransactionHash(),
        playerId,
        roundId: 'withdrawal', // Special round ID for withdrawals
        transactionType: 'withdrawal',
        usdAmount: usdValue,
        cryptoAmount: amount,
        cryptocurrency,
        priceAtTime: price,
        transactionHash: CryptoUtils.generateTransactionHash()
      });

      await transaction.save();

      console.log(`Withdrew ${amount} ${cryptocurrency} from player ${playerId}`);

      return {
        success: true,
        transaction: transaction.transactionId,
        newBalance: player.wallet[cryptocurrency],
        usdValue,
        priceAtTime: price
      };
    } catch (error) {
      console.error('Error withdrawing crypto:', error);
      throw error;
    }
  }

  /**
   * Transfer cryptocurrency between players
   * @param {string} fromPlayerId - Sender player ID
   * @param {string} toPlayerId - Receiver player ID
   * @param {number} amount - Amount to transfer
   * @param {string} cryptocurrency - Cryptocurrency type
   * @returns {Promise<Object>} Transaction result
   */
  async transferCrypto(fromPlayerId, toPlayerId, amount, cryptocurrency) {
    try {
      if (amount <= 0) {
        throw new Error('Transfer amount must be positive');
      }

      if (!['bitcoin', 'ethereum'].includes(cryptocurrency)) {
        throw new Error('Unsupported cryptocurrency');
      }

      if (fromPlayerId === toPlayerId) {
        throw new Error('Cannot transfer to the same player');
      }

      const fromPlayer = await Player.findOne({ playerId: fromPlayerId });
      const toPlayer = await Player.findOne({ playerId: toPlayerId });

      if (!fromPlayer) {
        throw new Error('Sender player not found');
      }

      if (!toPlayer) {
        throw new Error('Receiver player not found');
      }

      if (fromPlayer.wallet[cryptocurrency] < amount) {
        throw new Error('Insufficient balance');
      }

      // Perform transfer
      fromPlayer.wallet[cryptocurrency] -= amount;
      toPlayer.wallet[cryptocurrency] += amount;

      await fromPlayer.save();
      await toPlayer.save();

      // Get current price for transaction record
      const price = await this.cryptoService.getCurrentPrice(cryptocurrency);
      const usdValue = amount * price;

      // Create transaction records for both players
      const transferId = CryptoUtils.generateTransactionHash();
      
      const fromTransaction = new Transaction({
        transactionId: CryptoUtils.generateTransactionHash(),
        playerId: fromPlayerId,
        roundId: `transfer_${transferId}`,
        transactionType: 'withdrawal',
        usdAmount: usdValue,
        cryptoAmount: amount,
        cryptocurrency,
        priceAtTime: price,
        transactionHash: transferId
      });

      const toTransaction = new Transaction({
        transactionId: CryptoUtils.generateTransactionHash(),
        playerId: toPlayerId,
        roundId: `transfer_${transferId}`,
        transactionType: 'deposit',
        usdAmount: usdValue,
        cryptoAmount: amount,
        cryptocurrency,
        priceAtTime: price,
        transactionHash: transferId
      });

      await fromTransaction.save();
      await toTransaction.save();

      console.log(`Transferred ${amount} ${cryptocurrency} from ${fromPlayerId} to ${toPlayerId}`);

      return {
        success: true,
        transferId,
        fromBalance: fromPlayer.wallet[cryptocurrency],
        toBalance: toPlayer.wallet[cryptocurrency],
        usdValue,
        priceAtTime: price
      };
    } catch (error) {
      console.error('Error transferring crypto:', error);
      throw error;
    }
  }

  /**
   * Get player transaction history
   * @param {string} playerId - Player ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Transaction history
   */
  async getTransactionHistory(playerId, options = {}) {
    try {
      const { limit = 20, page = 1, type = null } = options;
      const skip = (page - 1) * limit;

      const query = { playerId };
      if (type) {
        query.transactionType = type;
      }

      const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);

      const total = await Transaction.countDocuments(query);

      return {
        playerId,
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw error;
    }
  }

  /**
   * Get all players
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Players list
   */
  async getAllPlayers(options = {}) {
    try {
      const { limit = 20, page = 1, active = null } = options;
      const skip = (page - 1) * limit;

      const query = {};
      if (active !== null) {
        query.isActive = active;
      }

      const players = await Player.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .select('playerId username wallet totalBets totalWins totalLosses isActive createdAt');

      const total = await Player.countDocuments(query);

      // Get current prices for USD calculations
      const prices = await this.cryptoService.getCurrentPrices();

      // Add USD values to each player
      const playersWithUsd = players.map(player => {
        const totalUsdValue = 
          (player.wallet.bitcoin * prices.bitcoin) + 
          (player.wallet.ethereum * prices.ethereum);

        return {
          ...player.toObject(),
          totalUsdValue,
          winRate: player.totalBets > 0 ? (player.totalWins / player.totalBets * 100).toFixed(2) : 0
        };
      });

      return {
        players: playersWithUsd,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        prices
      };
    } catch (error) {
      console.error('Error getting all players:', error);
      throw error;
    }
  }

  /**
   * Update player status
   * @param {string} playerId - Player ID
   * @param {boolean} isActive - Active status
   * @returns {Promise<Object>} Updated player
   */
  async updatePlayerStatus(playerId, isActive) {
    try {
      const player = await Player.findOneAndUpdate(
        { playerId },
        { isActive },
        { new: true }
      );

      if (!player) {
        throw new Error('Player not found');
      }

      console.log(`Updated player ${playerId} status to ${isActive ? 'active' : 'inactive'}`);
      return player;
    } catch (error) {
      console.error('Error updating player status:', error);
      throw error;
    }
  }
}

module.exports = WalletService;


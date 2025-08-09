const cron = require('node-cron');
const GameRound = require('../models/GameRound');
const Player = require('../models/Player');
const Transaction = require('../models/Transaction');
const CryptoUtils = require('../utils/cryptoUtils');
const CryptoService = require('./CryptoService');

class GameService {
  constructor(webSocketService) {
    this.webSocketService = webSocketService;
    this.currentRound = null;
    this.roundCounter = 0;
    this.gameInterval = null;
    this.multiplierInterval = null;
    this.currentMultiplier = 1.0;
    this.gameStartTime = null;
    this.isGameActive = false;
  }

  /**
   * Start the game loop - new round every 10 seconds
   */
  startGameLoop() {
    console.log('Starting game loop...');
    
    // Start first round immediately
    this.startNewRound();
    
    // Schedule new rounds every 10 seconds
    this.gameInterval = setInterval(() => {
      this.startNewRound();
    }, parseInt(process.env.GAME_ROUND_DURATION) || 10000);
  }

  /**
   * Start a new game round
   */
  async startNewRound() {
    try {
      // End current round if active
      if (this.currentRound && this.isGameActive) {
        await this.endCurrentRound();
      }

      this.roundCounter++;
      const seed = CryptoUtils.generateSeed();
      const crashPoint = CryptoUtils.generateCrashPoint(seed, this.roundCounter);
      const hash = CryptoUtils.generateHash(seed, this.roundCounter);
      const roundId = `round_${Date.now()}_${this.roundCounter}`;

      // Create new round in database
      this.currentRound = new GameRound({
        roundId,
        seed,
        hash,
        crashPoint,
        startTime: new Date(),
        status: 'waiting'
      });

      await this.currentRound.save();

      console.log(`New round started: ${roundId}, Crash Point: ${crashPoint}x`);

      // Notify clients about new round
      this.webSocketService.broadcast({
        type: 'round_started',
        data: {
          roundId,
          hash, // Clients can verify this later
          startTime: this.currentRound.startTime
        }
      });

      // Wait 3 seconds for bets, then start multiplier
      setTimeout(() => {
        this.startMultiplier();
      }, 3000);

    } catch (error) {
      console.error('Error starting new round:', error);
    }
  }

  /**
   * Start the multiplier increase
   */
  startMultiplier() {
    if (!this.currentRound) return;

    this.currentRound.status = 'active';
    this.currentRound.save();

    this.isGameActive = true;
    this.currentMultiplier = 1.0;
    this.gameStartTime = Date.now();

    console.log(`Multiplier started for round ${this.currentRound.roundId}`);

    // Update multiplier every 100ms
    this.multiplierInterval = setInterval(() => {
      this.updateMultiplier();
    }, 100);
  }

  /**
   * Update the current multiplier
   */
  updateMultiplier() {
    if (!this.isGameActive || !this.currentRound) return;

    const elapsed = (Date.now() - this.gameStartTime) / 1000; // seconds
    
    // Exponential growth: multiplier = 1 + (time_elapsed * growth_factor)
    // Adjust growth factor to reach crash point at appropriate time
    const targetTime = Math.log(this.currentRound.crashPoint) * 2; // Logarithmic time scaling
    const growthFactor = (this.currentRound.crashPoint - 1) / targetTime;
    
    this.currentMultiplier = 1 + (elapsed * growthFactor);

    // Update max multiplier reached
    if (this.currentMultiplier > this.currentRound.maxMultiplier) {
      this.currentRound.maxMultiplier = this.currentMultiplier;
    }

    // Check if we've reached the crash point
    if (this.currentMultiplier >= this.currentRound.crashPoint) {
      this.crashGame();
      return;
    }

    // Broadcast current multiplier to all clients
    this.webSocketService.broadcast({
      type: 'multiplier_update',
      data: {
        roundId: this.currentRound.roundId,
        multiplier: Math.round(this.currentMultiplier * 100) / 100,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Crash the game
   */
  async crashGame() {
    if (!this.isGameActive || !this.currentRound) return;

    this.isGameActive = false;
    clearInterval(this.multiplierInterval);

    this.currentRound.status = 'crashed';
    this.currentRound.endTime = new Date();
    this.currentRound.maxMultiplier = this.currentRound.crashPoint;

    await this.currentRound.save();

    console.log(`Game crashed at ${this.currentRound.crashPoint}x for round ${this.currentRound.roundId}`);

    // Process all bets that didn't cash out (they lose)
    await this.processLostBets();

    // Notify clients about crash
    this.webSocketService.broadcast({
      type: 'game_crashed',
      data: {
        roundId: this.currentRound.roundId,
        crashPoint: this.currentRound.crashPoint,
        seed: this.currentRound.seed, // Reveal seed for verification
        timestamp: Date.now()
      }
    });

    // Mark round as completed
    this.currentRound.status = 'completed';
    await this.currentRound.save();
  }

  /**
   * End current round gracefully
   */
  async endCurrentRound() {
    if (this.isGameActive) {
      await this.crashGame();
    }
  }

  /**
   * Process bets that didn't cash out (losses)
   */
  async processLostBets() {
    if (!this.currentRound) return;

    const lostBets = this.currentRound.bets.filter(bet => !bet.cashedOut);
    
    for (const bet of lostBets) {
      try {
        // Update player statistics
        await Player.findOneAndUpdate(
          { playerId: bet.playerId },
          { 
            $inc: { 
              totalLosses: 1,
              totalBets: 1
            }
          }
        );

        console.log(`Player ${bet.playerId} lost ${bet.usdAmount} USD (${bet.cryptoAmount} ${bet.cryptocurrency})`);
      } catch (error) {
        console.error(`Error processing lost bet for player ${bet.playerId}:`, error);
      }
    }
  }

  /**
   * Place a bet for a player
   */
  async placeBet(playerId, usdAmount, cryptocurrency) {
    try {
      if (!this.currentRound || this.currentRound.status !== 'waiting') {
        throw new Error('No active round accepting bets');
      }

      if (usdAmount <= 0) {
        throw new Error('Bet amount must be positive');
      }

      // Get current crypto price
      const cryptoService = new CryptoService();
      const price = await cryptoService.getCurrentPrice(cryptocurrency);
      const cryptoAmount = usdAmount / price;

      // Check if player exists and has sufficient balance
      const player = await Player.findOne({ playerId });
      if (!player) {
        throw new Error('Player not found');
      }

      if (player.wallet[cryptocurrency] < cryptoAmount) {
        throw new Error('Insufficient balance');
      }

      // Deduct from player's wallet
      player.wallet[cryptocurrency] -= cryptoAmount;
      await player.save();

      // Add bet to current round
      const bet = {
        playerId,
        usdAmount,
        cryptoAmount,
        cryptocurrency,
        priceAtTime: price,
        timestamp: new Date()
      };

      this.currentRound.bets.push(bet);
      await this.currentRound.save();

      // Create transaction record
      const transaction = new Transaction({
        transactionId: CryptoUtils.generateTransactionHash(),
        playerId,
        roundId: this.currentRound.roundId,
        transactionType: 'bet',
        usdAmount,
        cryptoAmount,
        cryptocurrency,
        priceAtTime: price,
        transactionHash: CryptoUtils.generateTransactionHash()
      });

      await transaction.save();

      console.log(`Bet placed: ${playerId} bet ${usdAmount} USD (${cryptoAmount} ${cryptocurrency})`);

      // Notify clients about new bet
      this.webSocketService.broadcast({
        type: 'bet_placed',
        data: {
          roundId: this.currentRound.roundId,
          playerId,
          usdAmount,
          cryptoAmount,
          cryptocurrency
        }
      });

      return {
        success: true,
        bet,
        transaction: transaction.transactionId
      };

    } catch (error) {
      console.error('Error placing bet:', error);
      throw error;
    }
  }

  /**
   * Cash out a player's bet
   */
  async cashOut(playerId) {
    try {
      if (!this.currentRound || !this.isGameActive) {
        throw new Error('No active round or game not in progress');
      }

      // Find player's bet in current round
      const bet = this.currentRound.bets.find(b => 
        b.playerId === playerId && !b.cashedOut
      );

      if (!bet) {
        throw new Error('No active bet found for player');
      }

      // Calculate cashout amount
      const cashoutMultiplier = this.currentMultiplier;
      const cashoutCryptoAmount = bet.cryptoAmount * cashoutMultiplier;
      const cashoutUsdAmount = bet.usdAmount * cashoutMultiplier;

      // Mark bet as cashed out
      bet.cashedOut = true;
      bet.cashoutMultiplier = cashoutMultiplier;
      bet.cashoutAmount = cashoutCryptoAmount;

      await this.currentRound.save();

      // Add winnings to player's wallet
      const player = await Player.findOne({ playerId });
      player.wallet[bet.cryptocurrency] += cashoutCryptoAmount;
      player.totalWins += 1;
      player.totalBets += 1;
      await player.save();

      // Create cashout transaction
      const transaction = new Transaction({
        transactionId: CryptoUtils.generateTransactionHash(),
        playerId,
        roundId: this.currentRound.roundId,
        transactionType: 'cashout',
        usdAmount: cashoutUsdAmount,
        cryptoAmount: cashoutCryptoAmount,
        cryptocurrency: bet.cryptocurrency,
        priceAtTime: bet.priceAtTime,
        transactionHash: CryptoUtils.generateTransactionHash(),
        multiplier: cashoutMultiplier
      });

      await transaction.save();

      console.log(`Cashout: ${playerId} cashed out at ${cashoutMultiplier}x for ${cashoutUsdAmount} USD`);

      // Notify clients about cashout
      this.webSocketService.broadcast({
        type: 'player_cashed_out',
        data: {
          roundId: this.currentRound.roundId,
          playerId,
          multiplier: cashoutMultiplier,
          amount: cashoutUsdAmount,
          cryptocurrency: bet.cryptocurrency
        }
      });

      return {
        success: true,
        multiplier: cashoutMultiplier,
        amount: cashoutUsdAmount,
        cryptoAmount: cashoutCryptoAmount,
        transaction: transaction.transactionId
      };

    } catch (error) {
      console.error('Error cashing out:', error);
      throw error;
    }
  }

  /**
   * Get current game state
   */
  getCurrentGameState() {
    if (!this.currentRound) {
      return {
        status: 'no_game',
        message: 'No active game round'
      };
    }

    return {
      roundId: this.currentRound.roundId,
      status: this.currentRound.status,
      multiplier: this.currentMultiplier,
      isActive: this.isGameActive,
      startTime: this.currentRound.startTime,
      bets: this.currentRound.bets.length,
      hash: this.currentRound.hash
    };
  }

  /**
   * Stop the game loop
   */
  stopGameLoop() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
    
    if (this.multiplierInterval) {
      clearInterval(this.multiplierInterval);
      this.multiplierInterval = null;
    }
    
    this.isGameActive = false;
    console.log('Game loop stopped');
  }
}

module.exports = GameService;


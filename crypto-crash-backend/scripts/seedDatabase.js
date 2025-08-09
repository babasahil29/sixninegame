#!/usr/bin/env node

/**
 * Database seeding script for Crypto Crash game
 * This script pre-populates the database with sample data
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Player = require('../src/models/Player');
const GameRound = require('../src/models/GameRound');
const Transaction = require('../src/models/Transaction');
const CryptoUtils = require('../src/utils/cryptoUtils');

// Sample data
const samplePlayers = [
  {
    playerId: 'player_alice',
    username: 'alice_crypto',
    wallet: {
      bitcoin: 0.05,
      ethereum: 2.5
    }
  },
  {
    playerId: 'player_bob',
    username: 'bob_trader',
    wallet: {
      bitcoin: 0.02,
      ethereum: 1.8
    }
  },
  {
    playerId: 'player_charlie',
    username: 'charlie_hodl',
    wallet: {
      bitcoin: 0.1,
      ethereum: 5.0
    }
  },
  {
    playerId: 'player_diana',
    username: 'diana_moon',
    wallet: {
      bitcoin: 0.03,
      ethereum: 1.2
    }
  },
  {
    playerId: 'player_eve',
    username: 'eve_whale',
    wallet: {
      bitcoin: 0.25,
      ethereum: 10.0
    }
  }
];

/**
 * Connect to database
 */
async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-crash';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

/**
 * Clear existing data
 */
async function clearDatabase() {
  try {
    console.log('Clearing existing data...');
    await Player.deleteMany({});
    await GameRound.deleteMany({});
    await Transaction.deleteMany({});
    console.log('Database cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}

/**
 * Create sample players
 */
async function createPlayers() {
  try {
    console.log('Creating sample players...');
    
    for (const playerData of samplePlayers) {
      const player = new Player(playerData);
      await player.save();
      console.log(`Created player: ${playerData.username} (${playerData.playerId})`);
    }
    
    console.log(`Created ${samplePlayers.length} players`);
  } catch (error) {
    console.error('Error creating players:', error);
    throw error;
  }
}

/**
 * Create sample game rounds with history
 */
async function createGameRounds() {
  try {
    console.log('Creating sample game rounds...');
    
    const rounds = [];
    const baseTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    for (let i = 1; i <= 20; i++) {
      const seed = CryptoUtils.generateSeed();
      const crashPoint = CryptoUtils.generateCrashPoint(seed, i);
      const hash = CryptoUtils.generateHash(seed, i);
      const roundId = `round_${baseTime + (i * 60000)}_${i}`;
      
      const startTime = new Date(baseTime + (i * 60000));
      const endTime = new Date(startTime.getTime() + 30000); // 30 seconds later
      
      // Create some random bets for this round
      const bets = [];
      const numBets = Math.floor(Math.random() * 4) + 1; // 1-4 bets per round
      
      for (let j = 0; j < numBets; j++) {
        const player = samplePlayers[Math.floor(Math.random() * samplePlayers.length)];
        const cryptocurrency = Math.random() > 0.5 ? 'bitcoin' : 'ethereum';
        const usdAmount = Math.floor(Math.random() * 100) + 10; // $10-$110
        const priceAtTime = cryptocurrency === 'bitcoin' ? 67000 : 3500;
        const cryptoAmount = usdAmount / priceAtTime;
        
        // Determine if player cashed out
        const cashoutMultiplier = 1 + Math.random() * (crashPoint - 1);
        const cashedOut = Math.random() > 0.3; // 70% chance of cashing out
        
        const bet = {
          playerId: player.playerId,
          usdAmount,
          cryptoAmount,
          cryptocurrency,
          priceAtTime,
          cashedOut: cashedOut && cashoutMultiplier < crashPoint,
          cashoutMultiplier: cashedOut && cashoutMultiplier < crashPoint ? cashoutMultiplier : null,
          cashoutAmount: cashedOut && cashoutMultiplier < crashPoint ? cryptoAmount * cashoutMultiplier : null,
          timestamp: new Date(startTime.getTime() + (j * 1000))
        };
        
        bets.push(bet);
      }
      
      const round = new GameRound({
        roundId,
        seed,
        hash,
        crashPoint,
        startTime,
        endTime,
        status: 'completed',
        bets,
        maxMultiplier: crashPoint
      });
      
      rounds.push(round);
      await round.save();
      
      console.log(`Created round ${i}: ${roundId}, crash at ${crashPoint}x, ${bets.length} bets`);
    }
    
    console.log(`Created ${rounds.length} game rounds`);
    return rounds;
  } catch (error) {
    console.error('Error creating game rounds:', error);
    throw error;
  }
}

/**
 * Create sample transactions based on game rounds
 */
async function createTransactions(rounds) {
  try {
    console.log('Creating sample transactions...');
    
    let transactionCount = 0;
    
    for (const round of rounds) {
      for (const bet of round.bets) {
        // Create bet transaction
        const betTransaction = new Transaction({
          transactionId: CryptoUtils.generateTransactionHash(),
          playerId: bet.playerId,
          roundId: round.roundId,
          transactionType: 'bet',
          usdAmount: bet.usdAmount,
          cryptoAmount: bet.cryptoAmount,
          cryptocurrency: bet.cryptocurrency,
          priceAtTime: bet.priceAtTime,
          transactionHash: CryptoUtils.generateTransactionHash(),
          createdAt: bet.timestamp
        });
        
        await betTransaction.save();
        transactionCount++;
        
        // Create cashout transaction if player cashed out
        if (bet.cashedOut && bet.cashoutAmount) {
          const cashoutTransaction = new Transaction({
            transactionId: CryptoUtils.generateTransactionHash(),
            playerId: bet.playerId,
            roundId: round.roundId,
            transactionType: 'cashout',
            usdAmount: bet.usdAmount * bet.cashoutMultiplier,
            cryptoAmount: bet.cashoutAmount,
            cryptocurrency: bet.cryptocurrency,
            priceAtTime: bet.priceAtTime,
            transactionHash: CryptoUtils.generateTransactionHash(),
            multiplier: bet.cashoutMultiplier,
            createdAt: new Date(bet.timestamp.getTime() + 5000) // 5 seconds after bet
          });
          
          await cashoutTransaction.save();
          transactionCount++;
        }
      }
    }
    
    // Create some additional deposit transactions
    for (const player of samplePlayers) {
      const numDeposits = Math.floor(Math.random() * 3) + 1; // 1-3 deposits per player
      
      for (let i = 0; i < numDeposits; i++) {
        const cryptocurrency = Math.random() > 0.5 ? 'bitcoin' : 'ethereum';
        const cryptoAmount = cryptocurrency === 'bitcoin' ? 
          (Math.random() * 0.01 + 0.005) : // 0.005-0.015 BTC
          (Math.random() * 0.5 + 0.1); // 0.1-0.6 ETH
        
        const priceAtTime = cryptocurrency === 'bitcoin' ? 67000 : 3500;
        const usdAmount = cryptoAmount * priceAtTime;
        
        const depositTransaction = new Transaction({
          transactionId: CryptoUtils.generateTransactionHash(),
          playerId: player.playerId,
          roundId: 'deposit',
          transactionType: 'deposit',
          usdAmount,
          cryptoAmount,
          cryptocurrency,
          priceAtTime,
          transactionHash: CryptoUtils.generateTransactionHash(),
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last week
        });
        
        await depositTransaction.save();
        transactionCount++;
      }
    }
    
    console.log(`Created ${transactionCount} transactions`);
  } catch (error) {
    console.error('Error creating transactions:', error);
    throw error;
  }
}

/**
 * Update player statistics based on transactions
 */
async function updatePlayerStats() {
  try {
    console.log('Updating player statistics...');
    
    for (const playerData of samplePlayers) {
      const player = await Player.findOne({ playerId: playerData.playerId });
      if (!player) continue;
      
      // Count bets and wins
      const betTransactions = await Transaction.find({
        playerId: playerData.playerId,
        transactionType: 'bet'
      });
      
      const cashoutTransactions = await Transaction.find({
        playerId: playerData.playerId,
        transactionType: 'cashout'
      });
      
      player.totalBets = betTransactions.length;
      player.totalWins = cashoutTransactions.length;
      player.totalLosses = betTransactions.length - cashoutTransactions.length;
      
      await player.save();
      
      console.log(`Updated stats for ${player.username}: ${player.totalBets} bets, ${player.totalWins} wins, ${player.totalLosses} losses`);
    }
  } catch (error) {
    console.error('Error updating player stats:', error);
    throw error;
  }
}

/**
 * Display database summary
 */
async function displaySummary() {
  try {
    console.log('\n=== DATABASE SUMMARY ===');
    
    const playerCount = await Player.countDocuments();
    const roundCount = await GameRound.countDocuments();
    const transactionCount = await Transaction.countDocuments();
    
    console.log(`Players: ${playerCount}`);
    console.log(`Game Rounds: ${roundCount}`);
    console.log(`Transactions: ${transactionCount}`);
    
    console.log('\n=== PLAYER DETAILS ===');
    const players = await Player.find().sort({ totalBets: -1 });
    
    for (const player of players) {
      const btcValue = player.wallet.bitcoin * 67000;
      const ethValue = player.wallet.ethereum * 3500;
      const totalValue = btcValue + ethValue;
      
      console.log(`${player.username} (${player.playerId}):`);
      console.log(`  Wallet: ${player.wallet.bitcoin.toFixed(6)} BTC, ${player.wallet.ethereum.toFixed(4)} ETH (~$${totalValue.toFixed(2)})`);
      console.log(`  Stats: ${player.totalBets} bets, ${player.totalWins} wins, ${player.totalLosses} losses`);
      console.log('');
    }
    
    console.log('=== RECENT ROUNDS ===');
    const recentRounds = await GameRound.find().sort({ createdAt: -1 }).limit(5);
    
    for (const round of recentRounds) {
      console.log(`${round.roundId}: Crashed at ${round.crashPoint}x, ${round.bets.length} bets`);
    }
    
  } catch (error) {
    console.error('Error displaying summary:', error);
    throw error;
  }
}

/**
 * Main seeding function
 */
async function seedDatabase() {
  try {
    console.log('Starting database seeding...\n');
    
    await connectDB();
    await clearDatabase();
    await createPlayers();
    
    const rounds = await createGameRounds();
    await createTransactions(rounds);
    await updatePlayerStats();
    
    await displaySummary();
    
    console.log('\n✅ Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding script
if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedDatabase,
  createPlayers,
  createGameRounds,
  createTransactions,
  updatePlayerStats,
  clearDatabase
};


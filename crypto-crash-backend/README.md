# Crypto Crash Backend

A real-time multiplayer crash game backend with cryptocurrency integration, built with Node.js, Express.js, MongoDB, and WebSockets.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [WebSocket Events](#websocket-events)
- [Game Logic](#game-logic)
- [Cryptocurrency Integration](#cryptocurrency-integration)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## Overview

Crypto Crash is a real-time multiplayer gambling game where players bet in USD, which is converted to cryptocurrency (Bitcoin or Ethereum) using real-time market prices. Players watch a multiplier increase exponentially and must decide when to cash out before the game "crashes" at a random point.

The backend implements a provably fair algorithm to ensure transparency and fairness, real-time WebSocket communication for live updates, and comprehensive cryptocurrency wallet simulation with transaction logging.

## Features

### Core Game Features
- **Real-time Multiplayer**: Support for multiple concurrent players
- **Provably Fair Algorithm**: Cryptographically secure crash point generation
- **Live Multiplier Updates**: Real-time multiplier progression via WebSockets
- **Instant Cash Out**: Players can cash out at any time before crash
- **Game History**: Complete round history with crash points and player actions

### Cryptocurrency Integration
- **Real-time Price Feeds**: Live BTC and ETH prices from CoinGecko API
- **USD to Crypto Conversion**: Automatic conversion at market rates
- **Wallet Simulation**: Virtual cryptocurrency wallets for each player
- **Transaction Logging**: Complete audit trail of all transactions
- **Price Caching**: 10-second price caching to handle API rate limits

### Technical Features
- **WebSocket Communication**: Real-time bidirectional communication
- **RESTful API**: Comprehensive HTTP API for all operations
- **Input Validation**: Robust validation and sanitization
- **Rate Limiting**: Protection against abuse and spam
- **Error Handling**: Comprehensive error handling and logging
- **Database Integration**: MongoDB with Mongoose ODM
- **Graceful Shutdown**: Proper cleanup on server termination

## Architecture

The application follows a modular architecture with clear separation of concerns:

```
src/
├── controllers/     # Request handlers and business logic
├── models/         # MongoDB schemas and data models
├── routes/         # API route definitions
├── services/       # Business logic and external integrations
├── middleware/     # Custom middleware (validation, rate limiting, etc.)
├── utils/          # Utility functions and helpers
└── server.js       # Main application entry point

config/
└── database.js     # Database connection configuration

scripts/
└── seedDatabase.js # Database seeding script

websocket-client/   # Test client for WebSocket functionality
├── index.html
├── script.js
└── README.md
```

### Key Components

- **GameService**: Manages game rounds, multiplier updates, and crash logic
- **WebSocketService**: Handles real-time communication with clients
- **CryptoService**: Integrates with cryptocurrency price APIs
- **WalletService**: Manages player wallets and transactions
- **Validation Middleware**: Ensures data integrity and security
- **Rate Limiting**: Protects against abuse and ensures fair usage

## Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd crypto-crash-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**:
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Seed the database** (optional):
   ```bash
   npm run seed
   ```

6. **Start the server**:
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000` with WebSocket support.

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/crypto-crash

# API Configuration
COINGECKO_API_URL=https://api.coingecko.com/api/v3

# Game Configuration
CACHE_DURATION=10000          # Price cache duration in milliseconds
GAME_ROUND_DURATION=10000     # Time between rounds in milliseconds
MAX_CRASH_MULTIPLIER=120      # Maximum possible crash multiplier
```

### MongoDB Configuration

The application connects to MongoDB using the `MONGODB_URI` environment variable. For production deployments, consider using MongoDB Atlas or a managed MongoDB service.

### API Rate Limiting

The application implements rate limiting to prevent abuse:

- **General API**: 100 requests per minute
- **Game Actions**: 10 requests per 10 seconds
- **Wallet Operations**: 30 requests per minute
- **Crypto Prices**: 50 requests per 10 seconds
- **Strict Operations**: 20 requests per minute

## API Documentation

### Base URL

All API endpoints are prefixed with `/api`:

- Local: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

### Authentication

Currently, the API does not implement authentication. Player identification is based on `playerId` parameters. For production use, implement proper authentication and authorization.

### Response Format

All API responses follow a consistent format:

```json
{
  "success": true|false,
  "message": "Human-readable message",
  "data": {}, // Response data (if applicable)
  "errors": [] // Validation errors (if applicable)
}
```

### Game Endpoints

#### Get Current Game State
```http
GET /api/game/state
```

Returns the current game state including round information, multiplier, and status.

**Response:**
```json
{
  "success": true,
  "data": {
    "roundId": "round_1234567890_1",
    "status": "active",
    "multiplier": 2.45,
    "isActive": true,
    "startTime": "2024-01-01T12:00:00.000Z",
    "bets": 5,
    "hash": "abc123..."
  }
}
```

#### Place a Bet
```http
POST /api/game/bet
```

**Request Body:**
```json
{
  "playerId": "player_alice",
  "usdAmount": 10.50,
  "cryptocurrency": "bitcoin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bet placed successfully",
  "data": {
    "bet": {
      "playerId": "player_alice",
      "usdAmount": 10.50,
      "cryptoAmount": 0.00015671,
      "cryptocurrency": "bitcoin",
      "priceAtTime": 67000
    },
    "transaction": "tx_abc123..."
  }
}
```

#### Cash Out
```http
POST /api/game/cashout
```

**Request Body:**
```json
{
  "playerId": "player_alice"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cashed out successfully",
  "data": {
    "multiplier": 2.45,
    "amount": 25.73,
    "cryptoAmount": 0.00038394,
    "transaction": "tx_def456..."
  }
}
```

#### Get Game History
```http
GET /api/game/history?limit=20&page=1
```

Returns paginated game history with completed rounds.

#### Get Round Details
```http
GET /api/game/round/:roundId
```

Returns detailed information about a specific game round.

#### Verify Round (Provably Fair)
```http
POST /api/game/verify
```

**Request Body:**
```json
{
  "roundId": "round_1234567890_1",
  "seed": "abc123...",
  "crashPoint": 2.45
}
```

Verifies the fairness of a completed round using the provided seed.

### Wallet Endpoints

#### Create Player
```http
POST /api/wallet/player
```

**Request Body:**
```json
{
  "playerId": "player_new",
  "username": "newplayer",
  "initialBalance": {
    "bitcoin": 0.01,
    "ethereum": 1.0
  }
}
```

#### Get Wallet Balance
```http
GET /api/wallet/balance/:playerId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "playerId": "player_alice",
    "username": "alice_crypto",
    "wallet": {
      "bitcoin": {
        "amount": 0.05,
        "usdValue": 3350.00
      },
      "ethereum": {
        "amount": 2.5,
        "usdValue": 8750.00
      }
    },
    "totalUsdValue": 12100.00,
    "prices": {
      "bitcoin": 67000,
      "ethereum": 3500
    }
  }
}
```

#### Deposit Cryptocurrency
```http
POST /api/wallet/deposit
```

#### Withdraw Cryptocurrency
```http
POST /api/wallet/withdraw
```

#### Transfer Between Players
```http
POST /api/wallet/transfer
```

#### Get Transaction History
```http
GET /api/wallet/transactions/:playerId?limit=20&page=1&type=bet
```

#### Get All Players
```http
GET /api/wallet/players?limit=20&page=1&active=true
```

### Cryptocurrency Endpoints

#### Get Current Prices
```http
GET /api/crypto/prices
```

**Response:**
```json
{
  "success": true,
  "data": {
    "prices": {
      "bitcoin": 67000,
      "ethereum": 3500
    },
    "timestamp": "2024-01-01T12:00:00.000Z",
    "cacheDuration": 10000
  }
}
```

#### Get Specific Price
```http
GET /api/crypto/price/:cryptocurrency
```

#### Convert USD to Crypto
```http
POST /api/crypto/convert/usd-to-crypto
```

#### Convert Crypto to USD
```http
POST /api/crypto/convert/crypto-to-usd
```

#### Get Supported Cryptocurrencies
```http
GET /api/crypto/supported
```

### WebSocket Endpoints

#### Get Connection Statistics
```http
GET /api/websocket/stats
```

#### Send Message to Player
```http
POST /api/websocket/send-to-player
```

#### Broadcast Message
```http
POST /api/websocket/broadcast
```

## WebSocket Events

The WebSocket server provides real-time communication for game events and player interactions.

### Connection

Connect to the WebSocket server at:
- Local: `ws://localhost:3000`
- Production: `wss://your-domain.com`

### Client to Server Events

#### Register Player
```json
{
  "type": "register_player",
  "playerId": "player_alice"
}
```

Associates a player ID with the WebSocket connection.

#### Cash Out Request
```json
{
  "type": "cashout_request",
  "playerId": "player_alice"
}
```

Requests to cash out during an active game round.

#### Get Game State
```json
{
  "type": "get_game_state"
}
```

Requests the current game state.

#### Ping
```json
{
  "type": "ping"
}
```

Tests connection health.

### Server to Client Events

#### Connection Established
```json
{
  "type": "connection_established",
  "data": {
    "clientId": "client_1234567890_abc",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "message": "Connected to Crypto Crash WebSocket server"
  }
}
```

#### Round Started
```json
{
  "type": "round_started",
  "data": {
    "roundId": "round_1234567890_1",
    "hash": "abc123...",
    "startTime": "2024-01-01T12:00:00.000Z"
  }
}
```

#### Multiplier Update
```json
{
  "type": "multiplier_update",
  "data": {
    "roundId": "round_1234567890_1",
    "multiplier": 2.45,
    "timestamp": 1234567890123
  }
}
```

#### Game Crashed
```json
{
  "type": "game_crashed",
  "data": {
    "roundId": "round_1234567890_1",
    "crashPoint": 2.45,
    "seed": "abc123...",
    "timestamp": 1234567890123
  }
}
```

#### Bet Placed
```json
{
  "type": "bet_placed",
  "data": {
    "roundId": "round_1234567890_1",
    "playerId": "player_alice",
    "usdAmount": 10.50,
    "cryptoAmount": 0.00015671,
    "cryptocurrency": "bitcoin"
  }
}
```

#### Player Cashed Out
```json
{
  "type": "player_cashed_out",
  "data": {
    "roundId": "round_1234567890_1",
    "playerId": "player_alice",
    "multiplier": 2.45,
    "amount": 25.73,
    "cryptocurrency": "bitcoin"
  }
}
```

## Game Logic

### Provably Fair Algorithm

The game implements a provably fair system to ensure transparency and prevent manipulation:

1. **Seed Generation**: Each round generates a cryptographically secure random seed
2. **Hash Creation**: The seed is hashed using SHA-256 for verification
3. **Crash Point Calculation**: The crash point is derived from the seed using a deterministic algorithm
4. **Verification**: Players can verify the fairness of any round using the revealed seed

#### Crash Point Generation

```javascript
function generateCrashPoint(seed, roundNumber) {
  const hash = crypto.createHash('sha256')
    .update(seed + roundNumber.toString())
    .digest('hex');
  
  const hashInt = parseInt(hash.substring(0, 8), 16);
  const random = hashInt / 0xffffffff;
  
  // Exponential distribution for realistic crash points
  const crashPoint = Math.max(1, Math.min(120, 1 / (1 - random * 0.99)));
  
  return Math.round(crashPoint * 100) / 100;
}
```

### Game Flow

1. **Round Initialization**: Every 10 seconds, a new round begins
2. **Betting Phase**: 3-second window for players to place bets
3. **Multiplier Phase**: Multiplier increases exponentially from 1.00x
4. **Cash Out Window**: Players can cash out at any time during multiplier phase
5. **Crash Event**: Game crashes at predetermined point
6. **Settlement**: Winning players receive payouts, losing players forfeit bets
7. **Seed Reveal**: Round seed is revealed for verification

### Multiplier Calculation

The multiplier increases exponentially based on elapsed time:

```javascript
function updateMultiplier(startTime, crashPoint) {
  const elapsed = (Date.now() - startTime) / 1000;
  const targetTime = Math.log(crashPoint) * 2;
  const growthFactor = (crashPoint - 1) / targetTime;
  
  return 1 + (elapsed * growthFactor);
}
```

## Cryptocurrency Integration

### Supported Cryptocurrencies

- **Bitcoin (BTC)**: Primary cryptocurrency option
- **Ethereum (ETH)**: Secondary cryptocurrency option

### Price Feed Integration

The system integrates with CoinGecko API for real-time cryptocurrency prices:

- **API Endpoint**: `https://api.coingecko.com/api/v3/simple/price`
- **Update Frequency**: Every 10 seconds (cached)
- **Fallback Prices**: Static fallback prices if API is unavailable
- **Rate Limiting**: Respects API rate limits with intelligent caching

### Conversion Logic

#### USD to Cryptocurrency
```javascript
function convertUsdToCrypto(usdAmount, cryptocurrency, price) {
  return usdAmount / price;
}
```

#### Cryptocurrency to USD
```javascript
function convertCryptoToUsd(cryptoAmount, cryptocurrency, price) {
  return cryptoAmount * price;
}
```

### Transaction Simulation

All cryptocurrency transactions are simulated with complete audit trails:

- **Transaction Hashes**: Mock blockchain transaction hashes
- **Timestamps**: Precise transaction timing
- **Price Recording**: Price at time of transaction
- **Type Classification**: Bet, cashout, deposit, withdrawal, transfer

## Database Schema

### Player Model

```javascript
{
  playerId: String,        // Unique player identifier
  username: String,        // Display name
  wallet: {
    bitcoin: Number,       // BTC balance
    ethereum: Number       // ETH balance
  },
  totalBets: Number,       // Lifetime bet count
  totalWins: Number,       // Lifetime win count
  totalLosses: Number,     // Lifetime loss count
  isActive: Boolean,       // Account status
  createdAt: Date,
  updatedAt: Date
}
```

### Game Round Model

```javascript
{
  roundId: String,         // Unique round identifier
  seed: String,            // Random seed for fairness
  hash: String,            // SHA-256 hash of seed
  crashPoint: Number,      // Crash multiplier
  startTime: Date,         // Round start time
  endTime: Date,           // Round end time
  status: String,          // waiting, active, crashed, completed
  bets: [{
    playerId: String,
    usdAmount: Number,
    cryptoAmount: Number,
    cryptocurrency: String,
    priceAtTime: Number,
    cashedOut: Boolean,
    cashoutMultiplier: Number,
    cashoutAmount: Number,
    timestamp: Date
  }],
  maxMultiplier: Number,   // Highest multiplier reached
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Model

```javascript
{
  transactionId: String,   // Unique transaction identifier
  playerId: String,        // Player involved
  roundId: String,         // Associated game round
  transactionType: String, // bet, cashout, deposit, withdrawal
  usdAmount: Number,       // USD value
  cryptoAmount: Number,    // Cryptocurrency amount
  cryptocurrency: String,  // bitcoin or ethereum
  priceAtTime: Number,     // Price at transaction time
  transactionHash: String, // Mock blockchain hash
  multiplier: Number,      // Cashout multiplier (if applicable)
  status: String,          // pending, completed, failed
  createdAt: Date,
  updatedAt: Date
}
```

## Testing

### Manual Testing

1. **Start the server**:
   ```bash
   npm run dev
   ```

2. **Open the WebSocket test client**:
   ```bash
   cd websocket-client
   python3 -m http.server 8080
   # Open http://localhost:8080 in browser
   ```

3. **Test API endpoints**:
   ```bash
   # Health check
   curl http://localhost:3000/health
   
   # Get crypto prices
   curl http://localhost:3000/api/crypto/prices
   
   # Get game state
   curl http://localhost:3000/api/game/state
   ```

### Database Seeding

Populate the database with test data:

```bash
npm run seed
```

This creates:
- 5 sample players with cryptocurrency balances
- 20 historical game rounds with bets and outcomes
- Complete transaction history
- Realistic player statistics

### WebSocket Testing

Use the included WebSocket test client to verify:
- Connection establishment
- Player registration
- Real-time multiplier updates
- Bet placement via HTTP API
- Cash out requests via WebSocket
- Game state synchronization

### Load Testing

For production readiness, consider load testing:

```bash
# Install artillery for load testing
npm install -g artillery

# Create artillery config file
# Run load tests on API endpoints
artillery run load-test-config.yml
```

## Deployment

### Environment Setup

1. **Production Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/crypto-crash
   ```

2. **MongoDB Atlas Setup**:
   - Create MongoDB Atlas cluster
   - Configure network access and database users
   - Update connection string in environment variables

### Render Deployment

1. **Create Render Account**: Sign up at render.com

2. **Connect Repository**: Link your GitHub repository

3. **Configure Build Settings**:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node.js

4. **Set Environment Variables**: Add all required environment variables

5. **Deploy**: Render will automatically deploy on git push

### Netlify/Vercel (WebSocket Client)

1. **Prepare Client Files**:
   ```bash
   cd websocket-client
   # Update WebSocket URL to production server
   ```

2. **Deploy to Netlify**:
   - Drag and drop the `websocket-client` folder
   - Or connect GitHub repository

3. **Deploy to Vercel**:
   ```bash
   cd websocket-client
   npx vercel --prod
   ```

### Docker Deployment

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run Docker container
docker build -t crypto-crash-backend .
docker run -p 3000:3000 --env-file .env crypto-crash-backend
```

### Health Monitoring

Monitor application health using the `/health` endpoint:

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "memory": {
    "rss": 50331648,
    "heapTotal": 20971520,
    "heapUsed": 15728640,
    "external": 1048576
  },
  "version": "v16.14.0"
}
```

## Security

### Input Validation

All user inputs are validated and sanitized:
- **Type Checking**: Ensure correct data types
- **Range Validation**: Verify numeric ranges
- **Format Validation**: Check string formats and patterns
- **Sanitization**: Remove potentially harmful characters

### Rate Limiting

Multiple layers of rate limiting protect against abuse:
- **IP-based Limiting**: Prevent spam from single sources
- **Endpoint-specific Limits**: Different limits for different operations
- **Sliding Window**: Fair distribution of requests over time

### Error Handling

Comprehensive error handling prevents information leakage:
- **Generic Error Messages**: Don't expose internal details
- **Logging**: Detailed server-side logging for debugging
- **Graceful Degradation**: Fallback mechanisms for external services

### Data Protection

- **No Sensitive Data**: No real financial information stored
- **Simulated Transactions**: All cryptocurrency operations are simulated
- **Audit Trails**: Complete transaction logging for accountability

### Production Considerations

For production deployment, implement:
- **Authentication**: User authentication and session management
- **Authorization**: Role-based access control
- **HTTPS**: SSL/TLS encryption for all communications
- **Database Security**: Encrypted connections and access controls
- **Monitoring**: Application performance and security monitoring
- **Backup**: Regular database backups and disaster recovery

## Contributing

### Development Setup

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/new-feature`
3. **Make changes**: Implement your feature or fix
4. **Test thoroughly**: Ensure all functionality works
5. **Commit changes**: `git commit -m "Add new feature"`
6. **Push to branch**: `git push origin feature/new-feature`
7. **Create Pull Request**: Submit for review

### Code Style

- **ESLint**: Follow JavaScript standard style
- **Prettier**: Use consistent code formatting
- **Comments**: Document complex logic and algorithms
- **Error Handling**: Always handle errors gracefully
- **Testing**: Add tests for new functionality

### Bug Reports

When reporting bugs, include:
- **Environment**: Node.js version, OS, browser
- **Steps to Reproduce**: Clear reproduction steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Logs**: Relevant error messages or logs

## License

This project is licensed under the ISC License. See the LICENSE file for details.

---

**Author**: Sahil  
**Version**: 1.0.0  
**Last Updated**: January 2024

For questions or support, please open an issue on the GitHub repository.


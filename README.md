# Crypto Crash - Complete Full-Stack Application

A real-time multiplayer crash game with cryptocurrency integration, featuring a modern React frontend and robust Node.js backend.

## 🎮 Project Overview

Crypto Crash is an exciting real-time multiplayer gambling game where players bet in USD (converted to cryptocurrency), watch a multiplier increase exponentially, and must cash out before the game "crashes" at a random point. The application combines the thrill of gambling with cryptocurrency simulation and real-time multiplayer interaction.

### ✨ Key Features

- **Real-time Multiplayer Gaming**: Support for multiple concurrent players with live updates
- **Cryptocurrency Integration**: Real-time BTC and ETH price feeds with automatic USD conversion
- **Provably Fair Algorithm**: Cryptographically secure crash point generation for transparency
- **Modern React Frontend**: Responsive design with real-time charts and animations
- **WebSocket Communication**: Instant updates for multiplier changes and game events
- **Wallet Simulation**: Virtual cryptocurrency wallets with complete transaction logging
- **Professional UI/UX**: Modern design with Tailwind CSS and shadcn/ui components

## 🏗️ Architecture

### Frontend (React.js)
- **Framework**: React 18+ with Vite for fast development
- **Styling**: Tailwind CSS with shadcn/ui components
- **Real-time**: WebSocket integration for live game updates
- **Charts**: Recharts for multiplier visualization
- **Icons**: Lucide React for consistent iconography

### Backend (Node.js)
- **Framework**: Express.js with WebSocket support
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: WebSocket server for game events
- **Security**: Rate limiting, input validation, CORS
- **External APIs**: CoinGecko for cryptocurrency prices

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/pnpm
- MongoDB 4.4+
- Git

### Installation

1. **Extract the project**:
   ```bash
   unzip crypto-crash-complete.zip
   cd crypto-crash-project
   ```

2. **Setup Backend**:
   ```bash
   cd crypto-crash-backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm start
   ```

3. **Setup Frontend**:
   ```bash
   cd ../crypto-crash-frontend
   pnpm install
   pnpm run dev --host
   ```

4. **Access the Application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api
   - WebSocket: ws://localhost:3000

## 📁 Project Structure

```
crypto-crash-project/
├── crypto-crash-backend/          # Node.js backend
│   ├── src/
│   │   ├── controllers/           # Request handlers
│   │   ├── models/               # MongoDB schemas
│   │   ├── routes/               # API routes
│   │   ├── services/             # Business logic
│   │   ├── middleware/           # Custom middleware
│   │   └── utils/                # Utility functions
│   ├── config/                   # Configuration files
│   ├── scripts/                  # Database scripts
│   └── package.json
├── crypto-crash-frontend/         # React frontend
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── hooks/                # Custom hooks
│   │   ├── lib/                  # Utilities
│   │   └── assets/               # Static assets
│   ├── public/                   # Public files
│   └── package.json
├── DEPLOYMENT_GUIDE.md           # Comprehensive deployment guide
└── README.md                     # This file
```

## 🎯 Game Mechanics

### How to Play
1. **Connect**: Open the application and connect to the game server
2. **Place Bet**: Enter a USD amount and select cryptocurrency (Bitcoin/Ethereum)
3. **Watch Multiplier**: Observe the multiplier increase from 1.00x exponentially
4. **Cash Out**: Click "Cash Out" before the crash to win your bet × multiplier
5. **Crash**: If you don't cash out before the crash, you lose your bet

### Provably Fair System
- Each round uses a cryptographically secure random seed
- Crash points are generated using deterministic algorithms
- Players can verify the fairness of any round using the revealed seed
- Complete transparency in game mechanics

## 🔧 Configuration

### Environment Variables

**Backend (.env)**:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/crypto-crash
COINGECKO_API_URL=https://api.coingecko.com/api/v3
GAME_ROUND_DURATION=10000
CACHE_DURATION=10000
MAX_CRASH_MULTIPLIER=120
```

**Frontend**:
```env
VITE_API_BASE=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

## 📊 API Documentation

### Game Endpoints
- `GET /api/game/state` - Get current game state
- `POST /api/game/bet` - Place a bet
- `POST /api/game/cashout` - Cash out current bet
- `GET /api/game/history` - Get game history

### Wallet Endpoints
- `POST /api/wallet/player` - Create player
- `GET /api/wallet/balance/:playerId` - Get wallet balance
- `GET /api/wallet/transactions/:playerId` - Get transaction history

### Crypto Endpoints
- `GET /api/crypto/prices` - Get current cryptocurrency prices
- `POST /api/crypto/convert/usd-to-crypto` - Convert USD to crypto

### WebSocket Events
- `round_started` - New game round begins
- `multiplier_update` - Real-time multiplier updates
- `game_crashed` - Game crash event
- `bet_placed` - Player places bet
- `player_cashed_out` - Player cashes out

## 🚀 Deployment

For production deployment, see the comprehensive [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) which covers:

- Production environment setup
- Database configuration and optimization
- Frontend build and deployment
- Backend process management with PM2
- Nginx reverse proxy configuration
- SSL/TLS certificate setup
- Monitoring and maintenance
- Security considerations
- Troubleshooting guide

### Quick Production Deployment

1. **Build Frontend**:
   ```bash
   cd crypto-crash-frontend
   pnpm run build
   ```

2. **Deploy Backend**:
   ```bash
   cd crypto-crash-backend
   npm ci --only=production
   pm2 start ecosystem.config.js --env production
   ```

3. **Configure Nginx**:
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/crypto-crash
   sudo ln -s /etc/nginx/sites-available/crypto-crash /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

## 🔒 Security Features

- **Input Validation**: Comprehensive validation and sanitization
- **Rate Limiting**: API protection against abuse
- **CORS Configuration**: Secure cross-origin resource sharing
- **WebSocket Security**: Origin validation and connection limits
- **Environment Variables**: Secure configuration management
- **Error Handling**: Proper error responses without information disclosure

## 🧪 Testing

### Backend Testing
```bash
cd crypto-crash-backend
npm test
```

### Frontend Testing
```bash
cd crypto-crash-frontend
pnpm test
```

### API Testing
Use the included Postman collection in `crypto-crash-backend/postman/` for comprehensive API testing.

## 📈 Performance

- **Real-time Updates**: Sub-100ms WebSocket message delivery
- **Database Optimization**: Indexed queries and connection pooling
- **Frontend Optimization**: Code splitting and lazy loading
- **Caching**: Intelligent cryptocurrency price caching
- **Compression**: Gzip compression for all assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) troubleshooting section
2. Review the API documentation
3. Check the browser console and server logs
4. Open an issue with detailed information

## 🎉 Acknowledgments

- **CoinGecko API** for cryptocurrency price data
- **MongoDB** for robust data persistence
- **React** and **Vite** for modern frontend development
- **Tailwind CSS** and **shadcn/ui** for beautiful UI components
- **WebSocket** technology for real-time communication

---

**Built with ❤️ by Sahil**

*Ready to crash? Start your engines and may the odds be in your favor!* 🚀


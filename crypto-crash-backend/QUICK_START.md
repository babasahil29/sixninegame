# 🚀 Crypto Crash Backend - Quick Start Guide

Get your Crypto Crash backend up and running in 5 minutes!

## 📋 What You Get

✅ **Complete Backend** - Node.js/Express server with WebSocket support  
✅ **Real-time Game Logic** - Provably fair crash game algorithm  
✅ **Cryptocurrency Integration** - Live BTC/ETH price feeds  
✅ **Database Ready** - MongoDB with sample data  
✅ **API Documentation** - Complete Postman collection  
✅ **WebSocket Client** - HTML/JS test interface  
✅ **Production Ready** - Deployment instructions for multiple platforms  

## ⚡ 5-Minute Setup

### 1. Extract & Install
```bash
unzip crypto-crash-backend.zip
cd crypto-crash-backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env if needed (defaults work for local development)
```

### 3. Start Database
```bash
# Option A: Local MongoDB
sudo systemctl start mongod

# Option B: Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Seed Database
```bash
npm run seed
```

### 5. Start Server
```bash
npm run dev
```

🎉 **Done!** Server running at `http://localhost:3000`

## 🧪 Test Your Setup

### API Test
```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/crypto/prices
curl http://localhost:3000/api/game/state
```

### WebSocket Test
1. Open `websocket-client/index.html` in browser
2. Click "Connect" 
3. Register as "player_alice"
4. Place a bet and watch the game!

### Postman Test
1. Import `postman/Crypto_Crash_API.postman_collection.json`
2. Test all endpoints with pre-configured requests

## 🌐 Deploy to Production

### Render (Recommended - Free)
1. Push code to GitHub
2. Create MongoDB Atlas database
3. Connect GitHub repo to Render
4. Add environment variables
5. Deploy!

**Detailed instructions**: See `DEPLOYMENT.md`

## 📁 Project Structure

```
crypto-crash-backend/
├── src/                    # Source code
│   ├── controllers/        # API controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utilities
│   └── server.js          # Main server file
├── scripts/               # Database scripts
├── websocket-client/      # Test client
├── postman/              # API collection
├── config/               # Configuration
├── README.md             # Full documentation
├── DEPLOYMENT.md         # Deployment guide
└── package.json          # Dependencies
```

## 🎮 Game Features

- **Real-time Multiplayer** - Multiple players can join simultaneously
- **Provably Fair** - Cryptographically secure random crash points
- **Live Crypto Prices** - Real BTC/ETH prices from CoinGecko
- **WebSocket Updates** - Real-time multiplier and game events
- **Wallet System** - Virtual cryptocurrency wallets
- **Transaction History** - Complete audit trail

## 🔧 Available Commands

```bash
npm start          # Start production server
npm run dev        # Start development server with auto-reload
npm run seed       # Populate database with sample data
npm test           # Run tests (placeholder)
```

## 📊 Sample Data

After seeding, you'll have:
- **5 Players** with crypto balances
- **20 Game Rounds** with betting history
- **Complete Transactions** for testing

**Test Players:**
- `player_alice` - Alice Crypto
- `player_bob` - Bob Trader
- `player_charlie` - Charlie HODL
- `player_diana` - Diana Moon
- `player_eve` - Eve Whale

## 🆘 Need Help?

1. **Check logs** - Look for error messages in console
2. **Verify MongoDB** - Ensure database is running
3. **Test API** - Use Postman collection to test endpoints
4. **Read docs** - Full documentation in `README.md`
5. **Check deployment** - See `DEPLOYMENT.md` for hosting issues

## 🔗 Important URLs

- **Health Check**: `http://localhost:3000/health`
- **API Base**: `http://localhost:3000/api`
- **WebSocket**: `ws://localhost:3000`
- **Test Client**: Open `websocket-client/index.html`

## 🚀 Next Steps

1. **Customize Game Logic** - Modify crash algorithm in `src/services/GameService.js`
2. **Add Authentication** - Implement user authentication system
3. **Enhance UI** - Build a proper frontend interface
4. **Add More Cryptos** - Extend to support additional cryptocurrencies
5. **Scale Up** - Deploy to production with load balancing

---

**Happy Coding!** 🎯

For detailed documentation, see `README.md`  
For deployment help, see `DEPLOYMENT.md`


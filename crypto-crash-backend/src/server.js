require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const connectDB = require('../config/database');

// Import routes
const gameRoutes = require('./routes/gameRoutes');
const walletRoutes = require('./routes/walletRoutes');
const cryptoRoutes = require('./routes/cryptoRoutes');
const websocketRoutes = require('./routes/websocketRoutes');

// Import services
const GameService = require('./services/GameService');
const WebSocketService = require('./services/WebSocketService');

// Import middleware
const { errorHandler, notFoundHandler, gracefulShutdown } = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Routes
app.use('/api/game', gameRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/crypto', cryptoRoutes);
app.use('/api/websocket', websocketRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

// WebSocket setup
const wss = new WebSocket.Server({ server });
const webSocketService = new WebSocketService(wss);

// Initialize game service
const gameService = new GameService(webSocketService);

// Make game service available to controllers
app.locals.gameService = gameService;

// Make WebSocket service available to controllers
app.locals.webSocketService = webSocketService;

// Make game service available globally for WebSocket service
global.gameService = gameService;

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Start the game loop
  gameService.startGameLoop();
  
  // Setup graceful shutdown
  gracefulShutdown(server, gameService, webSocketService);
});


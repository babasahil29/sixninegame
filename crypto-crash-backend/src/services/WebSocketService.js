const WebSocket = require('ws');

class WebSocketService {
  constructor(wss) {
    this.wss = wss;
    this.clients = new Map(); // Map to store client connections with metadata
    this.setupWebSocketServer();
  }

  /**
   * Setup WebSocket server event handlers
   */
  setupWebSocketServer() {
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      
      // Store client connection with metadata
      this.clients.set(clientId, {
        ws,
        playerId: null,
        connectedAt: new Date(),
        lastPing: new Date(),
        ip: req.socket.remoteAddress
      });

      console.log(`WebSocket client connected: ${clientId} from ${req.socket.remoteAddress}`);
      console.log(`Total connected clients: ${this.clients.size}`);

      // Send welcome message
      this.sendToClient(clientId, {
        type: 'connection_established',
        data: {
          clientId,
          timestamp: new Date().toISOString(),
          message: 'Connected to Crypto Crash WebSocket server'
        }
      });

      // Handle incoming messages
      ws.on('message', (message) => {
        this.handleMessage(clientId, message);
      });

      // Handle client disconnect
      ws.on('close', (code, reason) => {
        console.log(`WebSocket client disconnected: ${clientId}, Code: ${code}, Reason: ${reason}`);
        this.clients.delete(clientId);
        console.log(`Total connected clients: ${this.clients.size}`);
      });

      // Handle WebSocket errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
        this.clients.delete(clientId);
      });

      // Setup ping/pong for connection health
      ws.on('pong', () => {
        const client = this.clients.get(clientId);
        if (client) {
          client.lastPing = new Date();
        }
      });
    });

    // Setup periodic ping to check connection health
    setInterval(() => {
      this.pingClients();
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Handle incoming WebSocket messages
   * @param {string} clientId - Client ID
   * @param {Buffer} message - Raw message
   */
  handleMessage(clientId, message) {
    try {
      const data = JSON.parse(message.toString());
      const client = this.clients.get(clientId);
      
      if (!client) {
        console.error(`Client ${clientId} not found`);
        return;
      }

      console.log(`Received message from ${clientId}:`, data);

      switch (data.type) {
        case 'register_player':
          this.handlePlayerRegistration(clientId, data);
          break;
        
        case 'cashout_request':
          this.handleCashoutRequest(clientId, data);
          break;
        
        case 'ping':
          this.sendToClient(clientId, {
            type: 'pong',
            data: { timestamp: new Date().toISOString() }
          });
          break;
        
        case 'get_game_state':
          this.handleGameStateRequest(clientId);
          break;
        
        default:
          console.log(`Unknown message type: ${data.type}`);
          this.sendToClient(clientId, {
            type: 'error',
            data: {
              message: 'Unknown message type',
              receivedType: data.type
            }
          });
      }
    } catch (error) {
      console.error(`Error parsing message from ${clientId}:`, error);
      this.sendToClient(clientId, {
        type: 'error',
        data: {
          message: 'Invalid JSON message format'
        }
      });
    }
  }

  /**
   * Handle player registration
   * @param {string} clientId - Client ID
   * @param {Object} data - Registration data
   */
  handlePlayerRegistration(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (!data.playerId) {
      this.sendToClient(clientId, {
        type: 'registration_error',
        data: { message: 'Player ID is required' }
      });
      return;
    }

    // Associate player ID with client
    client.playerId = data.playerId;
    
    console.log(`Player ${data.playerId} registered with client ${clientId}`);
    
    this.sendToClient(clientId, {
      type: 'registration_success',
      data: {
        playerId: data.playerId,
        clientId,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Handle cashout request
   * @param {string} clientId - Client ID
   * @param {Object} data - Cashout data
   */
  async handleCashoutRequest(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const playerId = client.playerId || data.playerId;
    
    if (!playerId) {
      this.sendToClient(clientId, {
        type: 'cashout_error',
        data: { message: 'Player not registered or player ID not provided' }
      });
      return;
    }

    try {
      // Get game service from global context (will be set by server)
      const gameService = global.gameService;
      
      if (!gameService) {
        this.sendToClient(clientId, {
          type: 'cashout_error',
          data: { message: 'Game service not available' }
        });
        return;
      }

      const result = await gameService.cashOut(playerId);
      
      this.sendToClient(clientId, {
        type: 'cashout_success',
        data: result
      });

    } catch (error) {
      console.error(`Cashout error for player ${playerId}:`, error);
      this.sendToClient(clientId, {
        type: 'cashout_error',
        data: { message: error.message }
      });
    }
  }

  /**
   * Handle game state request
   * @param {string} clientId - Client ID
   */
  handleGameStateRequest(clientId) {
    try {
      const gameService = global.gameService;
      
      if (!gameService) {
        this.sendToClient(clientId, {
          type: 'game_state_error',
          data: { message: 'Game service not available' }
        });
        return;
      }

      const gameState = gameService.getCurrentGameState();
      
      this.sendToClient(clientId, {
        type: 'game_state',
        data: gameState
      });

    } catch (error) {
      console.error(`Error getting game state for client ${clientId}:`, error);
      this.sendToClient(clientId, {
        type: 'game_state_error',
        data: { message: 'Failed to get game state' }
      });
    }
  }

  /**
   * Send message to a specific client
   * @param {string} clientId - Client ID
   * @param {Object} message - Message to send
   */
  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      console.log(`Cannot send message to client ${clientId}: connection not open`);
      return false;
    }

    try {
      client.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error(`Error sending message to client ${clientId}:`, error);
      this.clients.delete(clientId);
      return false;
    }
  }

  /**
   * Send message to a specific player
   * @param {string} playerId - Player ID
   * @param {Object} message - Message to send
   */
  sendToPlayer(playerId, message) {
    let sent = false;
    
    for (const [clientId, client] of this.clients.entries()) {
      if (client.playerId === playerId) {
        if (this.sendToClient(clientId, message)) {
          sent = true;
        }
      }
    }
    
    return sent;
  }

  /**
   * Broadcast message to all connected clients
   * @param {Object} message - Message to broadcast
   * @param {string[]} excludeClients - Client IDs to exclude from broadcast
   */
  broadcast(message, excludeClients = []) {
    let sentCount = 0;
    
    for (const [clientId, client] of this.clients.entries()) {
      if (!excludeClients.includes(clientId)) {
        if (this.sendToClient(clientId, message)) {
          sentCount++;
        }
      }
    }
    
    console.log(`Broadcasted message to ${sentCount} clients:`, message.type);
    return sentCount;
  }

  /**
   * Broadcast message to all registered players
   * @param {Object} message - Message to broadcast
   */
  broadcastToPlayers(message) {
    let sentCount = 0;
    
    for (const [clientId, client] of this.clients.entries()) {
      if (client.playerId) {
        if (this.sendToClient(clientId, message)) {
          sentCount++;
        }
      }
    }
    
    console.log(`Broadcasted message to ${sentCount} registered players:`, message.type);
    return sentCount;
  }

  /**
   * Generate unique client ID
   * @returns {string} Unique client ID
   */
  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Ping all clients to check connection health
   */
  pingClients() {
    const now = new Date();
    const staleClients = [];
    
    for (const [clientId, client] of this.clients.entries()) {
      const timeSinceLastPing = now - client.lastPing;
      
      // Remove clients that haven't responded to ping in 2 minutes
      if (timeSinceLastPing > 120000) {
        staleClients.push(clientId);
        continue;
      }
      
      // Send ping
      if (client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.ping();
        } catch (error) {
          console.error(`Error pinging client ${clientId}:`, error);
          staleClients.push(clientId);
        }
      } else {
        staleClients.push(clientId);
      }
    }
    
    // Remove stale clients
    staleClients.forEach(clientId => {
      console.log(`Removing stale client: ${clientId}`);
      this.clients.delete(clientId);
    });
    
    if (staleClients.length > 0) {
      console.log(`Removed ${staleClients.length} stale clients. Active clients: ${this.clients.size}`);
    }
  }

  /**
   * Get connection statistics
   * @returns {Object} Connection statistics
   */
  getConnectionStats() {
    const stats = {
      totalConnections: this.clients.size,
      registeredPlayers: 0,
      anonymousClients: 0,
      clients: []
    };
    
    for (const [clientId, client] of this.clients.entries()) {
      if (client.playerId) {
        stats.registeredPlayers++;
      } else {
        stats.anonymousClients++;
      }
      
      stats.clients.push({
        clientId,
        playerId: client.playerId,
        connectedAt: client.connectedAt,
        lastPing: client.lastPing,
        ip: client.ip
      });
    }
    
    return stats;
  }

  /**
   * Close all connections
   */
  closeAllConnections() {
    for (const [clientId, client] of this.clients.entries()) {
      try {
        client.ws.close(1000, 'Server shutdown');
      } catch (error) {
        console.error(`Error closing connection for client ${clientId}:`, error);
      }
    }
    
    this.clients.clear();
    console.log('All WebSocket connections closed');
  }
}

module.exports = WebSocketService;


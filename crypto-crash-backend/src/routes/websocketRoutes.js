const express = require('express');
const router = express.Router();

/**
 * Get WebSocket connection statistics
 */
router.get('/stats', (req, res) => {
  try {
    const webSocketService = req.app.locals.webSocketService;
    
    if (!webSocketService) {
      return res.status(500).json({
        success: false,
        message: 'WebSocket service not available'
      });
    }

    const stats = webSocketService.getConnectionStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting WebSocket stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get WebSocket statistics'
    });
  }
});

/**
 * Send message to specific player via WebSocket
 */
router.post('/send-to-player', (req, res) => {
  try {
    const { playerId, message } = req.body;

    if (!playerId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: playerId, message'
      });
    }

    const webSocketService = req.app.locals.webSocketService;
    
    if (!webSocketService) {
      return res.status(500).json({
        success: false,
        message: 'WebSocket service not available'
      });
    }

    const sent = webSocketService.sendToPlayer(playerId, message);
    
    res.json({
      success: true,
      data: {
        sent,
        playerId,
        message: sent ? 'Message sent successfully' : 'Player not connected'
      }
    });
  } catch (error) {
    console.error('Error sending message to player:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

/**
 * Broadcast message to all connected clients
 */
router.post('/broadcast', (req, res) => {
  try {
    const { message, excludeClients = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: message'
      });
    }

    const webSocketService = req.app.locals.webSocketService;
    
    if (!webSocketService) {
      return res.status(500).json({
        success: false,
        message: 'WebSocket service not available'
      });
    }

    const sentCount = webSocketService.broadcast(message, excludeClients);
    
    res.json({
      success: true,
      data: {
        sentCount,
        message: `Message broadcasted to ${sentCount} clients`
      }
    });
  } catch (error) {
    console.error('Error broadcasting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to broadcast message'
    });
  }
});

module.exports = router;


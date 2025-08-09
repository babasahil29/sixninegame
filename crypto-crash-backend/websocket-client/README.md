# Crypto Crash WebSocket Test Client

A simple HTML/JavaScript client for testing the Crypto Crash WebSocket server functionality.

## Features

- **Real-time Connection**: Connect to the WebSocket server and monitor connection status
- **Player Registration**: Register as a player to participate in games
- **Live Game Display**: View real-time multiplier updates and game status
- **Betting Interface**: Place bets using the HTTP API
- **Cash Out**: Request cash out via WebSocket during active games
- **Balance Tracking**: View current wallet balances in BTC and ETH
- **Event Logging**: Comprehensive logging of all WebSocket events
- **Game State**: Request current game state information
- **Responsive Design**: Works on desktop and mobile devices

## Usage

### 1. Start the Backend Server

Make sure the Crypto Crash backend server is running:

```bash
cd crypto-crash-backend
npm start
```

### 2. Open the Test Client

Open `index.html` in a web browser. You can:

- **Local File**: Open the file directly in your browser
- **HTTP Server**: Serve the files using a simple HTTP server:

```bash
# Using Python
python3 -m http.server 8080

# Using Node.js (if you have http-server installed)
npx http-server -p 8080

# Using PHP
php -S localhost:8080
```

### 3. Connect to the Server

1. Enter the WebSocket server URL (default: `ws://localhost:3000`)
2. Click "Connect" to establish WebSocket connection
3. Enter a player ID (e.g., `player_alice`) and click "Register Player"

### 4. Test Game Functionality

- **Place Bets**: Enter bet amount and select cryptocurrency, then click "Place Bet"
- **Cash Out**: During an active game, click "Cash Out" to exit with current multiplier
- **Monitor Game**: Watch real-time multiplier updates and game events
- **View Logs**: Check the event logs for detailed information

## WebSocket Events

### Outgoing (Client → Server)

- `register_player`: Register a player ID with the WebSocket connection
- `cashout_request`: Request to cash out during an active game
- `get_game_state`: Request current game state information
- `ping`: Send ping to test connection

### Incoming (Server → Client)

- `connection_established`: Confirmation of WebSocket connection
- `registration_success/error`: Player registration result
- `round_started`: New game round has begun
- `multiplier_update`: Real-time multiplier updates during game
- `game_crashed`: Game has crashed at specific multiplier
- `bet_placed`: A bet has been placed (broadcast to all clients)
- `player_cashed_out`: A player has cashed out (broadcast to all clients)
- `cashout_success/error`: Result of cashout request
- `game_state`: Current game state information
- `pong`: Response to ping

## Configuration

### Server URL

Change the WebSocket server URL in the input field. Supported formats:

- `ws://localhost:3000` (local development)
- `ws://your-server.com` (production HTTP)
- `wss://your-server.com` (production HTTPS)

### Player IDs

Use any of the pre-seeded player IDs:

- `player_alice`
- `player_bob`
- `player_charlie`
- `player_diana`
- `player_eve`

Or create new players using the wallet API endpoints.

## Troubleshooting

### Connection Issues

1. **Server Not Running**: Ensure the backend server is running on the specified port
2. **CORS Issues**: The server is configured to allow all origins (`*`)
3. **Firewall**: Check if the port is accessible
4. **SSL/TLS**: Use `wss://` for HTTPS sites, `ws://` for HTTP

### Registration Issues

1. **Invalid Player ID**: Ensure the player exists in the database
2. **Already Registered**: Refresh the page to reset connection state
3. **Server Error**: Check server logs for detailed error information

### Betting Issues

1. **Not Registered**: Register as a player first
2. **Insufficient Balance**: Ensure player has enough cryptocurrency balance
3. **Invalid Amount**: Check bet amount is positive and within limits
4. **Game State**: Bets can only be placed during the waiting period

## Development

### File Structure

```
websocket-client/
├── index.html          # Main HTML page
├── script.js           # WebSocket client JavaScript
└── README.md          # This file
```

### Customization

- **Styling**: Modify CSS in `index.html` for different appearance
- **Functionality**: Extend `script.js` to add new features
- **Configuration**: Add environment-specific settings

### Testing

1. **Multiple Clients**: Open multiple browser tabs to simulate multiple players
2. **Network Issues**: Use browser dev tools to simulate network conditions
3. **Error Handling**: Test with invalid inputs and server disconnections

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **WebSocket Support**: Required (supported by all modern browsers)
- **ES6 Features**: Uses modern JavaScript features

## Security Notes

- **Development Only**: This client is for testing purposes
- **No Authentication**: No security measures implemented
- **Local Network**: Recommended for local development only
- **Production Use**: Implement proper authentication and validation for production


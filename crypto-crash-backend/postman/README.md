# Crypto Crash API - Postman Collection

This directory contains a comprehensive Postman collection for testing all Crypto Crash backend API endpoints.

## Files

- `Crypto_Crash_API.postman_collection.json` - Complete Postman collection with all API endpoints
- `README.md` - This documentation file

## Collection Overview

The Postman collection includes organized folders for:

### 1. Health Check
- Server health and status monitoring

### 2. Game API
- Get current game state
- Place bets
- Cash out
- Game history
- Round details
- Provably fair verification

### 3. Wallet API
- Create players
- Get wallet balances
- Deposit/withdraw cryptocurrency
- Transfer between players
- Transaction history
- Player management

### 4. Cryptocurrency API
- Get current prices
- Price conversion (USD ↔ Crypto)
- Supported cryptocurrencies
- Cache management

### 5. WebSocket Management
- Connection statistics
- Send messages to players
- Broadcast messages

## Setup Instructions

### 1. Import Collection

1. Open Postman
2. Click "Import" button
3. Select `Crypto_Crash_API.postman_collection.json`
4. The collection will be imported with all endpoints

### 2. Environment Variables

The collection uses the following variables:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `base_url` | `http://localhost:3000` | API server base URL |
| `player_id` | `player_alice` | Default player ID for testing |
| `round_id` | `round_1234567890_1` | Sample round ID |

### 3. Configure Environment

#### Option A: Use Collection Variables (Recommended)
The collection includes default variables that work out of the box for local testing.

#### Option B: Create Custom Environment
1. Click the gear icon in Postman
2. Select "Manage Environments"
3. Click "Add"
4. Create variables:
   - `base_url`: Your server URL
   - `player_id`: Player ID for testing
   - `round_id`: Round ID for testing

### 4. Server Setup

Before testing, ensure the backend server is running:

```bash
# Start the server
cd crypto-crash-backend
npm start

# Or in development mode
npm run dev

# Seed the database (optional)
npm run seed
```

## Testing Workflow

### 1. Basic Health Check
Start by testing the health endpoint to ensure the server is running:
- **Health Check** → **Server Health Check**

### 2. Cryptocurrency Prices
Test the crypto price endpoints:
- **Cryptocurrency API** → **Get Current Prices**
- **Cryptocurrency API** → **Get Specific Price**

### 3. Player Management
Create or verify players exist:
- **Wallet API** → **Get All Players**
- **Wallet API** → **Create Player** (if needed)
- **Wallet API** → **Get Wallet Balance**

### 4. Game Testing
Test the core game functionality:
- **Game API** → **Get Current Game State**
- **Game API** → **Place Bet**
- **Game API** → **Cash Out** (during active game)
- **Game API** → **Get Game History**

### 5. Advanced Features
Test additional functionality:
- **Game API** → **Verify Round** (provably fair)
- **Wallet API** → **Get Transaction History**
- **WebSocket Management** → **Get WebSocket Statistics**

## Pre-configured Test Data

The collection includes sample data for testing:

### Sample Players (from seeded database)
- `player_alice` - Alice Crypto
- `player_bob` - Bob Trader  
- `player_charlie` - Charlie HODL
- `player_diana` - Diana Moon
- `player_eve` - Eve Whale

### Sample Request Bodies
All POST requests include pre-filled example data that you can modify as needed.

## Automated Testing

The collection includes automated tests for:

### Global Tests (All Requests)
- Response time under 5 seconds
- Correct Content-Type header
- Success field in successful responses
- Error message in error responses

### Endpoint-Specific Tests
Individual endpoints may include additional validation tests.

## Environment Switching

### Local Development
```
base_url: http://localhost:3000
```

### Production/Staging
```
base_url: https://your-production-domain.com
```

Update the `base_url` variable to switch between environments.

## Common Test Scenarios

### 1. Complete Game Flow
1. Get current game state
2. Place a bet
3. Wait for multiplier to increase (check via WebSocket client)
4. Cash out before crash
5. Verify transaction in wallet

### 2. Wallet Operations
1. Check initial balance
2. Place several bets
3. Check updated balance
4. View transaction history
5. Transfer funds between players

### 3. Price Conversion
1. Get current crypto prices
2. Convert USD to crypto
3. Convert crypto back to USD
4. Verify conversion accuracy

### 4. Error Handling
1. Try invalid player IDs
2. Attempt bets with insufficient balance
3. Test rate limiting with rapid requests
4. Verify proper error responses

## Rate Limiting

The API implements rate limiting. If you encounter 429 errors:

1. Wait for the rate limit window to reset
2. Reduce request frequency
3. Check the rate limit headers in responses

Rate limits by endpoint type:
- General API: 100 requests/minute
- Game actions: 10 requests/10 seconds  
- Wallet operations: 30 requests/minute
- Crypto prices: 50 requests/10 seconds

## Troubleshooting

### Connection Issues
- Verify server is running on correct port
- Check firewall settings
- Ensure correct base_url

### Authentication Errors
- Currently no authentication required
- Verify player IDs exist in database

### Validation Errors
- Check request body format
- Verify required fields are included
- Ensure data types match API expectations

### Rate Limit Errors
- Wait for rate limit reset
- Reduce request frequency
- Check rate limit headers

## WebSocket Testing

While this collection covers HTTP API endpoints, WebSocket functionality should be tested using:

1. **WebSocket Test Client**: Use the included HTML/JS client in `websocket-client/`
2. **WebSocket Tools**: Browser dev tools or dedicated WebSocket clients
3. **Postman WebSocket**: Postman's WebSocket support (if available)

## Collection Maintenance

### Adding New Endpoints
1. Create new request in appropriate folder
2. Add example request/response
3. Include relevant tests
4. Update documentation

### Updating Examples
1. Keep request bodies current with API changes
2. Update response examples
3. Verify all tests still pass

### Version Control
- Export updated collection after changes
- Commit to version control
- Tag releases for major API changes

## Support

For issues with the Postman collection:

1. Check server logs for errors
2. Verify API endpoint documentation
3. Test endpoints manually with curl
4. Check Postman console for detailed errors

## Advanced Usage

### Newman (Command Line)
Run the collection from command line:

```bash
# Install Newman
npm install -g newman

# Run collection
newman run Crypto_Crash_API.postman_collection.json \
  --environment your-environment.json \
  --reporters cli,html \
  --reporter-html-export results.html
```

### CI/CD Integration
Integrate API testing into your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run API Tests
  run: |
    newman run postman/Crypto_Crash_API.postman_collection.json \
      --environment postman/production.postman_environment.json \
      --reporters junit \
      --reporter-junit-export test-results.xml
```

This collection provides comprehensive testing coverage for all Crypto Crash backend functionality and serves as both a testing tool and API documentation.


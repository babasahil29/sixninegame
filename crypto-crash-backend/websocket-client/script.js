// WebSocket Test Client for Crypto Crash Game
class CryptoCrashClient {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.isRegistered = false;
        this.currentPlayerId = null;
        this.currentMultiplier = 1.0;
        this.gameState = null;
        this.playerBalance = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.log('WebSocket test client initialized', 'info');
    }

    initializeElements() {
        // Connection elements
        this.statusIndicator = document.getElementById('statusIndicator');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.serverUrl = document.getElementById('serverUrl');
        this.connectBtn = document.getElementById('connectBtn');
        
        // Player elements
        this.playerId = document.getElementById('playerId');
        this.registerBtn = document.getElementById('registerBtn');
        this.playerInfo = document.getElementById('playerInfo');
        this.playerIdDisplay = document.getElementById('playerIdDisplay');
        this.balanceDisplay = document.getElementById('balanceDisplay');
        
        // Game elements
        this.gameStatus = document.getElementById('gameStatus');
        this.multiplierDisplay = document.getElementById('multiplierDisplay');
        this.roundInfo = document.getElementById('roundInfo');
        this.betAmount = document.getElementById('betAmount');
        this.cryptocurrency = document.getElementById('cryptocurrency');
        this.betBtn = document.getElementById('betBtn');
        this.cashoutBtn = document.getElementById('cashoutBtn');
        this.gameStateBtn = document.getElementById('gameStateBtn');
        
        // Log elements
        this.logContainer = document.getElementById('logContainer');
    }

    setupEventListeners() {
        // Enter key support for inputs
        this.serverUrl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.toggleConnection();
        });
        
        this.playerId.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.registerPlayer();
        });
        
        this.betAmount.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.placeBet();
        });
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`;
        
        this.logContainer.appendChild(logEntry);
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
        
        // Keep only last 100 log entries
        while (this.logContainer.children.length > 100) {
            this.logContainer.removeChild(this.logContainer.firstChild);
        }
    }

    updateConnectionStatus(connected) {
        this.isConnected = connected;
        
        if (connected) {
            this.statusIndicator.classList.add('connected');
            this.connectionStatus.textContent = 'Connected';
            this.connectBtn.textContent = 'Disconnect';
            this.connectBtn.className = 'btn btn-danger';
            this.registerBtn.disabled = false;
            this.gameStateBtn.disabled = false;
        } else {
            this.statusIndicator.classList.remove('connected');
            this.connectionStatus.textContent = 'Disconnected';
            this.connectBtn.textContent = 'Connect';
            this.connectBtn.className = 'btn btn-primary';
            this.registerBtn.disabled = true;
            this.betBtn.disabled = true;
            this.cashoutBtn.disabled = true;
            this.gameStateBtn.disabled = true;
            this.isRegistered = false;
            this.currentPlayerId = null;
            this.playerInfo.style.display = 'none';
        }
    }

    connect() {
        const url = this.serverUrl.value.trim();
        if (!url) {
            this.log('Please enter a valid WebSocket URL', 'error');
            return;
        }

        try {
            this.log(`Connecting to ${url}...`, 'info');
            this.ws = new WebSocket(url);

            this.ws.onopen = () => {
                this.log('WebSocket connection established', 'success');
                this.updateConnectionStatus(true);
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    this.log(`Error parsing message: ${error.message}`, 'error');
                }
            };

            this.ws.onclose = (event) => {
                this.log(`WebSocket connection closed (Code: ${event.code})`, 'warning');
                this.updateConnectionStatus(false);
            };

            this.ws.onerror = (error) => {
                this.log(`WebSocket error: ${error.message || 'Connection failed'}`, 'error');
                this.updateConnectionStatus(false);
            };

        } catch (error) {
            this.log(`Failed to connect: ${error.message}`, 'error');
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.updateConnectionStatus(false);
        this.log('Disconnected from server', 'info');
    }

    handleMessage(data) {
        this.log(`Received: ${data.type}`, 'info');
        
        switch (data.type) {
            case 'connection_established':
                this.log(`Connected with client ID: ${data.data.clientId}`, 'success');
                break;
                
            case 'registration_success':
                this.isRegistered = true;
                this.currentPlayerId = data.data.playerId;
                this.playerIdDisplay.textContent = this.currentPlayerId;
                this.playerInfo.style.display = 'block';
                this.betBtn.disabled = false;
                this.log(`Player registered: ${this.currentPlayerId}`, 'success');
                this.loadPlayerBalance();
                break;
                
            case 'registration_error':
                this.log(`Registration failed: ${data.data.message}`, 'error');
                break;
                
            case 'round_started':
                this.gameStatus.textContent = 'New Round Started - Place Your Bets!';
                this.roundInfo.textContent = `Round: ${data.data.roundId}`;
                this.multiplierDisplay.textContent = '1.00x';
                this.multiplierDisplay.classList.remove('crashed');
                this.cashoutBtn.disabled = true;
                this.log(`New round started: ${data.data.roundId}`, 'success');
                break;
                
            case 'multiplier_update':
                this.currentMultiplier = data.data.multiplier;
                this.multiplierDisplay.textContent = `${data.data.multiplier.toFixed(2)}x`;
                this.gameStatus.textContent = 'Game in Progress - Cash Out Anytime!';
                
                if (this.isRegistered && this.hasBetInCurrentRound()) {
                    this.cashoutBtn.disabled = false;
                }
                break;
                
            case 'game_crashed':
                this.multiplierDisplay.textContent = `${data.data.crashPoint.toFixed(2)}x`;
                this.multiplierDisplay.classList.add('crashed');
                this.gameStatus.textContent = `💥 CRASHED at ${data.data.crashPoint.toFixed(2)}x`;
                this.cashoutBtn.disabled = true;
                this.log(`Game crashed at ${data.data.crashPoint.toFixed(2)}x`, 'warning');
                this.log(`Seed revealed: ${data.data.seed}`, 'info');
                break;
                
            case 'bet_placed':
                if (data.data.playerId === this.currentPlayerId) {
                    this.log(`Bet placed: $${data.data.usdAmount} (${data.data.cryptoAmount.toFixed(6)} ${data.data.cryptocurrency.toUpperCase()})`, 'success');
                    this.loadPlayerBalance();
                } else {
                    this.log(`Player ${data.data.playerId} placed a bet: $${data.data.usdAmount}`, 'info');
                }
                break;
                
            case 'player_cashed_out':
                if (data.data.playerId === this.currentPlayerId) {
                    this.log(`You cashed out at ${data.data.multiplier.toFixed(2)}x for $${data.data.amount.toFixed(2)}!`, 'success');
                    this.cashoutBtn.disabled = true;
                    this.loadPlayerBalance();
                } else {
                    this.log(`Player ${data.data.playerId} cashed out at ${data.data.multiplier.toFixed(2)}x`, 'info');
                }
                break;
                
            case 'cashout_success':
                this.log(`Cashout successful: ${data.data.multiplier.toFixed(2)}x multiplier, $${data.data.amount.toFixed(2)} won`, 'success');
                this.cashoutBtn.disabled = true;
                this.loadPlayerBalance();
                break;
                
            case 'cashout_error':
                this.log(`Cashout failed: ${data.data.message}`, 'error');
                break;
                
            case 'game_state':
                this.gameState = data.data;
                this.updateGameStateDisplay();
                break;
                
            case 'game_state_error':
                this.log(`Failed to get game state: ${data.data.message}`, 'error');
                break;
                
            case 'error':
                this.log(`Server error: ${data.data.message}`, 'error');
                break;
                
            case 'pong':
                this.log('Pong received', 'info');
                break;
                
            default:
                this.log(`Unknown message type: ${data.type}`, 'warning');
        }
    }

    updateGameStateDisplay() {
        if (!this.gameState) return;
        
        this.roundInfo.textContent = `Round: ${this.gameState.roundId || 'None'}`;
        
        if (this.gameState.status === 'no_game') {
            this.gameStatus.textContent = 'No active game';
            this.multiplierDisplay.textContent = '1.00x';
        } else {
            this.gameStatus.textContent = `Status: ${this.gameState.status}`;
            if (this.gameState.multiplier) {
                this.multiplierDisplay.textContent = `${this.gameState.multiplier.toFixed(2)}x`;
            }
        }
        
        this.log(`Game state updated: ${this.gameState.status}`, 'info');
    }

    sendMessage(message) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this.log('WebSocket not connected', 'error');
            return false;
        }
        
        try {
            this.ws.send(JSON.stringify(message));
            return true;
        } catch (error) {
            this.log(`Failed to send message: ${error.message}`, 'error');
            return false;
        }
    }

    registerPlayer() {
        const playerId = this.playerId.value.trim();
        if (!playerId) {
            this.log('Please enter a player ID', 'error');
            return;
        }
        
        this.sendMessage({
            type: 'register_player',
            playerId: playerId
        });
        
        this.log(`Registering player: ${playerId}`, 'info');
    }

    placeBet() {
        if (!this.isRegistered) {
            this.log('Please register as a player first', 'error');
            return;
        }
        
        const amount = parseFloat(this.betAmount.value);
        const crypto = this.cryptocurrency.value;
        
        if (!amount || amount <= 0) {
            this.log('Please enter a valid bet amount', 'error');
            return;
        }
        
        // Make HTTP request to place bet
        this.makeApiRequest('/api/game/bet', 'POST', {
            playerId: this.currentPlayerId,
            usdAmount: amount,
            cryptocurrency: crypto
        }).then(response => {
            if (response.success) {
                this.log(`Bet placed successfully: $${amount} (${crypto})`, 'success');
            } else {
                this.log(`Failed to place bet: ${response.message}`, 'error');
            }
        }).catch(error => {
            this.log(`Error placing bet: ${error.message}`, 'error');
        });
    }

    cashOut() {
        if (!this.isRegistered) {
            this.log('Please register as a player first', 'error');
            return;
        }
        
        this.sendMessage({
            type: 'cashout_request',
            playerId: this.currentPlayerId
        });
        
        this.log('Requesting cashout...', 'info');
    }

    getGameState() {
        this.sendMessage({
            type: 'get_game_state'
        });
        
        this.log('Requesting game state...', 'info');
    }

    async loadPlayerBalance() {
        if (!this.currentPlayerId) return;
        
        try {
            const response = await this.makeApiRequest(`/api/wallet/balance/${this.currentPlayerId}`, 'GET');
            if (response.success) {
                this.playerBalance = response.data;
                this.updateBalanceDisplay();
            }
        } catch (error) {
            this.log(`Failed to load balance: ${error.message}`, 'error');
        }
    }

    updateBalanceDisplay() {
        if (!this.playerBalance) return;
        
        this.balanceDisplay.innerHTML = `
            <div class="balance-item">
                <div class="crypto">${this.playerBalance.wallet.bitcoin.amount.toFixed(6)} BTC</div>
                <div class="usd">$${this.playerBalance.wallet.bitcoin.usdValue.toFixed(2)}</div>
            </div>
            <div class="balance-item">
                <div class="crypto">${this.playerBalance.wallet.ethereum.amount.toFixed(4)} ETH</div>
                <div class="usd">$${this.playerBalance.wallet.ethereum.usdValue.toFixed(2)}</div>
            </div>
        `;
    }

    async makeApiRequest(endpoint, method = 'GET', body = null) {
        const baseUrl = this.serverUrl.value.replace('ws://', 'http://').replace('wss://', 'https://');
        const url = `${baseUrl}${endpoint}`;
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(url, options);
        return await response.json();
    }

    hasBetInCurrentRound() {
        // This would need to be tracked based on bet placement
        // For now, we'll assume the player has a bet if they're registered
        return this.isRegistered;
    }

    ping() {
        this.sendMessage({ type: 'ping' });
        this.log('Ping sent', 'info');
    }
}

// Global functions for HTML onclick handlers
let client;

function toggleConnection() {
    if (client.isConnected) {
        client.disconnect();
    } else {
        client.connect();
    }
}

function registerPlayer() {
    client.registerPlayer();
}

function placeBet() {
    client.placeBet();
}

function cashOut() {
    client.cashOut();
}

function getGameState() {
    client.getGameState();
}

function ping() {
    client.ping();
}

// Initialize client when page loads
document.addEventListener('DOMContentLoaded', () => {
    client = new CryptoCrashClient();
    
    // Add ping button to the page
    const controlsDiv = document.querySelector('.controls');
    const pingBtn = document.createElement('button');
    pingBtn.className = 'btn btn-primary';
    pingBtn.textContent = 'Ping Server';
    pingBtn.onclick = ping;
    pingBtn.disabled = true;
    pingBtn.id = 'pingBtn';
    controlsDiv.appendChild(pingBtn);
    
    // Enable/disable ping button based on connection
    const originalUpdateStatus = client.updateConnectionStatus;
    client.updateConnectionStatus = function(connected) {
        originalUpdateStatus.call(this, connected);
        document.getElementById('pingBtn').disabled = !connected;
    };
});


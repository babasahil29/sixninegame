import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { TrendingUp, TrendingDown, Wallet, History, Users, Bitcoin, Zap, DollarSign } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import './App.css'

const API_BASE = 'http://localhost:3000/api'
const WS_URL = 'ws://localhost:3000'

function App() {
  // Game state
  const [gameState, setGameState] = useState({
    roundId: null,
    status: 'waiting',
    multiplier: 1.00,
    isActive: false,
    startTime: null,
    bets: 0
  })
  
  // Player state
  const [playerId, setPlayerId] = useState('player_' + Math.random().toString(36).substr(2, 9))
  const [playerBalance, setPlayerBalance] = useState({ bitcoin: 0, ethereum: 0 })
  const [betAmount, setBetAmount] = useState('')
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin')
  const [hasBet, setHasBet] = useState(false)
  const [canCashOut, setCanCashOut] = useState(false)
  
  // UI state
  const [cryptoPrices, setCryptoPrices] = useState({ bitcoin: 67000, ethereum: 3500 })
  const [gameHistory, setGameHistory] = useState([])
  const [multiplierHistory, setMultiplierHistory] = useState([])
  const [connectedPlayers, setConnectedPlayers] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  
  // WebSocket
  const ws = useRef(null)
  const multiplierInterval = useRef(null)

  // Initialize player and connect to WebSocket
  useEffect(() => {
    initializePlayer()
    connectWebSocket()
    fetchCryptoPrices()
    fetchGameHistory()
    
    return () => {
      if (ws.current) {
        ws.current.close()
      }
      if (multiplierInterval.current) {
        clearInterval(multiplierInterval.current)
      }
    }
  }, [])

  const initializePlayer = async () => {
    try {
      // Create player if doesn't exist
      await fetch(`${API_BASE}/wallet/player`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          username: playerId,
          initialBalance: { bitcoin: 0.01, ethereum: 1.0 }
        })
      })
      
      // Fetch balance
      const response = await fetch(`${API_BASE}/wallet/balance/${playerId}`)
      const data = await response.json()
      if (data.success) {
        setPlayerBalance(data.data.wallet)
      }
    } catch (error) {
      console.error('Failed to initialize player:', error)
    }
  }

  const connectWebSocket = () => {
    ws.current = new WebSocket(WS_URL)
    
    ws.current.onopen = () => {
      setIsConnected(true)
      ws.current.send(JSON.stringify({
        type: 'register_player',
        playerId
      }))
    }
    
    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data)
      handleWebSocketMessage(message)
    }
    
    ws.current.onclose = () => {
      setIsConnected(false)
      // Reconnect after 3 seconds
      setTimeout(connectWebSocket, 3000)
    }
    
    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  const handleWebSocketMessage = (message) => {
    switch (message.type) {
      case 'round_started':
        setGameState(prev => ({
          ...prev,
          roundId: message.data.roundId,
          status: 'active',
          isActive: true,
          startTime: new Date(message.data.startTime),
          multiplier: 1.00
        }))
        setHasBet(false)
        setCanCashOut(false)
        setMultiplierHistory([])
        startMultiplierUpdates()
        break
        
      case 'multiplier_update':
        setGameState(prev => ({
          ...prev,
          multiplier: message.data.multiplier
        }))
        setMultiplierHistory(prev => [...prev, {
          time: Date.now() - new Date(gameState.startTime).getTime(),
          multiplier: message.data.multiplier
        }])
        break
        
      case 'game_crashed':
        setGameState(prev => ({
          ...prev,
          status: 'crashed',
          isActive: false,
          multiplier: message.data.crashPoint
        }))
        setCanCashOut(false)
        stopMultiplierUpdates()
        fetchGameHistory()
        break
        
      case 'bet_placed':
        if (message.data.playerId === playerId) {
          setHasBet(true)
          setCanCashOut(true)
        }
        setGameState(prev => ({
          ...prev,
          bets: prev.bets + 1
        }))
        break
        
      case 'player_cashed_out':
        if (message.data.playerId === playerId) {
          setCanCashOut(false)
          setHasBet(false)
        }
        break
    }
  }

  const startMultiplierUpdates = () => {
    multiplierInterval.current = setInterval(() => {
      if (gameState.isActive && gameState.startTime) {
        const elapsed = (Date.now() - new Date(gameState.startTime).getTime()) / 1000
        const newMultiplier = 1 + (elapsed * 0.1) // Simple linear growth for demo
        setGameState(prev => ({ ...prev, multiplier: newMultiplier }))
      }
    }, 100)
  }

  const stopMultiplierUpdates = () => {
    if (multiplierInterval.current) {
      clearInterval(multiplierInterval.current)
      multiplierInterval.current = null
    }
  }

  const fetchCryptoPrices = async () => {
    try {
      const response = await fetch(`${API_BASE}/crypto/prices`)
      const data = await response.json()
      if (data.success) {
        setCryptoPrices(data.data.prices)
      }
    } catch (error) {
      console.error('Failed to fetch crypto prices:', error)
    }
  }

  const fetchGameHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/game/history?limit=10`)
      const data = await response.json()
      if (data.success) {
        setGameHistory(data.data.rounds || [])
      }
    } catch (error) {
      console.error('Failed to fetch game history:', error)
    }
  }

  const placeBet = async () => {
    if (!betAmount || !gameState.isActive || hasBet) return
    
    try {
      const response = await fetch(`${API_BASE}/game/bet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          usdAmount: parseFloat(betAmount),
          cryptocurrency: selectedCrypto
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setBetAmount('')
        // Refresh balance
        initializePlayer()
      }
    } catch (error) {
      console.error('Failed to place bet:', error)
    }
  }

  const cashOut = async () => {
    if (!canCashOut) return
    
    try {
      const response = await fetch(`${API_BASE}/game/cashout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      })
      
      const data = await response.json()
      if (data.success) {
        // Refresh balance
        initializePlayer()
      }
    } catch (error) {
      console.error('Failed to cash out:', error)
    }
  }

  const formatCrypto = (amount, crypto) => {
    return crypto === 'bitcoin' ? `${amount.toFixed(8)} BTC` : `${amount.toFixed(6)} ETH`
  }

  const formatUSD = (amount) => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-yellow-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Crypto Crash
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
              <div className="flex items-center space-x-2 text-sm">
                <Users className="h-4 w-4" />
                <span>{connectedPlayers} players</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Game Display */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Current Round</CardTitle>
                  <Badge variant={gameState.status === 'active' ? 'default' : 'secondary'}>
                    {gameState.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-6xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    {gameState.multiplier.toFixed(2)}x
                  </div>
                  
                  {gameState.isActive && (
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={multiplierHistory}>
                          <XAxis dataKey="time" hide />
                          <YAxis hide />
                          <Line 
                            type="monotone" 
                            dataKey="multiplier" 
                            stroke="#10b981" 
                            strokeWidth={3}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  
                  <div className="flex justify-center space-x-4 text-sm text-gray-400">
                    <span>Round: {gameState.roundId || 'Waiting...'}</span>
                    <span>Bets: {gameState.bets}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Betting Interface */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Place Your Bet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Amount (USD)</label>
                    <Input
                      type="number"
                      placeholder="Enter bet amount"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      disabled={!gameState.isActive || hasBet}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Cryptocurrency</label>
                    <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bitcoin">
                          <div className="flex items-center space-x-2">
                            <Bitcoin className="h-4 w-4" />
                            <span>Bitcoin</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ethereum">
                          <div className="flex items-center space-x-2">
                            <div className="h-4 w-4 bg-blue-500 rounded-full" />
                            <span>Ethereum</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button 
                      onClick={placeBet}
                      disabled={!gameState.isActive || hasBet || !betAmount}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Place Bet
                    </Button>
                  </div>
                </div>
                
                {canCashOut && (
                  <Button 
                    onClick={cashOut}
                    className="w-full bg-red-600 hover:bg-red-700 text-lg py-6"
                    size="lg"
                  >
                    Cash Out at {gameState.multiplier.toFixed(2)}x
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wallet className="h-5 w-5" />
                  <span>Your Wallet</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Bitcoin</span>
                    <div className="text-right">
                      <div className="font-mono">{formatCrypto(playerBalance.bitcoin || 0, 'bitcoin')}</div>
                      <div className="text-xs text-gray-400">
                        {formatUSD((playerBalance.bitcoin || 0) * cryptoPrices.bitcoin)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Ethereum</span>
                    <div className="text-right">
                      <div className="font-mono">{formatCrypto(playerBalance.ethereum || 0, 'ethereum')}</div>
                      <div className="text-xs text-gray-400">
                        {formatUSD((playerBalance.ethereum || 0) * cryptoPrices.ethereum)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Crypto Prices */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Live Prices</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Bitcoin className="h-5 w-5 text-orange-500" />
                    <span>Bitcoin</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono">{formatUSD(cryptoPrices.bitcoin)}</div>
                    <div className="flex items-center text-xs text-green-400">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +2.4%
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="h-5 w-5 bg-blue-500 rounded-full" />
                    <span>Ethereum</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono">{formatUSD(cryptoPrices.ethereum)}</div>
                    <div className="flex items-center text-xs text-red-400">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      -1.2%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game History */}
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5" />
                  <span>Recent Games</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {gameHistory.map((round, index) => (
                    <div key={round.roundId || index} className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-sm text-gray-400">#{index + 1}</span>
                      <Badge variant={round.crashPoint > 2 ? "default" : "destructive"}>
                        {round.crashPoint?.toFixed(2) || '1.00'}x
                      </Badge>
                    </div>
                  ))}
                  {gameHistory.length === 0 && (
                    <div className="text-center text-gray-400 py-4">
                      No games yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App


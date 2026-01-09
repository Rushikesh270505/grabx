import React, { useState, useEffect, useRef } from 'react';
import PairChart from '../../components/PairChart';
import CoinSelector from '../../components/CoinSelector';
import GraberAIChat from '../../components/GraberAIChat';
import { executePythonCode } from '../../services/pythonExecutor';

// Default Python trading bot template
const DEFAULT_PYTHON_CODE = `# Simple trading bot example
if current_price > 50000:
    signals.append({'side': 'sell', 'price': current_price, 'reason': 'Price above 50000'})
elif current_price < 40000:
    signals.append({'side': 'buy', 'price': current_price, 'reason': 'Price below 40000'})`;

// Dynamic coin pool for rotation
const COIN_POOL = [
  { pair: 'BTCUSDT', basePrice: 60377, volatility: 0.05 },
  { pair: 'ETHUSDT', basePrice: 3456, volatility: 0.08 },
  { pair: 'BNBUSDT', basePrice: 567, volatility: 0.06 },
  { pair: 'ADAUSDT', basePrice: 0.65, volatility: 0.10 },
  { pair: 'SOLUSDT', basePrice: 145, volatility: 0.12 },
  { pair: 'DOTUSDT', basePrice: 8.90, volatility: 0.09 },
  { pair: 'AVAXUSDT', basePrice: 38.50, volatility: 0.11 },
  { pair: 'MATICUSDT', basePrice: 0.92, volatility: 0.08 },
  { pair: 'LINKUSDT', basePrice: 14.30, volatility: 0.07 },
  { pair: 'UNIUSDT', basePrice: 6.50, volatility: 0.09 },
  { pair: 'ATOMUSDT', basePrice: 12.80, volatility: 0.08 },
  { pair: 'FILUSDT', basePrice: 5.20, volatility: 0.10 },
  { pair: 'XLMUSDT', basePrice: 0.15, volatility: 0.12 },
  { pair: 'VETUSDT', basePrice: 0.045, volatility: 0.11 },
  { pair: 'ICPUSDT', basePrice: 13.50, volatility: 0.09 }
];

function generateSparkline(trend, points = 60) {
  // 60 points for 1-minute timeframe (1 point per second)
  const sparklinePoints = [];
  const baseY = trend === 'up' ? 25 : 5;
  const direction = trend === 'up' ? -1 : 1;
  
  for (let i = 0; i < points; i++) {
    // Simulate 1-minute price movement with realistic volatility
    const timeProgress = i / points;
    const trendMovement = direction * timeProgress * 15; // Overall trend
    const volatility = (Math.random() - 0.5) * 8; // Random volatility
    const microFluctuation = Math.sin(i * 0.3) * 2; // Small fluctuations
    
    const y = baseY + trendMovement + volatility + microFluctuation;
    // Use full width from 0 to panel width (represented as 100)
    const x = (i / (points - 1)) * 100; // Scale to full width
    sparklinePoints.push(`${x},${Math.max(2, Math.min(28, y))}`);
  }
  
  return sparklinePoints.join(' ');
}

export default function CustomBot() {
  const [code, setCode] = useState(DEFAULT_PYTHON_CODE);
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [isRunning, setIsRunning] = useState(false);
  const [events, setEvents] = useState([]);
  const [executionError, setExecutionError] = useState(null);
  const [displayCoins, setDisplayCoins] = useState([]);
  const intervalRef = useRef(null);

  // Rotate displayed coins one by one every 15 seconds
  useEffect(() => {
    const getRandomCoin = () => {
      const availableCoins = COIN_POOL.filter(coin => 
        !displayCoins.some(displayed => displayed.pair === coin.pair)
      );
      
      if (availableCoins.length === 0) {
        // If all coins are displayed, reset and start over
        return COIN_POOL[Math.floor(Math.random() * COIN_POOL.length)];
      }
      
      const selectedCoin = availableCoins[Math.floor(Math.random() * availableCoins.length)];
      
      // Simulate 1-minute price movement
      const randomMultiplier = 0.998 + Math.random() * 0.004; // ±0.2% variation for 1 minute
      const currentPrice = selectedCoin.basePrice * randomMultiplier;
      const change = (Math.random() - 0.5) * 0.8; // ±0.4% for 1-minute timeframe
      const trend = change > 0 ? 'up' : 'down';
      
      return {
        ...selectedCoin,
        price: currentPrice,
        change: Math.abs(change),
        trend,
        timeframe: '1m'
      };
    };

    // Initialize with 9 random coins
    if (displayCoins.length === 0) {
      const initialCoins = [];
      const shuffled = [...COIN_POOL].sort(() => Math.random() - 0.5);
      for (let i = 0; i < 9; i++) {
        const coin = shuffled[i];
        const randomMultiplier = 0.998 + Math.random() * 0.004;
        const currentPrice = coin.basePrice * randomMultiplier;
        const change = (Math.random() - 0.5) * 0.8;
        const trend = change > 0 ? 'up' : 'down';
        
        initialCoins.push({
          ...coin,
          price: currentPrice,
          change: Math.abs(change),
          trend,
          timeframe: '1m'
        });
      }
      setDisplayCoins(initialCoins);
    }
    
    // Rotate one coin every 15 seconds
    intervalRef.current = setInterval(() => {
      setDisplayCoins(prevCoins => {
        const newCoins = [...prevCoins];
        const randomIndex = Math.floor(Math.random() * 9);
        const newCoin = getRandomCoin();
        newCoins[randomIndex] = newCoin;
        return newCoins;
      });
    }, 15000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const priceRef = useRef(null);
  const lastExecutionRef = useRef(0);

  useEffect(() => {
    // Clear execution error when code changes
    setExecutionError(null);
  }, [code]);

  // Execute Python code on price updates
  useEffect(() => {
    if (!isRunning) return;
    
    function onTick(e) {
      if (!e.detail || !e.detail.price) return;
      const p = e.detail.price;
      priceRef.current = p;
      
      // Throttle executions to once per second
      const now = Date.now();
      if (now - lastExecutionRef.current < 1000) return;
      lastExecutionRef.current = now;
      
      executePythonCode(code, p, symbol)
        .then(result => {
          if (result.signals && Array.isArray(result.signals)) {
            result.signals.forEach(signal => {
              const evObj = {
                time: now,
                price: signal.price || p,
                side: signal.side || 'unknown',
                reason: signal.reason || 'No reason',
                quantity: signal.quantity || 0
              };
              setEvents(ev => [...ev.slice(-50), evObj]);
              
              // Emit signal for chart markers
              try {
                window.dispatchEvent(new CustomEvent('custombot:signal', {
                  detail: { ...evObj, pair: symbol }
                }));
              } catch (e) {}
            });
          }
          setExecutionError(null);
        })
        .catch(error => {
          console.error('Python execution error:', error);
          setExecutionError(error.message);
        });
    }
    
    window.addEventListener('custombot:tick', onTick);
    return () => window.removeEventListener('custombot:tick', onTick);
  }, [code, isRunning, symbol]);

  return (
    <div style={{ padding: 24, color: '#fff' }}>
      {/* Simple Header */}
      <div className="glass-panel" style={{ padding: 20, marginBottom: 24, textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 32, color: '#5da9ff' }}>Custom Python3 Bot</h1>
        <p style={{ color: '#9aa1aa', margin: 0, fontSize: 16, marginTop: 8 }}>Write simple trading rules and see live signals on the chart.</p>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        
        {/* Left Side: Market Overview, Select Pair, Chart & Dashboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Top Row: Market Overview and Select Pair Side by Side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            
            {/* Market Overview Panel */}
            <div className="glass-panel" style={{ padding: 20, height: 450 }}>
              <h4 style={{ margin: 0, marginBottom: 20, color: '#5da9ff', fontSize: 18, textAlign: 'center' }}>Market Overview</h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: 8,
                height: 'calc(100% - 50px)',
                overflow: 'hidden'
              }}>
                {displayCoins.map((crypto, index) => (
                  <div key={`${crypto.pair}-${index}`} style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(93,169,255,0.2)',
                    borderRadius: 8,
                    padding: 8,
                    fontSize: 9,
                    color: '#cfd3d8',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    height: '100%',
                    minHeight: 80,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    position: 'relative'
                  }}>
                    {/* Top Section - Coin Name */}
                    <div style={{ 
                      position: 'relative',
                      zIndex: 2,
                      marginBottom: 4
                    }}>
                      <div style={{ 
                        fontWeight: 700, 
                        color: '#ffffff', 
                        fontSize: 11, 
                        textShadow: '0 0 4px rgba(0,0,0,0.9)',
                        textAlign: 'center',
                        background: 'rgba(0,0,0,0.4)',
                        padding: '2px 8px',
                        borderRadius: 4,
                        display: 'inline-block',
                        margin: '0 auto',
                        width: 'fit-content'
                      }}>
                        {crypto.pair.slice(0, -4)}
                      </div>
                    </div>
                    
                    {/* Center Section - Graph */}
                    <div style={{ 
                      flex: 1,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 40,
                      padding: '0 4px'
                    }}>
                      <div style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.15)',
                        borderRadius: 6,
                        overflow: 'hidden',
                        opacity: 0.8
                      }}>
                        <svg width="100%" height="100%" style={{ position: 'absolute' }} viewBox="0 0 100 30" preserveAspectRatio="none">
                          <polyline
                            points={generateSparkline(crypto.trend, 80)}
                            fill="none"
                            stroke={crypto.trend === 'up' ? '#7ef0a2' : '#ffb3b3'}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Bottom Section - Price and Change */}
                    <div style={{ 
                      position: 'relative',
                      zIndex: 2,
                      marginTop: 4,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <div style={{ 
                          fontSize: 9, 
                          color: '#ffffff',
                          fontWeight: 600,
                          textShadow: '0 0 3px rgba(0,0,0,0.9)',
                          background: 'rgba(0,0,0,0.4)',
                          padding: '1px 4px',
                          borderRadius: 3,
                          display: 'inline-block'
                        }}>
                          ${crypto.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </div>
                        <div style={{ 
                          fontSize: 8, 
                          color: crypto.trend === 'up' ? '#7ef0a2' : '#ffb3b3',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          textShadow: '0 0 3px rgba(0,0,0,0.9)',
                          background: 'rgba(0,0,0,0.4)',
                          padding: '1px 4px',
                          borderRadius: 3,
                          display: 'inline-block'
                        }}>
                          <span>{crypto.trend === 'up' ? '▲' : '▼'}</span>
                          {crypto.change.toFixed(2)}%
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: 7, 
                        color: '#5da9ff',
                        fontWeight: 600,
                        background: 'rgba(93,169,255,0.3)',
                        padding: '2px 6px',
                        borderRadius: 4,
                        textShadow: '0 0 3px rgba(0,0,0,0.9)'
                      }}>
                        1m
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Select Pair Panel */}
            <div className="glass-panel" style={{ padding: 20, height: 450 }}>
              <h4 style={{ margin: 0, marginBottom: 20, color: '#5da9ff', fontSize: 18, textAlign: 'center' }}>Select Trading Pair</h4>
              <div style={{ height: 'calc(100% - 50px)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <span style={{ color: '#cfd3d8', fontSize: 14, fontWeight: 600 }}>Current Pair:</span>
                  <div style={{ 
                    background: 'rgba(93,169,255,0.2)', 
                    padding: '8px 16px', 
                    borderRadius: 8,
                    color: '#5da9ff',
                    fontWeight: 600,
                    fontSize: 14
                  }}>
                    {symbol}
                  </div>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <CoinSelector selectedPair={symbol} onPairChange={setSymbol} disabled={isRunning} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Chart Section */}
          <div className="glass-panel" style={{ padding: 20, minHeight: 450 }}>
            <h3 style={{ margin: 0, marginBottom: 20, color: '#5da9ff', fontSize: 20 }}>📈 Live Chart</h3>
            <div style={{ height: 380, background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 12 }}>
              <PairChart pair={symbol} liveSymbol={symbol.replace('/','').toLowerCase()} />
            </div>
          </div>

          {/* Dashboard Section */}
          <div className="glass-panel" style={{ padding: 20 }}>
            <h3 style={{ margin: 0, marginBottom: 20, color: '#5da9ff', fontSize: 20 }}>📊 Trading Dashboard</h3>
            
            {/* Signal Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div className="glass-panel" style={{ padding: 16, textAlign: 'center', background: 'rgba(126,240,162,0.1)' }}>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#7ef0a2', marginBottom: 8 }}>
                  {events.filter(e => e.side === 'buy').length}
                </div>
                <div style={{ fontSize: 14, color: '#9aa1aa', fontWeight: 600 }}>Buy Signals</div>
              </div>
              <div className="glass-panel" style={{ padding: 16, textAlign: 'center', background: 'rgba(255,179,179,0.1)' }}>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#ffb3b3', marginBottom: 8 }}>
                  {events.filter(e => e.side === 'sell').length}
                </div>
                <div style={{ fontSize: 14, color: '#9aa1aa', fontWeight: 600 }}>Sell Signals</div>
              </div>
            </div>

            {/* Bot Status */}
            <div className="glass-panel" style={{ padding: 16, marginBottom: 20, background: 'rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ color: '#cfd3d8', fontSize: 16, fontWeight: 600 }}>Bot Status</span>
                <span style={{ 
                  color: isRunning ? '#7ef0a2' : '#ff6b6b',
                  fontSize: 14,
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: 20,
                  background: isRunning ? 'rgba(126,240,162,0.2)' : 'rgba(255,107,107,0.2)'
                }}>
                  {isRunning ? '🟢 RUNNING' : '🔴 STOPPED'}
                </span>
              </div>
              <div style={{ 
                padding: 12,
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 8,
                fontSize: 13,
                color: '#9aa1aa',
                lineHeight: 1.5
              }}>
                {isRunning ? '🤖 Bot is executing trading rules on price updates...' : '⏸️ Bot is stopped. Click Start to begin trading.'}
                {executionError && `\n❌ Error: ${executionError}`}
              </div>
            </div>

            {/* Recent Signals */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ color: '#cfd3d8', fontSize: 16, fontWeight: 600 }}>Recent Signals</span>
                <span style={{ color: '#5da9ff', fontSize: 14, fontWeight: 600 }}>
                  {events.length} total
                </span>
              </div>
              <div style={{ 
                maxHeight: 250,
                overflowY: 'auto',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 12,
                padding: 12
              }}>
                {events.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#9aa1aa', fontSize: 14, padding: 30 }}>
                    <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>📈</div>
                    <div>No signals generated yet</div>
                    <div style={{ fontSize: 12, marginTop: 8 }}>Start the bot to see trading activity</div>
                  </div>
                ) : (
                  events.slice(-10).reverse().map((ev, i) => (
                    <div key={i} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '12px 16px',
                      marginBottom: 8,
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: 8,
                      borderLeft: `4px solid ${ev.side === 'buy' ? '#7ef0a2' : '#ffb3b3'}`,
                      transition: 'all 0.2s ease'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%',
                          background: ev.side === 'buy' ? '#7ef0a2' : '#ffb3b3',
                          boxShadow: `0 0 8px ${ev.side === 'buy' ? '#7ef0a2' : '#ffb3b3'}`
                        }} />
                        <div>
                          <div style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: 14 }}>{ev.side}</div>
                          <div style={{ fontSize: 12, color: '#9aa1aa' }}>{ev.reason}</div>
                        </div>
                      </div>
                      <div style={{ 
                        color: ev.side === 'buy' ? '#7ef0a2' : '#ffb3b3', 
                        fontWeight: 700,
                        fontSize: 14
                      }}>
                        {ev.price}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: AI Chat and Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Graber AI Chat */}
          <div style={{ height: 450 }}>
            <GraberAIChat 
              onCodeGenerated={(generatedCode) => {
                setCode(generatedCode);
                setExecutionError(null);
              }}
              onCodeModified={(modifiedCode) => {
                setCode(modifiedCode);
                setExecutionError(null);
              }}
            />
          </div>

          {/* Code Editor */}
          <div className="glass-panel" style={{ padding: 20, flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: '#5da9ff', fontSize: 20 }}>📝 Trading Rules</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setCode(DEFAULT_PYTHON_CODE)}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(93, 169, 255, 0.2)',
                    border: '1px solid rgba(93, 169, 255, 0.3)',
                    borderRadius: 8,
                    color: '#5da9ff',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  🔄 Reset
                </button>
              </div>
            </div>
            <div style={{ marginBottom: 16, padding: 12, background: 'rgba(93,169,255,0.1)', borderRadius: 8 }}>
              <div style={{ color: '#cfd3d8', fontSize: 14, marginBottom: 8 }}>
                <strong>Available Variables:</strong>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <code style={{ background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>current_price</code>
                <code style={{ background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>balance</code>
                <code style={{ background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>position</code>
                <code style={{ background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>candles</code>
                <code style={{ background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>signals</code>
              </div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="# Write your Python trading bot code here..."
              style={{
                width: '100%',
                height: 300,
                padding: 16,
                borderRadius: 12,
                background: 'rgba(0,0,0,0.3)',
                color: '#eaf4ff',
                border: '1px solid rgba(93,169,255,0.2)',
                fontSize: 14,
                fontFamily: 'Monaco, Menlo, monospace',
                resize: 'vertical',
                lineHeight: 1.6
              }}
            />
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button
                onClick={() => {
                  setIsRunning(!isRunning);
                  if (!isRunning) {
                    setEvents([]);
                    setExecutionError(null);
                  }
                }}
                style={{
                  padding: '12px 24px',
                  background: isRunning ? '#ff6b6b' : '#7ef0a2',
                  border: 'none',
                  borderRadius: 10,
                  color: '#000',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 16,
                  transition: 'all 0.2s ease',
                  boxShadow: `0 4px 12px ${isRunning ? 'rgba(255,107,107,0.3)' : 'rgba(126,240,162,0.3)'}`
                }}
              >
                {isRunning ? '⏹️ Stop Bot' : '▶️ Start Bot'}
              </button>
              <button
                onClick={() => {
                  setEvents([]);
                  setExecutionError(null);
                }}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 10,
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 16,
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
              >
                🗑️ Clear Signals
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

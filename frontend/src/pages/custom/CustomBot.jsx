import React, { useState, useEffect, useRef } from 'react';
import PairChart from '../../components/PairChart';
import CoinSelector from '../../components/CoinSelector';
import GraberAIChat from '../../components/GraberAIChat';
import { executePythonCode } from '../../services/pythonExecutor';

// Default Python trading bot template
const DEFAULT_PYTHON_CODE = `# Trading Bot Template
# Available variables: current_price, symbol, balance, position
# Return signals by appending to the signals list

signals = []

# Example: Simple moving average strategy
if current_price > 98000:
    signals.append({
        'side': 'buy',
        'price': current_price,
        'quantity': 0.001,
        'reason': 'Price above 98000'
    })

if current_price < 96000:
    signals.append({
        'side': 'sell',
        'price': current_price,
        'quantity': 0.001,
        'reason': 'Price below 96000'
    })

# You can add more complex logic here
# Technical indicators, risk management, etc.
`;

export default function CustomBot() {
  const [code, setCode] = useState(DEFAULT_PYTHON_CODE);
  const [events, setEvents] = useState([]); // {time, price, side, reason}
  const [symbol, setSymbol] = useState('BTC/USDT');
  const [isRunning, setIsRunning] = useState(false);
  const [executionError, setExecutionError] = useState(null);
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
        
        {/* Left Side: Chart and Dashboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Trading Pair Selector */}
          <div className="glass-panel" style={{ padding: 20, height: 450 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, height: '100%' }}>
              
              {/* Left Part - Coin Selector */}
              <div>
                <h4 style={{ margin: 0, marginBottom: 12, color: '#5da9ff', fontSize: 16 }}>Select Trading Pair</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ color: '#cfd3d8', fontSize: 12, fontWeight: 600 }}>Pair:</span>
                  <CoinSelector selectedPair={symbol} onPairChange={setSymbol} disabled={isRunning} />
                </div>
              </div>
              
              {/* Right Part - Market Overview */}
              <div>
                <h4 style={{ margin: 0, marginBottom: 12, color: '#5da9ff', fontSize: 16 }}>Market Overview</h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: 6,
                  height: 'calc(100% - 40px)',
                  overflow: 'hidden'
                }}>
                  {[
                    { pair: 'BTCUSDT', change: 5.55, price: 60377, trend: 'up' },
                    { pair: 'ETHUSDT', change: -2.34, price: 3456, trend: 'down' },
                    { pair: 'BNBUSDT', change: 1.23, price: 567, trend: 'up' },
                    { pair: 'ADAUSDT', change: 3.45, price: 0.65, trend: 'up' },
                    { pair: 'SOLUSDT', change: -1.89, price: 145, trend: 'down' },
                    { pair: 'DOTUSDT', change: 0.67, price: 8.90, trend: 'up' },
                    { pair: 'AVAXUSDT', change: 4.12, price: 38.50, trend: 'up' },
                    { pair: 'MATICUSDT', change: -0.45, price: 0.92, trend: 'down' },
                    { pair: 'LINKUSDT', change: 2.78, price: 14.30, trend: 'up' }
                  ].map((crypto, index) => (
                    <div key={crypto.pair} style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(93,169,255,0.2)',
                      borderRadius: 8,
                      padding: 6,
                      fontSize: 10,
                      color: '#cfd3d8',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}>
                      <div style={{ fontWeight: 600, color: '#5da9ff', fontSize: 9 }}>{crypto.pair}</div>
                      <div style={{ 
                        fontSize: 9, 
                        color: crypto.trend === 'up' ? '#7ef0a2' : '#ffb3b3',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                      }}>
                        {crypto.trend === 'up' ? '▲' : '▼'} {Math.abs(crypto.change)}%
                      </div>
                      <div style={{ fontSize: 9, color: '#7ef0a2', fontWeight: 600 }}>
                        ${crypto.price.toLocaleString()}
                      </div>
                      {/* Mini Sparkline Graph */}
                      <div style={{ 
                        height: 30, 
                        width: '100%',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: 4,
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <svg width="100%" height="100%" style={{ position: 'absolute' }}>
                          <polyline
                            points={crypto.trend === 'up' 
                              ? '0,25 5,22 10,20 15,18 20,15 25,12 30,8 35,10 40,5 45,7 50,3 55,6 60,2'
                              : '0,5 5,8 10,10 15,12 20,15 25,18 30,22 35,20 40,25 45,23 50,27 55,24 60,28'
                            }
                            fill="none"
                            stroke={crypto.trend === 'up' ? '#7ef0a2' : '#ffb3b3'}
                            strokeWidth="1.5"
                          />
                        </svg>
                      </div>
                    </div>
                  ))}
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

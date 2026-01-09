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
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>Custom Python Bot</h1>
        <p style={{ color: '#9aa1aa', marginTop: 0 }}>Write simple trading rules and see live signals on the chart.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        {/* Left Column: Chart & Dashboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Chart with Coin Selector */}
          <div className="glass-panel" style={{ padding: 20, height: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: '#5da9ff' }}>📈 Live Chart</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#9aa1aa', fontSize: 14 }}>Pair:</span>
                <CoinSelector selectedPair={symbol} onPairChange={setSymbol} disabled={isRunning} />
              </div>
            </div>
            <div style={{ height: 'calc(100% - 50px)' }}>
              <PairChart pair={symbol} liveSymbol={symbol.replace('/','').toLowerCase()} />
            </div>
          </div>

          {/* Dashboard */}
          <div className="glass-panel" style={{ padding: 20 }}>
            <h3 style={{ marginTop: 0, marginBottom: 16, color: '#5da9ff' }}>📊 Dashboard</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#7ef0a2', marginBottom: 4 }}>
                  {events.filter(e => e.side === 'buy').length}
                </div>
                <div style={{ fontSize: 12, color: '#9aa1aa' }}>Buy Signals</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ffb3b3', marginBottom: 4 }}>
                  {events.filter(e => e.side === 'sell').length}
                </div>
                <div style={{ fontSize: 12, color: '#9aa1aa' }}>Sell Signals</div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: '#cfd3d8', fontSize: 14 }}>Bot Status</span>
                <span style={{ 
                  color: isRunning ? '#7ef0a2' : '#ff6b6b',
                  fontSize: 12,
                  fontWeight: 600 
                }}>
                  {isRunning ? '🟢 RUNNING' : '🔴 STOPPED'}
                </span>
              </div>
              <div style={{ 
                padding: 8,
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 6,
                fontSize: 11,
                color: '#9aa1aa',
                maxHeight: 60,
                overflow: 'auto'
              }}>
                {isRunning ? 'Bot is executing trading rules on price updates...' : 'Bot is stopped. Click Start to begin trading.'}
                {executionError && `\n❌ ${executionError}`}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: '#cfd3d8', fontSize: 14 }}>Recent Signals</span>
                <span style={{ color: '#5da9ff', fontSize: 12 }}>
                  {events.length} total
                </span>
              </div>
              <div style={{ 
                maxHeight: 200,
                overflowY: 'auto',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 6,
                padding: 8
              }}>
                {events.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#9aa1aa', fontSize: 12, padding: 20 }}>
                    No signals generated yet
                  </div>
                ) : (
                  events.slice(-10).reverse().map((ev, i) => (
                    <div key={i} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 12px',
                      marginBottom: 6,
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: 6,
                      borderLeft: `3px solid ${ev.side === 'buy' ? '#7ef0a2' : '#ffb3b3'}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%',
                          background: ev.side === 'buy' ? '#7ef0a2' : '#ffb3b3'
                        }} />
                        <div>
                          <div style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 12 }}>{ev.side}</div>
                          <div style={{ fontSize: 10, color: '#9aa1aa' }}>{ev.reason}</div>
                        </div>
                      </div>
                      <div style={{ 
                        color: ev.side === 'buy' ? '#7ef0a2' : '#ffb3b3', 
                        fontWeight: 600,
                        fontSize: 12
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

        {/* Right Column: AI Chat & Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Graber AI Chat */}
          <div style={{ height: 400 }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, color: '#5da9ff' }}>📝 Trading Rules</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setCode(DEFAULT_PYTHON_CODE)}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(93, 169, 255, 0.2)',
                    border: '1px solid rgba(93, 169, 255, 0.3)',
                    borderRadius: 6,
                    color: '#5da9ff',
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
            <div style={{ marginBottom: 12, color: '#9aa1aa', fontSize: 14 }}>
              Use <code style={{ background: 'rgba(93,169,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>current_price</code> and <code style={{ background: 'rgba(93,169,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>signals</code> variables.
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="# Write your Python trading bot code here..."
              style={{
                width: '100%',
                height: 300,
                padding: 12,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.03)',
                color: '#eaf4ff',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: 13,
                fontFamily: 'Monaco, Menlo, monospace',
                resize: 'vertical',
                lineHeight: 1.5
              }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button
                onClick={() => {
                  setIsRunning(!isRunning);
                  if (!isRunning) {
                    setEvents([]);
                    setExecutionError(null);
                  }
                }}
                style={{
                  padding: '10px 20px',
                  background: isRunning ? '#ff6b6b' : '#7ef0a2',
                  border: 'none',
                  borderRadius: 8,
                  color: '#000',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 14
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
                  padding: '10px 20px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 8,
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 14
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

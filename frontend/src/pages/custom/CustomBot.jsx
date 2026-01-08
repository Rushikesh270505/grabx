import React, { useState, useEffect, useRef } from 'react';
import PairChart from '../../components/PairChart';
import CoinSelector from '../../components/CoinSelector';
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

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 20 }}>
        {/* Left Panel: Code & Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="glass-panel" style={{ padding: 20 }}>
            <h3 style={{ marginTop: 0, marginBottom: 12, color: '#5da9ff' }}>📝 Trading Rules</h3>
            <div style={{ marginBottom: 12, color: '#9aa1aa', fontSize: 14 }}>
              Write Python trading code. Use <code style={{ background: 'rgba(93,169,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>current_price</code> and <code style={{ background: 'rgba(93,169,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>signals</code> variables.
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="# Write your Python trading bot code here..."
              style={{
                width: '100%',
                height: 240,
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
                className="cta-btn"
                onClick={() => setIsRunning(!isRunning)}
                style={{
                  background: isRunning ? '#f87171' : '#4ade80',
                  flex: 1
                }}
              >
                {isRunning ? 'Stop Bot' : 'Start Bot'}
              </button>
              <button
                className="cta-btn"
                onClick={() => {
                  setCode(DEFAULT_PYTHON_CODE);
                  setExecutionError(null);
                }}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
              >
                Reset Code
              </button>
              <button
                className="cta-btn"
                onClick={() => setEvents([])}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
              >
                Clear Signals
              </button>
            </div>
            
            {executionError && (
              <div style={{
                marginTop: 12,
                padding: 10,
                background: 'rgba(248,113,113,0.1)',
                border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: 6,
                color: '#f87171',
                fontSize: 12
              }}>
                ⚠️ Execution Error: {executionError}
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ padding: 20 }}>
            <h3 style={{ marginTop: 0, marginBottom: 12, color: '#5da9ff' }}>📊 Recent Signals</h3>
            {events.length === 0 ? (
              <div style={{ color: '#9aa1aa', fontSize: 14 }}>No signals yet — start the bot and wait for price conditions.</div>
            ) : (
              <div style={{ maxHeight: 200, overflowY: 'auto', display: 'grid', gap: 8 }}>
                {events.slice().reverse().map((ev, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: 6,
                      border: `1px solid ${ev.side === 'buy' ? 'rgba(126,240,162,0.2)' : 'rgba(255,179,179,0.2)'}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: ev.side === 'buy' ? '#7ef0a2' : '#ffb3b3'
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, textTransform: 'uppercase' }}>{ev.side}</div>
                        <div style={{ fontSize: 11, color: '#9aa1aa' }}>{ev.reason}</div>
                        {ev.quantity > 0 && (
                          <div style={{ fontSize: 10, color: '#6b7280' }}>Qty: {ev.quantity}</div>
                        )}
                      </div>
                    </div>
                    <div style={{ color: ev.side === 'buy' ? '#7ef0a2' : '#ffb3b3', fontWeight: 600 }}>
                      {ev.price}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Chart & Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="glass-panel" style={{ padding: 20 }}>
            <h3 style={{ marginTop: 0, marginBottom: 12, color: '#5da9ff' }}>📈 Chart</h3>
            <PairChart pair={symbol} liveSymbol={symbol.replace('/','').toLowerCase()} />
          </div>

          <div className="glass-panel" style={{ padding: 20 }}>
            <h3 style={{ marginTop: 0, marginBottom: 12, color: '#5da9ff' }}>⚙️ Settings</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, color: '#cfd3d8', fontSize: 14 }}>Trading Pair</label>
              <CoinSelector selectedPair={symbol} onPairChange={setSymbol} disabled={isRunning} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, color: '#cfd3d8', fontSize: 14 }}>Code Status</label>
              <pre
                style={{
                  margin: 0,
                  padding: 12,
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 6,
                  fontSize: 11,
                  color: '#9aa1aa',
                  maxHeight: 100,
                  overflow: 'auto'
                }}
              >
                {isRunning ? '🟢 Bot is running - Executing on price updates...' : '🔴 Bot stopped'}
                {executionError ? `\n❌ Error: ${executionError}` : ''}
                {events.length > 0 ? `\n📊 Generated ${events.length} signals` : ''}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Backtesting() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get coin pair from URL params or state
  const [symbol, setSymbol] = useState(location.state?.symbol || 'BTCUSDT');
  const [backtestConfig, setBacktestConfig] = useState({
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    startTime: '09:00',
    endTime: '17:00',
    initialCapital: 10000,
    commission: 0.001
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [chartData, setChartData] = useState([]);

  // Generate mock chart data for the selected period
  useEffect(() => {
    const generateChartData = () => {
      const data = [];
      const start = new Date(backtestConfig.startDate);
      const end = new Date(backtestConfig.endDate);
      const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      let currentPrice = 60000; // Base price for BTC
      
      for (let i = 0; i < daysDiff; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        
        // Generate daily price data
        const volatility = (Math.random() - 0.5) * currentPrice * 0.05;
        const trend = Math.sin(i * 0.1) * currentPrice * 0.02;
        const price = currentPrice + volatility + trend;
        
        data.push({
          date: date.toISOString().split('T')[0],
          timestamp: date.getTime(),
          price: price,
          volume: Math.random() * 1000000 + 500000
        });
        
        currentPrice = price;
      }
      
      setChartData(data);
    };

    generateChartData();
  }, [backtestConfig.startDate, backtestConfig.endDate]);

  const runBacktest = () => {
    setIsRunning(true);
    
    // Simulate backtest processing
    setTimeout(() => {
      const mockResults = {
        totalTrades: Math.floor(Math.random() * 50) + 10,
        profitLoss: (Math.random() - 0.5) * 5000,
        profitLossPercentage: (Math.random() - 0.5) * 20,
        winRate: Math.random() * 40 + 30,
        maxDrawdown: Math.random() * 15 + 5,
        finalBalance: backtestConfig.initialCapital + ((Math.random() - 0.5) * 5000),
        sharpeRatio: (Math.random() - 0.5) * 2,
        trades: Array.from({ length: 10 }, (_, i) => ({
          timestamp: Date.now() - (i * 24 * 60 * 60 * 1000),
          side: Math.random() > 0.5 ? 'buy' : 'sell',
          price: 60000 + (Math.random() - 0.5) * 2000,
          reason: ['Price above threshold', 'RSI oversold', 'MACD crossover', 'Support level hit'][Math.floor(Math.random() * 4)]
        }))
      };
      
      setResults(mockResults);
      setIsRunning(false);
    }, 3000); // 3 second simulation
  };

  return (
    <div style={{ 
      padding: 24, 
      color: '#fff', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #151923 100%)'
    }}>
      {/* Header */}
      <div className="glass-panel" style={{ 
        padding: 20, 
        marginBottom: 24, 
        textAlign: 'center',
        background: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid rgba(93, 169, 255, 0.3)'
      }}>
        <h1 style={{ margin: 0, fontSize: 32, color: '#5da9ff' }}>
          📈 {symbol} Backtesting
        </h1>
        <p style={{ color: '#9aa1aa', margin: 0, fontSize: 16, marginTop: 8 }}>
          Historical performance analysis for your trading strategy
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        
        {/* Left Side: Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Configuration Panel */}
          <div className="glass-panel" style={{ 
            padding: 20,
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(93, 169, 255, 0.3)'
          }}>
            <h3 style={{ margin: 0, marginBottom: 20, color: '#5da9ff', fontSize: 20 }}>
              ⚙️ Configuration
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ color: '#cfd3d8', fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                  Trading Pair
                </label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(93, 169, 255, 0.3)',
                    color: '#fff',
                    fontSize: 14
                  }}
                >
                  <option value="BTCUSDT">BTC/USDT</option>
                  <option value="ETHUSDT">ETH/USDT</option>
                  <option value="BNBUSDT">BNB/USDT</option>
                  <option value="ADAUSDT">ADA/USDT</option>
                  <option value="SOLUSDT">SOL/USDT</option>
                </select>
              </div>
              <div>
                <label style={{ color: '#cfd3d8', fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={backtestConfig.startDate}
                  onChange={(e) => setBacktestConfig({...backtestConfig, startDate: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(93, 169, 255, 0.3)',
                    color: '#fff',
                    fontSize: 14
                  }}
                />
              </div>
              <div>
                <label style={{ color: '#cfd3d8', fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={backtestConfig.endDate}
                  onChange={(e) => setBacktestConfig({...backtestConfig, endDate: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(93, 169, 255, 0.3)',
                    color: '#fff',
                    fontSize: 14
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ color: '#cfd3d8', fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                  Start Time
                </label>
                <input
                  type="time"
                  value={backtestConfig.startTime}
                  onChange={(e) => setBacktestConfig({...backtestConfig, startTime: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(93, 169, 255, 0.3)',
                    color: '#fff',
                    fontSize: 14
                  }}
                />
              </div>
              <div>
                <label style={{ color: '#cfd3d8', fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                  End Time
                </label>
                <input
                  type="time"
                  value={backtestConfig.endTime}
                  onChange={(e) => setBacktestConfig({...backtestConfig, endTime: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(93, 169, 255, 0.3)',
                    color: '#fff',
                    fontSize: 14
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ color: '#cfd3d8', fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                  Initial Capital ($)
                </label>
                <input
                  type="number"
                  value={backtestConfig.initialCapital}
                  onChange={(e) => setBacktestConfig({...backtestConfig, initialCapital: Number(e.target.value)})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(93, 169, 255, 0.3)',
                    color: '#fff',
                    fontSize: 14
                  }}
                />
              </div>
              <div>
                <label style={{ color: '#cfd3d8', fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                  Commission (%)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={backtestConfig.commission * 100}
                  onChange={(e) => setBacktestConfig({...backtestConfig, commission: Number(e.target.value) / 100})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(93, 169, 255, 0.3)',
                    color: '#fff',
                    fontSize: 14
                  }}
                />
              </div>
            </div>

            <button
              onClick={runBacktest}
              disabled={isRunning}
              style={{
                width: '100%',
                padding: '16px 24px',
                background: isRunning ? '#ff6b6b' : '#5da9ff',
                border: 'none',
                borderRadius: 12,
                color: '#fff',
                fontWeight: 700,
                cursor: isRunning ? 'not-allowed' : 'pointer',
                fontSize: 16,
                transition: 'all 0.3s ease',
                marginTop: 20
              }}
            >
              {isRunning ? '⏳ Running Backtest...' : '🚀 Run Backtest'}
            </button>
          </div>

          {/* Results Panel */}
          {results && (
            <div className="glass-panel" style={{ 
              padding: 20,
              background: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(93, 169, 255, 0.3)'
            }}>
              <h3 style={{ margin: 0, marginBottom: 20, color: '#5da9ff', fontSize: 20 }}>
                📊 Results
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div style={{ textAlign: 'center', padding: 16, background: 'rgba(93, 169, 255, 0.1)', borderRadius: 12 }}>
                  <div style={{ fontSize: 28, fontWeight: 'bold', color: '#5da9ff', marginBottom: 8 }}>
                    ${results.finalBalance?.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 14, color: '#9aa1aa' }}>Final Balance</div>
                </div>
                <div style={{ textAlign: 'center', padding: 16, background: 'rgba(93, 169, 255, 0.1)', borderRadius: 12 }}>
                  <div style={{ 
                    fontSize: 28, 
                    fontWeight: 'bold', 
                    color: results.profitLoss >= 0 ? '#7ef0a2' : '#ff6b6b', 
                    marginBottom: 8 
                  }}>
                    {results.profitLoss >= 0 ? '+' : ''}{results.profitLoss?.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 14, color: '#9aa1aa' }}>Profit/Loss</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div style={{ textAlign: 'center', padding: 16, background: 'rgba(93, 169, 255, 0.1)', borderRadius: 12 }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#5da9ff', marginBottom: 8 }}>
                    {results.profitLossPercentage?.toFixed(2)}%
                  </div>
                  <div style={{ fontSize: 14, color: '#9aa1aa' }}>Return %</div>
                </div>
                <div style={{ textAlign: 'center', padding: 16, background: 'rgba(93, 169, 255, 0.1)', borderRadius: 12 }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#5da9ff', marginBottom: 8 }}>
                    {results.winRate?.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: 14, color: '#9aa1aa' }}>Win Rate</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div style={{ textAlign: 'center', padding: 16, background: 'rgba(93, 169, 255, 0.1)', borderRadius: 12 }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#5da9ff', marginBottom: 8 }}>
                    {results.totalTrades}
                  </div>
                  <div style={{ fontSize: 14, color: '#9aa1aa' }}>Total Trades</div>
                </div>
                <div style={{ textAlign: 'center', padding: 16, background: 'rgba(93, 169, 255, 0.1)', borderRadius: 12 }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff6b6b', marginBottom: 8 }}>
                    {results.maxDrawdown?.toFixed(2)}%
                  </div>
                  <div style={{ fontSize: 14, color: '#9aa1aa' }}>Max Drawdown</div>
                </div>
                <div style={{ textAlign: 'center', padding: 16, background: 'rgba(93, 169, 255, 0.1)', borderRadius: 12 }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#5da9ff', marginBottom: 8 }}>
                    {results.sharpeRatio?.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 14, color: '#9aa1aa' }}>Sharpe Ratio</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="glass-panel" style={{ 
            padding: 20,
            flex: 1,
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(93, 169, 255, 0.3)'
          }}>
            <h3 style={{ margin: 0, marginBottom: 20, color: '#5da9ff', fontSize: 20 }}>
              📈 Price Chart
            </h3>
            <div style={{ 
              height: 400,
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 12,
              padding: 16,
              position: 'relative'
            }}>
              {/* Simple SVG Chart */}
              <svg width="100%" height="100%" viewBox="0 0 800 400">
                {/* Grid Lines */}
                {[...Array(9)].map((_, i) => (
                  <line
                    key={`h-${i}`}
                    x1="0"
                    y1={i * 50}
                    x2="800"
                    y2={i * 50}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Price Line */}
                <polyline
                  points={chartData.map((point, i) => `${(i / chartData.length) * 800},${400 - (point.price / 70000) * 350}`).join(' ')}
                  fill="none"
                  stroke="#5da9ff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Data Points */}
                {chartData.map((point, i) => (
                  <circle
                    key={i}
                    cx={(i / chartData.length) * 800}
                    cy={400 - (point.price / 70000) * 350}
                    r="4"
                    fill="#5da9ff"
                    stroke="rgba(255, 255, 255, 0.8)"
                    strokeWidth="2"
                  />
                ))}
              </svg>
              
              {/* Chart Legend */}
              <div style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'rgba(0, 0, 0, 0.8)',
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 12,
                color: '#9aa1aa'
              }}>
                <div style={{ marginBottom: 4 }}>
                  <strong>Current Pair:</strong> {symbol}
                </div>
                <div style={{ marginBottom: 4 }}>
                  <strong>Period:</strong> {backtestConfig.startDate} to {backtestConfig.endDate}
                </div>
                <div>
                  <strong>Price Range:</strong> ${Math.min(...chartData.map(d => d.price)).toFixed(2)} - ${Math.max(...chartData.map(d => d.price)).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Trade History */}
          {results && results.trades && (
            <div className="glass-panel" style={{ 
              padding: 20,
              background: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(93, 169, 255, 0.3)'
            }}>
              <h3 style={{ margin: 0, marginBottom: 20, color: '#5da9ff', fontSize: 20 }}>
                📋 Recent Trades
              </h3>
              <div style={{ 
                maxHeight: 300,
                overflowY: 'auto',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: 12,
                padding: 16
              }}>
                {results.trades.map((trade, i) => (
                  <div key={i} style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    marginBottom: 8,
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 8,
                    borderLeft: `4px solid ${trade.side === 'buy' ? '#7ef0a2' : '#ff6b6b'}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ 
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: trade.side === 'buy' ? '#7ef0a2' : '#ff6b6b'
                      }}>
                        {trade.side.toUpperCase()}
                      </span>
                      <span style={{ fontSize: 12, color: '#9aa1aa' }}>
                        {trade.reason}
                      </span>
                    </div>
                    <div style={{ fontSize: 14, color: '#cfd3d8' }}>
                      ${trade.price?.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ position: 'fixed', bottom: 24, right: 24 }}>
        <button
          onClick={() => navigate('/custom-bot', { state: { symbol: symbol } })}
          style={{
            padding: '12px 24px',
            background: 'rgba(93, 169, 255, 0.2)',
            border: '1px solid rgba(93, 169, 255, 0.3)',
            borderRadius: 10,
            color: '#5da9ff',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            transition: 'all 0.2s ease'
          }}
        >
          ← Back to Custom Bot
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Backtesting() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get coin pair from URL params or state
  const [symbol, setSymbol] = useState(location.state?.symbol || 'BTCUSDT');
  const [showDatePrompt, setShowDatePrompt] = useState(true);
  const [backtestConfig, setBacktestConfig] = useState({
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    initialCapital: 10000,
    commission: 0.001
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [dailyPnL, setDailyPnL] = useState([]);
  const [monthlyPnL, setMonthlyPnL] = useState([]);
  const [livePrice, setLivePrice] = useState(60000);

  // Generate mock chart data for selected period
  useEffect(() => {
    const generateChartData = () => {
      const data = [];
      const start = new Date(backtestConfig.startDate);
      const end = new Date(backtestConfig.endDate);
      const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      let currentPrice = 60000; // Base price for BTC
      const dailyData = [];
      const monthlyData = {};
      
      for (let i = 0; i < daysDiff; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        
        // Generate daily price data
        const volatility = (Math.random() - 0.5) * currentPrice * 0.05;
        const trend = Math.sin(i * 0.1) * currentPrice * 0.02;
        const price = currentPrice + volatility + trend;
        
        // Generate daily P&L
        const dailyPL = (Math.random() - 0.5) * 500; // Random daily P&L between -$250 and +$250
        
        data.push({
          date: date.toISOString().split('T')[0],
          timestamp: date.getTime(),
          price: price,
          volume: Math.random() * 1000000 + 500000,
          dailyPL: dailyPL
        });
        
        // Store daily P&L
        dailyData.push({
          date: date.toISOString().split('T')[0],
          day: date.getDate(),
          month: date.getMonth(),
          year: date.getFullYear(),
          pnl: dailyPL,
          cumulativePnL: dailyData.reduce((sum, d) => sum + d.pnl, 0) + dailyPL
        });
        
        // Store monthly P&L
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: date.getMonth(),
            year: date.getFullYear(),
            monthName: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            pnl: 0,
            days: []
          };
        }
        monthlyData[monthKey].pnl += dailyPL;
        monthlyData[monthKey].days.push({
          day: date.getDate(),
          pnl: dailyPL
        });
        
        currentPrice = price;
      }
      
      setChartData(data);
      setDailyPnL(dailyData);
      setMonthlyPnL(Object.values(monthlyData));
    };

    generateChartData();
  }, [backtestConfig.startDate, backtestConfig.endDate]);

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrice(prev => {
        const change = (Math.random() - 0.5) * 100;
        return Math.max(0, prev + change);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

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

  // Calculate calendar grid layout
  const getCalendarLayout = () => {
    const monthCount = monthlyPnL.length;
    if (monthCount <= 6) return { cols: 6, rows: 1 };
    if (monthCount <= 12) return { cols: 6, rows: 2 };
    if (monthCount <= 18) return { cols: 6, rows: 3 };
    if (monthCount <= 24) return { cols: 6, rows: 4 };
    return { cols: 6, rows: Math.ceil(monthCount / 6) };
  };

  const layout = getCalendarLayout();

  return (
    <div style={{ 
      padding: 20, 
      color: '#fff', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #151923 100%)'
    }}>
      {/* Date Selection Modal */}
      {showDatePrompt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            padding: 40,
            maxWidth: 500,
            width: '90%',
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(93, 169, 255, 0.3)',
            borderRadius: 16,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}>
            <h2 style={{ 
              margin: 0, 
              marginBottom: 30, 
              color: '#5da9ff', 
              fontSize: 24,
              textAlign: 'center',
              fontWeight: 700
            }}>
              📅 Select Backtesting Period
            </h2>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ color: '#cfd3d8', fontSize: 16, fontWeight: 600, display: 'block', marginBottom: 12 }}>
                Trading Pair
              </label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 8,
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(93, 169, 255, 0.3)',
                  color: '#fff',
                  fontSize: 16,
                  transition: 'all 0.2s ease'
                }}
              >
                <option value="BTCUSDT">BTC/USDT</option>
                <option value="ETHUSDT">ETH/USDT</option>
                <option value="BNBUSDT">BNB/USDT</option>
                <option value="ADAUSDT">ADA/USDT</option>
                <option value="SOLUSDT">SOL/USDT</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div>
                <label style={{ color: '#cfd3d8', fontSize: 16, fontWeight: 600, display: 'block', marginBottom: 12 }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={backtestConfig.startDate}
                  onChange={(e) => setBacktestConfig({...backtestConfig, startDate: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 8,
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(93, 169, 255, 0.3)',
                    color: '#fff',
                    fontSize: 16,
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>
              <div>
                <label style={{ color: '#cfd3d8', fontSize: 16, fontWeight: 600, display: 'block', marginBottom: 12 }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={backtestConfig.endDate}
                  onChange={(e) => setBacktestConfig({...backtestConfig, endDate: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 8,
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(93, 169, 255, 0.3)',
                    color: '#fff',
                    fontSize: 16,
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
              <div>
                <label style={{ color: '#cfd3d8', fontSize: 16, fontWeight: 600, display: 'block', marginBottom: 12 }}>
                  Initial Capital ($)
                </label>
                <input
                  type="number"
                  value={backtestConfig.initialCapital}
                  onChange={(e) => setBacktestConfig({...backtestConfig, initialCapital: Number(e.target.value)})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 8,
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(93, 169, 255, 0.3)',
                    color: '#fff',
                    fontSize: 16,
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>
              <div>
                <label style={{ color: '#cfd3d8', fontSize: 16, fontWeight: 600, display: 'block', marginBottom: 12 }}>
                  Commission (%)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={backtestConfig.commission * 100}
                  onChange={(e) => setBacktestConfig({...backtestConfig, commission: Number(e.target.value) / 100})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 8,
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(93, 169, 255, 0.3)',
                    color: '#fff',
                    fontSize: 16,
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <button
                onClick={() => navigate('/custom-bot')}
                style={{
                  flex: 1,
                  padding: '16px 24px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 10,
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 16,
                  transition: 'all 0.2s ease'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowDatePrompt(false)}
                style={{
                  flex: 2,
                  padding: '16px 24px',
                  background: '#5da9ff',
                  border: 'none',
                  borderRadius: 10,
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 16,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(93, 169, 255, 0.3)'
                }}
              >
                🚀 Start Backtesting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Only show after date selection */}
      {!showDatePrompt && (
        <>
          {/* Top Navigation */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 24,
            padding: '16px 24px',
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(93, 169, 255, 0.3)',
            borderRadius: 16,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}>
            <button
              onClick={() => navigate('/custom-bot', { state: { symbol: symbol } })}
              style={{
                padding: '10px 20px',
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
            
            <h1 style={{ margin: 0, fontSize: 24, color: '#5da9ff', fontWeight: 700 }}>
              📈 {symbol} Backtesting
            </h1>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowDatePrompt(true)}
                style={{
                  padding: '10px 20px',
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
                📅 Change Period
              </button>
              <button
                onClick={runBacktest}
                disabled={isRunning}
                style={{
                  padding: '10px 20px',
                  background: isRunning ? '#ff6b6b' : '#7ef0a2',
                  border: 'none',
                  borderRadius: 10,
                  color: '#000',
                  fontWeight: 700,
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  transition: 'all 0.2s ease',
                  boxShadow: isRunning ? '0 4px 12px rgba(255, 107, 107, 0.3)' : '0 4px 12px rgba(126, 240, 162, 0.3)'
                }}
              >
                {isRunning ? '⏳ Running...' : '🚀 Run Backtest'}
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            
            {/* Live Graph */}
            <div style={{ 
              padding: 20,
              background: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(93, 169, 255, 0.3)',
              borderRadius: 16,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, color: '#5da9ff', fontSize: 20, fontWeight: 600 }}>
                  📈 Live {symbol} Chart
                </h3>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: livePrice >= 60000 ? '#7ef0a2' : '#ff6b6b' }}>
                    ${livePrice.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 12, color: '#9aa1aa' }}>
                    {livePrice >= 60000 ? '+' : ''}{((livePrice - 60000) / 60000 * 100).toFixed(2)}%
                  </div>
                </div>
              </div>
              
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
                
                {/* Live Indicator */}
                <div style={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  background: 'rgba(0, 0, 0, 0.8)',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#9aa1aa',
                  border: '1px solid rgba(93, 169, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#7ef0a2',
                    animation: 'pulse 2s infinite'
                  }}></div>
                  LIVE
                </div>
              </div>
            </div>

            {/* P&L Dashboard */}
            <div style={{ 
              padding: 20,
              background: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(93, 169, 255, 0.3)',
              borderRadius: 16,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}>
              <h3 style={{ margin: 0, marginBottom: 20, color: '#5da9ff', fontSize: 20, fontWeight: 600 }}>
                💰 P&L Dashboard
              </h3>
              
              {results ? (
                <div>
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
                        {results.profitLoss >= 0 ? '+' : ''}${results.profitLoss?.toFixed(2)}
                      </div>
                      <div style={{ fontSize: 14, color: '#9aa1aa' }}>Total P&L</div>
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
                    <div style={{ textAlign: 'center', padding: 16, background: 'rgba(93, 169, 255, 0.1)', borderRadius: 12 }}>
                      <div style={{ fontSize: 24, fontWeight: 'bold', color: '#5da9ff', marginBottom: 8 }}>
                        {results.totalTrades}
                      </div>
                      <div style={{ fontSize: 14, color: '#9aa1aa' }}>Total Trades</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
              ) : (
                <div style={{ 
                  height: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: 12,
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
                    <div style={{ fontSize: 18, color: '#9aa1aa', marginBottom: 8 }}>
                      No backtest results yet
                    </div>
                    <div style={{ fontSize: 14, color: '#666' }}>
                      Click "Run Backtest" to see P&L analysis
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Calendar Section */}
          <div style={{ 
            padding: 20,
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(93, 169, 255, 0.3)',
            borderRadius: 16,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}>
            <h3 style={{ margin: 0, marginBottom: 20, color: '#5da9ff', fontSize: 20, fontWeight: 600 }}>
              📅 Calendar P&L Analysis ({layout.cols}×{layout.rows} Layout)
            </h3>
            
            <style>{`
              * {
                box-sizing: border-box;
                font-family: system-ui, sans-serif;
              }
              
              .calendar-scene {
                perspective: 1400px;
              }
              
              .calendar-board {
                width: 380px;
                height: 350px;
                position: relative;
                transform-style: preserve-3d;
                transition: transform 0.9s cubic-bezier(.2,.7,.2,1);
                cursor: pointer;
              }
              
              .calendar-board.flipped {
                transform: rotateY(180deg);
              }
              
              .calendar-face {
                position: absolute;
                inset: 0;
                border-radius: 28px;
                padding: 16px;
                backface-visibility: hidden;
                background: linear-gradient(145deg, #020617, #0b1220);
                box-shadow:
                  inset 0 6px 14px rgba(255,255,255,0.05),
                  inset 0 -8px 16px rgba(0,0,0,0.6),
                  0 20px 50px rgba(14,165,233,0.35),
                  0 0 30px rgba(14,165,233,0.45);
              }
              
              .calendar-face::before {
                content: "";
                position: absolute;
                inset: -6px;
                border-radius: 34px;
                background: linear-gradient(to bottom, rgba(56,189,248,0.25), rgba(2,6,23,0.9));
                z-index: -1;
              }
              
              .calendar-front {
                transform: translateZ(18px);
                display: grid;
                place-content: center;
                text-align: center;
              }
              
              .calendar-front h1 {
                font-size: 80px;
                letter-spacing: 6px;
                margin: 0;
                text-shadow: 0 0 6px rgba(56,189,248,0.35);
              }
              
              .calendar-front .grab {
                color: white;
              }
              
              .calendar-front .x {
                color: #38bdf8;
              }
              
              .calendar-back {
                transform: rotateY(180deg) translateZ(18px);
                color: #7dd3fc;
                display: flex;
                flex-direction: column;
                padding: 16px;
                height: 100%;
              }
              
              .calendar-back h2 {
                text-align: center;
                margin: 0 0 8px;
                font-size: 40px;
                font-weight: 600;
                text-shadow: 0 0 6px rgba(255,255,255,0.15);
              }
              
              .calendar-back h2 .month,
              .calendar-back h2 .year {
                font-size: 30px;
                font-weight: 600;
                text-shadow: 0 0 6px rgba(255,255,255,0.15);
              }
              
              .calendar-back h2 .month {
                color: white;
                text-transform: uppercase;
              }
              
              .calendar-back h2 .year {
                color: #38bdf8;
              }
              
              .calendar-spacer {
                flex: 1;
              }
              
              .calendar-weekdays {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                font-size: 10px;
                opacity: 0.75;
                margin: 0;
                padding: 0;
                line-height: 1;
                position: relative;
                top: -15px;
              }
              
              .calendar-weekdays span {
                text-align: center;
              }
              
              .calendar-days {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 6px;
                margin-top: 2px;
              }
              
              .calendar-day {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 2px;
                padding: 6px 0;
                border-radius: 10px;
                background: rgba(255,255,255,0.04);
                backdrop-filter: blur(4px);
              }
              
              .calendar-day.empty {
                background: transparent;
              }
              
              .calendar-day .date {
                font-size: 12px;
                opacity: 0.85;
              }
              
              .calendar-day .pnl {
                font-size: 11px;
                font-weight: 600;
              }
              
              .calendar-day.profit {
                background: rgba(34,197,94,0.12);
              }
              
              .calendar-day.profit .pnl {
                color: #22c55e;
              }
              
              .calendar-day.loss {
                background: rgba(239,68,68,0.12);
              }
              
              .calendar-day.loss .pnl {
                color: #ef4444;
              }
            `}</style>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
              gap: 20
            }}>
              {Array.from({ length: layout.cols * layout.rows }).map((_, index) => {
                const monthData = monthlyPnL[index];
                const isEmpty = !monthData;
                
                return (
                  <div key={index} style={{ display: 'flex', justifyContent: 'center' }}>
                    {isEmpty ? (
                      <div className="calendar-scene">
                        <div className="calendar-board">
                          <div className="calendar-face calendar-front">
                            <h1><span className="grab">GRAB</span><span className="x">X</span></h1>
                          </div>
                          <div className="calendar-face calendar-back">
                            <h2><span className="month">EMPTY</span> <span className="year">—</span></h2>
                            <div className="calendar-spacer"></div>
                            <div className="calendar-weekdays">
                              <span>Sun</span><span>Mon</span><span>Tue</span>
                              <span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                            </div>
                            <div className="calendar-days">
                              {Array.from({ length: 35 }).map((_, dayIndex) => (
                                <div key={dayIndex} className="calendar-day empty">
                                  <span className="date"></span>
                                  <span className="pnl">—</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="calendar-scene">
                        <div 
                          className="calendar-board" 
                          onClick={(e) => {
                            e.currentTarget.classList.toggle('flipped');
                          }}
                        >
                          <div className="calendar-face calendar-front">
                            <h1><span className="grab">GRAB</span><span className="x">X</span></h1>
                          </div>
                          <div className="calendar-face calendar-back">
                            <h2><span className="month">{monthData.monthName.toUpperCase()}</span> <span className="year">{monthData.year}</span></h2>
                            <div className="calendar-spacer"></div>
                            <div className="calendar-weekdays">
                              <span>Sun</span><span>Mon</span><span>Tue</span>
                              <span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                            </div>
                            <div className="calendar-days">
                              {Array.from({ length: 35 }).map((_, dayIndex) => {
                                const dayData = monthData.days.find(d => d.day === dayIndex + 1);
                                const hasData = dayData !== undefined;
                                
                                if (dayIndex < monthData.days.length) {
                                  return (
                                    <div 
                                      key={dayIndex} 
                                      className={`calendar-day ${hasData ? (dayData.pnl >= 0 ? 'profit' : 'loss') : ''}`}
                                    >
                                      <span className="date">{dayIndex + 1}</span>
                                      <span className="pnl">
                                        {hasData ? (dayData.pnl >= 0 ? `+$${dayData.pnl.toFixed(0)}` : `-$${Math.abs(dayData.pnl).toFixed(0)}`) : '—'}
                                      </span>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div key={dayIndex} className="calendar-day empty">
                                      <span className="date"></span>
                                      <span className="pnl">—</span>
                                    </div>
                                  );
                                }
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Summary Stats */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: 16,
              marginTop: 20,
              padding: 16,
              background: 'rgba(93, 169, 255, 0.05)',
              borderRadius: 12,
              border: '1px solid rgba(93, 169, 255, 0.2)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#9aa1aa', marginBottom: 4 }}>
                  Total Period P&L
                </div>
                <div style={{ 
                  fontSize: 18, 
                  fontWeight: 'bold', 
                  color: monthlyPnL.reduce((sum, m) => sum + m.pnl, 0) >= 0 ? '#7ef0a2' : '#ff6b6b' 
                }}>
                  ${monthlyPnL.reduce((sum, m) => sum + m.pnl, 0).toFixed(2)}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#9aa1aa', marginBottom: 4 }}>
                  Average Monthly P&L
                </div>
                <div style={{ 
                  fontSize: 18, 
                  fontWeight: 'bold', 
                  color: '#5da9ff' 
                }}>
                  ${(monthlyPnL.reduce((sum, m) => sum + m.pnl, 0) / monthlyPnL.length).toFixed(2)}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#9aa1aa', marginBottom: 4 }}>
                  Profitable Months
                </div>
                <div style={{ 
                  fontSize: 18, 
                  fontWeight: 'bold', 
                  color: '#5da9ff' 
                }}>
                  {monthlyPnL.filter(m => m.pnl >= 0).length}/{monthlyPnL.length}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#9aa1aa', marginBottom: 4 }}>
                  Period Length
                </div>
                <div style={{ 
                  fontSize: 18, 
                  fontWeight: 'bold', 
                  color: '#5da9ff' 
                }}>
                  {monthlyPnL.length} months
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

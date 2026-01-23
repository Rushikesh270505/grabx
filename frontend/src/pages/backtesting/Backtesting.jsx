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
  const [backtestProgress, setBacktestProgress] = useState(0);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [flippedMonths, setFlippedMonths] = useState(new Set());

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
    setBacktestProgress(0);
    setCurrentDayIndex(0);
    setCurrentMonthIndex(0);
    setFlippedMonths(new Set());
    
    // Reset results
    setResults(null);
    
    const totalDays = dailyPnL.length;
    const totalMonths = monthlyPnL.length;
    let processedDays = 0;
    let processedMonths = 0;
    let currentBalance = backtestConfig.initialCapital;
    let trades = [];
    let totalProfitLoss = 0;
    
    // Process day by day
    const processDay = () => {
      if (processedDays < totalDays) {
        const dayData = dailyPnL[processedDays];
        currentBalance += dayData.pnl;
        totalProfitLoss += dayData.pnl;
        
        // Generate random trade for this day
        if (Math.random() > 0.7) {
          trades.push({
            timestamp: Date.now() - ((totalDays - processedDays) * 24 * 60 * 60 * 1000),
            side: Math.random() > 0.5 ? 'buy' : 'sell',
            price: 60000 + (Math.random() - 0.5) * 2000,
            reason: ['Price above threshold', 'RSI oversold', 'MACD crossover', 'Support level hit'][Math.floor(Math.random() * 4)]
          });
        }
        
        setCurrentDayIndex(processedDays);
        processedDays++;
        
        // Update progress
        const progress = (processedDays / totalDays) * 100;
        setBacktestProgress(progress);
        
        // Check if we need to flip a calendar
        const currentDayData = dailyPnL[processedDays - 1];
        if (currentDayData) {
          const monthIndex = monthlyPnL.findIndex(m => 
            m.month === currentDayData.month && m.year === currentDayData.year
          );
          
          if (monthIndex !== -1 && !flippedMonths.has(monthIndex)) {
            // Flip immediately when we start processing any day in this month
            console.log(`Flipping month ${monthIndex} (${monthlyPnL[monthIndex].monthName}) on day ${currentDayData.day}`);
            setCurrentMonthIndex(monthIndex);
            setFlippedMonths(prev => new Set([...prev, monthIndex]));
          }
          
          // Check if we're moving to a new month and flip it immediately
          if (processedDays < totalDays) {
            const nextDayData = dailyPnL[processedDays];
            if (nextDayData) {
              const nextMonthIndex = monthlyPnL.findIndex(m => 
                m.month === nextDayData.month && m.year === nextDayData.year
              );
              
              if (nextMonthIndex !== -1 && nextMonthIndex !== monthIndex && !flippedMonths.has(nextMonthIndex)) {
                console.log(`Flipping next month ${nextMonthIndex} (${monthlyPnL[nextMonthIndex].monthName}) immediately`);
                setCurrentMonthIndex(nextMonthIndex);
                setFlippedMonths(prev => new Set([...prev, nextMonthIndex]));
              }
            }
          }
        }
        
        // Update live price
        setLivePrice(prev => {
          const change = (Math.random() - 0.5) * 100;
          return Math.max(0, prev + change);
        });
        
        // Continue processing
        setTimeout(processDay, 100); // Process each day with 100ms delay
      } else {
        // Backtest completed
        const mockResults = {
          totalTrades: trades.length,
          profitLoss: totalProfitLoss,
          profitLossPercentage: (totalProfitLoss / backtestConfig.initialCapital) * 100,
          winRate: Math.random() * 40 + 30,
          maxDrawdown: Math.random() * 15 + 5,
          finalBalance: currentBalance,
          sharpeRatio: (Math.random() - 0.5) * 2,
          trades: trades.slice(-10) // Show last 10 trades
        };
        
        setResults(mockResults);
        setIsRunning(false);
        setBacktestProgress(100);
      }
    };
    
    // Start processing
    processDay();
  };

  // Calculate calendar grid layout
  const getCalendarLayout = () => {
    const monthCount = monthlyPnL.length;
    if (monthCount <= 4) return { cols: 4, rows: 1 };
    if (monthCount <= 8) return { cols: 4, rows: 2 };
    if (monthCount <= 12) return { cols: 4, rows: 3 };
    if (monthCount <= 16) return { cols: 4, rows: 4 };
    if (monthCount <= 20) return { cols: 4, rows: 5 };
    return { cols: 4, rows: Math.ceil(monthCount / 4) };
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

            <div style={{ marginBottom: 24 }}>
              <label style={{ color: '#cfd3d8', fontSize: 16, fontWeight: 600, display: 'block', marginBottom: 12 }}>
                Select Backtesting Period
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ color: '#9aa1aa', fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 8 }}>
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
                  <label style={{ color: '#9aa1aa', fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 8 }}>
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
            </div>

            {/* Calendar Preview */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ 
                padding: 16,
                background: 'rgba(93, 169, 255, 0.2)',
                border: '1px solid rgba(93, 169, 255, 0.5)',
                borderRadius: 12,
                color: '#fff',
                fontSize: 14,
                textAlign: 'center'
              }}>
                <div style={{ marginBottom: 8, fontSize: 16, fontWeight: 600, color: '#fff' }}>
                  📅 Selected Period Overview
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Start:</strong> {new Date(backtestConfig.startDate).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>End:</strong> {new Date(backtestConfig.endDate).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div>
                  <strong>Duration:</strong> {Math.ceil((new Date(backtestConfig.endDate) - new Date(backtestConfig.startDate)) / (1000 * 60 * 60 * 24))} days
                </div>
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
                onClick={() => setShowDatePrompt(false)}
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
            
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
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

          {/* Progress Bar */}
          {isRunning && (
            <div style={{ 
              marginBottom: 24,
              padding: '20px 24px',
              background: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(93, 169, 255, 0.3)',
              borderRadius: 16,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: '#7ef0a2',
                    animation: 'pulse 2s infinite'
                  }}></div>
                  <h4 style={{ margin: 0, color: '#5da9ff', fontSize: 18, fontWeight: 600 }}>
                    🔄 Live Backtesting in Progress
                  </h4>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#7ef0a2', fontSize: 16, fontWeight: 600 }}>
                    Day {currentDayIndex + 1} of {dailyPnL.length}
                  </div>
                  <div style={{ color: '#9aa1aa', fontSize: 14 }}>
                    {backtestProgress.toFixed(1)}% Complete
                  </div>
                </div>
              </div>
              <div style={{ 
                height: 12, 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: 6,
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  height: '100%',
                  width: `${backtestProgress}%`,
                  background: 'linear-gradient(90deg, #5da9ff, #7ef0a2)',
                  borderRadius: 6,
                  transition: 'width 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    animation: 'shimmer 2s infinite'
                  }}></div>
                </div>
              </div>
            </div>
          )}

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
              
              {results || isRunning ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <div style={{ textAlign: 'center', padding: 16, background: 'rgba(93, 169, 255, 0.1)', borderRadius: 12 }}>
                      <div style={{ fontSize: 28, fontWeight: 'bold', color: '#5da9ff', marginBottom: 8 }}>
                        ${isRunning ? (backtestConfig.initialCapital + (dailyPnL.slice(0, currentDayIndex).reduce((sum, d) => sum + d.pnl, 0))).toFixed(2) : results?.finalBalance?.toFixed(2)}
                      </div>
                      <div style={{ fontSize: 14, color: '#9aa1aa' }}>Current Balance</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: 16, background: 'rgba(93, 169, 255, 0.1)', borderRadius: 12 }}>
                      <div style={{ 
                        fontSize: 28, 
                        fontWeight: 'bold', 
                        color: (isRunning ? dailyPnL.slice(0, currentDayIndex).reduce((sum, d) => sum + d.pnl, 0) : results?.profitLoss) >= 0 ? '#7ef0a2' : '#ff6b6b', 
                        marginBottom: 8 
                      }}>
                        {(isRunning ? dailyPnL.slice(0, currentDayIndex).reduce((sum, d) => sum + d.pnl, 0) : results?.profitLoss) >= 0 ? '+' : ''}${(isRunning ? dailyPnL.slice(0, currentDayIndex).reduce((sum, d) => sum + d.pnl, 0) : results?.profitLoss)?.toFixed(2)}
                      </div>
                      <div style={{ fontSize: 14, color: '#9aa1aa' }}>Total P&L</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <div style={{ textAlign: 'center', padding: 16, background: 'rgba(93, 169, 255, 0.1)', borderRadius: 12 }}>
                      <div style={{ fontSize: 24, fontWeight: 'bold', color: '#5da9ff', marginBottom: 8 }}>
                        {isRunning ? ((dailyPnL.slice(0, currentDayIndex).reduce((sum, d) => sum + d.pnl, 0) / backtestConfig.initialCapital) * 100).toFixed(2) : results?.profitLossPercentage?.toFixed(2)}%
                      </div>
                      <div style={{ fontSize: 14, color: '#9aa1aa' }}>Return %</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: 16, background: 'rgba(93, 169, 255, 0.1)', borderRadius: 12 }}>
                      <div style={{ fontSize: 24, fontWeight: 'bold', color: '#5da9ff', marginBottom: 8 }}>
                        {isRunning ? currentDayIndex : results?.totalTrades}
                      </div>
                      <div style={{ fontSize: 14, color: '#9aa1aa' }}>Days Processed</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: 16, background: 'rgba(93, 169, 255, 0.1)', borderRadius: 12 }}>
                      <div style={{ fontSize: 24, fontWeight: 'bold', color: '#5da9ff', marginBottom: 8 }}>
                        {isRunning ? currentMonthIndex + 1 : monthlyPnL.filter(m => m.pnl >= 0).length}/{isRunning ? monthlyPnL.length : monthlyPnL.length}
                      </div>
                      <div style={{ fontSize: 14, color: '#9aa1aa' }}>Months</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ textAlign: 'center', padding: 16, background: 'rgba(93, 169, 255, 0.1)', borderRadius: 12 }}>
                      <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff6b6b', marginBottom: 8 }}>
                        {isRunning ? '0.00' : results?.maxDrawdown?.toFixed(2)}%
                      </div>
                      <div style={{ fontSize: 14, color: '#9aa1aa' }}>Max Drawdown</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: 16, background: 'rgba(93, 169, 255, 0.1)', borderRadius: 12 }}>
                      <div style={{ fontSize: 24, fontWeight: 'bold', color: '#5da9ff', marginBottom: 8 }}>
                        {isRunning ? '0.00' : results?.sharpeRatio?.toFixed(2)}
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
              📅 Calendar P&L Analysis
            </h3>
            
            {/* Debug Info */}
            {isRunning && (
              <div style={{ 
                marginBottom: 16,
                padding: 8,
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 8,
                fontSize: 12,
                color: '#9aa1aa'
              }}>
                Debug: Current Day: {currentDayIndex}, Flipped Months: [{Array.from(flippedMonths).join(', ')}], Total Months: {monthlyPnL.length}
              </div>
            )}
            
            <style>{`
              * {
                box-sizing: border-box;
                font-family: system-ui, sans-serif;
              }
              
              @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
              
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
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
                transition: all 0.2s ease;
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
                transform: scale(1.05);
              }
              
              .calendar-day.profit .pnl {
                color: #22c55e;
              }
              
              .calendar-day.loss {
                background: rgba(239,68,68,0.12);
                transform: scale(1.05);
              }
              
              .calendar-day.loss .pnl {
                color: #ef4444;
              }
            `}</style>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
              gap: '35px', // uniform gap for both rows and columns
              padding: '20px'
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
                        <div className={`calendar-board ${flippedMonths.has(index) ? 'flipped' : ''}`}>
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
                              {(() => {
                                // Get the first day of the month
                                const firstDay = new Date(monthData.year, monthData.month, 1);
                                const startDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
                                const daysInMonth = new Date(monthData.year, monthData.month + 1, 0).getDate();
                                
                                // Create calendar array with empty cells for days before month starts
                                const calendarDays = [];
                                
                                // Add empty cells for days before month starts
                                for (let i = 0; i < startDayOfWeek; i++) {
                                  calendarDays.push(null);
                                }
                                
                                // Add all days of the month
                                for (let day = 1; day <= daysInMonth; day++) {
                                  calendarDays.push(day);
                                }
                                
                                return calendarDays.map((day, calendarIndex) => {
                                  if (day === null) {
                                    // Empty cell for days before month starts
                                    return (
                                      <div key={`empty-${calendarIndex}`} className="calendar-day empty">
                                        <span className="date"></span>
                                        <span className="pnl">—</span>
                                      </div>
                                    );
                                  }
                                  
                                  const dayData = monthData.days.find(d => d.day === day);
                                  const hasData = dayData !== undefined;
                                  const dayOverallIndex = dailyPnL.findIndex(d => 
                                    d.date === `${monthData.year}-${String(monthData.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                  );
                                  const isProcessed = dayOverallIndex !== -1 && dayOverallIndex < currentDayIndex;
                                  
                                  return (
                                    <div 
                                      key={day} 
                                      className={`calendar-day ${hasData && isProcessed ? (dayData.pnl >= 0 ? 'profit' : 'loss') : ''}`}
                                    >
                                      <span className="date">{day}</span>
                                      <span className="pnl">
                                        {hasData && isProcessed ? (dayData.pnl >= 0 ? `+$${dayData.pnl.toFixed(0)}` : `-$${Math.abs(dayData.pnl).toFixed(0)}`) : '—'}
                                      </span>
                                    </div>
                                  );
                                });
                              })()}
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

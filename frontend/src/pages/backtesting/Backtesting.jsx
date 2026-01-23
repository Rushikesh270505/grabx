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
          {/* Header */}
          <div style={{ 
            padding: 20, 
            marginBottom: 24, 
            textAlign: 'center',
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(93, 169, 255, 0.3)',
            borderRadius: 16,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}>
            <h1 style={{ margin: 0, fontSize: 32, color: '#5da9ff', fontWeight: 700 }}>
              📈 {symbol} Backtesting
            </h1>
            <p style={{ color: '#9aa1aa', margin: 0, fontSize: 16, marginTop: 8 }}>
              {backtestConfig.startDate} to {backtestConfig.endDate} • ${backtestConfig.initialCapital} Initial Capital
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            
            {/* Left Side: Calendar P&L */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Calendar P&L Section */}
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
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: monthlyPnL.length <= 12 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                  gap: 16,
                  marginBottom: 20
                }}>
                  {Array.from({ length: monthlyPnL.length <= 12 ? 12 : 18 }).map((_, index) => {
                    const monthData = monthlyPnL[index];
                    const isEmpty = !monthData;
                    
                    return (
                      <div 
                        key={index} 
                        style={{ 
                          padding: 16,
                          background: isEmpty ? 'rgba(255, 255, 255, 0.02)' : 'rgba(93, 169, 255, 0.1)',
                          border: isEmpty ? '1px dashed rgba(255, 255, 255, 0.1)' : '1px solid rgba(93, 169, 255, 0.3)',
                          borderRadius: 12,
                          minHeight: 200,
                          opacity: isEmpty ? 0.5 : 1,
                          backdropFilter: 'blur(5px)'
                        }}
                      >
                        {isEmpty ? (
                          <div style={{ 
                            textAlign: 'center', 
                            color: '#666', 
                            fontSize: 14,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%'
                          }}>
                            <div>
                              <div style={{ fontSize: 24, marginBottom: 8 }}>📅</div>
                              <div>Empty</div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ 
                              fontSize: 16, 
                              fontWeight: 'bold', 
                              color: '#5da9ff', 
                              marginBottom: 12,
                              textAlign: 'center'
                            }}>
                              {monthData.monthName}
                            </div>
                            
                            <div style={{ 
                              fontSize: 24, 
                              fontWeight: 'bold', 
                              color: monthData.pnl >= 0 ? '#7ef0a2' : '#ff6b6b',
                              marginBottom: 16,
                              textAlign: 'center'
                            }}>
                              {monthData.pnl >= 0 ? '+' : ''}${monthData.pnl.toFixed(2)}
                            </div>
                            
                            <div style={{ 
                              fontSize: 12, 
                              color: '#9aa1aa', 
                              marginBottom: 12,
                              textAlign: 'center'
                            }}>
                              Total Days: {monthData.days.length}
                            </div>
                            
                            <div style={{ 
                              display: 'grid', 
                              gridTemplateColumns: 'repeat(7, 1fr)', 
                              gap: 2,
                              fontSize: 10,
                              color: '#9aa1aa'
                            }}>
                              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                <div key={i} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                  {day}
                                </div>
                              ))}
                              
                              {/* Calendar days */}
                              {Array.from({ length: 35 }).map((_, dayIndex) => {
                                const dayData = monthData.days.find(d => d.day === dayIndex + 1);
                                const hasData = dayData !== undefined;
                                
                                return (
                                  <div
                                    key={dayIndex}
                                    style={{
                                      textAlign: 'center',
                                      padding: '4px 2px',
                                      borderRadius: 4,
                                      background: hasData ? (
                                        dayData.pnl >= 0 ? 'rgba(126, 240, 162, 0.2)' : 'rgba(255, 107, 107, 0.2)'
                                      ) : 'transparent',
                                      color: hasData ? (
                                        dayData.pnl >= 0 ? '#7ef0a2' : '#ff6b6b'
                                      ) : '#666',
                                      fontSize: 11,
                                      fontWeight: hasData ? 'bold' : 'normal',
                                      border: hasData ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                                    }}
                                    title={hasData ? `P&L: $${dayData.pnl.toFixed(2)}` : 'No data'}
                                  >
                                    {dayIndex < monthData.days.length ? dayIndex + 1 : ''}
                                  </div>
                                );
                              })}
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
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: 16,
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
                      fontSize: 20, 
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
                      fontSize: 20, 
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
                      fontSize: 20, 
                      fontWeight: 'bold', 
                      color: '#5da9ff' 
                    }}>
                      {monthlyPnL.filter(m => m.pnl >= 0).length}/{monthlyPnL.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Panel */}
              {results && (
                <div style={{ 
                  padding: 20,
                  background: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(93, 169, 255, 0.3)',
                  borderRadius: 16,
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                }}>
                  <h3 style={{ margin: 0, marginBottom: 20, color: '#5da9ff', fontSize: 20, fontWeight: 600 }}>
                    📊 Backtest Results
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
              <div style={{ 
                padding: 20,
                flex: 1,
                background: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(93, 169, 255, 0.3)',
                borderRadius: 16,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
              }}>
                <h3 style={{ margin: 0, marginBottom: 20, color: '#5da9ff', fontSize: 20, fontWeight: 600 }}>
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
                    color: '#9aa1aa',
                    border: '1px solid rgba(93, 169, 255, 0.2)'
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
                <div style={{ 
                  padding: 20,
                  background: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(93, 169, 255, 0.3)',
                  borderRadius: 16,
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                }}>
                  <h3 style={{ margin: 0, marginBottom: 20, color: '#5da9ff', fontSize: 20, fontWeight: 600 }}>
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
        </>
      )}

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
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 12px rgba(93, 169, 255, 0.3)'
          }}
        >
          ← Back to Custom Bot
        </button>
      </div>
    </div>
  );
}

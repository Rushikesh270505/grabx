// Simple backtesting engine for bot configurations
export async function runBacktest(settings, pair, timeframe = '1h', days = 30) {
  try {
    // Fetch historical data from Binance
    const symbol = pair.replace('/', '');
    const limit = Math.min((days * 24) / (timeframe === '1m' ? 1 : timeframe === '5m' ? 5 : timeframe === '15m' ? 15 : timeframe === '1h' ? 60 : 240), 1000);
    
    const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${timeframe}&limit=${limit}`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      return { error: 'No historical data available' };
    }

    const klines = data.map(row => ({
      openTime: row[0],
      open: Number(row[1]),
      high: Number(row[2]),
      low: Number(row[3]),
      close: Number(row[4]),
      volume: Number(row[5])
    }));

    // Simulate trading based on bot type and settings
    const { botType, investment, gridCount, gridSpacing, upperPrice, lowerPrice, buyBuffer, sellBuffer, stopLoss, takeProfit } = settings;
    
    let balance = investment;
    let position = 0;
    let trades = [];
    let maxDrawdown = 0;
    let peakBalance = balance;
    let totalFees = 0;
    
    const feeRate = 0.0004; // 0.04% per trade
    
    for (let i = 1; i < klines.length; i++) {
      const prevCandle = klines[i - 1];
      const candle = klines[i];
      const price = candle.close;
      
      // Update peak balance and drawdown
      if (balance > peakBalance) {
        peakBalance = balance;
      }
      const drawdown = (peakBalance - balance) / peakBalance * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
      
      // Grid trading simulation
      if (botType?.toLowerCase().includes('grid')) {
        const gridUpper = upperPrice || prevCandle.high * 1.05;
        const gridLower = lowerPrice || prevCandle.low * 0.95;
        const gridStep = (gridUpper - gridLower) / gridCount;
        
        // Simple grid logic: buy on dips, sell on rips within grid
        if (price <= gridLower + gridStep * 0.3 && position === 0) {
          const buyAmount = balance / (gridCount / 2);
          position = buyAmount / price;
          balance -= buyAmount;
          totalFees += buyAmount * feeRate;
          trades.push({ time: candle.openTime, side: 'buy', price, amount: buyAmount });
        } else if (price >= gridUpper - gridStep * 0.3 && position > 0) {
          const sellValue = position * price;
          balance += sellValue;
          totalFees += sellValue * feeRate;
          trades.push({ time: candle.openTime, side: 'sell', price, amount: position });
          position = 0;
        }
      }
      
      // Mean reversion simulation
      else if (botType?.toLowerCase().includes('mean')) {
        const sma = klines.slice(Math.max(0, i - 20), i).reduce((sum, k) => sum + k.close, 0) / Math.min(20, i);
        const deviation = (price - sma) / sma;
        
        if (deviation < -0.02 && position === 0) { // 2% below SMA
          const buyAmount = balance * 0.5;
          position = buyAmount / price;
          balance -= buyAmount;
          totalFees += buyAmount * feeRate;
          trades.push({ time: candle.openTime, side: 'buy', price, amount: buyAmount });
        } else if (deviation > 0.02 && position > 0) { // 2% above SMA
          const sellValue = position * price;
          balance += sellValue;
          totalFees += sellValue * feeRate;
          trades.push({ time: candle.openTime, side: 'sell', price, amount: position });
          position = 0;
        }
      }
      
      // Trend following simulation
      else if (botType?.toLowerCase().includes('trend')) {
        const ema20 = calculateEMA(klines.slice(Math.max(0, i - 20), i), 20);
        const ema50 = calculateEMA(klines.slice(Math.max(0, i - 50), i), 50);
        
        if (ema20 > ema50 && position === 0) { // Golden cross
          const buyAmount = balance * 0.6;
          position = buyAmount / price;
          balance -= buyAmount;
          totalFees += buyAmount * feeRate;
          trades.push({ time: candle.openTime, side: 'buy', price, amount: buyAmount });
        } else if (ema20 < ema50 && position > 0) { // Death cross
          const sellValue = position * price;
          balance += sellValue;
          totalFees += sellValue * feeRate;
          trades.push({ time: candle.openTime, side: 'sell', price, amount: position });
          position = 0;
        }
      }
      
      // Scalper simulation
      else if (botType?.toLowerCase().includes('scalper')) {
        const rsi = calculateRSI(klines.slice(Math.max(0, i - 14), i), 14);
        
        if (rsi < 30 && position === 0) { // Oversold
          const buyAmount = balance * 0.3;
          position = buyAmount / price;
          balance -= buyAmount;
          totalFees += buyAmount * feeRate;
          trades.push({ time: candle.openTime, side: 'buy', price, amount: buyAmount });
        } else if (rsi > 70 && position > 0) { // Overbought
          const sellValue = position * price;
          balance += sellValue;
          totalFees += sellValue * feeRate;
          trades.push({ time: candle.openTime, side: 'sell', price, amount: position });
          position = 0;
        }
      }
      
      // Stop loss and take profit
      if (position > 0) {
        const entryPrice = trades[trades.length - 1]?.price || price;
        const pnlPercent = ((price - entryPrice) / entryPrice) * 100;
        
        if (pnlPercent <= -stopLoss || pnlPercent >= takeProfit) {
          const sellValue = position * price;
          balance += sellValue;
          totalFees += sellValue * feeRate;
          trades.push({ time: candle.openTime, side: 'sell', price, amount: position });
          position = 0;
        }
      }
    }
    
    // Close any open position
    if (position > 0) {
      const finalPrice = klines[klines.length - 1].close;
      const sellValue = position * finalPrice;
      balance += sellValue;
      totalFees += sellValue * feeRate;
      trades.push({ time: klines[klines.length - 1].openTime, side: 'sell', price: finalPrice, amount: position });
    }
    
    const totalReturn = balance - investment;
    const totalReturnPercent = (totalReturn / investment) * 100;
    const apr = (totalReturnPercent / days) * 365;
    
    return {
      totalReturn,
      totalReturnPercent,
      apr,
      maxDrawdown,
      trades: trades.length,
      winRate: trades.filter((t, i) => i % 2 === 1 && t.side === 'sell' && trades[i-1]?.side === 'buy').length / Math.floor(trades.length / 2) * 100,
      totalFees,
      sharpeRatio: totalReturnPercent / (maxDrawdown || 1),
      dataPoints: klines.length
    };
    
  } catch (error) {
    console.error('Backtest error:', error);
    return { error: error.message };
  }
}

function calculateEMA(data, period) {
  if (data.length === 0) return 0;
  const multiplier = 2 / (period + 1);
  let ema = data[0].close;
  
  for (let i = 1; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema;
  }
  
  return ema;
}

function calculateRSI(data, period) {
  if (data.length < period + 1) return 50;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change >= 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  const rs = avgGain / (avgLoss || 0.001);
  
  return 100 - (100 / (1 + rs));
}

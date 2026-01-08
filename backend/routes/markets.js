const express = require('express');
const axios = require('axios');
const router = express.Router();

// Get market data for a symbol
router.get('/ticker/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Fetch from Binance API
    const response = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
    
    res.json(response.data);
  } catch (error) {
    console.error('Get ticker error:', error);
    res.status(500).json({ error: 'Failed to get market data' });
  }
});

// Get klines (candlestick data)
router.get('/klines/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1h', limit = 100 } = req.query;
    
    // Fetch from Binance API
    const response = await axios.get('https://api.binance.com/api/v3/klines', {
      params: {
        symbol,
        interval,
        limit
      }
    });
    
    const formattedData = response.data.map(kline => ({
      openTime: kline[0],
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5]),
      closeTime: kline[6],
      quoteVolume: parseFloat(kline[7]),
      trades: parseInt(kline[8])
    }));
    
    res.json(formattedData);
  } catch (error) {
    console.error('Get klines error:', error);
    res.status(500).json({ error: 'Failed to get klines data' });
  }
});

// Get orderbook
router.get('/orderbook/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { limit = 100 } = req.query;
    
    const response = await axios.get('https://api.binance.com/api/v3/depth', {
      params: {
        symbol,
        limit
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Get orderbook error:', error);
    res.status(500).json({ error: 'Failed to get orderbook' });
  }
});

// Get recent trades
router.get('/trades/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { limit = 500 } = req.query;
    
    const response = await axios.get('https://api.binance.com/api/v3/trades', {
      params: {
        symbol,
        limit
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ error: 'Failed to get recent trades' });
  }
});

// Get exchange info
router.get('/exchange-info', async (req, res) => {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/exchangeInfo');
    res.json(response.data);
  } catch (error) {
    console.error('Get exchange info error:', error);
    res.status(500).json({ error: 'Failed to get exchange info' });
  }
});

// Get 24hr ticker for all symbols
router.get('/ticker/24hr', async (req, res) => {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
    res.json(response.data);
  } catch (error) {
    console.error('Get 24hr ticker error:', error);
    res.status(500).json({ error: 'Failed to get 24hr ticker data' });
  }
});

// Search symbols
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    
    // Get exchange info first
    const exchangeResponse = await axios.get('https://api.binance.com/api/v3/exchangeInfo');
    const symbols = exchangeResponse.data.symbols;
    
    // Filter symbols based on query
    const filteredSymbols = symbols.filter(symbol => 
      symbol.symbol.toLowerCase().includes(query.toLowerCase()) ||
      symbol.baseAsset.toLowerCase().includes(query.toLowerCase()) ||
      symbol.quoteAsset.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 20); // Limit to 20 results
    
    res.json(filteredSymbols);
  } catch (error) {
    console.error('Search symbols error:', error);
    res.status(500).json({ error: 'Failed to search symbols' });
  }
});

// Get popular symbols
router.get('/popular', async (req, res) => {
  try {
    const popularSymbols = [
      'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT',
      'XRPUSDT', 'DOTUSDT', 'DOGEUSDT', 'AVAXUSDT', 'MATICUSDT',
      'LINKUSDT', 'UNIUSDT', 'LTCUSDT', 'BCHUSDT', 'FILUSDT'
    ];
    
    const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
    const tickers = response.data;
    
    const popularTickers = tickers.filter(ticker => 
      popularSymbols.includes(ticker.symbol)
    );
    
    res.json(popularTickers);
  } catch (error) {
    console.error('Get popular symbols error:', error);
    res.status(500).json({ error: 'Failed to get popular symbols' });
  }
});

module.exports = router;

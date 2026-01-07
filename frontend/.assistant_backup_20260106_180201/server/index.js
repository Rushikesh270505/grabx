const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = path.join(__dirname, 'data.json');

function readData(){
  try{
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }catch(e){
    return { activeBots: [] };
  }
}
function writeData(d){ fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2)); }

const ALL_BOTS = [
  { id: 1, name: 'Scalper', pair: 'BTC/USDT', description: 'Short time-frame trades that capture small price moves across tight spreads. High frequency, low-latency approach ideal for liquid pairs.' },
  { id: 2, name: 'Mean Reverter', pair: 'ETH/USDT', description: 'Detects temporary price deviations and executes counter-trend trades to profit from reversion to average. Works best in range-bound markets.' },
  { id: 3, name: 'Trend Follower', pair: 'SOL/USDT', description: 'Follows medium-to-longer trends, adding to positions as momentum continues and exiting on trend weakness. Designed to capture big market moves.' },
  { id: 4, name: 'Grid Trader', pair: 'ADA/USDT', description: 'Places buy/sell orders in a price grid to profit from oscillations. Excellent for volatile but mean-reverting pairs.' },
  { id: 5, name: 'Arbitrage', pair: 'BNB/USDT', description: 'Scans multiple venues for price differences and executes near-instant trades to lock in risk-free spreads. Requires fast execution and low fees.' },
  { id: 6, name: 'Market Maker', pair: 'XRP/USDT', description: 'Provides liquidity by placing passive bids and asks around mid-price, earning spreads while managing inventory risk.' },
  { id: 7, name: 'Dollar Cost Averager', pair: 'DOT/USDT', description: 'Systematically invests fixed amounts over time to reduce entry timing risk and build positions steadily using market averages.' },
  { id: 8, name: 'Momentum', pair: 'LTC/USDT', description: 'Enters positions when momentum indicators align and exits on momentum breakdowns. A balance between trend-following and quick reactions.' },
  { id: 9, name: 'Options Hedger', pair: 'BTC-PERP', description: 'Uses options or perp instruments to hedge directional exposure, capturing premium while limiting downside risk in volatile markets.' }
];

app.get('/api/bots', (req,res)=>{
  res.json(ALL_BOTS);
});

app.get('/api/bots/:id', (req,res)=>{
  const id = Number(req.params.id);
  const bot = ALL_BOTS.find(b=>b.id===id);
  if (!bot) return res.status(404).json({ error: 'not found' });
  res.json(bot);
});

app.get('/api/active', (req,res)=>{
  const data = readData();
  res.json(data.activeBots || []);
});

app.post('/api/bots/:id/start', (req,res)=>{
  const id = Number(req.params.id);
  const bot = ALL_BOTS.find(b=>b.id===id);
  if (!bot) return res.status(404).json({ error: 'not found' });
  const { investment=0, grids=20, lower=null, upper=null } = req.body || {};
  const data = readData();
  if (!data.activeBots) data.activeBots = [];
  if (data.activeBots.find(b=>b.id===id)) return res.status(400).json({ error: 'already running' });
  const nb = { ...bot, startedAt: Date.now(), pnl: 0, investment, grids, lower, upper };
  data.activeBots.push(nb);
  writeData(data);
  res.json(nb);
});

app.post('/api/bots/:id/stop', (req,res)=>{
  const id = Number(req.params.id);
  const data = readData();
  data.activeBots = (data.activeBots || []).filter(b=>b.id!==id);
  writeData(data);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log('GrabX backend listening on', PORT));

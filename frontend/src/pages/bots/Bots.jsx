import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import PairChart from "../../components/PairChart";
import { fetchBots, fetchActive, startBotRemote, stopBotRemote } from '../../services/api';

const ALL_BOTS = [
  { 
    id: 1, 
    name: "Scalper", 
    pair: "BTC/USDT", 
    category: "High Frequency",
    risk: "High",
    apr: 18.5,
    description: "Short time-frame trades that capture small price moves across tight spreads. High frequency, low-latency approach ideal for liquid pairs." 
  },
  { 
    id: 2, 
    name: "Mean Reverter", 
    pair: "ETH/USDT", 
    category: "Range Trading",
    risk: "Medium",
    apr: 12.3,
    description: "Detects temporary price deviations and executes counter-trend trades to profit from reversion to average. Works best in range-bound markets." 
  },
  { 
    id: 3, 
    name: "Trend Follower", 
    pair: "SOL/USDT", 
    category: "Trend Following",
    risk: "Medium",
    apr: 15.7,
    description: "Follows medium-to-longer trends, adding to positions as momentum continues and exiting on trend weakness. Designed to capture big market moves." 
  },
  { 
    id: 4, 
    name: "Grid Trader", 
    pair: "ADA/USDT", 
    category: "Range Trading",
    risk: "Low",
    apr: 9.8,
    description: "Places buy/sell orders in a price grid to profit from oscillations. Excellent for volatile but mean-reverting pairs." 
  },
  { 
    id: 5, 
    name: "Arbitrage", 
    pair: "BNB/USDT", 
    category: "Arbitrage",
    risk: "Low",
    apr: 6.2,
    description: "Scans multiple venues for price differences and executes near-instant trades to lock in risk-free spreads. Requires fast execution and low fees." 
  },
  { 
    id: 6, 
    name: "Market Maker", 
    pair: "XRP/USDT", 
    category: "Market Making",
    risk: "Medium",
    apr: 11.4,
    description: "Provides liquidity by placing passive bids and asks around mid-price, earning spreads while managing inventory risk." 
  },
  { 
    id: 7, 
    name: "Dollar Cost Averager", 
    pair: "DOT/USDT", 
    category: "Investment",
    risk: "Low",
    apr: 7.6,
    description: "Systematically invests fixed amounts over time to reduce entry timing risk and build positions steadily using market averages." 
  },
  { 
    id: 8, 
    name: "Momentum", 
    pair: "LTC/USDT", 
    category: "Momentum",
    risk: "Medium",
    apr: 14.2,
    description: "Enters positions when momentum indicators align and exits on momentum breakdowns. A balance between trend-following and quick reactions." 
  },
  { 
    id: 9, 
    name: "Options Hedger", 
    pair: "BTC-PERP", 
    category: "Hedging",
    risk: "Low",
    apr: 8.9,
    description: "Uses options or perp instruments to hedge directional exposure, capturing premium while limiting downside risk in volatile markets." 
  }
];

function loadActiveBots() {
  try {
    return JSON.parse(localStorage.getItem('activeBots') || '[]');
  } catch (e) {
    return [];
  }
}

function saveActiveBots(list) {
  localStorage.setItem('activeBots', JSON.stringify(list));
}

export default function Bots() {
  const [bots, setBots] = useState(ALL_BOTS);
  const [activeBots, setActiveBots] = useState(loadActiveBots());
  const [settings, setSettings] = useState({ size: 0.1, stopLoss: 1.5, takeProfit: 3 });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Get unique categories and risk levels
  const categories = ['All', ...new Set(ALL_BOTS.map(bot => bot.category))];
  const riskLevels = ['All', ...new Set(ALL_BOTS.map(bot => bot.risk))];

  // Filter bots based on selected filters
  const filteredBots = bots.filter(bot => {
    const matchesCategory = selectedCategory === 'All' || bot.category === selectedCategory;
    const matchesRisk = selectedRisk === 'All' || bot.risk === selectedRisk;
    const matchesSearch = bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bot.pair.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bot.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesRisk && matchesSearch;
  });

  // Get risk color
  const getRiskColor = (risk) => {
    switch(risk) {
      case 'Low': return '#4ade80';
      case 'Medium': return '#fbbf24';
      case 'High': return '#f87171';
      default: return '#9aa1aa';
    }
  };

  useEffect(() => {
    saveActiveBots(activeBots);
  }, [activeBots]);

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      try{
        const remoteBots = await fetchBots();
        if (mounted && remoteBots && remoteBots.length) setBots(remoteBots);
      }catch(e){ }
      try{ const act = await fetchActive(); if (mounted && act) setActiveBots(act); }catch(e){}
    })();
    return ()=>{ mounted = false };
  },[]);

  function startBot(bot) {
    if (activeBots.find(b => b.id === bot.id)) return;
    // try remote start
    startBotRemote(bot.id, { investment: 0, grids: 20 }).then(res=>{
      setActiveBots(prev=>[...prev, res]);
    }).catch(()=>{
      const nb = [...activeBots, { ...bot, startedAt: Date.now(), pnl: 0 }];
      setActiveBots(nb);
    });
  }

  function stopBot(bot) {
    stopBotRemote(bot.id).then(()=>{
      setActiveBots(activeBots.filter(b => b.id !== bot.id));
    }).catch(()=>{
      setActiveBots(activeBots.filter(b => b.id !== bot.id));
    });
  }

  return (
    <div style={{ padding: '20px', color: '#fff', minHeight: '100vh' }}>
      
      {/* Header Section */}
      <div className="glass-panel" style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '16px', background: 'linear-gradient(135deg, #5da9ff, #2b7cff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Trading Bots
        </h1>
        <p style={{ fontSize: '18px', color: '#cfd3d8', maxWidth: '800px', margin: '0 auto' }}>
          Choose from our sophisticated trading algorithms or create your own custom strategy
        </p>
      </div>

      {/* Filters Section */}
      <div className="glass-panel" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '20px', alignItems: 'center' }}>
          
          {/* Category Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#9aa1aa', fontSize: '14px', fontWeight: '600' }}>
              Category
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    padding: '8px 16px',
                    border: selectedCategory === category ? '1px solid #5da9ff' : '1px solid rgba(255,255,255,0.1)',
                    background: selectedCategory === category ? 'rgba(93,169,255,0.2)' : 'rgba(255,255,255,0.05)',
                    color: selectedCategory === category ? '#5da9ff' : '#cfd3d8',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Risk Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#9aa1aa', fontSize: '14px', fontWeight: '600' }}>
              Risk Level
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {riskLevels.map(risk => (
                <button
                  key={risk}
                  onClick={() => setSelectedRisk(risk)}
                  style={{
                    padding: '8px 16px',
                    border: selectedRisk === risk ? '1px solid #5da9ff' : '1px solid rgba(255,255,255,0.1)',
                    background: selectedRisk === risk ? 'rgba(93,169,255,0.2)' : 'rgba(255,255,255,0.05)',
                    color: selectedRisk === risk ? '#5da9ff' : '#cfd3d8',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {risk}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#9aa1aa', fontSize: '14px', fontWeight: '600' }}>
              Search Bots
            </label>
            <input
              type="text"
              placeholder="Search by name, pair, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
            />
          </div>
        </div>
      </div>

      {/* Active Bots Summary */}
      {activeBots.length > 0 && (
        <div className="glass-panel" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#5da9ff' }}>
            🚀 Active Bots ({activeBots.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {activeBots.map(b => (
              <div key={b.id} className="glass-panel" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: 'rgba(93,169,255,0.1)',
                border: '1px solid rgba(93,169,255,0.2)'
              }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '16px' }}>{b.name}</div>
                  <div style={{ color: '#9aa1aa', fontSize: '13px' }}>{b.pair}</div>
                  <div style={{ color: '#9aa1aa', fontSize: '12px' }}>
                    Started {new Date(b.startedAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontWeight: 800, 
                    fontSize: '18px',
                    color: b.pnl >= 0 ? '#4ade80' : '#f87171'
                  }}>
                    {b.pnl.toFixed(2)}%
                  </div>
                  <button 
                    className="cta-btn" 
                    style={{ marginTop: '8px', padding: '6px 12px', fontSize: '12px' }} 
                    onClick={() => stopBot(b)}
                  >
                    Stop
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bots Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 350px))', justifyContent: 'center', gap: '20px' }}>
        {filteredBots.map(b => (
          <div
            key={b.id}
            className="glass-panel"
            onClick={() => navigate(`/bots/${b.id}`)}
            style={{
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: 'rgba(255,255,255,0.05)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 260
            }}
          >
            {/* Bot Header */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>{b.name}</h3>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '12px', 
                  fontWeight: 600,
                  background: `${getRiskColor(b.risk)}20`,
                  color: getRiskColor(b.risk),
                  border: `1px solid ${getRiskColor(b.risk)}40`
                }}>
                  {b.risk}
                </span>
              </div>
              <div style={{ color: '#5da9ff', fontSize: '14px', marginBottom: '4px' }}>{b.pair}</div>
              <div style={{ color: '#9aa1aa', fontSize: '12px' }}>{b.category}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '12px', 
                  fontWeight: 600,
                  background: 'rgba(74, 222, 128, 0.15)',
                  color: '#4ade80',
                  border: '1px solid rgba(74, 222, 128, 0.3)'
                }}>
                  APR: {b.apr}%
                </span>
              </div>
            </div>

            {/* Bot Description */}
            <p style={{ 
              color: '#cfd3d8', 
              fontSize: '14px', 
              lineHeight: 1.5, 
              marginBottom: '16px',
              minHeight: '60px'
            }}>
              {b.description}
            </p>

            {/* Bot Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
              <button
                className="cta-btn"
                style={{ flex: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/bots/${b.id}`);
                }}
              >
                Create Bot
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredBots.length === 0 && (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', color: '#9aa1aa', marginBottom: '16px' }}>
            No bots found matching your criteria
          </div>
          <button 
            className="cta-btn"
            onClick={() => {
              setSelectedCategory('All');
              setSelectedRisk('All');
              setSearchTerm('');
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

    </div>
  );
}

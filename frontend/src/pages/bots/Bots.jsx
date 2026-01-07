import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import PairChart from "../../components/PairChart";
import BotModal from "../../components/BotModal";
import { fetchBots, fetchActive, startBotRemote, stopBotRemote } from '../../services/api';

const ALL_BOTS = [
  { id: 1, name: "Scalper", pair: "BTC/USDT", description: "Short time-frame trades that capture small price moves across tight spreads. High frequency, low-latency approach ideal for liquid pairs." },
  { id: 2, name: "Mean Reverter", pair: "ETH/USDT", description: "Detects temporary price deviations and executes counter-trend trades to profit from reversion to average. Works best in range-bound markets." },
  { id: 3, name: "Trend Follower", pair: "SOL/USDT", description: "Follows medium-to-longer trends, adding to positions as momentum continues and exiting on trend weakness. Designed to capture big market moves." },
  { id: 4, name: "Grid Trader", pair: "ADA/USDT", description: "Places buy/sell orders in a price grid to profit from oscillations. Excellent for volatile but mean-reverting pairs." },
  { id: 5, name: "Arbitrage", pair: "BNB/USDT", description: "Scans multiple venues for price differences and executes near-instant trades to lock in risk-free spreads. Requires fast execution and low fees." },
  { id: 6, name: "Market Maker", pair: "XRP/USDT", description: "Provides liquidity by placing passive bids and asks around mid-price, earning spreads while managing inventory risk." },
  { id: 7, name: "Dollar Cost Averager", pair: "DOT/USDT", description: "Systematically invests fixed amounts over time to reduce entry timing risk and build positions steadily using market averages." },
  { id: 8, name: "Momentum", pair: "LTC/USDT", description: "Enters positions when momentum indicators align and exits on momentum breakdowns. A balance between trend-following and quick reactions." },
  { id: 9, name: "Options Hedger", pair: "BTC-PERP", description: "Uses options or perp instruments to hedge directional exposure, capturing premium while limiting downside risk in volatile markets." }
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
  const [selected, setSelected] = useState(ALL_BOTS[0]);
  const [bots, setBots] = useState(ALL_BOTS);
  const [activeBots, setActiveBots] = useState(loadActiveBots());
  const [settings, setSettings] = useState({ size: 0.1, stopLoss: 1.5, takeProfit: 3 });
  const [modalBot, setModalBot] = useState(null);
  const navigate = useNavigate();

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
    <div style={{ padding: 20, color: '#fff', display: 'grid', gridTemplateColumns: '1fr 520px', gap: 18 }}>
      {/* LEFT: Chart for selected pair */}
      <div>
        <h2>{selected.name} — {selected.pair}</h2>
        <div className="card-box" style={{ height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#9aa1aa' }}>Interactive chart placeholder for {selected.pair}</div>
        </div>

        <section style={{ marginTop: 18 }}>
          <h3>Currently Running Bots</h3>
          {activeBots.length === 0 ? (
            <div style={{ color: '#9aa1aa', marginTop: 10 }}>No bots are running — start one from the center panel.</div>
          ) : (
            <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
              {activeBots.map(b => (
                <div key={b.id} className="card-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{b.name} <span style={{ color: '#9aa1aa', fontWeight: 600 }}>({b.pair})</span></div>
                    <div style={{ color: '#9aa1aa', fontSize: 13 }}>Started {new Date(b.startedAt).toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 18 }}>{b.pnl.toFixed(2)}%</div>
                    <button className="cta-btn" style={{ marginTop: 8 }} onClick={() => stopBot(b)}>Stop</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* RIGHT: center panel + settings */}
      <div>
        <h2 style={{ marginTop: 0 }}>Available Bots</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {bots.map(b => (
            <div key={b.id} className="card-box" style={{ padding: 14, cursor: 'pointer', minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: selected.id === b.id ? '1px solid rgba(93,169,255,0.4)' : undefined }} onClick={() => navigate(`/bots/${b.id}`)}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>{b.name}</div>
                <div style={{ color: '#9aa1aa', fontSize: 13, marginBottom: 8 }}>{b.pair}</div>
                <div style={{ color: '#cfd3d8', fontSize: 13, lineHeight: 1.3, maxHeight: 40, overflow: 'hidden' }}>{b.description}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                {activeBots.find(x => x.id === b.id) ? (
                  <button className="cta-btn" onClick={(e) => { e.stopPropagation(); stopBot(b); }}>Stop</button>
                ) : (
                  <>
                    <button className="cta-btn" onClick={(e) => { e.stopPropagation(); startBot(b); }}>Start</button>
                    <button style={{ marginLeft: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: '#cfd3d8', padding: '8px 10px', borderRadius: 8 }} onClick={(e) => { e.stopPropagation(); setModalBot(b); }}>Details</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18 }} className="card-box">
          <h3 style={{ marginTop: 0 }}>Settings for {selected.name}</h3>
          <div style={{ color: '#cfd3d8', marginTop: 8 }}>{selected.description}</div>
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            <label style={{ color: '#9aa1aa' }}>Size (BTC/ETH fraction)</label>
            <input type="range" min="0.01" max="1" step="0.01" value={settings.size} onChange={(e) => setSettings({ ...settings, size: Number(e.target.value) })} />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9aa1aa' }}><span>Stop Loss</span><span>{settings.stopLoss}%</span></div>
            <input type="range" min="0.5" max="10" step="0.1" value={settings.stopLoss} onChange={(e) => setSettings({ ...settings, stopLoss: Number(e.target.value) })} />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9aa1aa' }}><span>Take Profit</span><span>{settings.takeProfit}%</span></div>
            <input type="range" min="0.5" max="20" step="0.1" value={settings.takeProfit} onChange={(e) => setSettings({ ...settings, takeProfit: Number(e.target.value) })} />

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="cta-btn" onClick={() => startBot(selected)}>Start {selected.name}</button>
              <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: '#cfd3d8', padding: '8px 12px', borderRadius: 8 }} onClick={() => alert('Saved locally')}>Save</button>
            </div>
          </div>
        </div>
      </div>
      <BotModal bot={modalBot} onClose={() => setModalBot(null)} />
    </div>
  );
}

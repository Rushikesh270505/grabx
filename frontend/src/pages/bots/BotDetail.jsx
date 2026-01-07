import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import BotModal from '../../components/BotModal';
import PairChart from '../../components/PairChart';
import usePrice from '../../hooks/usePrice';
import { fetchActive, startBotRemote, stopBotRemote } from '../../services/api';

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

export default function BotDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const botId = Number(id);
  const bot = ALL_BOTS.find(b => b.id === botId);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeBots, setActiveBots] = useState([]);
  const [investment, setInvestment] = useState('100');
  const [grids, setGrids] = useState(20);
  const [lower, setLower] = useState('');
  const [upper, setUpper] = useState('');
  const [starting, setStarting] = useState(false);
  const livePrice = usePrice(bot ? bot.pair : null);

  useEffect(() => {
    let mounted = true;
    (async ()=>{
      try{ const remoteActive = await fetchActive(); if (mounted && remoteActive) setActiveBots(remoteActive); }
      catch(e){ try { setActiveBots(JSON.parse(localStorage.getItem('activeBots') || '[]')); } catch(_){ setActiveBots([]); } }
    })();
    return ()=> mounted = false;
  }, []);

  useEffect(()=>{
    if (!livePrice) return;
    // prefill lower/upper if empty
    if (!lower) setLower((livePrice * 0.98).toFixed(2));
    if (!upper) setUpper((livePrice * 1.02).toFixed(2));
  }, [livePrice]);

  function persistActiveBots(list){
    localStorage.setItem('activeBots', JSON.stringify(list));
    setActiveBots(list);
  }

  function startBotLocal(bot){
    if (activeBots.find(b=>b.id===bot.id)) return;
    // basic validation
    const low = Number(lower);
    const up = Number(upper);
    const invest = Number(investment);
    if (!invest || invest <= 0) { alert('Please enter an investment amount > 0'); return; }
    if (!low || !up || low >= up) { alert('Please set a valid price range where Lower < Upper'); return; }

    if (!confirm(`Start ${bot.name} on ${bot.pair} with ${grids} grids, investment ${invest}?`)) return;
    setStarting(true);
    // call backend if available
    startBotRemote(bot.id, { investment: invest, grids, lower: low, upper: up }).then(res=>{
      persistActiveBots([...activeBots, res]);
    }).catch(()=>{
      const nb = [...activeBots, { ...bot, startedAt: Date.now(), pnl: 0, investment: invest, grids, lower: low, upper: up }];
      persistActiveBots(nb);
    }).finally(()=> setStarting(false));
  }

  function stopBotLocal(bot){
    stopBotRemote(bot.id).then(()=>{
      const nb = activeBots.filter(b=>b.id!==bot.id);
      persistActiveBots(nb);
    }).catch(()=>{
      const nb = activeBots.filter(b=>b.id!==bot.id);
      persistActiveBots(nb);
    });
  }

  if (!bot) return (
    <div style={{ padding: 20, color: '#fff' }}>
      <h2>Bot not found</h2>
      <p style={{ color: '#9aa1aa' }}>We couldn't find that bot. <Link to="/bots">Back to bots</Link></p>
    </div>
  );

  const isRunning = !!activeBots.find(b=>b.id===bot.id);

  return (
    <div style={{ padding: 20, color: '#fff' }}>
      <button style={{ marginBottom: 12 }} onClick={() => navigate(-1)}>← Back</button>

  <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18 }}>
        {/* LEFT: large chart and running bots */}
        <div>
          <h2 style={{ margin: 0 }}>{bot.name} <span style={{ color: '#9aa1aa', fontSize: 14 }}>— {bot.pair}</span></h2>
          <div className="card-box" style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#9aa1aa' }}>Current price: <strong>{livePrice ? livePrice.toFixed(2) : '--'}</strong></div>
              <div style={{ color: '#9aa1aa', fontSize: 13 }}>{bot.pair}</div>
            </div>
            <div style={{ marginTop: 12 }}>
              <PairChart liveSymbol={bot.pair} />
            </div>
          </div>

          <section style={{ marginTop: 18 }}>
            <h3>Currently Running Bots</h3>
            {activeBots.length === 0 ? (
              <div style={{ color: '#9aa1aa', marginTop: 10 }}>No bots are running — start one from the right panel.</div>
            ) : (
              <div style={{ display: 'grid', gap: 12, marginTop: 10 }}>
                {activeBots.map(b => (
                  <div key={b.id} className="running-bot-row card-box">
                    <div>
                      <div style={{ fontWeight: 800 }}>{b.name} <span style={{ color: '#9aa1aa', fontWeight: 600 }}>({b.pair})</span></div>
                      <div style={{ color: '#9aa1aa', fontSize: 13 }}>Started {new Date(b.startedAt).toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>{(b.pnl || 0).toFixed(2)}%</div>
                      <button className="cta-btn" style={{ marginTop: 8 }} onClick={() => stopBotLocal(b)}>Stop</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT: compact bot cards + settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <h3 style={{ marginTop: 0 }}>Available Bots</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
              {ALL_BOTS.map(b => (
                <div key={b.id} className="small-bot-card card-box" onClick={() => navigate(`/bots/${b.id}`)}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{b.name}</div>
                    <div style={{ color: '#9aa1aa', fontSize: 12 }}>{b.pair}</div>
                    <div style={{ color: '#cfd3d8', fontSize: 12, marginTop: 6, maxHeight: 40, overflow: 'hidden' }}>{b.description}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {activeBots.find(x => x.id === b.id) ? (
                      <button className="cta-btn" onClick={(e) => { e.stopPropagation(); stopBotLocal(b); }}>Stop</button>
                    ) : (
                      <>
                        <button className="cta-btn" onClick={(e) => { e.stopPropagation(); startBotLocal(b); }}>Start</button>
                        <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: '#cfd3d8', padding: '6px 8px', borderRadius: 8 }} onClick={(e) => { e.stopPropagation(); setModalOpen(b); }}>Details</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-box">
            <h3 style={{ marginTop: 0 }}>Settings for {bot.name}</h3>
            <div style={{ color: '#cfd3d8', marginTop: 8 }}>{bot.description}</div>
            <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
              <label style={{ color: '#9aa1aa' }}>Price Range</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={lower} onChange={(e)=>setLower(e.target.value)} placeholder="Lower" style={{ flex: 1 }} />
                <input value={upper} onChange={(e)=>setUpper(e.target.value)} placeholder="Upper" style={{ flex: 1 }} />
              </div>

              <div>
                <label style={{ color: '#9aa1aa' }}>Number of grids: <strong style={{ color: '#fff' }}>{grids}</strong></label>
                <input type="range" min={2} max={200} value={grids} onChange={(e)=>setGrids(Number(e.target.value))} />
              </div>

              <div>
                <label style={{ color: '#9aa1aa' }}>Investment (USDT)</label>
                <input value={investment} onChange={(e)=>setInvestment(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {isRunning ? (
                  <button className="cta-btn" onClick={() => stopBotLocal(bot)}>Stop</button>
                ) : (
                  <button className="cta-btn" disabled={starting} onClick={() => startBotLocal(bot)}>{starting ? 'Starting…' : 'Start'}</button>
                )}

                <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: '#cfd3d8', padding: '8px 12px', borderRadius: 8 }} onClick={() => setModalOpen(true)}>Register / Details</button>
              </div>
              { !starting && isRunning && <div style={{ color: '#7fe08a', marginTop: 6 }}>Bot is running</div> }
            </div>
          </div>
        </div>
      </div>

      <BotModal bot={modalOpen ? bot : null} onClose={() => setModalOpen(false)} />
    </div>
  );
}

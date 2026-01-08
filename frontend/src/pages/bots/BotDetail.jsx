import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PairChart from "../../components/PairChart";
import BotExplanation from "../../components/BotExplanation";
import CoinSelector from "../../components/CoinSelector";
import BotSettings from "../../components/BotSettings";
import { fetchActive, startBotRemote, stopBotRemote } from "../../services/api";
import { runBacktest } from "../../utils/backtest";
import priceStream from "../../services/priceStream";

const ALL_BOTS = [
  { id: 1, name: "Scalper", pair: "BTC/USDT", description: "Short time-frame trades that capture small price moves across tight spreads." },
  { id: 2, name: "Mean Reverter", pair: "ETH/USDT", description: "Trades reversions back to average in range-bound markets." },
  { id: 3, name: "Trend Follower", pair: "SOL/USDT", description: "Follows momentum and trend continuation." },
  { id: 4, name: "Grid Trader", pair: "ADA/USDT", description: "Places a grid of buy/sell orders to profit from oscillations." },
  { id: 5, name: "Arbitrage", pair: "BNB/USDT", description: "Captures price differences across venues." },
  { id: 6, name: "Market Maker", pair: "XRP/USDT", description: "Quotes bids/asks to earn spread while managing inventory." },
  { id: 7, name: "Dollar Cost Averager", pair: "DOT/USDT", description: "Buys periodically to average entry." },
  { id: 8, name: "Momentum", pair: "LTC/USDT", description: "Enters on momentum confirmation and exits on weakness." },
  { id: 9, name: "Options Hedger", pair: "BTC-PERP", description: "Hedges exposure using perp/options style logic." }
];

export default function BotDetail() {
  const { id } = useParams();
  const botId = Number(id);
  const bot = useMemo(() => ALL_BOTS.find((b) => b.id === botId), [botId]);

  const [activeBots, setActiveBots] = useState([]);
  const [starting, setStarting] = useState(false);
  const [selectedPair, setSelectedPair] = useState(null);
  const [botSettings, setBotSettings] = useState(null);
  const [buyBuffer, setBuyBuffer] = useState(0.15);
  const [sellBuffer, setSellBuffer] = useState(0.15);
  const [initialBotSettings, setInitialBotSettings] = useState(null);
  const [backtestResult, setBacktestResult] = useState(null);
  const [backtesting, setBacktesting] = useState(false);

  useEffect(() => {
    try {
      priceStream.setBase("wss://fstream.binance.com");
    } catch {
      // ignore
    }
  }, []);

  function normalizePairToSymbol(p) {
    if (!p) return null;
    const raw = String(p).trim();
    if (!raw) return null;
    if (raw.includes("/")) return raw.replace("/", "");
    if (raw.toUpperCase().endsWith("-PERP")) return `${raw.split("-")[0]}USDT`;
    return raw.replace(/[^A-Z0-9]/gi, "");
  }

  const configKey = bot ? `botConfig:${bot.id}` : null;

  useEffect(() => {
    if (!bot || !configKey) return;
    let cfg = null;
    try {
      cfg = JSON.parse(localStorage.getItem(configKey) || "null");
    } catch {
      cfg = null;
    }

    const pairFromCfg = cfg?.pair || null;
    const defaultPair = normalizePairToSymbol(bot.pair) || "BTCUSDT";
    setSelectedPair(pairFromCfg || defaultPair);
    setBuyBuffer(typeof cfg?.buyBuffer === "number" ? cfg.buyBuffer : 0.15);
    setSellBuffer(typeof cfg?.sellBuffer === "number" ? cfg.sellBuffer : 0.15);
    setInitialBotSettings(cfg?.settings && typeof cfg.settings === "object" ? cfg.settings : null);
  }, [botId, configKey]);

  useEffect(() => {
    if (!bot || !configKey) return;
    const next = {
      pair: selectedPair,
      buyBuffer,
      sellBuffer,
      settings: botSettings
    };
    try {
      localStorage.setItem(configKey, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, [bot, configKey, selectedPair, buyBuffer, sellBuffer, botSettings]);

  // Run backtest when settings change
  useEffect(() => {
    if (!bot || !botSettings || !selectedPair) return;
    
    const runTest = async () => {
      setBacktesting(true);
      try {
        const result = await runBacktest(
          { 
            botType: bot.name,
            ...botSettings,
            buyBuffer,
            sellBuffer
          },
          selectedPair,
          '1h',
          30
        );
        setBacktestResult(result);
      } catch (error) {
        console.error('Backtest failed:', error);
        setBacktestResult({ error: 'Backtest failed' });
      } finally {
        setBacktesting(false);
      }
    };
    
    const timeoutId = setTimeout(runTest, 1000); // Debounce
    return () => clearTimeout(timeoutId);
  }, [bot, botSettings, selectedPair, buyBuffer, sellBuffer]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const act = await fetchActive();
        if (mounted && Array.isArray(act)) setActiveBots(act);
      } catch {
        try {
          setActiveBots(JSON.parse(localStorage.getItem("activeBots") || "[]"));
        } catch {
          setActiveBots([]);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const isActive = bot ? activeBots.some((b) => b.id === bot.id) : false;

  function persist(list) {
    try {
      localStorage.setItem("activeBots", JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  async function start() {
    if (!bot || starting || isActive) return;
    
    // Validate minimum investment
    if (botSettings && botSettings.investment && botSettings.minInvestment) {
      if (botSettings.investment < botSettings.minInvestment) {
        alert(`Minimum investment required: ${botSettings.minInvestment} ${botSettings.investmentType || 'USDT'}`);
        return;
      }
    }
    
    setStarting(true);
    try {
      const payload = {
        pair: selectedPair,
        buyBuffer,
        sellBuffer,
        ...(botSettings || {})
      };
      const res = await startBotRemote(bot.id, payload);
      setActiveBots((prev) => {
        const next = [...prev, res];
        persist(next);
        return next;
      });
    } catch {
      setActiveBots((prev) => {
        const next = [
          ...prev,
          {
            ...bot,
            startedAt: Date.now(),
            pnl: 0,
            pair: selectedPair || bot.pair,
            config: { buyBuffer, sellBuffer, ...(botSettings || {}) }
          }
        ];
        persist(next);
        return next;
      });
    } finally {
      setStarting(false);
    }
  }

  async function stop() {
    if (!bot || !isActive) return;
    try {
      await stopBotRemote(bot.id);
    } catch {
      // ignore
    }

    setActiveBots((prev) => {
      const next = prev.filter((b) => b.id !== bot.id);
      persist(next);
      return next;
    });
  }

  if (!bot) {
    return (
      <div style={{ padding: 24, color: "#fff" }}>
        <div className="glass-panel" style={{ textAlign: "center" }}>
          <h2 style={{ marginTop: 0 }}>Bot not found</h2>
          <Link className="cta-btn" to="/bots">
            Back to Bots
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, color: "#fff" }}>
      <div style={{ marginBottom: 16 }}>
        <Link to="/bots" style={{ color: "#5da9ff", textDecoration: "none" }}>
          Back to Bots
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.25fr) minmax(0, 0.9fr)", gap: 18, alignItems: "start" }}>
        <div className="glass-panel" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ marginTop: 0, marginBottom: 6 }}>{bot.name}</h1>
              <div style={{ color: "#9aa1aa" }}>{selectedPair || bot.pair}</div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {isActive ? (
                <button className="cta-btn" style={{ background: "#f87171", color: "#fff" }} onClick={stop}>
                  Stop
                </button>
              ) : (
                <button className="cta-btn" onClick={start} disabled={starting}>
                  {starting ? "Creating..." : "Create"}
                </button>
              )}
            </div>
          </div>

          <div style={{ color: "#cfd3d8", marginBottom: 14 }}>{bot.description}</div>
          <PairChart pair={selectedPair || bot.pair} liveSymbol={(selectedPair || "").toLowerCase()} />
          <div style={{ marginTop: 16 }}>
            <BotExplanation botName={bot.name} isActive={isActive} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CoinSelector selectedPair={selectedPair} onPairChange={setSelectedPair} disabled={false} />

          <div className="glass-panel" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 20, marginBottom: 18, color: "#5da9ff" }}>Buffers</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
              <div>
                <label style={{ display: "block", marginBottom: 8, color: "#cfd3d8", fontSize: 14 }}>
                  Buy Buffer (%)
                </label>
                <input
                  type="number"
                  value={buyBuffer}
                  onChange={(e) => setBuyBuffer(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "14px"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8, color: "#cfd3d8", fontSize: 14 }}>
                  Sell Buffer (%)
                </label>
                <input
                  type="number"
                  value={sellBuffer}
                  onChange={(e) => setSellBuffer(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "14px"
                  }}
                />
              </div>
            </div>
          </div>

          <BotSettings
            botName={bot.name}
            pair={selectedPair}
            initialSettings={initialBotSettings}
            onSettingsChange={setBotSettings}
          />

          {botSettings && botSettings.investment && botSettings.minInvestment && (
            <div className="glass-panel" style={{ padding: 16, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: '#9aa1aa' }}>Investment Check</span>
                <span style={{ color: botSettings.investment >= botSettings.minInvestment ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                  {botSettings.investment} {botSettings.investmentType || 'USDT'}
                </span>
              </div>
              <div style={{ color: '#9aa1aa', fontSize: 12 }}>
                Minimum Required: {botSettings.minInvestment} {botSettings.investmentType || 'USDT'}
              </div>
              {botSettings.investment < botSettings.minInvestment && (
                <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>
                  ⚠️ Increase investment to start bot
                </div>
              )}
            </div>
          )}

          {/* Backtest Results */}
          {backtestResult && !backtestResult.error && (
            <div className="glass-panel" style={{ padding: 16, fontSize: 13 }}>
              <h4 style={{ marginTop: 0, marginBottom: 12, color: '#5da9ff', fontSize: 16 }}>📊 Backtest Results (30 days)</h4>
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9aa1aa' }}>APR (Annualized)</span>
                  <span style={{ color: backtestResult.apr >= 0 ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                    {backtestResult.apr.toFixed(2)}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9aa1aa' }}>Total Return</span>
                  <span style={{ color: backtestResult.totalReturnPercent >= 0 ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                    {backtestResult.totalReturnPercent.toFixed(2)}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9aa1aa' }}>Max Drawdown</span>
                  <span style={{ color: '#f87171', fontWeight: 600 }}>
                    {backtestResult.maxDrawdown.toFixed(2)}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9aa1aa' }}>Win Rate</span>
                  <span style={{ color: '#5da9ff', fontWeight: 600 }}>
                    {backtestResult.winRate.toFixed(1)}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9aa1aa' }}>Total Trades</span>
                  <span style={{ color: '#cfd3d8', fontWeight: 600 }}>
                    {backtestResult.trades}
                  </span>
                </div>
              </div>
            </div>
          )}

          {backtesting && (
            <div className="glass-panel" style={{ padding: 16, fontSize: 13, textAlign: 'center' }}>
              <div style={{ color: '#5da9ff' }}>🔄 Running backtest...</div>
            </div>
          )}

          {backtestResult?.error && (
            <div className="glass-panel" style={{ padding: 16, fontSize: 13 }}>
              <div style={{ color: '#f87171' }}>⚠️ {backtestResult.error}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

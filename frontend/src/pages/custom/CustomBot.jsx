import React, { useState, useEffect, useRef } from 'react';
import PairChart from '../../components/PairChart';

// Very small DSL parser for demo purposes
function parseRules(code) {
  // lines like: buy if price > 30000
  const lines = code.split('\n').map(l => l.trim()).filter(Boolean);
  const rules = [];
  for (const line of lines) {
    const m = line.match(/^(buy|sell)\s+if\s+price\s*([><=]+)\s*([0-9.]+)/i);
    if (m) {
      rules.push({ side: m[1].toLowerCase(), op: m[2], value: Number(m[3]) });
    }
  }
  return rules;
}

export default function CustomBot() {
  const [code, setCode] = useState('buy if price > 100\nsell if price < 98');
  const [rules, setRules] = useState(parseRules(code));
  const [events, setEvents] = useState([]); // {time, price, side}
  const [symbol, setSymbol] = useState('BTC/USDT');
  const priceRef = useRef(null);

  useEffect(() => {
    setRules(parseRules(code));
  }, [code]);

  // simple subscription to price via window event (PairChart pushes updates)
  useEffect(() => {
    function onTick(e) {
      if (!e.detail || !e.detail.price) return;
      const p = e.detail.price;
      priceRef.current = p;
      for (const r of rules) {
        let ok = false;
        if (r.op === '>') ok = p > r.value;
        if (r.op === '<') ok = p < r.value;
        if (r.op === '>=') ok = p >= r.value;
        if (r.op === '<=') ok = p <= r.value;
        if (ok) {
          const evObj = { time: Date.now(), price: p, side: r.side };
          setEvents(ev => [...ev.slice(-50), evObj]);
          // also emit a global signal so PairChart (or other components) can render markers
          try {
            window.dispatchEvent(new CustomEvent('custombot:signal', { detail: { ...evObj, pair: symbol } }));
          } catch (e) {}
        }
      }
    }
    window.addEventListener('custombot:tick', onTick);
    return () => window.removeEventListener('custombot:tick', onTick);
  }, [rules]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '520px 1fr', gap: 18, padding: 20, color: '#fff' }}>
      <div>
        <h2>Custom Python Bot (demo)</h2>
        <div style={{ marginBottom: 8, color: '#9aa1aa' }}>Enter simple rules (DSL): <code>buy if price &gt; 100</code></div>
        <textarea value={code} onChange={(e) => setCode(e.target.value)} style={{ width: '100%', height: 220, padding: 12, borderRadius: 8, background: '#0b1117', color: '#eaf4ff', border: '1px solid rgba(255,255,255,0.04)' }} />

        <div style={{ marginTop: 12 }}>
          <label style={{ color: '#9aa1aa' }}>Symbol</label>
          <input value={symbol} onChange={(e) => setSymbol(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 6, borderRadius: 6, border: '1px solid rgba(255,255,255,0.04)', background: '#071021', color: '#fff' }} />
        </div>

        <div style={{ marginTop: 12 }} className="card-box">
          <h3 style={{ marginTop: 0 }}>Recent Signals</h3>
          {events.length === 0 ? <div style={{ color: '#9aa1aa' }}>No signals yet — start streaming or wait for price to hit conditions.</div> : (
            <div style={{ display: 'grid', gap: 8 }}>
              {events.slice().reverse().map((ev, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>{ev.side.toUpperCase()}</div>
                  <div style={{ color: ev.side === 'buy' ? '#7ef0a2' : '#ffb3b3' }}>{ev.price}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 style={{ marginTop: 0 }}>{symbol} — Live visualization</h2>
        {/* PairChart will dispatch window events named 'custombot:tick' with price updates */}
        <PairChart pair={symbol} liveSymbol={symbol.replace('/','').toLowerCase()} />

        <div style={{ marginTop: 12 }} className="card-box">
          <h3 style={{ marginTop: 0 }}>Rule Preview</h3>
          <pre style={{ color: '#9aa1aa' }}>{JSON.stringify(rules, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}

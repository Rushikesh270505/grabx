import React, { useEffect, useMemo, useRef, useState } from 'react';
import usePrice from '../hooks/usePrice';

const TIMEFRAMES = [
  { key: '1m', label: '1m' },
  { key: '5m', label: '5m' },
  { key: '15m', label: '15m' },
  { key: '1h', label: '1h' },
  { key: '4h', label: '4h' },
  { key: '1d', label: '1D' }
];

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function formatPrice(p) {
  if (p == null || Number.isNaN(p)) return '-';
  if (p >= 1000) return p.toFixed(2);
  if (p >= 1) return p.toFixed(4);
  return p.toFixed(6);
}

// Canvas chart with Binance-like timeframe buttons and line/candles toggle.
export default function PairChart({ pair, liveSymbol }) {
  const canvasRef = useRef(null);
  const [timeframe, setTimeframe] = useState('1m');
  const [chartType, setChartType] = useState('line'); // 'line' | 'candles'
  const [klines, setKlines] = useState([]);
  const [klineLoading, setKlineLoading] = useState(false);

  const livePrice = usePrice(liveSymbol);

  const symbolForRest = useMemo(() => {
    if (!pair) return null;
    const raw = String(pair).trim();
    if (!raw) return null;
    if (raw.includes('/')) return raw.replace('/', '');
    return raw;
  }, [pair]);

  useEffect(() => {
    let mounted = true;
    if (!symbolForRest) {
      setKlines([]);
      return;
    }

    (async () => {
      setKlineLoading(true);
      try {
        const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${encodeURIComponent(symbolForRest)}&interval=${encodeURIComponent(timeframe)}&limit=200`;
        const res = await fetch(url);
        const json = await res.json();
        const parsed = Array.isArray(json)
          ? json.map(row => ({
              openTime: row[0],
              open: Number(row[1]),
              high: Number(row[2]),
              low: Number(row[3]),
              close: Number(row[4]),
              volume: Number(row[5])
            }))
          : [];
        if (mounted) setKlines(parsed.filter(k => Number.isFinite(k.close)));
      } catch (e) {
        if (mounted) setKlines([]);
      } finally {
        if (mounted) setKlineLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [symbolForRest, timeframe]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = null;
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const markers = [];
    function onSignal(e) {
      try {
        const d = e.detail;
        if (!d || !d.price) return;
        markers.push({ time: Date.now(), price: Number(d.price), side: d.side });
        if (markers.length > 200) markers.shift();
      } catch (err) {}
    }
    window.addEventListener('custombot:signal', onSignal);

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(6,12,22,0.14)';
      ctx.fillRect(0, 0, width, height);

      const padL = 12;
      const padR = 56;
      const padT = 10;
      const padB = 18;
      const plotW = Math.max(10, width - padL - padR);
      const plotH = Math.max(10, height - padT - padB);

      const data = klines && klines.length ? klines : [];
      let min = Infinity;
      let max = -Infinity;
      for (const k of data) {
        min = Math.min(min, k.low);
        max = Math.max(max, k.high);
      }
      if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
        min = (livePrice || 100) * 0.98;
        max = (livePrice || 100) * 1.02;
      }

      // grid
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = padT + (i / 4) * plotH;
        ctx.beginPath();
        ctx.moveTo(padL, y + 0.5);
        ctx.lineTo(padL + plotW, y + 0.5);
        ctx.stroke();
      }

      function yForPrice(p) {
        const t = (p - min) / (max - min);
        return padT + (1 - t) * plotH;
      }

      // y-axis labels
      ctx.fillStyle = 'rgba(205,216,232,0.6)';
      ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      for (let i = 0; i <= 4; i++) {
        const p = max - (i / 4) * (max - min);
        const y = padT + (i / 4) * plotH;
        ctx.fillText(formatPrice(p), padL + plotW + 6, y + 4);
      }

      if (data.length) {
        if (chartType === 'line') {
          ctx.beginPath();
          for (let i = 0; i < data.length; i++) {
            const x = padL + (i / Math.max(1, data.length - 1)) * plotW;
            const y = yForPrice(data[i].close);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.lineWidth = 2.1;
          ctx.strokeStyle = 'rgba(46,161,255,0.95)';
          ctx.stroke();

          // fill
          ctx.lineTo(padL + plotW, padT + plotH);
          ctx.lineTo(padL, padT + plotH);
          ctx.closePath();
          ctx.fillStyle = 'rgba(46,161,255,0.06)';
          ctx.fill();
        } else {
          // candles
          const candleW = clamp(plotW / data.length, 2, 10);
          for (let i = 0; i < data.length; i++) {
            const k = data[i];
            const x = padL + (i / data.length) * plotW;
            const openY = yForPrice(k.open);
            const closeY = yForPrice(k.close);
            const highY = yForPrice(k.high);
            const lowY = yForPrice(k.low);
            const up = k.close >= k.open;
            const color = up ? 'rgba(126,240,162,0.95)' : 'rgba(255,179,179,0.95)';
            const bodyTop = Math.min(openY, closeY);
            const bodyH = Math.max(1, Math.abs(closeY - openY));
            const cx = x + candleW * 0.5;

            // wick
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx, highY);
            ctx.lineTo(cx, lowY);
            ctx.stroke();

            // body
            ctx.fillStyle = color;
            ctx.fillRect(x, bodyTop, candleW, bodyH);
          }
        }

        // live price marker
        if (livePrice) {
          const y = yForPrice(livePrice);
          ctx.strokeStyle = 'rgba(93,169,255,0.35)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(padL, y + 0.5);
          ctx.lineTo(padL + plotW, y + 0.5);
          ctx.stroke();
        }

        // draw markers (approximate mapping by price only)
        for (let i = 0; i < markers.length; i++) {
          const m = markers[i];
          if (!Number.isFinite(m.price)) continue;
          if (m.price < min || m.price > max) continue;
          const x = padL + ((i % data.length) / Math.max(1, data.length - 1)) * plotW;
          const y = yForPrice(m.price);
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fillStyle = m.side === 'buy' ? 'rgba(126,240,162,0.95)' : 'rgba(255,179,179,0.95)';
          ctx.fill();
        }
      }

      // dispatch live tick for other parts
      if (livePrice) {
        try {
          window.dispatchEvent(new CustomEvent('custombot:tick', { detail: { price: livePrice, pair } }));
        } catch (e) {}
      }

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('custombot:signal', onSignal);
    };
  }, [pair, livePrice, klines, chartType]);

  const title = useMemo(() => {
    const parts = [pair || '-', timeframe, chartType === 'line' ? 'Line' : 'Bar'];
    return parts.join(' — ');
  }, [pair, timeframe, chartType]);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={{ color: '#9aa1aa' }}>
          {title}{livePrice ? ` — live ${formatPrice(livePrice)}` : ''}{klineLoading ? ' — loading…' : ''}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TIMEFRAMES.map(tf => (
              <button
                key={tf.key}
                className="cta-btn"
                onClick={() => setTimeframe(tf.key)}
                style={{
                  padding: '6px 10px',
                  fontSize: 12,
                  background: timeframe === tf.key ? 'rgba(93,169,255,0.25)' : 'transparent',
                  border: '1px solid rgba(93,169,255,0.25)',
                  color: '#cfe9ff'
                }}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className="cta-btn"
              onClick={() => setChartType('line')}
              style={{
                padding: '6px 10px',
                fontSize: 12,
                background: chartType === 'line' ? 'rgba(93,169,255,0.25)' : 'transparent',
                border: '1px solid rgba(93,169,255,0.25)',
                color: '#cfe9ff'
              }}
            >
              Line
            </button>
            <button
              className="cta-btn"
              onClick={() => setChartType('candles')}
              style={{
                padding: '6px 10px',
                fontSize: 12,
                background: chartType === 'candles' ? 'rgba(93,169,255,0.25)' : 'transparent',
                border: '1px solid rgba(93,169,255,0.25)',
                color: '#cfe9ff'
              }}
            >
              Bar
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ width: '100%', height: 420, padding: 14 }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', borderRadius: 12 }} />
      </div>
    </div>
  );
}

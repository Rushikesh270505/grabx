import React, { useEffect, useRef } from 'react';
import usePrice from '../hooks/usePrice';

// Lightweight in-memory line chart for a pair (no deps).
export default function PairChart({ pair, liveSymbol }) {
  const canvasRef = useRef(null);
  const livePrice = usePrice(liveSymbol);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf = null;
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

  // generate a short simulated price series
    const points = 160;
  const base = 100 + Math.random() * 40;
    const data = new Array(points).fill(0).map((_, i) => {
      const noise = (Math.sin(i / 5) + Math.random() * 0.8) * 0.6;
      return base + noise + i * (Math.random() - 0.45) * 0.2;
    });

    const markers = [];

    function onSignal(e) {
      try {
        const d = e.detail;
        if (!d || !d.price) return;
        // record marker for a few seconds
        markers.push({ time: Date.now(), price: d.price, side: d.side });
        // keep markers small
        if (markers.length > 200) markers.shift();
      } catch (err) {}
    }
    window.addEventListener('custombot:signal', onSignal);

    function draw(t) {
      // clear with subtle background
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(6,12,22,0.14)';
      ctx.fillRect(0, 0, width, height);

      // compute bounds
      const min = Math.min(...data);
      const max = Math.max(...data);

      // draw grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const y = (i / 4) * height;
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(width, y + 0.5);
        ctx.stroke();
      }

      // draw area line
      ctx.beginPath();
      for (let i = 0; i < data.length; i++) {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((data[i] - min) / (max - min)) * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = 'rgba(46,161,255,0.95)';
      ctx.stroke();

      // subtle fill
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fillStyle = 'rgba(46,161,255,0.06)';
      ctx.fill();

      // animate by shifting data slightly
      if (Math.random() > 0.5) {
        if (livePrice) {
          data.push(livePrice);
          // dispatch a DOM event so other parts (CustomBot) can listen for ticks
          try {
            window.dispatchEvent(new CustomEvent('custombot:tick', { detail: { price: livePrice, pair } }));
          } catch (e) {}
        } else {
          const last = data[data.length - 1] || base;
          data.push(last + (Math.random() - 0.5) * 0.6);
        }
        data.shift();
      }

      // draw markers
      for (let i = 0; i < markers.length; i++) {
        const m = markers[i];
        // position on chart (approximate by value)
        if (m.price < min || m.price > max) continue;
        const x = ((i % data.length) / (data.length - 1)) * width;
        const y = height - ((m.price - min) / (max - min)) * height;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = m.side === 'buy' ? 'rgba(126,240,162,0.95)' : 'rgba(255,179,179,0.95)';
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('custombot:signal', onSignal);
    };
  }, [pair, livePrice]);

  return (
    <div style={{ width: '100%', height: 420 }}>
  <div style={{ color: '#9aa1aa', marginBottom: 8 }}>{pair} — {livePrice ? `live ${livePrice}` : 'simulated live chart'}</div>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
    </div>
  );
}

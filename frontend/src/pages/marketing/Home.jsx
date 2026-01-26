import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const MOTIVATIONAL = [
  { text: "Let's earn more 💰", emoji: "" },
  { text: "Be bold. Take smart risks 🚀", emoji: "" },
  { text: "Safe money grows slow 🐢", emoji: "" },
  { text: "Discipline beats luck 🎯", emoji: "" },
  { text: "Make your capital work harder ⚙️", emoji: "" },
];

export default function Home() {
  const [current, setCurrent] = useState(0);
  const revealRefs = useRef([]);
  const statsRef = useRef(null);
  const statsDone = useRef(false);
  const touchStartX = useRef(null);

  /* ---------------- hex canvas ---------------- */
  useEffect(() => {
    if (!document.querySelector('script[src="/hexFlow.js"]')) {
      const s = document.createElement("script");
      s.src = "/hexFlow.js";
      s.async = true;
      document.head.appendChild(s);
    }

    const resize = () => {
      const c = document.getElementById("hexagonCanvas");
      if (!c) return;
      const dpr = window.devicePixelRatio || 1;
      c.width = innerWidth * dpr;
      c.height = innerHeight * dpr;
      c.style.width = "100vw";
      c.style.height = "100vh";
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ---------------- reveal ---------------- */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.2 }
    );
    revealRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  /* ---------------- stats ---------------- */
  useEffect(() => {
    if (!statsRef.current) return;

    const io = new IntersectionObserver(
      ([e], obs) => {
        if (!e.isIntersecting || statsDone.current) return;
        statsDone.current = true;

        statsRef.current.querySelectorAll("[data-to]").forEach((el) => {
          const to = +el.dataset.to;
          const start = performance.now();
          const dur = 1400;

          const tick = (t) => {
            const p = Math.min(1, (t - start) / dur);
            el.textContent =
              to % 1 ? (to * p).toFixed(1) : Math.round(to * p);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });

        obs.disconnect();
      },
      { threshold: 0.35 }
    );

    io.observe(statsRef.current);
    return () => io.disconnect();
  }, []);

  /* ---------------- slider ---------------- */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % MOTIVATIONAL.length);
    }, 4000); // Change quote every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const go = useCallback(
    (i) =>
      setCurrent(
        ((i % MOTIVATIONAL.length) + MOTIVATIONAL.length) %
          MOTIVATIONAL.length
      ),
    []
  );

  const onTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) go(current + (dx > 0 ? -1 : 1));
    touchStartX.current = null;
  };

  /* ---------------- tilt ---------------- */
  const tilt = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -8;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 12;
    el.style.transform = perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02);
  };

  return (
    <div className="home-root">
      <canvas id="hexagonCanvas" style={{ pointerEvents: 'none' }} />
      <div className="bg-overlay" />
      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <h1>Trading bots that<br />move with the market</h1>
          <div className="hero-line" />
          <h2>not against it.</h2>
          <p>
            Adaptive algorithms that evolve with market conditions in real time,
            protecting your capital while maximizing opportunity.
          </p>
          <div className="cta-row">
            <Link to="/bots" className="cta-main">Explore Bots</Link>
            <Link to="/custom-bot" className="cta-ghost">Build Custom Bot</Link>
          </div>
        </div>
      </section>

      {/* SLIDER */}
      <section className="section">
        <div
          ref={(e) => (revealRefs.current[0] = e)}
          className="reveal glass slider"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="slider-left">
            <div className="slider-emoji">{MOTIVATIONAL[current].emoji}</div>
            <div className="slider-text">{MOTIVATIONAL[current].text}</div>
          </div>

          <div className="slider-controls">
            {MOTIVATIONAL.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === current ? "active" : ""}`}
                onClick={() => go(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div
          ref={(e) => (revealRefs.current[1] = e)}
          className="reveal glass"
        >
          <h2 className="section-title">Platform Features</h2>
          <div className="feature-grid">
            {[
              ["🚀", "Lightning-fast", "Sub-100ms execution"],
              ["🔒", "Enterprise-grade", "Encrypted keys & audits"],
              ["📡", "24/7 Monitoring", "Automated fail-safes"],
              ["⚙️", "Fully Custom", "Python bots & builder"],
              ["📈", "Deep Analytics", "Visual backtests"],
              ["🌍", "Global Markets", "Major exchanges"],
            ].map(([i, t, s]) => (
              <div
                key={t}
                className="feature"
                onMouseMove={tilt}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
              >
                <div className="icon">{i}</div>
                <strong>{t}</strong>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="section">
        <div
          ref={(e) => {
            revealRefs.current[2] = e;
            statsRef.current = e;
          }}
          className="reveal glass"
        >
          <div className="stats-grid">
            <div><strong data-to="10">0</strong>Strategies</div>
            <div><strong data-to="24">0</strong>x7 Monitoring</div>
            <div><strong data-to="100">0</strong>ms Execution</div>
            <div><strong data-to="99.9">0</strong>% Uptime</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div
          ref={(e) => (revealRefs.current[3] = e)}
          className="reveal glass final-cta"
        >
          <h2>Ready to trade smarter?</h2>
          <div className="cta-row">
            <Link to="/bots" className="cta-main">Get Started — Free</Link>
            <Link to="/custom-bot" className="cta-ghost">Build Custom Bot</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

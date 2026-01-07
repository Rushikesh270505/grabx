import { useEffect, useState } from "react";

const quotes = [
  "Let’s earn more 💰",
  "Be bold. Take smart risks 🚀",
  "Safe money grows slow 🐢",
  "Discipline beats luck 🎯",
  "Make your capital work harder ⚙️"
];

const traditionalFeatures = [
  "💰 Fixed returns",
  "🚧 Limited profit",
  "🏦 Platform controls your money",
  "👥 Funds are pooled",
  "📉 Miss market upside",
  "✂️ Small share for you"
];

const grabxFeatures = [
  "📈 Returns grow with market",
  "🔥 No profit limits",
  "🧠 You stay in control",
  "🔐 Your money stays yours",
  "🌊 Market moves used smartly",
  "⚙️ Capital works fully for you"
];

export default function Home() {
  const [qIndex, setQIndex] = useState(0);
  const [fIndex, setFIndex] = useState(0);

  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setQIndex(i => (i + 1) % quotes.length);
    }, 2600);

    const featureTimer = setInterval(() => {
      setFIndex(i => (i + 1) % traditionalFeatures.length);
    }, 2000);

    return () => {
      clearInterval(quoteTimer);
      clearInterval(featureTimer);
    };
  }, []);

  return (
    <div>

      {/* ================= HERO ================= */}
      <section className="section-hero">
        <div className="hero-panel" style={{ textAlign: "center" }}>
          <h1 className="grabx-hover" style={{ fontSize: "72px", marginBottom: "18px" }}>
            <span className="grab">Grab</span>
            <span className="x">X</span>{" "}
            <span className="x">Bots</span>
          </h1>

          <p style={{ fontSize: "22px", color: "#b6bbc2", marginBottom: "8px" }}>
            Your capital deserves alignment — not limitation.
          </p>

          <div key={qIndex} className="quote-text">
            {quotes[qIndex]}
          </div>
        </div>
      </section>

      {/* ================= EDUCATION ================= */}
      <section className="section-education section-divider">
        <div className="content-panel">

          <div style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px"
          }}>

            {/* ASK YOURSELF */}
            <div>
              <h2 style={{ fontSize: "36px", marginBottom: "32px" }}>
                🤔 ASK YOURSELF THIS
              </h2>

              <p style={{ fontSize: "20px", color: "#b6bbc2", marginBottom: "22px" }}>
                Almost every staking platform promises fixed or predictable returns.
                It feels stable. Comfortable. Safe.
              </p>

              <p style={{ fontSize: "20px", marginBottom: "20px" }}>
                ❓ How are they able to pay you consistently?
              </p>

              <p style={{ fontSize: "20px", marginBottom: "18px" }}>
                💡 In most cases, platforms earn <strong>2× or even 3×</strong>
                more by using <strong>your capital</strong>.
              </p>

              <p style={{ fontSize: "20px", marginBottom: "16px" }}>
                ✂️ You receive only a slice.
              </p>

              <p style={{ fontSize: "20px", marginBottom: "16px" }}>
                📈 The real compounding stays with them.
              </p>

              <p style={{ fontSize: "20px", fontWeight: "700", marginTop: "28px" }}>
                🚨 That difference is your lost potential.
              </p>
            </div>

            {/* HOW GRABX IS DIFFERENT */}
            <div>
              <h2 style={{ fontSize: "36px", marginBottom: "32px", color: "#5da9ff" }}>
                🔄 HOW <span className="grab">Grab</span><span className="x">X</span> IS DIFFERENT
              </h2>

              <p style={{ fontSize: "20px", marginBottom: "18px" }}>
                🔐 Your capital always remains under your control.
              </p>

              <p style={{ fontSize: "20px", marginBottom: "18px" }}>
                📊 Profits are not capped — you grow with the market.
              </p>

              <p style={{ fontSize: "20px", marginBottom: "18px" }}>
                🌊 Volatility is used intelligently, not avoided blindly.
              </p>

              <p style={{ fontSize: "20px", marginBottom: "18px" }}>
                ⚙️ Execution is disciplined, transparent, and rule-based.
              </p>

              <p style={{ fontSize: "20px", fontWeight: "700", marginTop: "28px", color: "#5da9ff" }}>
                ✅ GrabX is a complete solution for long-term capital growth.
              </p>
            </div>

          </div>

          {/* ================= VS COMPARISON ================= */}
          <div className="vs-section">

            <div className="compare-card traditional">
              <h3>😴 Traditional Staking</h3>
              <div className="feature-line">
                {traditionalFeatures[fIndex]}
              </div>
            </div>

            <div className="vs-text">VS</div>

            <div className="compare-card grabx">
              <h3>🚀 Grab<span className="x">X</span> Bots</h3>
              <div className="feature-line highlight">
                {grabxFeatures[fIndex]}
              </div>
            </div>

          </div>

          {/* ================= PHILOSOPHY + CTA ================= */}
          <div style={{ textAlign: "center", marginTop: "120px" }}>
            <p style={{ fontSize: "22px", color: "#c2c7d0", maxWidth: "900px", margin: "0 auto 28px" }}>
              When profits appear, discipline matters.
              It is often wiser to secure gains than wait too long out of greed.
            </p>

            <p style={{ fontSize: "20px", color: "#b6bbc2", maxWidth: "900px", margin: "0 auto 28px" }}>
              Losses are temporary. Markets move in cycles.
              With volatility-aware strategies, recovery becomes part of the process.
            </p>

            <p style={{ fontSize: "22px", fontWeight: "700", color: "#5da9ff", marginBottom: "42px" }}>
              🎯 This is the GrabX philosophy.
            </p>

            <button style={{
              padding: "16px 42px",
              fontSize: "18px",
              fontWeight: "700",
              borderRadius: "999px",
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg, #5da9ff, #2b7cff)",
              color: "#050b14",
              boxShadow: "0 20px 60px rgba(0,120,255,0.45)"
            }}>
              🚀 Let’s Start Earning
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}

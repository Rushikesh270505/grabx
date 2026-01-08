 import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const motivationalLines = [
  { text: "Let your money work for you while you sleep 💰", emoji: "💰" },
  { text: "Risk, when managed, becomes opportunity 📈", emoji: "📈" },
  { text: "Let's earn more with smart trading bots 🤖", emoji: "🤖" },
  { text: "Automate your way to financial freedom 🚀", emoji: "🚀" },
  { text: "24/7 trading never stops, neither should your profits ⏰", emoji: "⏰" },
  { text: "Turn market volatility into your advantage 🎯", emoji: "🎯" },
  { text: "Build wealth while you live your life 🏖️", emoji: "🏖️" },
  { text: "Smart algorithms, smarter profits 🧠", emoji: "🧠" },
  { text: "Trade like a pro, even when you're a beginner 🌟", emoji: "🌟" },
  { text: "The market never sleeps, and neither do your bots 🌙", emoji: "🌙" },
  { text: "Passive income through active trading 💎", emoji: "💎" },
  { text: "Master the market with AI-powered precision ⚡", emoji: "⚡" },
  { text: "Your wealth journey starts with automation 🌱", emoji: "🌱" },
  { text: "Financial freedom is just one bot away 🔓", emoji: "🔓" },
  { text: "Let algorithms handle the stress while you enjoy life 🍹", emoji: "🍹" },
  { text: "Transform trading hours into freedom hours ⏳", emoji: "⏳" }
];

export default function Home() {
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % motivationalLines.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: 24, color: "#fff" }}>
      {/* Hero Section */}
      <div className="glass-panel" style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ marginTop: 0, fontSize: 52, marginBottom: 12 }}>
          Grab<span className="x">X</span>
        </h1>
        <p style={{ margin: 0, color: "#cfd3d8", fontSize: 18, marginBottom: 24 }}>
          Trading bots, real-time prices, and strategy controls.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link className="cta-btn" to="/bots">Explore Bots</Link>
          <Link
            className="cta-btn"
            to="/custom-bot"
            style={{ background: "transparent", border: "1px solid rgba(93,169,255,0.3)", color: "#5da9ff" }}
          >
            Build Custom Bot
          </Link>
        </div>
      </div>

      {/* Motivational Lines Section */}
      <div className="glass-panel" style={{ textAlign: "center", marginBottom: 32, padding: "32px 24px" }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>
          {motivationalLines[currentQuote].emoji}
        </div>
        <div style={{ fontSize: 24, fontWeight: "600", color: "#5da9ff", marginBottom: 16, lineHeight: 1.4 }}>
          {motivationalLines[currentQuote].text}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
          {motivationalLines.map((_, index) => (
            <div
              key={index}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: index === currentQuote ? "#5da9ff" : "rgba(255,255,255,0.2)",
                cursor: "pointer"
              }}
              onClick={() => setCurrentQuote(index)}
            />
          ))}
        </div>
      </div>

      {/* Goals Section */}
      <div className="glass-panel" style={{ marginBottom: 32 }}>
        <h2 style={{ textAlign: "center", marginTop: 0, marginBottom: 32, color: "#5da9ff" }}>
          Our Mission & Goals
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
            <h3 style={{ color: "#5da9ff", marginBottom: 12 }}>Empower Traders</h3>
            <p style={{ color: "#9aa1aa", lineHeight: 1.6 }}>
              Provide cutting-edge automated trading tools that level the playing field for both beginners and experienced traders.
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
            <h3 style={{ color: "#5da9ff", marginBottom: 12 }}>Smart Automation</h3>
            <p style={{ color: "#9aa1aa", lineHeight: 1.6 }}>
              Leverage AI and machine learning to create intelligent trading bots that adapt to market conditions 24/7.
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
            <h3 style={{ color: "#5da9ff", marginBottom: 12 }}>Data-Driven</h3>
            <p style={{ color: "#9aa1aa", lineHeight: 1.6 }}>
              Make informed decisions with real-time market data, backtesting, and comprehensive performance analytics.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="glass-panel" style={{ marginBottom: 32 }}>
        <h2 style={{ textAlign: "center", marginTop: 0, marginBottom: 32, color: "#5da9ff" }}>
          Platform Features
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
          {[
            { icon: "🚀", title: "Lightning Fast", desc: "Execute trades in milliseconds with optimized infrastructure" },
            { icon: "🔒", title: "Secure", desc: "Bank-level encryption and security protocols protect your assets" },
            { icon: "🌍", title: "Global Markets", desc: "Access major exchanges worldwide from a single platform" },
            { icon: "📈", title: "Advanced Analytics", desc: "Deep insights into your trading performance and strategies" },
            { icon: "⚡", title: "Real-time Data", desc: "Live price feeds and market updates 24/7" },
            { icon: "🎛️", title: "Full Control", desc: "Customize every aspect of your trading strategies" }
          ].map((feature, index) => (
            <div key={index} style={{ textAlign: "center", padding: "20px 16px" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{feature.icon}</div>
              <h4 style={{ color: "#5da9ff", marginBottom: 8 }}>{feature.title}</h4>
              <p style={{ color: "#9aa1aa", fontSize: 14, lineHeight: 1.5 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="glass-panel" style={{ marginBottom: 32 }}>
        <h2 style={{ textAlign: "center", marginTop: 0, marginBottom: 32, color: "#5da9ff" }}>
          Platform Statistics
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24, textAlign: "center" }}>
          <div>
            <div style={{ fontSize: 36, fontWeight: "bold", color: "#5da9ff", marginBottom: 8 }}>10+</div>
            <div style={{ color: "#9aa1aa" }}>Trading Strategies</div>
          </div>
          <div>
            <div style={{ fontSize: 36, fontWeight: "bold", color: "#5da9ff", marginBottom: 8 }}>24/7</div>
            <div style={{ color: "#9aa1aa" }}>Market Monitoring</div>
          </div>
          <div>
            <div style={{ fontSize: 36, fontWeight: "bold", color: "#5da9ff", marginBottom: 8 }}>100ms</div>
            <div style={{ color: "#9aa1aa" }}>Execution Speed</div>
          </div>
          <div>
            <div style={{ fontSize: 36, fontWeight: "bold", color: "#5da9ff", marginBottom: 8 }}>99.9%</div>
            <div style={{ color: "#9aa1aa" }}>Uptime</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="glass-panel" style={{ textAlign: "center", padding: "40px 24px" }}>
        <h2 style={{ marginTop: 0, marginBottom: 16, color: "#5da9ff" }}>Ready to Start Trading?</h2>
        <p style={{ color: "#9aa1aa", marginBottom: 24, fontSize: 16 }}>
          Join thousands of traders who have automated their strategies with GrabX
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link className="cta-btn" to="/bots">Get Started</Link>
          <Link
            className="cta-btn"
            to="/profile"
            style={{ background: "transparent", border: "1px solid rgba(93,169,255,0.3)", color: "#5da9ff" }}
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

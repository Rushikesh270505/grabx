import React, { useState, useEffect } from 'react';

const botExplanations = {
  'Scalper': {
    title: 'Lightning Fast Scalping',
    steps: [
      {
        title: '🎯 Market Analysis',
        description: 'Continuously scans order book for micro-price differences and liquidity gaps',
        visual: '📊'
      },
      {
        title: '⚡ Rapid Execution',
        description: 'Places hundreds of trades per second to capture tiny price movements',
        visual: '🚀'
      },
      {
        title: '💰 Profit Accumulation',
        description: 'Small gains compound over time through high-frequency trading',
        visual: '💎'
      },
      {
        title: '🛡️ Risk Management',
        description: 'Strict position limits and instant stop-losses protect capital',
        visual: '🛡️'
      }
    ],
    advantages: ['High Win Rate', 'Quick Profits', 'Market Neutral', 'Low Capital Risk'],
    bestFor: 'Liquid markets with tight spreads like BTC/USDT, ETH/USDT'
  },
  'Mean Reverter': {
    title: 'Strategic Mean Reversion',
    steps: [
      {
        title: '📈 Deviation Detection',
        description: 'Identifies when price moves far from historical average',
        visual: '📉'
      },
      {
        title: '🎯 Counter-Trend Entry',
        description: 'Enters positions against the current trend expecting reversal',
        visual: '🔄'
      },
      {
        title: '⚖️ Position Sizing',
        description: 'Scales positions based on deviation magnitude',
        visual: '⚖️'
      },
      {
        title: '📊 Mean Target',
        description: 'Exits when price returns to historical average',
        visual: '🎯'
      }
    ],
    advantages: ['Statistical Edge', 'Defined Risk', 'Range Markets', 'Predictable'],
    bestFor: 'Range-bound markets like ETH/USDT, SOL/USDT'
  },
  'Trend Follower': {
    title: 'Momentum Trend Following',
    steps: [
      {
        title: '🌊 Trend Detection',
        description: 'Uses multiple indicators to confirm trend direction',
        visual: '📈'
      },
      {
        title: '🚀 Momentum Entry',
        description: 'Enters when momentum aligns with trend direction',
        visual: '💫'
      },
      {
        title: '📈 Position Building',
        description: 'Adds to positions as trend strengthens',
        visual: '🏗️'
      },
      {
        title: '🛑 Trend Exit',
        description: 'Exits when momentum shows signs of weakness',
        visual: '🏁'
      }
    ],
    advantages: ['Big Moves', 'Trend Capture', 'Pyramiding', 'Ride Winners'],
    bestFor: 'Trending markets like SOL/USDT, ADA/USDT'
  },
  'Grid Trader': {
    title: 'Systematic Grid Trading',
    steps: [
      {
        title: '🏗️ Grid Setup',
        description: 'Places buy and sell orders at regular price intervals',
        visual: '📋'
      },
      {
        title: '💰 Profit Grid',
        description: 'Earns profit from price oscillations within the grid',
        visual: '🏆'
      },
      {
        title: '🔄 Auto Rebalancing',
        description: 'Continuously places new orders as positions are filled',
        visual: '🔄'
      },
      {
        title: '📊 Range Optimization',
        description: 'Adjusts grid parameters based on market volatility',
        visual: '⚙️'
      }
    ],
    advantages: ['Passive Income', 'Volatility Capture', 'Automated', 'Consistent'],
    bestFor: 'Volatile range markets like ADA/USDT, XRP/USDT'
  },
  'Arbitrage': {
    title: 'Risk-Free Arbitrage',
    steps: [
      {
        title: '🔍 Price Discovery',
        description: 'Scans multiple exchanges for price differences',
        visual: '🔍'
      },
      {
        title: '⚡ Instant Execution',
        description: 'Simultaneously buys low and sells high across venues',
        visual: '⚡'
      },
      {
        title: '💰 Spread Capture',
        description: 'Locks in risk-free profits from price discrepancies',
        visual: '💰'
      },
      {
        title: '🔄 Rapid Cycling',
        description: 'Repeats process continuously for compound returns',
        visual: '🔄'
      }
    ],
    advantages: ['Risk-Free', 'Market Neutral', 'Instant Profits', 'Scalable'],
    bestFor: 'Liquid markets with multiple venues like BTC/USDT, ETH/USDT'
  },
  'Market Maker': {
    title: 'Professional Market Making',
    steps: [
      {
        title: '📊 Order Book Analysis',
        description: 'Analyzes market depth and liquidity patterns',
        visual: '📊'
      },
      {
        title: '💼 Quote Placement',
        description: 'Places passive bids and asks around mid-price',
        visual: '💼'
      },
      {
        title: '💰 Spread Earnings',
        description: 'Profits from bid-ask spread through volume',
        visual: '💰'
      },
      {
        title: '⚖️ Inventory Management',
        description: 'Balances positions to manage directional risk',
        visual: '⚖️'
      }
    ],
    advantages: ['Steady Income', 'Low Risk', 'Volume Based', 'Professional'],
    bestFor: 'Liquid markets like XRP/USDT, BNB/USDT'
  },
  'Dollar Cost Averager': {
    title: 'Systematic DCA Investing',
    steps: [
      {
        title: '📅 Schedule Setup',
        description: 'Defines investment intervals and amounts',
        visual: '📅'
      },
      {
        title: '💰 Regular Purchases',
        description: 'Automatically buys fixed amounts at set intervals',
        visual: '💰'
      },
      {
        title: '📊 Average Cost',
        description: 'Builds position at average market price over time',
        visual: '📊'
      },
      {
        title: '🎯 Long Term Growth',
        description: 'Benefits from long-term market appreciation',
        visual: '🌱'
      }
    ],
    advantages: ['Risk Reduction', 'Time Tested', 'Simple', 'Passive'],
    bestFor: 'Long-term investing in DOT/USDT, major cryptocurrencies'
  },
  'Momentum': {
    title: 'Dynamic Momentum Trading',
    steps: [
      {
        title: '🚀 Momentum Scan',
        description: 'Identifies assets with strong price momentum',
        visual: '🚀'
      },
      {
        title: '📈 Confirmation Signals',
        description: 'Uses multiple indicators to confirm momentum',
        visual: '✅'
      },
      {
        title: '⚡ Quick Entry',
        description: 'Enters positions rapidly on momentum confirmation',
        visual: '⚡'
      },
      {
        title: '🛑 Momentum Exit',
        description: 'Exits when momentum shows signs of exhaustion',
        visual: '🛑'
      }
    ],
    advantages: ['Quick Profits', 'Trend Capture', 'Volatility', 'Active'],
    bestFor: 'Momentum markets like LTC/USDT, emerging altcoins'
  },
  'Options Hedger': {
    title: 'Advanced Options Hedging',
    steps: [
      {
        title: '🛡️ Risk Analysis',
        description: 'Identifies portfolio exposure to market movements',
        visual: '🛡️'
      },
      {
        title: '📊 Strategy Selection',
        description: 'Chooses optimal options strategies for hedging',
        visual: '📋'
      },
      {
        title: '💼 Position Construction',
        description: 'Builds options positions to offset directional risk',
        visual: '🏗️'
      },
      {
        title: '🔄 Dynamic Adjustment',
        description: 'Adjusts hedges as market conditions change',
        visual: '🔄'
      }
    ],
    advantages: ['Risk Protection', 'Premium Income', 'Flexible', 'Professional'],
    bestFor: 'Volatile markets like BTC-PERP, options trading'
  }
};

export default function BotExplanation({ botName, isActive }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const explanation = botExplanations[botName];
  
  useEffect(() => {
    if (!isActive || !explanation) return;
    
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => (prev + 1) % explanation.steps.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isActive, explanation]);

  if (!explanation) return null;

  return (
    <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
      <h2 style={{ 
        fontSize: '32px', 
        marginBottom: '24px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #5da9ff, #2b7cff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        {explanation.title}
      </h2>

      {/* Animated Steps */}
      <div style={{ marginBottom: '32px' }}>
        <div className="glass-panel" style={{ 
          padding: '24px', 
          textAlign: 'center',
          background: 'rgba(93,169,255,0.1)',
          border: '1px solid rgba(93,169,255,0.2)',
          transition: 'all 0.5s ease',
          transform: isAnimating ? 'scale(0.95)' : 'scale(1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            {explanation.steps[currentStep].visual}
          </div>
          <h3 style={{ fontSize: '20px', marginBottom: '12px', color: '#5da9ff' }}>
            {explanation.steps[currentStep].title}
          </h3>
          <p style={{ fontSize: '16px', color: '#cfd3d8', lineHeight: 1.6 }}>
            {explanation.steps[currentStep].description}
          </p>
        </div>

        {/* Step Indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
          {explanation.steps.map((_, index) => (
            <div
              key={index}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: index === currentStep ? '#5da9ff' : 'rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>

      {/* Advantages */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '18px', marginBottom: '16px', color: '#5da9ff' }}>
          ✨ Key Advantages
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          {explanation.advantages.map((advantage, index) => (
            <div key={index} className="glass-panel" style={{ 
              padding: '12px', 
              textAlign: 'center',
              background: 'rgba(76,222,128,0.1)',
              border: '1px solid rgba(76,222,128,0.2)'
            }}>
              <span style={{ color: '#4ade80', fontWeight: '600' }}>{advantage}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Best For */}
      <div>
        <h4 style={{ fontSize: '18px', marginBottom: '12px', color: '#5da9ff' }}>
          🎯 Best Market Conditions
        </h4>
        <p style={{ fontSize: '16px', color: '#cfd3d8', fontStyle: 'italic' }}>
          {explanation.bestFor}
        </p>
      </div>
    </div>
  );
}

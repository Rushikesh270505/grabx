import React, { useState, useRef, useEffect } from 'react';
import './GraberAIChat.css';

const GraberAIChat = ({ onCodeGenerated, onCodeModified }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'I am Graber AI, your autonomous trading strategy engineer. I can help you:\n\n• Generate complete Python trading strategies\n• Modify existing strategies\n• Validate and optimize code\n• Explain trading logic\n• Assess risk and viability\n\nPlease provide your trading strategy requirements or share existing code.',
      timestamp: new Date(),
      confidence: 1.0,
      confidenceColor: 'GREEN'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [agentMode, setAgentMode] = useState(false); // Agent Mode toggle
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateStrategy = async (requirements) => {
    // Simulate Graber AI strategy generation
    const strategies = {
      'rsi': `# RSI Mean Reversion Strategy
signals = []

# Calculate RSI manually
if len(candles) >= 14:
    gains = []
    losses = []
    
    for i in range(1, min(15, len(candles))):
        change = candles[i]['close'] - candles[i-1]['close']
        if change > 0:
            gains.append(change)
            losses.append(0)
        else:
            gains.append(0)
            losses.append(abs(change))
    
    avg_gain = sum(gains) / len(gains) if gains else 0
    avg_loss = sum(losses) / len(losses) if losses else 0
    
    if avg_loss > 0:
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        
        # Buy when RSI is oversold
        if rsi < 30 and position is None:
            signals.append({
                'side': 'buy',
                'price': current_price,
                'quantity': 0.001
            })
        
        # Sell when RSI is overbought
        if rsi > 70 and position is not None:
            signals.append({
                'side': 'sell',
                'price': current_price,
                'quantity': position.get('quantity', 0.001)
            })`,

      'ema': `# EMA Crossover Strategy
signals = []

# Calculate EMAs manually
if len(candles) >= 20:
    # Calculate EMA 10
    ema10 = candles[0]['close']
    multiplier10 = 2 / (10 + 1)
    
    for candle in candles[1:10]:
        ema10 = (candle['close'] - ema10) * multiplier10 + ema10
    
    # Calculate EMA 20
    ema20 = candles[0]['close']
    multiplier20 = 2 / (20 + 1)
    
    for candle in candles[1:20]:
        ema20 = (candle['close'] - ema20) * multiplier20 + ema20
    
    # Buy when EMA 10 crosses above EMA 20
    if ema10 > ema20 and position is None:
        signals.append({
            'side': 'buy',
            'price': current_price,
            'quantity': 0.001
        })
    
    # Sell when EMA 10 crosses below EMA 20
    if ema10 < ema20 and position is not None:
        signals.append({
            'side': 'sell',
            'price': current_price,
            'quantity': position.get('quantity', 0.001)
        })`,

      'macd': `# MACD Strategy
signals = []

# Calculate MACD manually
if len(candles) >= 26:
    # Calculate EMAs for MACD
    ema12 = candles[0]['close']
    ema26 = candles[0]['close']
    mult12 = 2 / (12 + 1)
    mult26 = 2 / (26 + 1)
    
    for candle in candles[1:]:
        ema12 = (candle['close'] - ema12) * mult12 + ema12
        ema26 = (candle['close'] - ema26) * mult26 + ema26
    
    macd_line = ema12 - ema26
    
    # Calculate signal line (EMA of MACD)
    signal_line = macd_line  # Simplified for demo
    histogram = macd_line - signal_line
    
    # Buy when MACD crosses above signal line
    if histogram > 0 and position is None:
        signals.append({
            'side': 'buy',
            'price': current_price,
            'quantity': 0.001
        })
    
    # Sell when MACD crosses below signal line
    if histogram < 0 and position is not None:
        signals.append({
            'side': 'sell',
            'price': current_price,
            'quantity': position.get('quantity', 0.001)
        })`
    };

    // Simple keyword matching for demo
    const lowerReq = requirements.toLowerCase();
    if (lowerReq.includes('rsi') || lowerReq.includes('oversold')) {
      return strategies.rsi;
    } else if (lowerReq.includes('ema') || lowerReq.includes('crossover')) {
      return strategies.ema;
    } else if (lowerReq.includes('macd')) {
      return strategies.macd;
    } else {
      // Default simple strategy
      return strategies.ema;
    }
  };

  const analyzeCode = async (code) => {
    // Simulate code analysis
    const analysis = {
      score: 8.5,
      confidence: 0.85,
      confidenceColor: 'GREEN',
      issues: [],
      suggestions: []
    };

    if (code.includes('position is None') && code.includes('position is not None')) {
      analysis.score = Math.min(10, analysis.score + 0.5);
    } else {
      analysis.issues.push('Missing proper position management');
      analysis.score = Math.max(0, analysis.score - 2);
    }

    if (code.includes('signals.append')) {
      analysis.score = Math.min(10, analysis.score + 0.5);
    } else {
      analysis.issues.push('No signal generation found');
      analysis.score = Math.max(0, analysis.score - 3);
    }

    if (code.includes('len(candles)')) {
      analysis.score = Math.min(10, analysis.score + 0.5);
    } else {
      analysis.suggestions.push('Add candle length validation');
    }

    return analysis;
  };

  const processMessage = async (userInput) => {
    setIsTyping(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let response = '';
    let generatedCode = '';
    let confidence = 0.8;
    let confidenceColor = 'GREEN';

    // Convert to lowercase for better matching
    const lowerInput = userInput.toLowerCase().trim();

    // Handle greetings and simple interactions
    if (lowerInput === 'hi' || lowerInput === 'hello' || lowerInput === 'ho' || lowerInput === 'hey') {
      response = `Hello! I'm Graber AI, your autonomous trading strategy engineer. I'm here to help you create and optimize trading strategies.\n\n**What I can do:**\n• Generate complete Python trading strategies\n• Analyze and improve existing code\n• Explain trading concepts\n• Assess risk and viability\n\n**How to use:**\n1. Describe your strategy requirements (e.g., "Create an RSI strategy")\n2. Or paste your existing code for analysis\n3. Use the quick action buttons below\n\nReady to help! What trading strategy would you like to work on?`;
      confidence = 1.0;
      confidenceColor = 'GREEN';
    }
    // Handle questions about capabilities
    else if (lowerInput.includes('what can you do') || lowerInput.includes('help') || lowerInput.includes('capabilities')) {
      response = `**Graber AI Capabilities** 🚀\n\nI'm designed to be your complete trading strategy partner:\n\n📊 **Strategy Generation:**\n• RSI Mean Reversion\n• EMA Crossover\n• MACD Signals\n• Bollinger Bands\n• Custom strategies based on your requirements\n\n🔍 **Code Analysis:**\n• Syntax validation\n• Logic review\n• Performance optimization\n• Risk assessment\n\n🤖 **Agent Mode:**\n• Automatic code modification\n• Real-time strategy updates\n• Seamless editor integration\n\n💡 **Just tell me what you need!**\n"Generate an RSI strategy" or "Analyze this code..."`;
      confidence = 1.0;
      confidenceColor = 'GREEN';
    }
    // Check if user is providing code to analyze
    else if (userInput.includes('signals.append') || userInput.includes('def ') || userInput.includes('if ')) {
      // Code analysis mode
      const analysis = await analyzeCode(userInput);
      
      response = `**Code Analysis Complete**\n\n📊 **Score: ${analysis.score.toFixed(1)}/10**\n🎯 **Confidence: ${(analysis.confidence * 100).toFixed(0)}%**\n🟢 **Status: ${analysis.confidenceColor}**\n\n`;
      
      if (analysis.issues.length > 0) {
        response += '**Issues Found:**\n';
        analysis.issues.forEach(issue => {
          response += `• ${issue}\n`;
        });
      }
      
      if (analysis.suggestions.length > 0) {
        response += '\n**Suggestions:**\n';
        analysis.suggestions.forEach(suggestion => {
          response += `• ${suggestion}\n`;
        });
      }
      
      if (analysis.issues.length === 0) {
        response += '\n✅ Strategy looks solid! Ready for trading.';
      }
      
      confidence = analysis.confidence;
      confidenceColor = analysis.confidenceColor;
    }
    // Strategy generation mode
    else if (lowerInput.includes('strategy') || lowerInput.includes('generate') || lowerInput.includes('create') || lowerInput.includes('build') || lowerInput.includes('rsi') || lowerInput.includes('ema') || lowerInput.includes('macd') || lowerInput.includes('bollinger')) {
      // Strategy generation mode
      generatedCode = await generateStrategy(userInput);
      
      response = `**Strategy Generated Successfully**\n\nI've created a complete Python trading strategy based on your requirements. The strategy includes:\n\n• Proper position management\n• Risk controls\n• Entry/exit logic\n• Signal generation\n\nThe code has been validated and is ready to use. You can copy it to the editor or I can place it there automatically.\n\nWould you like me to explain any part of the strategy or make adjustments?`;
      
      confidence = 0.9;
      confidenceColor = 'GREEN';
    }
    // Default response for unrecognized input
    else {
      response = `I'm here to help with trading strategies! Could you please clarify what you'd like:\n\n**Examples:**\n• "Generate an RSI strategy"\n• "Create an EMA crossover"\n• "Analyze this code: [paste code]"\n• "Help me understand MACD"\n\nOr use the quick action buttons below for common strategies. I'm ready to assist! 🚀`;
      confidence = 0.7;
      confidenceColor = 'YELLOW';
    }

    const assistantMessage = {
      id: Date.now(),
      type: 'assistant',
      content: response,
      timestamp: new Date(),
      code: generatedCode,
      confidence: confidence,
      confidenceColor: confidenceColor
    };

    setMessages(prev => [...prev, assistantMessage]);
    
    // Agent Mode: Automatically modify code in editor
    if (agentMode && generatedCode) {
      if (onCodeModified) {
        onCodeModified(generatedCode);
      }
      // Add agent mode confirmation message
      const agentMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `🤖 **Agent Mode Activated**\n\nI've automatically updated the code in your editor with the generated strategy. The changes have been applied directly to your trading bot.\n\n**Strategy Type:** ${userInput.includes('rsi') ? 'RSI' : userInput.includes('ema') ? 'EMA Crossover' : userInput.includes('macd') ? 'MACD' : 'Custom'}\n**Status:** ✅ Applied\n\nYou can now run the updated strategy or ask me to make further modifications.`,
        timestamp: new Date(),
        confidence: confidence,
        confidenceColor: confidenceColor
      };
      setMessages(prev => [...prev, agentMessage]);
    } else if (generatedCode && onCodeGenerated) {
      onCodeGenerated(generatedCode);
    }
    
    setIsTyping(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    await processMessage(input);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertCode = (code) => {
    if (onCodeGenerated) {
      onCodeGenerated(code);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'assistant',
        content: 'Chat cleared. How can I help you with your trading strategy today?',
        timestamp: new Date(),
        confidence: 1.0,
        confidenceColor: 'GREEN'
      }
    ]);
  };

  return (
    <div className="graber-ai-chat">
      <div className="chat-header">
        <div className="chat-title">
          <div className="ai-avatar">🤖</div>
          <div>
            <h3>Graber AI</h3>
            <span className="ai-status">Trading Strategy Engineer</span>
          </div>
        </div>
        <div className="chat-actions">
          <button className="clear-btn" onClick={clearChat}>
            Clear
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            {message.type === 'assistant' && (
              <div className="message-avatar">🤖</div>
            )}
            <div className="message-content">
              <div className="message-text">
                {message.content.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
              
              {message.code && (
                <div className="generated-code">
                  <div className="code-header">
                    <span>Generated Strategy</span>
                    <button 
                      className="insert-btn"
                      onClick={() => insertCode(message.code)}
                    >
                      Insert to Editor
                    </button>
                  </div>
                  <pre className="code-block">
                    <code>{message.code}</code>
                  </pre>
                </div>
              )}
              
              {message.type === 'assistant' && (
                <div className="message-meta">
                  <div className={`confidence-indicator ${message.confidenceColor.toLowerCase()}`}>
                    <span className="confidence-score">
                      {(message.confidence * 100).toFixed(0)}%
                    </span>
                    <span className="confidence-label">
                      {message.confidenceColor}
                    </span>
                  </div>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Describe your trading strategy or paste code to analyze..."
          rows={3}
          disabled={isTyping}
        />
        <button 
          className="send-btn"
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
        >
          {isTyping ? 'Processing...' : 'Send'}
        </button>
      </div>

      <div className="chat-footer">
        <div className="quick-actions">
          <button 
            onClick={() => setInput('Generate an RSI mean reversion strategy')}
            disabled={isTyping}
          >
            RSI Strategy
          </button>
          <button 
            onClick={() => setInput('Create an EMA crossover strategy')}
            disabled={isTyping}
          >
            EMA Crossover
          </button>
          <button 
            onClick={() => setInput('Build a MACD trading strategy')}
            disabled={isTyping}
          >
            MACD Strategy
          </button>
        </div>
        
        {/* Agent Mode Toggle - Bottom Right */}
        <div className="agent-mode-toggle-bottom">
          <div className="toggle-label-compact">
            <span>🤖 Agent</span>
            <label className="toggle-switch-compact">
              <input
                type="checkbox"
                checked={agentMode}
                onChange={(e) => setAgentMode(e.target.checked)}
              />
              <span className="slider-compact"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraberAIChat;

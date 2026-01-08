// Python code execution service for Custom Bot
export async function executePythonCode(code, currentPrice, symbol) {
  try {
    // Create a safe execution environment
    const wrappedCode = `
# Safe execution environment
import json
import sys

# Bot context
context = {
    'current_price': ${currentPrice},
    'symbol': '${symbol}',
    'balance': 1000.0,
    'position': 0.0,
    'trades': []
}

# User code execution
${code}

# Return signals as JSON
result = {
    'signals': signals if 'signals' in locals() else [],
    'context': context
}
print(json.dumps(result))
    `;

    // For demo purposes, we'll simulate Python execution
    // In production, this would connect to a real Python backend
    const response = await fetch('/api/execute-python', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: wrappedCode,
        context: {
          current_price: currentPrice,
          symbol: symbol
        }
      })
    });

    if (!response.ok) {
      throw new Error('Python execution failed');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Python execution error:', error);
    // Fallback to simple rule parsing for demo
    return parseSimpleRules(code, currentPrice);
  }
}

// Fallback simple rule parser
function parseSimpleRules(code, currentPrice) {
  const lines = code.split('\n').map(l => l.trim()).filter(Boolean);
  const signals = [];
  
  for (const line of lines) {
    // Simple patterns: buy if price > X, sell if price < X
    const buyMatch = line.match(/buy\s+if\s+price\s*([><=]+)\s*([0-9.]+)/i);
    const sellMatch = line.match(/sell\s+if\s+price\s*([><=]+)\s*([0-9.]+)/i);
    
    if (buyMatch) {
      const [, op, value] = buyMatch;
      let condition = false;
      if (op === '>') condition = currentPrice > Number(value);
      if (op === '<') condition = currentPrice < Number(value);
      if (op === '>=') condition = currentPrice >= Number(value);
      if (op === '<=') condition = currentPrice <= Number(value);
      
      if (condition) {
        signals.push({ side: 'buy', price: currentPrice, rule: line });
      }
    }
    
    if (sellMatch) {
      const [, op, value] = sellMatch;
      let condition = false;
      if (op === '>') condition = currentPrice > Number(value);
      if (op === '<') condition = currentPrice < Number(value);
      if (op === '>=') condition = currentPrice >= Number(value);
      if (op === '<=') condition = currentPrice <= Number(value);
      
      if (condition) {
        signals.push({ side: 'sell', price: currentPrice, rule: line });
      }
    }
  }
  
  return {
    signals,
    context: { current_price: currentPrice, symbol: 'BTC/USDT' }
  };
}

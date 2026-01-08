const mongoose = require('mongoose');

const botSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['scalper', 'mean-reverter', 'trend-follower', 'grid-trader', 'arbitrage', 'market-maker', 'dca', 'momentum', 'options-hedger', 'custom-python'],
    required: true
  },
  pair: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'stopped', 'error'],
    default: 'draft'
  },
  config: {
    // Investment settings
    investment: { type: Number, required: true },
    investmentType: { type: String, enum: ['USDT', 'COIN'], default: 'USDT' },
    minInvestment: { type: Number, default: 50 },
    
    // Risk management
    leverage: { type: Number, default: 1 },
    stopLoss: { type: Number, default: 1.5 },
    takeProfit: { type: Number, default: 3 },
    maxDrawdown: { type: Number, default: 10 },
    
    // Grid settings
    gridCount: { type: Number, default: 20 },
    gridSpacing: { type: Number, default: 0.5 },
    gridStepUp: { type: Number, default: 0.5 },
    upperGrid: { type: Number },
    lowerGrid: { type: Number },
    upperPrice: { type: Number },
    lowerPrice: { type: Number },
    
    // Buffers
    buyBuffer: { type: Number, default: 0.5 },
    sellBuffer: { type: Number, default: 0.5 },
    
    // Trailing
    trailUp: { type: Number, default: 0.5 },
    trailDown: { type: Number, default: 0.5 },
    
    // Advanced
    maxPositions: { type: Number, default: 5 },
    positionSize: { type: Number, default: 10 },
    rebalanceInterval: { type: Number, default: 60 },
    
    // Time settings
    runTime: { type: String, default: '24/7' },
    startTime: { type: String, default: '00:00' },
    endTime: { type: String, default: '23:59' },
    
    // Custom Python code
    pythonCode: { type: String },
    
    // Notifications
    enableNotifications: { type: Boolean, default: true },
    profitThreshold: { type: Number, default: 5.0 },
    lossThreshold: { type: Number, default: 3.0 }
  },
  performance: {
    totalReturn: { type: Number, default: 0 },
    totalReturnPercent: { type: Number, default: 0 },
    apr: { type: Number, default: 0 },
    maxDrawdown: { type: Number, default: 0 },
    trades: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 },
    totalFees: { type: Number, default: 0 },
    sharpeRatio: { type: Number, default: 0 },
    dataPoints: { type: Number, default: 0 }
  },
  backtestResults: {
    timeframe: { type: String },
    days: { type: Number },
    totalReturn: { type: Number },
    apr: { type: Number },
    maxDrawdown: { type: Number },
    trades: { type: Number },
    winRate: { type: Number },
    sharpeRatio: { type: Number },
    executedAt: { type: Date }
  },
  trades: [{
    timestamp: { type: Date, default: Date.now },
    side: { type: String, enum: ['buy', 'sell'] },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    amount: { type: Number, required: true },
    fee: { type: Number, default: 0 },
    pnl: { type: Number, default: 0 },
    pnlPercent: { type: Number, default: 0 },
    reason: { type: String },
    orderId: { type: String },
    exchangeOrderId: { type: String }
  }],
  signals: [{
    timestamp: { type: Date, default: Date.now },
    side: { type: String, enum: ['buy', 'sell'] },
    price: { type: Number },
    reason: { type: String },
    rule: { type: String },
    quantity: { type: Number },
    executed: { type: Boolean, default: false }
  }],
  logs: [{
    timestamp: { type: Date, default: Date.now },
    level: { type: String, enum: ['info', 'warn', 'error', 'debug'] },
    message: { type: String },
    data: { type: mongoose.Schema.Types.Mixed }
  }],
  startedAt: { type: Date },
  stoppedAt: { type: Date },
  lastActivity: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update updatedAt on save
botSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to calculate performance metrics
botSchema.methods.calculatePerformance = function() {
  if (this.trades.length === 0) {
    this.performance = {
      totalReturn: 0,
      totalReturnPercent: 0,
      apr: 0,
      maxDrawdown: 0,
      trades: 0,
      winRate: 0,
      totalFees: 0,
      sharpeRatio: 0,
      dataPoints: 0
    };
    return this.performance;
  }

  const profitableTrades = this.trades.filter(t => t.pnl > 0);
  const totalPnL = this.trades.reduce((sum, t) => sum + t.pnl, 0);
  const totalFees = this.trades.reduce((sum, t) => sum + t.fee, 0);
  
  this.performance = {
    totalReturn: totalPnL,
    totalReturnPercent: (totalPnL / this.config.investment) * 100,
    apr: 0, // Will be calculated based on runtime
    maxDrawdown: 0, // Will be calculated
    trades: this.trades.length,
    winRate: (profitableTrades.length / this.trades.length) * 100,
    totalFees: totalFees,
    sharpeRatio: 0, // Will be calculated
    dataPoints: this.trades.length
  };

  return this.performance;
};

// Indexes
botSchema.index({ userId: 1 });
botSchema.index({ status: 1 });
botSchema.index({ type: 1 });
botSchema.index({ pair: 1 });
botSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Bot', botSchema);

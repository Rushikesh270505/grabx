const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
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
    enum: ['spot', 'futures', 'margin', 'savings'],
    required: true
  },
  exchange: {
    type: String,
    enum: ['binance', 'coinbase', 'kraken', 'kucoin', 'bybit'],
    required: true
  },
  apiKey: {
    type: String,
    required: true
  },
  secretKey: {
    type: String,
    required: true
  },
  passphrase: {
    type: String // Required for some exchanges like Coinbase
  },
  isActive: {
    type: Boolean,
    default: true
  },
  balances: [{
    asset: { type: String, required: true },
    free: { type: Number, default: 0 },
    locked: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    valueInUSD: { type: Number, default: 0 }
  }],
  totalBalanceUSD: {
    type: Number,
    default: 0
  },
  lastSync: {
    type: Date
  },
  permissions: {
    read: { type: Boolean, default: true },
    trade: { type: Boolean, default: true },
    withdraw: { type: Boolean, default: false }
  },
  riskSettings: {
    maxDailyLoss: { type: Number, default: 1000 },
    maxPositionSize: { type: Number, default: 5000 },
    leverageLimit: { type: Number, default: 10 },
    stopLossEnabled: { type: Boolean, default: true }
  },
  tradingStats: {
    totalVolume: { type: Number, default: 0 },
    totalTrades: { type: Number, default: 0 },
    totalPnL: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 },
    sharpeRatio: { type: Number, default: 0 },
    maxDrawdown: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update updatedAt on save
walletSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate total balance
walletSchema.methods.calculateTotalBalance = function() {
  this.totalBalanceUSD = this.balances.reduce((total, balance) => {
    return total + (balance.valueInUSD || 0);
  }, 0);
  return this.totalBalanceUSD;
};

// Method to get safe wallet data (without sensitive keys)
walletSchema.methods.toSafeJSON = function() {
  const wallet = this.toObject();
  delete wallet.apiKey;
  delete wallet.secretKey;
  delete wallet.passphrase;
  return wallet;
};

// Indexes
walletSchema.index({ userId: 1 });
walletSchema.index({ exchange: 1 });
walletSchema.index({ isActive: 1 });

module.exports = mongoose.model('Wallet', walletSchema);

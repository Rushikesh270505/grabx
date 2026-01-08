const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    avatar: { type: String },
    bio: { type: String, maxlength: 500 },
    phone: { type: String },
    country: { type: String },
    timezone: { type: String, default: 'UTC' }
  },
  preferences: {
    theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
    language: { type: String, default: 'en' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      trading: { type: Boolean, default: true },
      priceAlerts: { type: Boolean, default: true }
    }
  },
  security: {
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date }
  },
  subscription: {
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    startDate: { type: Date },
    endDate: { type: Date },
    features: [String]
  },
  stats: {
    totalTrades: { type: Number, default: 0 },
    successfulTrades: { type: Number, default: 0 },
    totalProfit: { type: Number, default: 0 },
    totalLoss: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 },
    averageProfit: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update updatedAt on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.toPublicJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.security.twoFactorSecret;
  return user;
};

// Virtual for calculating win rate
userSchema.virtual('calculatedWinRate').get(function() {
  if (this.stats.totalTrades === 0) return 0;
  return (this.stats.successfulTrades / this.stats.totalTrades) * 100;
});

// Indexes
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);

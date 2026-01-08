const express = require('express');
const Wallet = require('../models/Wallet');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all wallets for user
router.get('/', auth, async (req, res) => {
  try {
    const wallets = await Wallet.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    const safeWallets = wallets.map(wallet => wallet.toSafeJSON());
    res.json(safeWallets);
  } catch (error) {
    console.error('Get wallets error:', error);
    res.status(500).json({ error: 'Failed to get wallets' });
  }
});

// Get single wallet
router.get('/:id', auth, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json(wallet.toSafeJSON());
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ error: 'Failed to get wallet' });
  }
});

// Create new wallet
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      type,
      exchange,
      apiKey,
      secretKey,
      passphrase
    } = req.body;

    // Validate required fields
    if (!name || !type || !exchange || !apiKey || !secretKey) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, type, exchange, apiKey, secretKey' 
      });
    }

    // Check if wallet name already exists for user
    const existingWallet = await Wallet.findOne({
      userId: req.user._id,
      name
    });

    if (existingWallet) {
      return res.status(400).json({ error: 'Wallet with this name already exists' });
    }

    const wallet = new Wallet({
      userId: req.user._id,
      name,
      type,
      exchange,
      apiKey,
      secretKey,
      passphrase,
      balances: [],
      totalBalanceUSD: 0
    });

    await wallet.save();

    // Broadcast wallet update
    if (global.broadcast) {
      global.broadcast({
        type: 'wallet_created',
        data: wallet.toSafeJSON()
      });
    }

    res.status(201).json({
      message: 'Wallet created successfully',
      wallet: wallet.toSafeJSON()
    });
  } catch (error) {
    console.error('Create wallet error:', error);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
});

// Update wallet
router.put('/:id', auth, async (req, res) => {
  try {
    const allowedUpdates = [
      'name', 'type', 'isActive', 'permissions', 'riskSettings'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const wallet = await Wallet.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id
      },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Broadcast wallet update
    if (global.broadcast) {
      global.broadcast({
        type: 'wallet_updated',
        data: wallet.toSafeJSON()
      });
    }

    res.json({
      message: 'Wallet updated successfully',
      wallet: wallet.toSafeJSON()
    });
  } catch (error) {
    console.error('Update wallet error:', error);
    res.status(500).json({ error: 'Failed to update wallet' });
  }
});

// Sync wallet balances (mock implementation)
router.post('/:id/sync', auth, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Mock balance data - in production, this would call exchange APIs
    const mockBalances = [
      { asset: 'BTC', free: 0.025, locked: 0, total: 0.025, valueInUSD: 975 },
      { asset: 'ETH', free: 1.5, locked: 0, total: 1.5, valueInUSD: 3000 },
      { asset: 'USDT', free: 500, locked: 0, total: 500, valueInUSD: 500 }
    ];

    wallet.balances = mockBalances;
    wallet.lastSync = new Date();
    wallet.calculateTotalBalance();
    await wallet.save();

    // Broadcast balance update
    if (global.broadcast) {
      global.broadcast({
        type: 'wallet_balance_updated',
        data: wallet.toSafeJSON()
      });
    }

    res.json({
      message: 'Wallet synced successfully',
      balances: wallet.balances,
      totalBalanceUSD: wallet.totalBalanceUSD
    });
  } catch (error) {
    console.error('Sync wallet error:', error);
    res.status(500).json({ error: 'Failed to sync wallet' });
  }
});

// Delete wallet
router.delete('/:id', auth, async (req, res) => {
  try {
    const wallet = await Wallet.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Broadcast wallet deletion
    if (global.broadcast) {
      global.broadcast({
        type: 'wallet_deleted',
        data: { id: wallet._id }
      });
    }

    res.json({ message: 'Wallet deleted successfully' });
  } catch (error) {
    console.error('Delete wallet error:', error);
    res.status(500).json({ error: 'Failed to delete wallet' });
  }
});

// Get wallet trading stats
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).select('tradingStats');

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json(wallet.tradingStats);
  } catch (error) {
    console.error('Get wallet stats error:', error);
    res.status(500).json({ error: 'Failed to get wallet stats' });
  }
});

module.exports = router;

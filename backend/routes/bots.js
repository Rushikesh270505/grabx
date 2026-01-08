const express = require('express');
const Bot = require('../models/Bot');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all bots for user
router.get('/', auth, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    
    const query = { userId: req.user._id };
    if (status) query.status = status;
    if (type) query.type = type;

    const bots = await Bot.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Bot.countDocuments(query);

    res.json({
      bots,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get bots error:', error);
    res.status(500).json({ error: 'Failed to get bots' });
  }
});

// Get single bot
router.get('/:id', auth, async (req, res) => {
  try {
    const bot = await Bot.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    res.json(bot);
  } catch (error) {
    console.error('Get bot error:', error);
    res.status(500).json({ error: 'Failed to get bot' });
  }
});

// Create new bot
router.post('/', auth, async (req, res) => {
  try {
    const botData = {
      ...req.body,
      userId: req.user._id
    };

    const bot = new Bot(botData);
    await bot.save();

    // Broadcast bot creation
    if (global.broadcast) {
      global.broadcast({
        type: 'bot_created',
        data: bot
      });
    }

    res.status(201).json({
      message: 'Bot created successfully',
      bot
    });
  } catch (error) {
    console.error('Create bot error:', error);
    res.status(500).json({ error: 'Failed to create bot' });
  }
});

// Update bot
router.put('/:id', auth, async (req, res) => {
  try {
    const allowedUpdates = [
      'name', 'config', 'status'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const bot = await Bot.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id
      },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    // Broadcast bot update
    if (global.broadcast) {
      global.broadcast({
        type: 'bot_updated',
        data: bot
      });
    }

    res.json({
      message: 'Bot updated successfully',
      bot
    });
  } catch (error) {
    console.error('Update bot error:', error);
    res.status(500).json({ error: 'Failed to update bot' });
  }
});

// Start bot
router.post('/:id/start', auth, async (req, res) => {
  try {
    const bot = await Bot.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    if (bot.status === 'active') {
      return res.status(400).json({ error: 'Bot is already active' });
    }

    bot.status = 'active';
    bot.startedAt = new Date();
    bot.lastActivity = new Date();
    
    // Add log entry
    bot.logs.push({
      level: 'info',
      message: 'Bot started successfully',
      data: { startedAt: bot.startedAt }
    });

    await bot.save();

    // Broadcast bot start
    if (global.broadcast) {
      global.broadcast({
        type: 'bot_started',
        data: bot
      });
    }

    res.json({
      message: 'Bot started successfully',
      bot
    });
  } catch (error) {
    console.error('Start bot error:', error);
    res.status(500).json({ error: 'Failed to start bot' });
  }
});

// Stop bot
router.post('/:id/stop', auth, async (req, res) => {
  try {
    const bot = await Bot.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    if (bot.status !== 'active') {
      return res.status(400).json({ error: 'Bot is not active' });
    }

    bot.status = 'stopped';
    bot.stoppedAt = new Date();
    
    // Add log entry
    bot.logs.push({
      level: 'info',
      message: 'Bot stopped successfully',
      data: { stoppedAt: bot.stoppedAt }
    });

    await bot.save();

    // Broadcast bot stop
    if (global.broadcast) {
      global.broadcast({
        type: 'bot_stopped',
        data: bot
      });
    }

    res.json({
      message: 'Bot stopped successfully',
      bot
    });
  } catch (error) {
    console.error('Stop bot error:', error);
    res.status(500).json({ error: 'Failed to stop bot' });
  }
});

// Delete bot
router.delete('/:id', auth, async (req, res) => {
  try {
    const bot = await Bot.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    // Broadcast bot deletion
    if (global.broadcast) {
      global.broadcast({
        type: 'bot_deleted',
        data: { id: bot._id }
      });
    }

    res.json({ message: 'Bot deleted successfully' });
  } catch (error) {
    console.error('Delete bot error:', error);
    res.status(500).json({ error: 'Failed to delete bot' });
  }
});

// Get bot trades
router.get('/:id/trades', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const bot = await Bot.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    const trades = bot.trades
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice((page - 1) * limit, page * limit);

    const total = bot.trades.length;

    res.json({
      trades,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get bot trades error:', error);
    res.status(500).json({ error: 'Failed to get bot trades' });
  }
});

// Get bot signals
router.get('/:id/signals', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const bot = await Bot.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    const signals = bot.signals
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice((page - 1) * limit, page * limit);

    const total = bot.signals.length;

    res.json({
      signals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get bot signals error:', error);
    res.status(500).json({ error: 'Failed to get bot signals' });
  }
});

// Get bot logs
router.get('/:id/logs', auth, async (req, res) => {
  try {
    const { page = 1, limit = 100, level } = req.query;
    
    const bot = await Bot.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    let logs = bot.logs.sort((a, b) => b.timestamp - a.timestamp);
    
    if (level) {
      logs = logs.filter(log => log.level === level);
    }

    const paginatedLogs = logs.slice((page - 1) * limit, page * limit);
    const total = logs.length;

    res.json({
      logs: paginatedLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get bot logs error:', error);
    res.status(500).json({ error: 'Failed to get bot logs' });
  }
});

module.exports = router;

const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -security.twoFactorSecret');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = {};
    const allowedFields = [
      'profile.firstName',
      'profile.lastName',
      'profile.bio',
      'profile.phone',
      'profile.country',
      'profile.timezone',
      'preferences.theme',
      'preferences.language',
      'preferences.notifications.email',
      'preferences.notifications.push',
      'preferences.notifications.trading',
      'preferences.notifications.priceAlerts'
    ];

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        const keys = key.split('.');
        if (keys.length === 2) {
          if (!updates[keys[0]]) updates[keys[0]] = {};
          updates[keys[0]][keys[1]] = req.body[key];
        } else {
          updates[key] = req.body[key];
        }
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -security.twoFactorSecret');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload avatar
router.post('/avatar', auth, async (req, res) => {
  try {
    // In production, you'd use multer or similar to handle file uploads
    // For now, we'll simulate with a placeholder
    const avatarUrl = `https://ui-avatars.com/api/?name=${req.user.username}&background=random`;
    
    await User.findByIdAndUpdate(
      req.user._id,
      { 'profile.avatar': avatarUrl }
    );

    res.json({
      message: 'Avatar updated successfully',
      avatar: avatarUrl
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Get user stats
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('stats');
    res.json(user.stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Get user preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('preferences');
    res.json(user.preferences);
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to get preferences' });
  }
});

// Update user preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { preferences: req.body } },
      { new: true, runValidators: true }
    ).select('preferences');

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Delete account
router.delete('/account', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;

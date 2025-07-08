const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// Get notifications for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('fromUser', 'username displayName')
      .populate('post', 'content');
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete all notifications for logged-in user
router.delete('/all', auth, async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user.id });
    res.json({ message: 'All notifications deleted' });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read for logged-in user
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    const updateResult = await Notification.updateMany({ user: req.user.id, read: false }, { $set: { read: true } });
    console.log('Mark all as read update result:', updateResult);
    const updatedNotifications = await Notification.find({ user: req.user.id });
    console.log('Notifications after mark all as read:', updatedNotifications.map(n => ({ _id: n._id, read: n.read })));
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

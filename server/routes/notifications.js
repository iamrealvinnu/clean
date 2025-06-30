const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const User = require('../models/User');
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    title: 'Collection Completed',
    message: 'Your waste collection has been completed for today.',
    type: 'success',
    timestamp: new Date(Date.now() - 300000),
    read: false
  },
  {
    id: 2,
    title: 'Schedule Update',
    message: 'Tomorrow\'s collection time has been updated to 8:00 AM.',
    type: 'info',
    timestamp: new Date(Date.now() - 1800000),
    read: false
  },
  {
    id: 3,
    title: 'Report Resolved',
    message: 'Your recent report has been resolved. Thank you for your feedback.',
    type: 'success',
    timestamp: new Date(Date.now() - 3600000),
    read: true
  }
];

// Get notifications
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Filter notifications based on user role and return limited results
    const notifications = mockNotifications.slice(0, parseInt(limit));
    
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const notification = mockNotifications.find(n => n.id === notificationId);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    notification.read = true;
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    mockNotifications.forEach(notification => {
      notification.read = true;
    });
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get unread count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = mockNotifications.filter(n => !n.read).length;
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
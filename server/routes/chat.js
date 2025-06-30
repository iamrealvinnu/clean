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

// Mock conversations data
const mockConversations = [
  {
    id: 1,
    participants: ['user1', 'user2'],
    lastMessage: 'Collection completed successfully',
    lastMessageTime: new Date(),
    unreadCount: 0
  }
];

// Mock messages data
const mockMessages = [
  {
    id: 1,
    conversationId: 1,
    senderId: 'user1',
    message: 'Hello, when is the next collection?',
    timestamp: new Date(Date.now() - 3600000),
    type: 'text'
  },
  {
    id: 2,
    conversationId: 1,
    senderId: 'user2',
    message: 'Collection is scheduled for tomorrow at 8 AM',
    timestamp: new Date(Date.now() - 1800000),
    type: 'text'
  }
];

// Get conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    res.json({ success: true, conversations: mockConversations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get messages for a conversation
router.get('/conversations/:id/messages', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const conversationId = parseInt(req.params.id);
    
    const messages = mockMessages.filter(m => m.conversationId === conversationId);
    
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Send message
router.post('/messages', auth, async (req, res) => {
  try {
    const { recipientId, message, type = 'text' } = req.body;
    
    const newMessage = {
      id: Date.now(),
      senderId: req.user._id,
      recipientId,
      message,
      type,
      timestamp: new Date()
    };
    
    mockMessages.push(newMessage);
    
    // Emit real-time message
    req.io.to(recipientId).emit('new_message', newMessage);
    
    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark messages as read
router.put('/conversations/:id/read', auth, async (req, res) => {
  try {
    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
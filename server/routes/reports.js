const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
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

// Get all reports
router.get('/', auth, async (req, res) => {
  try {
    const { status, type, ward, limit = 50 } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (ward) filter['location.ward'] = ward;
    
    // If user is not admin, only show their reports
    if (req.user.role !== 'admin') {
      filter.user = req.user._id;
    }

    const reports = await Report.find(filter)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get specific report
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email')
      .populate('updates.updatedBy', 'name email');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new report
router.post('/', auth, async (req, res) => {
  try {
    const reportData = {
      ...req.body,
      user: req.user._id
    };

    const report = new Report(reportData);
    await report.save();
    
    // Populate user data
    await report.populate('user', 'name email');
    
    // Emit real-time notification
    req.io.emit('new_report', {
      report,
      timestamp: new Date()
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update report
router.put('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    Object.assign(report, req.body);
    await report.save();
    
    // Add update entry
    if (req.body.status && req.body.status !== report.status) {
      await report.addUpdate(`Status changed to ${req.body.status}`, req.user._id, 'status');
    }

    // Emit real-time update
    req.io.emit('report_updated', {
      reportId: report._id,
      status: report.status,
      timestamp: new Date()
    });

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add report update
router.post('/:id/updates', auth, async (req, res) => {
  try {
    const { message, type = 'comment' } = req.body;
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    await report.addUpdate(message, req.user._id, type);
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Vote on report
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { vote } = req.body; // 'up' or 'down'
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Remove existing vote from this user
    report.votes.voters = report.votes.voters.filter(
      voter => voter.user.toString() !== req.user._id.toString()
    );

    // Add new vote
    report.votes.voters.push({ user: req.user._id, vote });
    
    // Update vote counts
    const upvotes = report.votes.voters.filter(v => v.vote === 'up').length;
    const downvotes = report.votes.voters.filter(v => v.vote === 'down').length;
    
    report.votes.upvotes = upvotes;
    report.votes.downvotes = downvotes;
    
    await report.save();
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
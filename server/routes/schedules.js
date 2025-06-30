const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
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

// Get schedules
router.get('/', auth, async (req, res) => {
  try {
    const { ward, driver, date, upcoming } = req.query;
    const filter = {};
    
    if (ward) filter.ward = ward;
    if (driver) filter.driver = driver;
    if (date) {
      const targetDate = new Date(date);
      filter.scheduledDate = {
        $gte: targetDate.setHours(0, 0, 0, 0),
        $lt: targetDate.setHours(23, 59, 59, 999)
      };
    }
    if (upcoming) {
      filter.scheduledDate = { $gte: new Date() };
    }

    const schedules = await Schedule.find(filter)
      .populate('vehicle', 'vehicleId type')
      .populate('driver', 'name email')
      .sort({ scheduledDate: 1 });

    res.json({ success: true, schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get specific schedule
router.get('/:id', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('vehicle', 'vehicleId type capacity')
      .populate('driver', 'name email phone');

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    res.json({ success: true, schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new schedule (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const schedule = new Schedule(req.body);
    await schedule.save();
    
    await schedule.populate('vehicle', 'vehicleId type');
    await schedule.populate('driver', 'name email');

    res.status(201).json({ success: true, schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update schedule
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'driver') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('vehicle', 'vehicleId type')
     .populate('driver', 'name email');

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    res.json({ success: true, schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Start collection
router.post('/:id/start', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    await schedule.startCollection();
    
    // Emit real-time notification
    req.io.to(`ward_${schedule.ward}`).emit('collection_notification', {
      type: 'started',
      scheduleId: schedule._id,
      ward: schedule.ward,
      message: 'Waste collection has started in your area',
      timestamp: new Date()
    });

    res.json({ success: true, schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Complete collection
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    const stats = req.body;
    await schedule.completeCollection();
    
    // Update performance metrics
    if (stats) {
      schedule.performance = {
        ...schedule.performance,
        ...stats
      };
      await schedule.save();
    }
    
    // Emit real-time notification
    req.io.to(`ward_${schedule.ward}`).emit('collection_notification', {
      type: 'completed',
      scheduleId: schedule._id,
      ward: schedule.ward,
      stats,
      message: 'Waste collection completed in your area',
      timestamp: new Date()
    });

    res.json({ success: true, schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
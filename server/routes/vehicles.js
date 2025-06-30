const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
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

// Get all vehicles
router.get('/', auth, async (req, res) => {
  try {
    const { ward } = req.query;
    const filter = ward ? { 'route.ward': ward } : {};
    
    const vehicles = await Vehicle.find(filter).populate('driver', 'name email');
    res.json({ success: true, vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get specific vehicle
router.get('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('driver', 'name email');
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    res.json({ success: true, vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update vehicle location
router.put('/:id/location', auth, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    await vehicle.updateLocation(lat, lng);
    
    // Emit real-time update
    req.io.emit('vehicle_location_update', {
      vehicleId: vehicle.vehicleId,
      lat,
      lng,
      timestamp: new Date()
    });

    res.json({ success: true, vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update vehicle status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    await vehicle.updateStatus(status);
    
    // Emit real-time update
    req.io.emit('vehicle_status_update', {
      vehicleId: vehicle.vehicleId,
      status,
      timestamp: new Date()
    });

    res.json({ success: true, vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new vehicle (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    
    res.status(201).json({ success: true, vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update vehicle (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    res.json({ success: true, vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Vehicle = require('../models/Vehicle');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

// Get dashboard stats
router.get('/dashboard', auth, async (req, res) => {
  try {
    const { ward } = req.query;
    const filter = ward ? { ward } : {};

    const [
      totalUsers,
      totalVehicles,
      totalReports,
      activeVehicles,
      openReports,
      todayCollections
    ] = await Promise.all([
      User.countDocuments(filter),
      Vehicle.countDocuments(),
      Report.countDocuments(),
      Vehicle.countDocuments({ status: 'on-route' }),
      Report.countDocuments({ status: 'open' }),
      Schedule.countDocuments({ 
        scheduledDate: {
          $gte: new Date().setHours(0, 0, 0, 0),
          $lt: new Date().setHours(23, 59, 59, 999)
        },
        status: 'completed'
      })
    ]);

    const stats = {
      totalUsers,
      totalVehicles,
      totalReports,
      activeVehicles,
      openReports,
      todayCollections,
      efficiencyRate: totalReports > 0 ? ((totalReports - openReports) / totalReports * 100).toFixed(1) : 0
    };

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get collection statistics
router.get('/collection', auth, async (req, res) => {
  try {
    const { period = '7d', ward } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    const filter = { scheduledDate: { $gte: startDate } };
    if (ward) filter.ward = ward;

    const schedules = await Schedule.find(filter);
    
    // Group by date
    const data = {};
    schedules.forEach(schedule => {
      const date = schedule.scheduledDate.toISOString().split('T')[0];
      if (!data[date]) {
        data[date] = { date, collected: 0, missed: 0, efficiency: 0 };
      }
      
      if (schedule.status === 'completed') {
        data[date].collected++;
      } else if (schedule.status === 'cancelled') {
        data[date].missed++;
      }
    });

    // Calculate efficiency
    Object.values(data).forEach(day => {
      const total = day.collected + day.missed;
      day.efficiency = total > 0 ? (day.collected / total * 100).toFixed(1) : 0;
    });

    const kpis = {
      totalCollections: schedules.filter(s => s.status === 'completed').length,
      missedCollections: schedules.filter(s => s.status === 'cancelled').length,
      efficiencyRate: schedules.length > 0 ? 
        (schedules.filter(s => s.status === 'completed').length / schedules.length * 100).toFixed(1) : 0,
      avgResponseTime: '2.4' // Mock data
    };

    res.json({ 
      success: true, 
      data: Object.values(data).sort((a, b) => new Date(a.date) - new Date(b.date)),
      kpis 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get vehicle performance
router.get('/vehicles/:id?', auth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const { id } = req.params;
    
    const filter = id ? { _id: id } : {};
    const vehicles = await Vehicle.find(filter).populate('driver', 'name');
    
    const data = vehicles.map(vehicle => ({
      vehicleId: vehicle.vehicleId,
      efficiency: Math.floor(Math.random() * 30) + 70, // Mock data
      fuelConsumption: Math.floor(Math.random() * 20) + 30,
      maintenanceScore: Math.floor(Math.random() * 30) + 70,
      hoursActive: Math.floor(Math.random() * 8) + 4,
      collectionsCompleted: Math.floor(Math.random() * 50) + 20,
      driver: vehicle.driver?.name || 'Unassigned'
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get report analytics
router.get('/reports', auth, async (req, res) => {
  try {
    const { period = '30d', ward } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    const filter = { createdAt: { $gte: startDate } };
    if (ward) filter['location.ward'] = ward;

    const reports = await Report.find(filter);
    
    // Group by date
    const trends = {};
    reports.forEach(report => {
      const date = report.createdAt.toISOString().split('T')[0];
      if (!trends[date]) {
        trends[date] = { date, submitted: 0, resolved: 0, avgResolutionTime: 0 };
      }
      
      trends[date].submitted++;
      if (report.status === 'resolved') {
        trends[date].resolved++;
        // Mock resolution time calculation
        trends[date].avgResolutionTime = Math.floor(Math.random() * 48) + 2;
      }
    });

    res.json({ 
      success: true, 
      trends: Object.values(trends).sort((a, b) => new Date(a.date) - new Date(b.date))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get waste analytics
router.get('/waste', auth, async (req, res) => {
  try {
    const { period = '30d', ward } = req.query;
    
    // Mock waste composition data
    const composition = [
      { name: 'Organic', value: 45, color: '#4CAF50' },
      { name: 'Recyclable', value: 30, color: '#2196F3' },
      { name: 'Hazardous', value: 15, color: '#FF9800' },
      { name: 'Electronic', value: 10, color: '#9C27B0' }
    ];

    // Mock trends data
    const trends = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trends.push({
        date: date.toISOString().split('T')[0],
        organic: Math.floor(Math.random() * 20) + 40,
        recyclable: Math.floor(Math.random() * 15) + 25,
        hazardous: Math.floor(Math.random() * 10) + 10,
        electronic: Math.floor(Math.random() * 8) + 7
      });
    }

    res.json({ success: true, composition, trends });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
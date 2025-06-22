const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Schedule = require('../models/Schedule');
const Vehicle = require('../models/Vehicle');

// Mock data for when database is empty
const mockSchedules = [
  { day: 'Monday', time: '7:00 AM - 12:45 PM', type: 'Organic Waste', ward: 'Ward 1' },
  { day: 'Wednesday', time: '7:00 AM - 12:45 PM', type: 'Recyclables', ward: 'Ward 1' },
  { day: 'Friday', time: '7:00 AM - 12:00 PM', type: 'Hazardous Waste', ward: 'Ward 1' },
];

const mockVehicles = [
  { vehicleId: 'KA01AB1234', lat: 12.9716, lng: 77.5946, status: 'On Route', lastUpdated: new Date() },
  { vehicleId: 'KA01CD5678', lat: 12.975, lng: 77.6, status: 'Idle', lastUpdated: new Date() },
];

// Get schedules
router.get('/schedules', async (req, res) => {
  try {
    let schedules = await Schedule.find();
    if (schedules.length === 0) {
      // If no schedules in DB, return mock data
      schedules = mockSchedules;
    }
    res.json(schedules);
  } catch (err) {
    console.error('Error fetching schedules:', err);
    res.json(mockSchedules); // Fallback to mock data
  }
});

// Get vehicle tracking
router.get('/tracking', async (req, res) => {
  try {
    let vehicles = await Vehicle.find().populate('driver');
    if (vehicles.length === 0) {
      // If no vehicles in DB, return mock data
      vehicles = mockVehicles;
    }
    res.json(vehicles);
  } catch (err) {
    console.error('Error fetching vehicles:', err);
    res.json(mockVehicles); // Fallback to mock data
  }
});

// Submit report
router.post('/report', async (req, res) => {
  try {
    const { type, details, photo } = req.body;
    const report = new Report({
      type,
      details,
      user: '507f1f77bcf86cd799439011', // Mock user ID
      status: 'Open'
    });
    await report.save();
    res.json({ message: 'Report submitted successfully', report });
  } catch (err) {
    console.error('Error submitting report:', err);
    res.status(500).json({ message: 'Error submitting report' });
  }
});

// Get user reports
router.get('/reports', async (req, res) => {
  try {
    let reports = await Report.find({ user: '507f1f77bcf86cd799439011' }).sort({ createdAt: -1 });
    if (reports.length === 0) {
      // If no reports, return mock data
      reports = [
        { type: 'Missed Collection', details: 'No pickup on Monday', status: 'Resolved', createdAt: new Date() },
        { type: 'Complaint', details: 'Truck was late', status: 'In Progress', createdAt: new Date() },
        { type: 'Suggestion', details: 'Add more bins in park', status: 'Open', createdAt: new Date() },
      ];
    }
    res.json(reports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.json([
      { type: 'Missed Collection', details: 'No pickup on Monday', status: 'Resolved', createdAt: new Date() },
      { type: 'Complaint', details: 'Truck was late', status: 'In Progress', createdAt: new Date() },
    ]);
  }
});

// Update report status
router.put('/reports/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(report);
  } catch (err) {
    console.error('Error updating report:', err);
    res.status(500).json({ message: 'Error updating report' });
  }
});

// Get analytics
router.get('/analytics', async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const openReports = await Report.countDocuments({ status: 'Open' });
    const resolvedReports = await Report.countDocuments({ status: 'Closed' });
    const totalVehicles = await Vehicle.countDocuments();
    
    res.json({
      totalReports: totalReports || 15,
      openReports: openReports || 3,
      resolvedReports: resolvedReports || 12,
      totalVehicles: totalVehicles || 2,
      resolutionRate: totalReports > 0 ? (resolvedReports / totalReports * 100).toFixed(1) : 80
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.json({
      totalReports: 15,
      openReports: 3,
      resolvedReports: 12,
      totalVehicles: 2,
      resolutionRate: 80
    });
  }
});

module.exports = router;
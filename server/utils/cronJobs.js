const cron = require('cron');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Report = require('../models/Report');

const startCronJobs = (io) => {
  
  // Daily schedule notifications (runs at 6 AM)
  const scheduleNotificationJob = new cron.CronJob('0 6 * * *', async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todaySchedules = await Schedule.find({
        scheduledDate: {
          $gte: today,
          $lt: tomorrow
        },
        status: 'scheduled'
      }).populate('driver vehicle');

      // Group schedules by ward
      const schedulesByWard = {};
      todaySchedules.forEach(schedule => {
        if (!schedulesByWard[schedule.ward]) {
          schedulesByWard[schedule.ward] = [];
        }
        schedulesByWard[schedule.ward].push(schedule);
      });

      // Send notifications to each ward
      Object.keys(schedulesByWard).forEach(ward => {
        io.to(`ward_${ward}`).emit('daily_schedule_notification', {
          ward,
          schedules: schedulesByWard[ward],
          message: `Today's waste collection schedule for ${ward}`,
          timestamp: new Date()
        });
      });

      console.log(`📅 Daily schedule notifications sent for ${todaySchedules.length} schedules`);
    } catch (error) {
      console.error('Schedule notification job error:', error);
    }
  });

  // Vehicle maintenance alerts (runs every hour)
  const maintenanceAlertJob = new cron.CronJob('0 * * * *', async () => {
    try {
      const vehicles = await Vehicle.find({
        isActive: true,
        'maintenance.nextService': {
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        }
      }).populate('driver');

      vehicles.forEach(vehicle => {
        io.to('role_admin').emit('maintenance_alert', {
          vehicleId: vehicle.vehicleId,
          driver: vehicle.driver.name,
          nextService: vehicle.maintenance.nextService,
          message: `Vehicle ${vehicle.vehicleId} requires maintenance within 7 days`,
          timestamp: new Date()
        });
      });

      if (vehicles.length > 0) {
        console.log(`🔧 Maintenance alerts sent for ${vehicles.length} vehicles`);
      }
    } catch (error) {
      console.error('Maintenance alert job error:', error);
    }
  });

  // Auto-resolve old reports (runs daily at midnight)
  const autoResolveJob = new cron.CronJob('0 0 * * *', async () => {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const result = await Report.updateMany(
        {
          status: 'open',
          createdAt: { $lte: thirtyDaysAgo },
          type: { $in: ['suggestion', 'complaint'] }
        },
        {
          status: 'closed',
          resolvedAt: new Date(),
          $push: {
            updates: {
              message: 'Auto-closed due to inactivity (30 days)',
              type: 'resolution',
              timestamp: new Date()
            }
          }
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`📋 Auto-resolved ${result.modifiedCount} old reports`);
      }
    } catch (error) {
      console.error('Auto-resolve job error:', error);
    }
  });

  // Performance analytics (runs daily at 1 AM)
  const analyticsJob = new cron.CronJob('0 1 * * *', async () => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const today = new Date(yesterday);
      today.setDate(today.getDate() + 1);

      // Calculate daily performance metrics
      const completedSchedules = await Schedule.find({
        scheduledDate: { $gte: yesterday, $lt: today },
        status: 'completed'
      });

      const totalSchedules = await Schedule.find({
        scheduledDate: { $gte: yesterday, $lt: today }
      });

      const completionRate = totalSchedules.length > 0 
        ? (completedSchedules.length / totalSchedules.length) * 100 
        : 0;

      // Send analytics to admin dashboard
      io.to('role_admin').emit('daily_analytics', {
        date: yesterday,
        completionRate,
        totalSchedules: totalSchedules.length,
        completedSchedules: completedSchedules.length,
        timestamp: new Date()
      });

      console.log(`📊 Daily analytics calculated: ${completionRate.toFixed(1)}% completion rate`);
    } catch (error) {
      console.error('Analytics job error:', error);
    }
  });

  // Start all jobs
  scheduleNotificationJob.start();
  maintenanceAlertJob.start();
  autoResolveJob.start();
  analyticsJob.start();

  console.log('⏰ Cron jobs started successfully');

  return {
    scheduleNotificationJob,
    maintenanceAlertJob,
    autoResolveJob,
    analyticsJob
  };
};

module.exports = { startCronJobs };
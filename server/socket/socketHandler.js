const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketHandler = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.userWard = user.ward;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Join user to their ward room
    if (socket.userWard) {
      socket.join(`ward_${socket.userWard}`);
    }

    // Join user to their role room
    socket.join(`role_${socket.userRole}`);

    // Vehicle tracking for drivers
    if (socket.userRole === 'driver') {
      socket.on('update_location', async (data) => {
        try {
          const { lat, lng, vehicleId } = data;
          
          // Broadcast location update to all users in the ward
          socket.to(`ward_${socket.userWard}`).emit('vehicle_location_update', {
            vehicleId,
            lat,
            lng,
            timestamp: new Date(),
            driverId: socket.userId
          });

          // Broadcast to admin dashboard
          socket.to('role_admin').emit('vehicle_location_update', {
            vehicleId,
            lat,
            lng,
            timestamp: new Date(),
            driverId: socket.userId,
            ward: socket.userWard
          });

        } catch (error) {
          socket.emit('error', { message: 'Failed to update location' });
        }
      });

      socket.on('update_status', (data) => {
        const { status, vehicleId } = data;
        
        // Broadcast status update
        io.emit('vehicle_status_update', {
          vehicleId,
          status,
          timestamp: new Date(),
          driverId: socket.userId
        });
      });
    }

    // Real-time chat
    socket.on('send_message', (data) => {
      const { recipientId, message, type } = data;
      
      // Send to specific user
      socket.to(recipientId).emit('new_message', {
        senderId: socket.userId,
        message,
        type,
        timestamp: new Date()
      });
    });

    // Report updates
    socket.on('report_update', (data) => {
      const { reportId, status, message } = data;
      
      // Notify relevant users
      io.emit('report_status_update', {
        reportId,
        status,
        message,
        timestamp: new Date(),
        updatedBy: socket.userId
      });
    });

    // Emergency alerts
    socket.on('emergency_alert', (data) => {
      if (socket.userRole === 'admin' || socket.userRole === 'supervisor') {
        io.emit('emergency_alert', {
          ...data,
          timestamp: new Date(),
          alertedBy: socket.userId
        });
      }
    });

    // Collection notifications
    socket.on('collection_started', (data) => {
      const { scheduleId, ward } = data;
      
      // Notify residents in the ward
      socket.to(`ward_${ward}`).emit('collection_notification', {
        type: 'started',
        scheduleId,
        message: 'Waste collection has started in your area',
        timestamp: new Date()
      });
    });

    socket.on('collection_completed', (data) => {
      const { scheduleId, ward, stats } = data;
      
      // Notify residents and admin
      socket.to(`ward_${ward}`).emit('collection_notification', {
        type: 'completed',
        scheduleId,
        stats,
        message: 'Waste collection completed in your area',
        timestamp: new Date()
      });

      socket.to('role_admin').emit('collection_completed', {
        scheduleId,
        ward,
        stats,
        timestamp: new Date()
      });
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });

  return io;
};

module.exports = socketHandler;
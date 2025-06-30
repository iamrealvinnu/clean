import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  // Vehicle tracking
  updateLocation(lat, lng, vehicleId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('update_location', { lat, lng, vehicleId });
    }
  }

  updateVehicleStatus(status, vehicleId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('update_status', { status, vehicleId });
    }
  }

  // Real-time messaging
  sendMessage(recipientId, message, type = 'text') {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', { recipientId, message, type });
    }
  }

  // Report updates
  updateReport(reportId, status, message) {
    if (this.socket && this.isConnected) {
      this.socket.emit('report_update', { reportId, status, message });
    }
  }

  // Emergency alerts
  sendEmergencyAlert(type, message, location) {
    if (this.socket && this.isConnected) {
      this.socket.emit('emergency_alert', { type, message, location });
    }
  }

  // Collection notifications
  notifyCollectionStarted(scheduleId, ward) {
    if (this.socket && this.isConnected) {
      this.socket.emit('collection_started', { scheduleId, ward });
    }
  }

  notifyCollectionCompleted(scheduleId, ward, stats) {
    if (this.socket && this.isConnected) {
      this.socket.emit('collection_completed', { scheduleId, ward, stats });
    }
  }

  // Event listeners
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Store listener for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      // Remove from stored listeners
      if (this.listeners.has(event)) {
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }

  // Convenience methods for common events
  onVehicleLocationUpdate(callback) {
    this.on('vehicle_location_update', callback);
  }

  onVehicleStatusUpdate(callback) {
    this.on('vehicle_status_update', callback);
  }

  onNewMessage(callback) {
    this.on('new_message', callback);
  }

  onReportStatusUpdate(callback) {
    this.on('report_status_update', callback);
  }

  onEmergencyAlert(callback) {
    this.on('emergency_alert', callback);
  }

  onCollectionNotification(callback) {
    this.on('collection_notification', callback);
  }

  onDailyScheduleNotification(callback) {
    this.on('daily_schedule_notification', callback);
  }

  onMaintenanceAlert(callback) {
    this.on('maintenance_alert', callback);
  }

  onDailyAnalytics(callback) {
    this.on('daily_analytics', callback);
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
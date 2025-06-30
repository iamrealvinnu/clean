const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicleId: {
    type: String,
    required: [true, 'Vehicle ID is required'],
    unique: true,
    uppercase: true,
    match: [/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/, 'Invalid vehicle number format']
  },
  type: {
    type: String,
    enum: ['compactor', 'tipper', 'auto', 'mini-truck'],
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: [100, 'Capacity must be at least 100 kg']
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentLocation: {
    lat: {
      type: Number,
      required: true,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    lng: {
      type: Number,
      required: true,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  },
  status: {
    type: String,
    enum: ['idle', 'on-route', 'collecting', 'maintenance', 'offline'],
    default: 'idle'
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  },
  currentLoad: {
    type: Number,
    default: 0,
    min: [0, 'Load cannot be negative'],
    validate: {
      validator: function(value) {
        return value <= this.capacity;
      },
      message: 'Current load cannot exceed vehicle capacity'
    }
  },
  fuelLevel: {
    type: Number,
    min: [0, 'Fuel level cannot be negative'],
    max: [100, 'Fuel level cannot exceed 100%'],
    default: 100
  },
  maintenance: {
    lastService: Date,
    nextService: Date,
    mileage: { type: Number, default: 0 },
    issues: [{
      description: String,
      reportedAt: { type: Date, default: Date.now },
      severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
      resolved: { type: Boolean, default: false }
    }]
  },
  sensors: {
    gps: { type: Boolean, default: true },
    weightSensor: { type: Boolean, default: false },
    fuelSensor: { type: Boolean, default: false },
    temperatureSensor: { type: Boolean, default: false }
  },
  performance: {
    totalDistance: { type: Number, default: 0 },
    totalCollections: { type: Number, default: 0 },
    averageSpeed: { type: Number, default: 0 },
    fuelEfficiency: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
vehicleSchema.index({ vehicleId: 1 });
vehicleSchema.index({ driver: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ 'currentLocation.lat': 1, 'currentLocation.lng': 1 });

// Update location method
vehicleSchema.methods.updateLocation = function(lat, lng) {
  this.currentLocation = { lat, lng };
  this.lastUpdated = new Date();
  return this.save();
};

// Update status method
vehicleSchema.methods.updateStatus = function(status) {
  this.status = status;
  this.lastUpdated = new Date();
  return this.save();
};

// Calculate distance traveled
vehicleSchema.methods.calculateDistance = function(newLat, newLng) {
  const R = 6371; // Earth's radius in km
  const dLat = (newLat - this.currentLocation.lat) * Math.PI / 180;
  const dLng = (newLng - this.currentLocation.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.currentLocation.lat * Math.PI / 180) * Math.cos(newLat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

module.exports = mongoose.model('Vehicle', vehicleSchema);
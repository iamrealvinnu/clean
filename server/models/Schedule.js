const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  ward: {
    type: String,
    required: true
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wasteType: {
    type: String,
    enum: ['organic', 'recyclable', 'hazardous', 'electronic', 'mixed'],
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    start: { type: String, required: true }, // "07:00"
    end: { type: String, required: true }     // "12:00"
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'bi-weekly', 'monthly'],
    default: 'weekly'
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'delayed'],
    default: 'scheduled'
  },
  estimatedDuration: Number, // in minutes
  actualStartTime: Date,
  actualEndTime: Date,
  collectionPoints: [{
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    estimatedTime: String,
    actualTime: Date,
    status: {
      type: String,
      enum: ['pending', 'collected', 'missed', 'partial'],
      default: 'pending'
    },
    notes: String
  }],
  performance: {
    onTimePercentage: Number,
    collectionEfficiency: Number,
    fuelUsed: Number,
    distanceCovered: Number
  },
  weather: {
    condition: String,
    temperature: Number,
    humidity: Number
  },
  notes: String,
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: String,
    daysOfWeek: [Number], // 0-6 (Sunday-Saturday)
    endDate: Date
  }
}, {
  timestamps: true
});

// Indexes
scheduleSchema.index({ ward: 1, scheduledDate: 1 });
scheduleSchema.index({ vehicle: 1, scheduledDate: 1 });
scheduleSchema.index({ driver: 1, scheduledDate: 1 });
scheduleSchema.index({ status: 1, scheduledDate: 1 });

// Start collection method
scheduleSchema.methods.startCollection = function() {
  this.status = 'in-progress';
  this.actualStartTime = new Date();
  return this.save();
};

// Complete collection method
scheduleSchema.methods.completeCollection = function() {
  this.status = 'completed';
  this.actualEndTime = new Date();
  
  // Calculate performance metrics
  const scheduledDuration = this.estimatedDuration;
  const actualDuration = (this.actualEndTime - this.actualStartTime) / (1000 * 60); // minutes
  
  this.performance = {
    ...this.performance,
    onTimePercentage: Math.min(100, (scheduledDuration / actualDuration) * 100)
  };
  
  return this.save();
};

module.exports = mongoose.model('Schedule', scheduleSchema);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['resident', 'driver', 'admin', 'supervisor'],
    default: 'resident'
  },
  ward: {
    type: String,
    required: function() {
      return this.role === 'resident' || this.role === 'driver';
    }
  },
  phone: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  address: {
    street: String,
    area: String,
    pincode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  profile: {
    avatar: String,
    bio: String,
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true }
      },
      language: { type: String, default: 'en' },
      theme: { type: String, default: 'light' }
    }
  },
  points: {
    type: Number,
    default: 0
  },
  badges: [{
    name: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: function() {
      return this.role === 'driver';
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance (removed duplicate email index)
userSchema.index({ role: 1, ward: 1 });
userSchema.index({ points: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Add points method
userSchema.methods.addPoints = function(points, reason) {
  this.points += points;
  return this.save();
};

// Get user stats
userSchema.methods.getStats = async function() {
  const Report = mongoose.model('Report');
  const stats = await Report.aggregate([
    { $match: { user: this._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return {
    totalReports: stats.reduce((sum, stat) => sum + stat.count, 0),
    resolvedReports: stats.find(s => s._id === 'resolved')?.count || 0,
    pendingReports: stats.find(s => s._id === 'pending')?.count || 0,
    points: this.points,
    badges: this.badges.length
  };
};

module.exports = mongoose.model('User', userSchema);
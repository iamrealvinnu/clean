const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['missed-collection', 'overflow', 'damage', 'complaint', 'suggestion', 'hazard', 'illegal-dumping'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  location: {
    address: String,
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    ward: String
  },
  images: [{
    url: String,
    caption: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'assigned', 'in-progress', 'resolved', 'closed', 'rejected'],
    default: 'open'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: Date,
  resolvedAt: Date,
  estimatedResolution: Date,
  category: {
    type: String,
    enum: ['collection', 'infrastructure', 'environmental', 'administrative', 'emergency']
  },
  tags: [String],
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  },
  updates: [{
    message: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ['status', 'assignment', 'comment', 'resolution'] }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  votes: {
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    voters: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      vote: { type: String, enum: ['up', 'down'] }
    }]
  }
}, {
  timestamps: true
});

// Indexes
reportSchema.index({ user: 1, createdAt: -1 });
reportSchema.index({ status: 1, priority: 1 });
reportSchema.index({ type: 1, 'location.ward': 1 });
reportSchema.index({ 'location.coordinates.lat': 1, 'location.coordinates.lng': 1 });

// Auto-assign priority based on type
reportSchema.pre('save', function(next) {
  if (this.isNew) {
    switch (this.type) {
      case 'hazard':
      case 'illegal-dumping':
        this.priority = 'urgent';
        break;
      case 'overflow':
      case 'missed-collection':
        this.priority = 'high';
        break;
      case 'damage':
        this.priority = 'medium';
        break;
      default:
        this.priority = 'low';
    }
  }
  next();
});

// Add update method
reportSchema.methods.addUpdate = function(message, updatedBy, type = 'comment') {
  this.updates.push({
    message,
    updatedBy,
    type,
    timestamp: new Date()
  });
  return this.save();
};

// Resolve report method
reportSchema.methods.resolve = function(resolvedBy, message) {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  this.addUpdate(message || 'Report has been resolved', resolvedBy, 'resolution');
  return this.save();
};

module.exports = mongoose.model('Report', reportSchema);
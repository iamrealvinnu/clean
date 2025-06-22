const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    vehicleId: { type: String, required: true, unique: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    currentLocation: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    status: { type: String, enum: ['On Route', 'Idle', 'Maintenance'], default: 'Idle' },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);

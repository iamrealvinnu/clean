const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    ward: { type: String, required: true },
    day: { type: String, required: true },
    time: { type: String, required: true },
    type: { type: String, enum: ['Organic', 'Recyclables', 'Hazardous'], required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }
});

module.exports = mongoose.model('Schedule', scheduleSchema); 
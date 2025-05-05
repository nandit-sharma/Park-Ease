const mongoose = require('mongoose');

const parkingLotSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    totalSlots: {
        type: Number,
        required: true,
        min: 1
    },
    availableSlots: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['active', 'maintenance', 'closed'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('ParkingLot', parkingLotSchema); 
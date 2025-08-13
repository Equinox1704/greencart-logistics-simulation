import mongoose from 'mongoose';

const DriverSchema = new mongoose.Schema({
    name: String,
    currentShiftHours: { type: Number, default: 0 },
    past7DayHours: { type: [Number], default: [] }
}, { timestamps: true });

const Driver = mongoose.model('Driver', DriverSchema);
export default Driver;
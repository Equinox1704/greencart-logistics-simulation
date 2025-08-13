import mongoose from 'mongoose';

const RouteSchema = new mongoose.Schema(
  {
    routeId: { type: Number, unique: true, index: true, required: true },
    distanceKm: { type: Number, required: true },
    trafficLevel: { type: String, enum: ['Low','Medium','High'], required: true },
    baseTimeMin: { type: Number, required: true }
  },
  { timestamps: true }
);

const Route = mongoose.model('Route', RouteSchema);
export default Route;

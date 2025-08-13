import mongoose from 'mongoose';

const SimulationResultSchema = new mongoose.Schema({
  inputs: {
    driversAvailable: Number,
    startTime: String,
    maxHoursPerDriver: Number
  },
  kpis: {
    totalProfit: Number,
    efficiency: Number,
    onTime: Number,
    late: Number,
    fuelCostBreakdown: {
      baseFuel: Number,
      highTrafficSurcharge: Number
    }
  },
  assignments: [
    {
      orderId: Number,
      driverName: String,
      routeId: Number,
      onTime: Boolean,
      profitForOrder: Number
    }
  ]
}, { timestamps: true });

const SimulationResult = mongoose.model('SimulationResult', SimulationResultSchema);
export default SimulationResult;

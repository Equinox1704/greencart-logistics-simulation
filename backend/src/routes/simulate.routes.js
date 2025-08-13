import express from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import Driver from '../models/Driver.js';
import Route from '../models/Route.js';
import Order from '../models/Order.js';
import SimulationResult from '../models/SimulationResult.js';

const router = express.Router();

const inputSchema = z.object({
  driversAvailable: z.number().int().positive(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  maxHoursPerDriver: z.number().positive()
});

router.post('/', async (req, res) => {
  try {
    const parsed = inputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }
    const { driversAvailable, startTime, maxHoursPerDriver } = parsed.data;

    const orders = await Order.find();
    const routes = await Route.find();
    const drivers = (await Driver.find()).slice(0, driversAvailable);

    let totalProfit = 0;
    let onTime = 0;
    let late = 0;
    let baseFuelTotal = 0;
    let trafficSurchargeTotal = 0;

    const assignments = [];
    let driverHours = Array(driversAvailable).fill(0);

    orders.forEach((order, idx) => {
      const driverIndex = idx % driversAvailable;
      const driver = drivers[driverIndex];
      const route = routes.find(r => r.routeId === order.routeId);
      if (!route) return;

      // Base delivery time
      let deliveryMinutes = route.baseTimeMin;

      // Fatigue rule
      const lastDayHours = driver.past7DayHours?.[6] || 0;
      if (lastDayHours > 8) {
        deliveryMinutes = Math.ceil(deliveryMinutes * 1.3);
      }

      // Check deadline
      const deliveredOnTime = (toMinutes(order.deliveryTime) <= route.baseTimeMin + 10);

      // Fuel cost
      let fuelCost = route.distanceKm * 5;
      if (route.trafficLevel === 'High') {
        fuelCost += route.distanceKm * 2;
        trafficSurchargeTotal += route.distanceKm * 2;
      }
      baseFuelTotal += route.distanceKm * 5;

      // Bonuses and penalties
      let bonus = 0;
      let penalty = 0;
      if (deliveredOnTime && order.valueRs > 1000) {
        bonus += Math.floor(order.valueRs * 0.1);
      }
      if (!deliveredOnTime) {
        penalty += 50;
      }

      const profit = order.valueRs + bonus - penalty - fuelCost;

      totalProfit += profit;
      if (deliveredOnTime) onTime++; else late++;

      assignments.push({
        orderId: order.orderId,
        driverName: driver.name,
        routeId: route.routeId,
        onTime: deliveredOnTime,
        profitForOrder: profit
      });

      // Increase driver hours worked
      driverHours[driverIndex] += (deliveryMinutes / 60);
    });

    const efficiency = Math.round((onTime / orders.length) * 100);

    const resultDoc = await SimulationResult.create({
      inputs: { driversAvailable, startTime, maxHoursPerDriver },
      kpis: {
        totalProfit,
        efficiency,
        onTime,
        late,
        fuelCostBreakdown: {
          baseFuel: baseFuelTotal,
          highTrafficSurcharge: trafficSurchargeTotal
        }
      },
      assignments
    });

    res.json(resultDoc);
  } catch (err) {
    console.error('POST /simulate error:', err);
    res.status(500).json({ error: 'Failed to run simulation' });
  }
});

// GET /simulate/history → this will list recent runs
router.get('/history', async (req, res) => {
  try {
    const history = await SimulationResult.find()
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(history);
  } catch (err) {
    console.error('GET /simulate/history error:', err);
    res.status(500).json({ error: 'Failed to fetch simulation history' });
  }
});

// GET /simulate/:id → detailed result for one run
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid simulation id' });
    }
    const sim = await SimulationResult.findById(id);
    if (!sim) return res.status(404).json({ error: 'Simulation not found' });
    res.json(sim);
  } catch (err) {
    console.error('GET /simulate/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch simulation result' });
  }
});

function toMinutes(str) {
  const [h, m] = str.split(':').map(Number);
  return (h * 60) + m;
}

export default router;

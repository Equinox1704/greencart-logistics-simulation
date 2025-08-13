import express from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import Driver from '../models/Driver.js';
import Route from '../models/Route.js';
import Order from '../models/Order.js';
import SimulationResult from '../models/SimulationResult.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Simulation
 *   description: Run delivery simulations and view KPI history
 */

const inputSchema = z.object({
  driversAvailable: z.number().int().positive(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  maxHoursPerDriver: z.number().positive()
});

/**
 * Helper: convert HH:MM string to minutes
 */
function toMinutes(str) {
  const [h, m] = str.split(':').map(Number);
  return (h * 60) + m;
}

/**
 * @swagger
 * /simulate:
 *   post:
 *     summary: Run a simulation with inputs and return KPIs applying business rules
 *     description: Allocates orders to drivers, applies company rules for penalties/bonuses, calculates KPIs, saves result in DB, and returns it.
 *     tags: [Simulation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - driversAvailable
 *               - startTime
 *               - maxHoursPerDriver
 *             properties:
 *               driversAvailable:
 *                 type: integer
 *                 example: 5
 *               startTime:
 *                 type: string
 *                 example: "09:00"
 *               maxHoursPerDriver:
 *                 type: number
 *                 example: 8
 *     responses:
 *       200:
 *         description: Simulation run successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SimulationResult'
 */
router.post('/', async (req, res) => {
  // Validate input
  const parsed = inputSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  const { driversAvailable, startTime, maxHoursPerDriver } = parsed.data;

  try {
    // Fetch data
    const drivers = (await Driver.find()).slice(0, driversAvailable);
    const routes = await Route.find();
    const orders = await Order.find();

    if (drivers.length === 0 || routes.length === 0 || orders.length === 0) {
      return res.status(400).json({ error: 'Insufficient data to run simulation.' });
    }

    let totalProfit = 0;
    let onTime = 0;
    let late = 0;
    let baseFuelTotal = 0;
    let trafficSurchargeTotal = 0;
    const assignments = [];

    let driverHours = Array(driversAvailable).fill(0);

    orders.forEach((order, idx) => {
      // Assign round-robin
      const driverIndex = idx % driversAvailable;
      const driver = drivers[driverIndex];
      const route = routes.find(r => r.routeId === order.routeId);
      if (!route) return;

      // Base delivery time in minutes
      let deliveryMinutes = route.baseTimeMin;

      // Fatigue Rule: if previous day > 8h
      const lastDayHours = driver?.past7DayHours?.[6] || 0;
      if (lastDayHours > 8) {
        deliveryMinutes = Math.ceil(deliveryMinutes * 1.3);
      }

      // Deadline check (On-time if <= baseTime + 10 min)
      const deliveredOnTime = toMinutes(order.deliveryTime) <= (route.baseTimeMin + 10);

      // Fuel Cost
      let fuelCost = route.distanceKm * 5;
      if (route.trafficLevel === 'High') {
        const surcharge = route.distanceKm * 2;
        fuelCost += surcharge;
        trafficSurchargeTotal += surcharge;
      }
      baseFuelTotal += route.distanceKm * 5;

      // Bonus & Penalty
      let bonus = 0;
      let penalty = 0;
      if (deliveredOnTime && order.valueRs > 1000) {
        bonus += order.valueRs * 0.1;
      }
      if (!deliveredOnTime) {
        penalty += 50;
      }

      const profit = order.valueRs + bonus - penalty - fuelCost;
      totalProfit += profit;

      if (deliveredOnTime) onTime++;
      else late++;

      assignments.push({
        orderId: order.orderId,
        driverName: driver.name,
        routeId: route.routeId,
        onTime: deliveredOnTime,
        profitForOrder: profit
      });

      // Track driver hours used
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
    console.error('Simulation error:', err);
    res.status(500).json({ error: 'Failed to run simulation' });
  }
});

/**
 * @swagger
 * /simulate/history:
 *   get:
 *     summary: Get recent simulation history
 *     tags: [Simulation]
 *     security:
 *       - bearerAuth: []
 */
router.get('/history', async (req, res) => {
  const history = await SimulationResult.find().sort({ createdAt: -1 }).limit(10);
  res.json(history);
});

/**
 * @swagger
 * /simulate/{id}:
 *   get:
 *     summary: Get a specific simulation result by ID
 *     tags: [Simulation]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ error: 'Invalid simulation id' });

  const sim = await SimulationResult.findById(req.params.id);
  if (!sim) return res.status(404).json({ error: 'Simulation not found' });
  res.json(sim);
});

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     SimulationResult:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         inputs:
 *           type: object
 *           properties:
 *             driversAvailable: { type: integer }
 *             startTime: { type: string }
 *             maxHoursPerDriver: { type: number }
 *         kpis:
 *           type: object
 *           properties:
 *             totalProfit: { type: number }
 *             efficiency: { type: number }
 *             onTime: { type: integer }
 *             late: { type: integer }
 *             fuelCostBreakdown:
 *               type: object
 *               properties:
 *                 baseFuel: { type: number }
 *                 highTrafficSurcharge: { type: number }
 *         assignments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               orderId: { type: number }
 *               driverName: { type: string }
 *               routeId: { type: number }
 *               onTime: { type: boolean }
 *               profitForOrder: { type: number }
 */

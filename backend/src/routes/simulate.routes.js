import express from "express";
import { z } from "zod";
import mongoose from "mongoose";
import Driver from "../models/Driver.js";
import Route from "../models/Route.js";
import Order from "../models/Order.js";
import SimulationResult from "../models/SimulationResult.js";

const router = express.Router();

const inputSchema = z.object({
  driversAvailable: z.number().int().positive(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/), // fixed regex
  maxHoursPerDriver: z.number().positive(),
});

// Helper: convert HH:MM string to minutes from midnight
function toMinutes(str) {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
}

// POST /simulate — run simulation
router.post("/", async (req, res) => {
  const parsed = inputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors });
  }

  const { driversAvailable, startTime, maxHoursPerDriver } = parsed.data;

  try {
    const drivers = (await Driver.find()).slice(0, driversAvailable);
    const routes = await Route.find();
    const orders = await Order.find();

    if (drivers.length === 0 || routes.length === 0 || orders.length === 0) {
      return res
        .status(400)
        .json({ error: "Insufficient data to run simulation." });
    }

    let totalProfit = 0;
    let onTime = 0;
    let late = 0;
    let baseFuelTotal = 0;
    let trafficSurchargeTotal = 0;
    const assignments = [];

    const simStartMin = toMinutes(startTime);
    let driverCurrentMinutes = Array(driversAvailable).fill(simStartMin);

    orders.forEach((order, idx) => {
      const driverIndex = idx % driversAvailable;
      const driver = drivers[driverIndex];
      const route = routes.find((r) => r.routeId === order.routeId);
      if (!route) return;

      // Base delivery time
      let deliveryMinutes = route.baseTimeMin;

      // Fatigue rule: slower if >8h previous day
      const lastDayHours = driver?.past7DayHours || 0;
      if (lastDayHours > 8) {
        deliveryMinutes = Math.ceil(deliveryMinutes * 1.3);
      }

      // Check max hours per driver
      const hoursWorkedSoFar =
        (driverCurrentMinutes[driverIndex] - simStartMin) / 60;
      if (hoursWorkedSoFar + deliveryMinutes / 60 > maxHoursPerDriver) {
        late++;
        assignments.push({
          orderId: order.orderId,
          driverName: driver.name,
          routeId: route.routeId,
          onTime: false,
          profitForOrder: 0,
        });
        return;
      }

      // Delivery finish time
      const orderStartForDriver = driverCurrentMinutes[driverIndex];
      const finishTime = orderStartForDriver + deliveryMinutes;
      driverCurrentMinutes[driverIndex] = finishTime;

      // Dynamic deadline (base time + 10 min buffer)
      const idealFinishSinceStart =
        orderStartForDriver - simStartMin + route.baseTimeMin;
      const deadline = simStartMin + idealFinishSinceStart + 10;
      const deliveredOnTime = finishTime <= deadline;

      // Fuel cost & surcharges
      let fuelCost = route.distanceKm * 5;
      if (route.trafficLevel === "High") {
        const surcharge = route.distanceKm * 2;
        fuelCost += surcharge;
        trafficSurchargeTotal += surcharge;
      }
      baseFuelTotal += route.distanceKm * 5;

      // Bonus / penalty
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
        profitForOrder: profit,
      });
    });

    const efficiency =
      orders.length > 0 ? Math.round((onTime / orders.length) * 100) : 0;

    const resultDoc = await SimulationResult.create({
      inputs: { driversAvailable, startTime, maxHoursPerDriver },
      kpis: {
        totalProfit,
        efficiency,
        onTime,
        late,
        fuelCostBreakdown: {
          baseFuel: baseFuelTotal,
          highTrafficSurcharge: trafficSurchargeTotal,
        },
      },
      assignments,
    });

    res.json(resultDoc);
  } catch (err) {
    console.error("Simulation error:", err);
    res.status(500).json({ error: "Failed to run simulation" });
  }
});

// GET /simulate/history — recent results
router.get("/history", async (req, res) => {
  const history = await SimulationResult.find()
    .sort({ createdAt: -1 })
    .limit(10);
  res.json(history);
});

// GET /simulate/:id — specific result
router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid simulation id" });
  }
  const sim = await SimulationResult.findById(req.params.id);
  if (!sim) return res.status(404).json({ error: "Simulation not found" });
  res.json(sim);
});

export default router;

import express from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import SimulationResult from '../models/SimulationResult.js';

const router = express.Router();

// Regex to validate HH:MM 24-hour format
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const simulationSchema = z.object({
  inputs: z.object({
    driversAvailable: z.number().int().positive(),
    startTime: z.string().regex(timeRegex, 'Invalid time format, expected HH:MM'),
    maxHoursPerDriver: z.number().positive()
  }),
  kpis: z.object({
    totalProfit: z.number().nonnegative(),
    efficiency: z.number().nonnegative(),
    onTime: z.number().nonnegative(),
    late: z.number().nonnegative(),
    fuelCostBreakdown: z.object({
      baseFuel: z.number().nonnegative(),
      highTrafficSurcharge: z.number().nonnegative()
    })
  }),
  assignments: z.array(
    z.object({
      orderId: z.number().int().positive(),
      driverName: z.string(),
      routeId: z.number().int().positive(),
      onTime: z.boolean(),
      profitForOrder: z.number().nonnegative()
    })
  )
});

// GET all simulation results
router.get('/history', async (req, res) => {
  try {
    const results = await SimulationResult.find().sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    console.error('GET /simulate/history error:', err);
    res.status(500).json({ error: 'Failed to fetch simulation history' });
  }
});

// POST new simulation
router.post('/', async (req, res) => {
  const parsed = simulationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  try {
    const simulation = await SimulationResult.create(parsed.data);
    res.status(201).json(simulation);
  } catch (err) {
    console.error('POST /simulate error:', err);
    res.status(500).json({ error: 'Failed to save simulation result' });
  }
});

// UPDATE simulation by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid simulation ID' });

  const parsed = simulationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  try {
    const updated = await SimulationResult.findByIdAndUpdate(id, parsed.data, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Simulation not found' });
    res.json(updated);
  } catch (err) {
    console.error('PUT /simulate/:id error:', err);
    res.status(500).json({ error: 'Failed to update simulation result' });
  }
});

// GET a single simulation by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid ID' });

  try {
    const simulation = await SimulationResult.findById(id);
    if (!simulation) return res.status(404).json({ error: 'Simulation not found' });
    res.json(simulation);
  } catch (err) {
    console.error('GET /simulate/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch simulation result' });
  }
});

// DELETE simulation by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid ID' });

  try {
    const deleted = await SimulationResult.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Simulation not found' });
    res.json({ message: 'Simulation deleted successfully' });
  } catch (err) {
    console.error('DELETE /simulate/:id error:', err);
    res.status(500).json({ error: 'Failed to delete simulation result' });
  }
});

export default router;

import express from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import Route from '../models/Route.js';

const router = express.Router();

const routeSchema = z.object({
  routeId: z.number().int().positive(),
  distanceKm: z.number().positive(),
  trafficLevel: z.enum(['Low', 'Medium', 'High']),
  baseTimeMin: z.number().positive()
});

router.get('/', async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

router.post('/', async (req, res) => {
  const parsed = routeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  const exists = await Route.findOne({ routeId: parsed.data.routeId });
  if (exists) return res.status(409).json({ error: 'routeId already exists' });

  const doc = await Route.create(parsed.data);
  res.status(201).json(doc);
});

router.put('/:id', async (req, res) => {
  const id = req.params.id?.trim();
  if (!id || !mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid route id' });

  const parsed = routeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  const updated = await Route.findByIdAndUpdate(id, parsed.data, { new: true, runValidators: true });
  if (!updated) return res.status(404).json({ error: 'Route not found' });

  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id?.trim();
  if (!id || !mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid route id' });

  const deleted = await Route.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ error: 'Route not found' });

  res.json({ message: 'Route deleted successfully' });
});

export default router;

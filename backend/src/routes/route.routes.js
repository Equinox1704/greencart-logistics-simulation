import express from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import Route from '../models/Route.js';

const router = express.Router();

const routeSchema = z.object({
  routeId: z.number().int().positive(),
  distanceKm: z.number().positive(),
  trafficLevel: z.enum(['Low', 'Medium', 'High']),
  baseTimeMin: z.number().positive()
});

// GET /routes
router.get('/', async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (err) {
    console.error('GET /routes error:', err);
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

// POST /routes
router.post('/', async (req, res) => {
  try {
    const parsed = routeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }
    // Optional: enforce unique routeId at app level
    const exists = await Route.findOne({ routeId: parsed.data.routeId });
    if (exists) return res.status(409).json({ error: 'routeId already exists' });

    const doc = await Route.create(parsed.data);
    res.status(201).json(doc);
  } catch (err) {
    console.error('POST /routes error:', err);
    res.status(500).json({ error: 'Failed to create route' });
  }
});

// PUT /routes/:id
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id?.trim();
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid route id' });
    }
    const parsed = routeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }
    const updated = await Route.findByIdAndUpdate(id, parsed.data, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ error: 'Route not found' });
    res.json(updated);
  } catch (err) {
    console.error('PUT /routes/:id error:', err);
    res.status(500).json({ error: 'Failed to update route' });
  }
});

// DELETE /routes/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id?.trim();
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid route id' });
    }
    const deleted = await Route.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Route not found' });
    res.json({ message: 'Route deleted successfully' });
  } catch (err) {
    console.error('DELETE /routes/:id error:', err);
    res.status(500).json({ error: 'Failed to delete route' });
  }
});

export default router;

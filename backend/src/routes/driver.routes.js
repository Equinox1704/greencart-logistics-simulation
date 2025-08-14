import express from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import Driver from '../models/Driver.js';

const router = express.Router();

const driverSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  currentShiftHours: z.number().min(0, 'Current shift hours must be >= 0'),
  past7DayHours: z.array(z.number().min(0)).length(7, 'Must have exactly 7 entries')
});

// GET all drivers
router.get('/', async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (err) {
    console.error('GET /drivers error:', err);
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
});

// CREATE new driver
router.post('/', async (req, res) => {
  try {
    const parseResult = driverSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors });
    }
    const driver = await Driver.create(parseResult.data);
    res.status(201).json(driver);
  } catch (err) {
    console.error('POST /drivers error:', err);
    res.status(500).json({ error: 'Failed to create driver' });
  }
});

// UPDATE driver
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id?.trim();
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid driver id' });
    }
    const parsed = driverSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }
    const updated = await Driver.findByIdAndUpdate(id, parsed.data, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Driver not found' });
    res.json(updated);
  } catch (err) {
    console.error('PUT /drivers/:id error:', err);
    res.status(500).json({ error: 'Failed to update driver' });
  }
});

// DELETE driver
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id?.trim();
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid driver id' });
    }
    const deletedDriver = await Driver.findByIdAndDelete(id);
    if (!deletedDriver) return res.status(404).json({ error: 'Driver not found' });
    res.json({ message: 'Driver deleted successfully' });
  } catch (err) {
    console.error('DELETE /drivers/:id error:', err);
    res.status(500).json({ error: 'Failed to delete driver' });
  }
});

export default router;

import express from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Route from '../models/Route.js';

const router = express.Router();

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const orderSchema = z.object({
  orderId: z.number().int().positive(),
  valueRs: z.number().min(0),
  routeId: z.number().int().positive(),
  deliveryTime: z.string().regex(timeRegex, 'deliveryTime must be HH:MM in 24h format')
});

// GET /orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    console.error('GET /orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /orders
router.post('/', async (req, res) => {
  try {
    const parsed = orderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }

    // Enforce existing routeId
    const route = await Route.findOne({ routeId: parsed.data.routeId });
    if (!route) return res.status(400).json({ error: 'routeId does not exist' });

    // Optional: unique orderId
    const exists = await Order.findOne({ orderId: parsed.data.orderId });
    if (exists) return res.status(409).json({ error: 'orderId already exists' });

    const doc = await Order.create(parsed.data);
    res.status(201).json(doc);
  } catch (err) {
    console.error('POST /orders error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT /orders/:id
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id?.trim();
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid order id' });
    }
    const parsed = orderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }

    // If routeId changed, verify existence
    const route = await Route.findOne({ routeId: parsed.data.routeId });
    if (!route) return res.status(400).json({ error: 'routeId does not exist' });

    const updated = await Order.findByIdAndUpdate(id, parsed.data, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json(updated);
  } catch (err) {
    console.error('PUT /orders/:id error:', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// DELETE /orders/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id?.trim();
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid order id' });
    }
    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error('DELETE /orders/:id error:', err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

export default router;

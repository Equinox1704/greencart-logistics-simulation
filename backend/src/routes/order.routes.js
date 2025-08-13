import express from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import Order from '../models/Order.js';
import Route from '../models/Route.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: API for managing delivery orders
 */

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const orderSchema = z.object({
  orderId: z.number().int().positive(),
  valueRs: z.number().min(0),
  routeId: z.number().int().positive(),
  deliveryTime: z.string().regex(timeRegex)
});

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', async (req, res) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  const existsRoute = await Route.findOne({ routeId: parsed.data.routeId });
  if (!existsRoute) return res.status(400).json({ error: 'routeId does not exist' });

  const existsOrder = await Order.findOne({ orderId: parsed.data.orderId });
  if (existsOrder) return res.status(409).json({ error: 'orderId already exists' });

  const doc = await Order.create(parsed.data);
  res.status(201).json(doc);
});

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Update an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', async (req, res) => {
  const id = req.params.id?.trim();
  if (!id || !mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid order id' });

  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  const existsRoute = await Route.findOne({ routeId: parsed.data.routeId });
  if (!existsRoute) return res.status(400).json({ error: 'routeId does not exist' });

  const updated = await Order.findByIdAndUpdate(id, parsed.data, { new: true, runValidators: true });
  if (!updated) return res.status(404).json({ error: 'Order not found' });

  res.json(updated);
});

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Delete an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', async (req, res) => {
  const id = req.params.id?.trim();
  if (!id || !mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid order id' });

  const deleted = await Order.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ error: 'Order not found' });

  res.json({ message: 'Order deleted successfully' });
});

export default router;

import express from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import Route from '../models/Route.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Routes
 *   description: API for managing delivery routes
 */

const routeSchema = z.object({
  routeId: z.number().int().positive(),
  distanceKm: z.number().positive(),
  trafficLevel: z.enum(['Low', 'Medium', 'High']),
  baseTimeMin: z.number().positive()
});

/**
 * @swagger
 * /routes:
 *   get:
 *     summary: Get all routes
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of routes
 */
router.get('/', async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

/**
 * @swagger
 * /routes:
 *   post:
 *     summary: Create a new route
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RouteInput'
 *     responses:
 *       201:
 *         description: Route created
 */
router.post('/', async (req, res) => {
  const parsed = routeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  const exists = await Route.findOne({ routeId: parsed.data.routeId });
  if (exists) return res.status(409).json({ error: 'routeId already exists' });

  const doc = await Route.create(parsed.data);
  res.status(201).json(doc);
});

/**
 * @swagger
 * /routes/{id}:
 *   put:
 *     summary: Update an existing route
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:id', async (req, res) => {
  const id = req.params.id?.trim();
  if (!id || !mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid route id' });

  const parsed = routeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  const updated = await Route.findByIdAndUpdate(id, parsed.data, { new: true, runValidators: true });
  if (!updated) return res.status(404).json({ error: 'Route not found' });

  res.json(updated);
});

/**
 * @swagger
 * /routes/{id}:
 *   delete:
 *     summary: Delete a route
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', async (req, res) => {
  const id = req.params.id?.trim();
  if (!id || !mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid route id' });

  const deleted = await Route.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ error: 'Route not found' });

  res.json({ message: 'Route deleted successfully' });
});

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Route:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         routeId: { type: number }
 *         distanceKm: { type: number }
 *         trafficLevel: { type: string }
 *         baseTimeMin: { type: number }
 *     RouteInput:
 *       type: object
 *       required: [routeId, distanceKm, trafficLevel, baseTimeMin]
 */

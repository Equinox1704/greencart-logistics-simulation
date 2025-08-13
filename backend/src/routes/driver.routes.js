import express from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import Driver from '../models/Driver.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Drivers
 *   description: API for managing drivers
 */

/**
 * Zod schema for validating Drivers
 */
const driverSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  currentShiftHours: z.number().min(0, 'Current shift hours must be >= 0'),
  past7DayHours: z.array(z.number().min(0)).length(7, 'Must have exactly 7 entries')
});

/**
 * @swagger
 * /drivers:
 *   get:
 *     summary: Get all drivers
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of drivers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Driver'
 */
router.get('/', async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (err) {
    console.error('GET /drivers error:', err);
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
});

/**
 * @swagger
 * /drivers:
 *   post:
 *     summary: Create a new driver
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DriverInput'
 *     responses:
 *       201:
 *         description: Driver created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Driver'
 *       400:
 *         description: Invalid input data
 */
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

/**
 * @swagger
 * /drivers/{id}:
 *   put:
 *     summary: Update an existing driver
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: MongoDB ObjectId of the driver
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DriverInput'
 *     responses:
 *       200:
 *         description: Driver updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Driver'
 *       400:
 *         description: Invalid ID or input
 *       404:
 *         description: Driver not found
 */
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
    const updated = await Driver.findByIdAndUpdate(
      id,
      parsed.data,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Driver not found' });
    res.json(updated);
  } catch (err) {
    console.error('PUT /drivers/:id error:', err);
    res.status(500).json({ error: 'Failed to update driver' });
  }
});

/**
 * @swagger
 * /drivers/{id}:
 *   delete:
 *     summary: Delete a driver
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: MongoDB ObjectId of the driver
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Driver deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid driver id
 *       404:
 *         description: Driver not found
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id?.trim();
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid driver id' });
    }
    const deletedDriver = await Driver.findByIdAndDelete(id);
    if (!deletedDriver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json({ message: 'Driver deleted successfully' });
  } catch (err) {
    console.error('DELETE /drivers/:id error:', err);
    res.status(500).json({ error: 'Failed to delete driver' });
  }
});

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Driver:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         currentShiftHours:
 *           type: number
 *         past7DayHours:
 *           type: array
 *           items:
 *             type: number
 *     DriverInput:
 *       type: object
 *       required:
 *         - name
 *         - currentShiftHours
 *         - past7DayHours
 *       properties:
 *         name:
 *           type: string
 *           example: Alice
 *         currentShiftHours:
 *           type: number
 *           example: 0
 *         past7DayHours:
 *           type: array
 *           items:
 *             type: number
 *           example: [8, 7, 6, 7, 8, 5, 4]
 */

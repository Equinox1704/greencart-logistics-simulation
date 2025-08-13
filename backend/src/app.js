import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import driverRoutes from './routes/driver.routes.js';
import routeRoutes from './routes/route.routes.js';
import orderRoutes from './routes/order.routes.js';
import authRoutes from './routes/auth.routes.js';
import simulateRoutes from './routes/simulate.routes.js';
import { verifyToken } from './middlewares/auth.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => res.json({ message: 'API running...' }));

// Public
app.use('/auth', authRoutes);

// Protected
app.use('/drivers', verifyToken, driverRoutes);
app.use('/routes', verifyToken, routeRoutes);
app.use('/orders', verifyToken, orderRoutes);
app.use('/simulate', verifyToken, simulateRoutes);

export default app;

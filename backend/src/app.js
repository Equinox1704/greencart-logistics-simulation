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

// ----------------------
// CORS configuration
// ----------------------
const allowedOrigins = [
  process.env.CORS_ORIGIN,      // local frontend
  process.env.CORS_ORIGIN_PROD  // production frontend
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback){
    if (!origin) return callback(null, true); // allow Postman, curl
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle OPTIONS preflight for all routes
app.options('*', cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ----------------------
// Middleware
// ----------------------
app.use(express.json());
app.use(cookieParser());

// ----------------------
// Basic health check
// ----------------------
app.get('/', (req, res) => res.json({ message: 'API running...' }));

// ----------------------
// Public routes
// ----------------------
app.use('/auth', authRoutes);

// ----------------------
// Protected routes
// ----------------------
app.use('/drivers', verifyToken, driverRoutes);
app.use('/routes', verifyToken, routeRoutes);
app.use('/orders', verifyToken, orderRoutes);
app.use('/simulate', verifyToken, simulateRoutes);

export default app;

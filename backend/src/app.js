import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

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
  process.env.CORS_ORIGIN || 'http://localhost:3000',  // local frontend
  process.env.CORS_ORIGIN_PROD || 'https://greencart-logistics-simulation.vercel.app' // production frontend
];

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (like Postman, curl)
    if(!origin) return callback(null, true);
    if(allowedOrigins.includes(origin)){
      return callback(null, true);
    } else {
      return callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
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
// Swagger definition
// ----------------------
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GreenCart Logistics API',
      version: '1.0.0',
      description: 'API documentation for GreenCart Logistics Simulation Tool'
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Local server' },
      { url: process.env.API_BASE_URL, description: 'Production server' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

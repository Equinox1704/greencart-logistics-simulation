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

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => res.json({ message: 'API running...' }));


// Swagger definition
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
      { url: process.env.API_BASE_URL || '', description: 'Production server' }
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

// Public
app.use('/auth', authRoutes);

// Protected
app.use('/drivers', verifyToken, driverRoutes);
app.use('/routes', verifyToken, routeRoutes);
app.use('/orders', verifyToken, orderRoutes);
app.use('/simulate', verifyToken, simulateRoutes);

export default app;

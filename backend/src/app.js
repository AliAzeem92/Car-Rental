import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import customerAuthRoutes from './routes/customerAuthRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import planningRoutes from './routes/planningRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import checkInOutRoutes from './routes/checkInOutRoutes.js';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Compression middleware
app.use(compression());

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL?.split(',') || ['http://localhost:5173'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/customer/auth', customerAuthRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/planning', planningRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/checkinout', checkInOutRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'running',
    message: '🚗 Car Rental API is running!',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Car Rental API',
    version: '1.0.0'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

export default app;

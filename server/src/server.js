import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { initSocket } from './config/socket.js';
import { seedDatabase } from './seeds/seedData.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import discussionRoutes from './routes/discussionRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    app: 'ImpactHub API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/discussions', discussionRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect DB, Seed if needed, and Start Server
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    httpServer.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 ImpactHub Backend Server running on http://localhost:${PORT}`);
      console.log(`📡 WebSocket / Socket.IO ready for real-time events`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start ImpactHub server:', error);
    process.exit(1);
  }
};

startServer();

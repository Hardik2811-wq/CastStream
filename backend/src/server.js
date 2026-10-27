import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { connectDB } from './db.js';
import { setupSocketHandlers } from './socket/socketHandler.js';
import { runSeed } from './seeds/seed.js';
import { Room } from './models/Room.js';

import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, true); // Fallback for local testing
    },
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));

// REST API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// Health & Sync Diagnostics Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'CastStream Interactive Watch-Party Platform',
    activeSocketConnections: io.engine.clientsCount,
    driftToleranceSec: 1.2,
    canvasParticleEngine: 'ACTIVE_60FPS',
    timestamp: new Date().toISOString(),
  });
});

// 404 Route Handler
app.use((req, res, next) => {
  if (req.path === '/health') return next();
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found on CastStream API` });
});

// Global Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[CastStream Server Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

setupSocketHandlers(io);

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  const roomCount = await Room.countDocuments();
  if (roomCount === 0) {
    console.log('[Init] No rooms found in database, running CastStream seed...');
    await runSeed();
  }

  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🎬 CASTSTREAM SYNCHRONIZED WATCH-PARTY PLATFORM ONLINE`);
    console.log(`📡 WebSocket Engine & Health: http://localhost:${PORT}/health`);
    console.log(`🍿 Rooms API Gate: http://localhost:${PORT}/api/rooms`);
    console.log(`======================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('[FATAL] Failed to start server:', err);
  process.exit(1);
});

export { app, server, io };

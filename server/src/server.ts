import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './game/RoomManager';
import { setupSocketHandlers } from './socket/socketHandlers';
import { logger } from './utils/logger';

const app = express();
const httpServer = createServer(app);

// CORS configuration - production-safe with environment variable support
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? allowedOrigins : '*',
  methods: ['GET', 'POST'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.io setup with production CORS
const io = new Server(httpServer, {
  cors: corsOptions
});

// Initialize room manager
const roomManager = new RoomManager();

// Setup socket handlers
setupSocketHandlers(io, roomManager);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    activeRooms: roomManager.getAllRooms().length,
    timestamp: new Date().toISOString(),
  });
});

// Stats endpoint for production monitoring
app.get('/stats', (req, res) => {
  const memUsage = process.memoryUsage();
  res.json({
    activeRooms: roomManager.getAllRooms().length,
    connectedClients: io.engine.clientsCount,
    memory: {
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`
    },
    uptime: `${Math.round(process.uptime() / 60)} minutes`,
    timestamp: new Date().toISOString()
  });
});

// Get room info endpoint
app.get('/room/:roomCode', (req, res) => {
  const room = roomManager.getRoom(req.params.roomCode);
  if (!room) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }

  const gameState = room.getGameState();
  res.json({
    roomCode: gameState.roomCode,
    playerCount: gameState.players.length,
    gamePhase: gameState.gamePhase,
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  logger.info(`🎮 Exploding Kittens Server running on port ${PORT}`);
  logger.info(`🌐 Socket.IO server ready for connections`);
  logger.info(`🧹 Automatic cleanup enabled (every 5 minutes)`);
  logger.info(`📝 Log level: ${process.env.LOG_LEVEL || 'info'} (set LOG_LEVEL env var to change)`);
  logger.info(`🔒 CORS: ${process.env.NODE_ENV === 'production' ? 'Production mode' : 'Development mode (all origins)'}`);
});

// Cleanup interval - comprehensive cleanup every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
setInterval(() => {
  logger.cleanup('Running periodic room cleanup...');
  roomManager.cleanup();
  
  // Log memory stats periodically
  const memUsage = process.memoryUsage();
  logger.memory(`Heap: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`);
  logger.info(`📊 Active rooms: ${roomManager.getAllRooms().length}, Connected clients: ${io.engine.clientsCount}`);
}, CLEANUP_INTERVAL);

// Also run cleanup for ended games more frequently (every minute)
setInterval(() => {
  logger.cleanup('Running ended games cleanup...');
  roomManager.cleanupEndedGames(30);
}, 1 * 60 * 1000);

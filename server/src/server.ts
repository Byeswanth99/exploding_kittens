import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './game/RoomManager';
import { setupSocketHandlers } from './socket/socketHandlers';

const app = express();
const httpServer = createServer(app);

// CORS configuration
app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json());

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
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
  // Server started - no logging
});

// Cleanup interval - comprehensive cleanup every 5 minutes
setInterval(() => {
  roomManager.cleanup();
}, 5 * 60 * 1000);

// Also run cleanup for ended games more frequently (every minute)
setInterval(() => {
  roomManager.cleanupEndedGames(30);
}, 1 * 60 * 1000);

import { GameRoom } from './GameRoom';

/**
 * Room Manager
 * Manages all active game rooms
 */
export class RoomManager {
  private rooms: Map<string, GameRoom> = new Map();

  /**
   * Generate a unique room code
   */
  private generateRoomCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }

  /**
   * Create a new game room
   */
  createRoom(hostId: string, hostName: string): GameRoom {
    let roomCode = this.generateRoomCode();

    // Ensure unique room code
    while (this.rooms.has(roomCode)) {
      roomCode = this.generateRoomCode();
    }

    const room = new GameRoom(roomCode, hostId, hostName);
    this.rooms.set(roomCode, room);

    return room;
  }

  /**
   * Get a room by code
   */
  getRoom(roomCode: string): GameRoom | undefined {
    return this.rooms.get(roomCode);
  }

  /**
   * Remove a room
   */
  removeRoom(roomCode: string): void {
    this.rooms.delete(roomCode);
  }

  /**
   * Get all active rooms
   */
  getAllRooms(): GameRoom[] {
    return Array.from(this.rooms.values());
  }

  /**
   * Clean up empty rooms
   */
  cleanupEmptyRooms(): void {
    for (const [roomCode, room] of this.rooms.entries()) {
      if (room.getPlayers().length === 0) {
        this.removeRoom(roomCode);
      }
    }
  }

  /**
   * Clean up ended games (games that ended more than gracePeriodMinutes ago)
   */
  cleanupEndedGames(gracePeriodMinutes: number = 30): void {
    const now = Date.now();
    const gracePeriodMs = gracePeriodMinutes * 60 * 1000;

    for (const [roomCode, room] of this.rooms.entries()) {
      const gameState = room.getGameState();

      if (gameState.gamePhase === 'gameEnd' && gameState.endedAt) {
        const timeSinceEnd = now - gameState.endedAt;

        // Remove if grace period passed OR no connected players
        const hasConnectedPlayers = room.getPlayers().some(p => p.isConnected);

        if (timeSinceEnd > gracePeriodMs || !hasConnectedPlayers) {
          this.removeRoom(roomCode);
        }
      }
    }
  }

  /**
   * Clean up idle/abandoned games (no activity for maxIdleDays)
   */
  cleanupIdleGames(maxIdleDays: number = 3): void {
    const now = Date.now();
    const maxIdleMs = maxIdleDays * 24 * 60 * 60 * 1000;

    for (const [roomCode, room] of this.rooms.entries()) {
      const gameState = room.getGameState();
      const timeSinceActivity = now - gameState.lastActivityAt;
      const timeSinceCreation = now - gameState.createdAt;

      // Remove if:
      // 1. No activity for maxIdleDays, OR
      // 2. Room created more than maxIdleDays ago and has no connected players
      const hasConnectedPlayers = room.getPlayers().some(p => p.isConnected);

      if (timeSinceActivity > maxIdleMs ||
          (timeSinceCreation > maxIdleMs && !hasConnectedPlayers)) {
        this.removeRoom(roomCode);
      }
    }
  }

  /**
   * Comprehensive cleanup - runs all cleanup methods
   */
  cleanup(): void {
    this.cleanupEmptyRooms();
    this.cleanupEndedGames(30); // 30 minute grace period for ended games
    this.cleanupIdleGames(3); // 3 days for idle games
  }
}

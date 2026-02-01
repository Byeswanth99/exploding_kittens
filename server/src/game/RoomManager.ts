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
    
    console.log(`Room created: ${roomCode} by ${hostName}`);
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
    console.log(`Room removed: ${roomCode}`);
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
}

import { Server, Socket } from 'socket.io';
import { RoomManager } from '../game/RoomManager';
import {
  CreateGamePayload,
  JoinGamePayload,
  PlayCardPayload,
  DrawCardPayload,
  DefuseKittenPayload,
  GameStatePayload,
} from '../types/game';

export function setupSocketHandlers(io: Server, roomManager: RoomManager) {
  io.on('connection', (socket: Socket) => {
    console.log(`Player connected: ${socket.id}`);

    /**
     * Create a new game
     */
    socket.on('createGame', (payload: CreateGamePayload, callback) => {
      try {
        const { playerName } = payload;
        const room = roomManager.createRoom(socket.id, playerName);
        
        socket.join(room.getGameState().roomCode);
        
        const response: GameStatePayload = {
          gameState: room.getGameState(),
          yourPlayerId: socket.id,
        };
        
        // Emit game state to the socket so App component receives it
        socket.emit('gameState', response);
        
        callback({ success: true, data: response });
      } catch (error) {
        console.error('Error creating game:', error);
        callback({ success: false, error: 'Failed to create game' });
      }
    });

    /**
     * Join an existing game
     */
    socket.on('joinGame', (payload: JoinGamePayload, callback) => {
      try {
        const { roomCode, playerName } = payload;
        const room = roomManager.getRoom(roomCode);
        
        if (!room) {
          callback({ success: false, error: 'Room not found' });
          return;
        }

        const player = room.addPlayer(socket.id, playerName);
        
        if (!player) {
          callback({ success: false, error: 'Cannot join game' });
          return;
        }

        socket.join(roomCode);
        
        const response: GameStatePayload = {
          gameState: room.getGameState(),
          yourPlayerId: socket.id,
        };
        
        // Notify all players in room (they'll use their own socket.id)
        io.to(roomCode).emit('gameState', { gameState: room.getGameState() });
        
        callback({ success: true, data: response });
      } catch (error) {
        console.error('Error joining game:', error);
        callback({ success: false, error: 'Failed to join game' });
      }
    });

    /**
     * Start the game
     */
    socket.on('startGame', (roomCode: string, callback) => {
      try {
        const room = roomManager.getRoom(roomCode);
        
        if (!room) {
          callback({ success: false, error: 'Room not found' });
          return;
        }

        const gameState = room.getGameState();
        
        // Check if caller is host
        if (gameState.hostId !== socket.id) {
          callback({ success: false, error: 'Only host can start game' });
          return;
        }

        room.startGame();
        
        // Notify all players (they'll use their own socket.id)
        io.to(roomCode).emit('gameState', { gameState: room.getGameState() });
        
        callback({ success: true });
      } catch (error) {
        console.error('Error starting game:', error);
        callback({ success: false, error: 'Failed to start game' });
      }
    });

    /**
     * Play a card
     */
    socket.on('playCard', (payload: PlayCardPayload, callback) => {
      try {
        const { cardId, targetPlayerId, data } = payload;
        
        // Find which room the player is in
        let room = null;
        let roomCode = '';
        
        for (const r of roomManager.getAllRooms()) {
          if (r.getPlayers().find(p => p.id === socket.id)) {
            room = r;
            roomCode = r.getGameState().roomCode;
            break;
          }
        }

        if (!room) {
          callback({ success: false, error: 'Not in a game' });
          return;
        }

        const result = room.playCard(socket.id, cardId, { targetPlayerId, ...data });
        
        if (!result.success) {
          callback({ success: false, error: result.error });
          return;
        }

        // Notify all players (they'll use their own socket.id)
        io.to(roomCode).emit('gameState', { gameState: room.getGameState() });
        
        callback({ success: true, requiresAction: result.requiresAction });
      } catch (error) {
        console.error('Error playing card:', error);
        callback({ success: false, error: 'Failed to play card' });
      }
    });

    /**
     * Give card for Favor
     */
    socket.on('giveFavorCard', (payload: { requesterId: string; cardId: string }, callback) => {
      try {
        // Find which room the player is in
        let room = null;
        let roomCode = '';
        
        for (const r of roomManager.getAllRooms()) {
          if (r.getPlayers().find(p => p.id === socket.id)) {
            room = r;
            roomCode = r.getGameState().roomCode;
            break;
          }
        }

        if (!room) {
          callback({ success: false, error: 'Not in a game' });
          return;
        }

        const success = room.giveFavorCard(socket.id, payload.requesterId, payload.cardId);
        
        if (!success) {
          callback({ success: false, error: 'Failed to give card' });
          return;
        }

        // Notify all players
        io.to(roomCode).emit('gameState', { gameState: room.getGameState() });
        
        callback({ success: true });
      } catch (error) {
        console.error('Error giving favor card:', error);
        callback({ success: false, error: 'Failed to give card' });
      }
    });

    /**
     * Draw a card
     */
    socket.on('drawCard', (callback) => {
      try {
        // Find which room the player is in
        let room = null;
        let roomCode = '';
        
        for (const r of roomManager.getAllRooms()) {
          if (r.getPlayers().find(p => p.id === socket.id)) {
            room = r;
            roomCode = r.getGameState().roomCode;
            break;
          }
        }

        if (!room) {
          callback({ success: false, error: 'Not in a game' });
          return;
        }

        const result = room.drawCard(socket.id);
        
        if (result.exploded) {
          // Check if game ended
          const winner = room.checkGameEnd();
          if (winner) {
            io.to(roomCode).emit('gameEnd', { 
              winnerId: winner.id, 
              winnerName: winner.name 
            });
          }
        }

        // If drew Exploding Kitten but didn't explode, need to defuse
        if (result.card?.type === 'exploding-kitten' && !result.exploded) {
          callback({ 
            success: true, 
            needsDefuse: true,
            card: result.card
          });
          return;
        }

        // End turn after drawing
        if (!result.exploded && result.card) {
          room.endTurn();
        }

        // Notify all players (they'll use their own socket.id)
        io.to(roomCode).emit('gameState', { gameState: room.getGameState() });
        
        callback({ 
          success: true, 
          card: result.card,
          exploded: result.exploded
        });
      } catch (error) {
        console.error('Error drawing card:', error);
        callback({ success: false, error: 'Failed to draw card' });
      }
    });

    /**
     * Defuse an Exploding Kitten
     */
    socket.on('defuseKitten', (payload: DefuseKittenPayload, callback) => {
      try {
        const { insertPosition } = payload;
        
        // Find which room the player is in
        let room = null;
        let roomCode = '';
        
        for (const r of roomManager.getAllRooms()) {
          if (r.getPlayers().find(p => p.id === socket.id)) {
            room = r;
            roomCode = r.getGameState().roomCode;
            break;
          }
        }

        if (!room) {
          callback({ success: false, error: 'Not in a game' });
          return;
        }

        const success = room.defuseKitten(socket.id, insertPosition);
        
        if (!success) {
          callback({ success: false, error: 'Failed to defuse' });
          return;
        }

        // End turn after defusing
        room.endTurn();

        // Notify all players (they'll use their own socket.id)
        io.to(roomCode).emit('gameState', { gameState: room.getGameState() });
        
        callback({ success: true });
      } catch (error) {
        console.error('Error defusing kitten:', error);
        callback({ success: false, error: 'Failed to defuse kitten' });
      }
    });

    /**
     * See the Future
     */
    socket.on('seeTheFuture', (callback) => {
      try {
        // Find which room the player is in
        let room = null;
        
        for (const r of roomManager.getAllRooms()) {
          if (r.getPlayers().find(p => p.id === socket.id)) {
            room = r;
            break;
          }
        }

        if (!room) {
          callback({ success: false, error: 'Not in a game' });
          return;
        }

        const topCards = room.peekDeck(3);
        
        callback({ success: true, cards: topCards });
      } catch (error) {
        console.error('Error seeing future:', error);
        callback({ success: false, error: 'Failed to see future' });
      }
    });

    /**
     * Alter the Future
     */
    socket.on('alterTheFuture', (rearrangedCards, callback) => {
      try {
        // Find which room the player is in
        let room = null;
        let roomCode = '';
        
        for (const r of roomManager.getAllRooms()) {
          if (r.getPlayers().find(p => p.id === socket.id)) {
            room = r;
            roomCode = r.getGameState().roomCode;
            break;
          }
        }

        if (!room) {
          callback({ success: false, error: 'Not in a game' });
          return;
        }

        room.rearrangeDeck(rearrangedCards);
        
        callback({ success: true });
      } catch (error) {
        console.error('Error altering future:', error);
        callback({ success: false, error: 'Failed to alter future' });
      }
    });

    /**
     * Shuffle deck
     */
    socket.on('shuffleDeck', (callback) => {
      try {
        // Find which room the player is in
        let room = null;
        let roomCode = '';
        
        for (const r of roomManager.getAllRooms()) {
          if (r.getPlayers().find(p => p.id === socket.id)) {
            room = r;
            roomCode = r.getGameState().roomCode;
            break;
          }
        }

        if (!room) {
          callback({ success: false, error: 'Not in a game' });
          return;
        }

        room.shuffleDeck();
        
        // Notify all players (they'll use their own socket.id)
        io.to(roomCode).emit('gameState', { gameState: room.getGameState() });
        
        callback({ success: true });
      } catch (error) {
        console.error('Error shuffling deck:', error);
        callback({ success: false, error: 'Failed to shuffle deck' });
      }
    });

    /**
     * Player disconnects
     */
    socket.on('disconnect', () => {
      console.log(`Player disconnected: ${socket.id}`);
      
      // Find and update player connection status
      for (const room of roomManager.getAllRooms()) {
        const player = room.getPlayers().find(p => p.id === socket.id);
        if (player) {
          player.isConnected = false;
          const roomCode = room.getGameState().roomCode;
          
          // Notify other players (they'll use their own socket.id)
          io.to(roomCode).emit('gameState', { gameState: room.getGameState() });
          
          // If in lobby, remove player after 30 seconds
          if (room.getGameState().gamePhase === 'lobby') {
            setTimeout(() => {
              if (!player.isConnected) {
                room.removePlayer(socket.id);
                io.to(roomCode).emit('gameState', { gameState: room.getGameState() });
              }
            }, 30000);
          }
        }
      }
      
      // Cleanup empty rooms
      roomManager.cleanupEmptyRooms();
    });
  });
}

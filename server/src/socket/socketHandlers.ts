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
  /**
   * Helper function to check for game end and emit if needed
   */
  const checkAndEmitGameEnd = (room: any, roomCode: string) => {
    const winner = room.checkGameEnd();
    if (winner) {
      io.to(roomCode).emit('gameEnd', {
        winnerId: winner.id,
        winnerName: winner.name
      });
    }
  };

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
    socket.on('startGame', (payload: { roomCode: string; defuseCount?: number; explodingKittenCount?: number }, callback) => {
      try {
        const { roomCode, defuseCount = 0, explodingKittenCount } = typeof payload === 'string'
          ? { roomCode: payload, defuseCount: 0, explodingKittenCount: undefined }
          : payload;

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

        room.startGame(defuseCount, explodingKittenCount);

        // Notify all players (they'll use their own socket.id)
        io.to(roomCode).emit('gameState', { gameState: room.getGameState() });

        callback({ success: true });
      } catch (error) {
        console.error('Error starting game:', error);
        callback({ success: false, error: 'Failed to start game' });
      }
    });

    /**
     * Play a card or cat card combination
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

        // Support both single card and array of cards (for cat combos)
        const cardsToPlay = Array.isArray(cardId) ? cardId : cardId;
        const result = room.playCard(socket.id, cardsToPlay, { targetPlayerId, ...data });

        if (!result.success) {
          callback({ success: false, error: result.error });
          return;
        }

        // Notify all players (they'll use their own socket.id)
        io.to(roomCode).emit('gameState', { gameState: room.getGameState() });

        // Check for game end after playing card
        checkAndEmitGameEnd(room, roomCode);

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

        // Check for game end (in case this was the last action and someone won)
        checkAndEmitGameEnd(room, roomCode);

        callback({ success: true });
      } catch (error) {
        console.error('Error giving favor card:', error);
        callback({ success: false, error: 'Failed to give card' });
      }
    });

    /**
     * Get target player's cards for Cat Combo (face down)
     */
    socket.on('getCatComboTargetCards', (callback) => {
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

        const result = room.getTargetPlayerCardsForCombo(socket.id);

        if (!result) {
          callback({ success: false, error: 'No pending cat combo action' });
          return;
        }

        callback({ success: true, cards: result.cards, targetPlayerName: result.targetPlayerName });
      } catch (error) {
        console.error('Error getting cat combo target cards:', error);
        callback({ success: false, error: 'Failed to get target cards' });
      }
    });

    /**
     * Take card for Cat Combo (2 of a kind) - requester chooses which card to take
     */
    socket.on('takeCatComboCard', (payload: { cardId: string }, callback) => {
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

        const success = room.takeCatComboCard(socket.id, payload.cardId);

        if (!success) {
          callback({ success: false, error: 'Failed to take card' });
          return;
        }

        // Notify all players
        io.to(roomCode).emit('gameState', { gameState: room.getGameState() });

        // Check for game end
        checkAndEmitGameEnd(room, roomCode);

        callback({ success: true });
      } catch (error) {
        console.error('Error taking cat combo card:', error);
        callback({ success: false, error: 'Failed to take card' });
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
          // Check if game ended after player exploded
          checkAndEmitGameEnd(room, roomCode);
        }

        // If drew Exploding Kitten but didn't explode, need to defuse
        if (result.card?.type === 'exploding-kitten' && !result.exploded) {
          // Don't end turn yet - player must defuse first
          // Notify all players of the state
          io.to(roomCode).emit('gameState', { gameState: room.getGameState() });
          callback({
            success: true,
            needsDefuse: true,
            card: result.card
          });
          return;
        }

        // End turn after drawing (only if not exploded and not needing defuse)
        if (!result.exploded && result.card && result.card.type !== 'exploding-kitten') {
          room.endTurn();
        }

        // Notify all players (they'll use their own socket.id)
        io.to(roomCode).emit('gameState', { gameState: room.getGameState() });

        // Check for game end after state update (in case last player was eliminated)
        checkAndEmitGameEnd(room, roomCode);

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

        // Check for game end after defusing
        checkAndEmitGameEnd(room, roomCode);

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

      // Find and handle disconnected player
      for (const room of roomManager.getAllRooms()) {
        const player = room.getPlayers().find(p => p.id === socket.id);
        if (player) {
          const roomCode = room.getGameState().roomCode;
          const gamePhase = room.getGameState().gamePhase;
          const wasCurrentTurn = room.getGameState().currentTurnPlayerId === socket.id;

          player.isConnected = false;

          // If game is in progress, eliminate the player
          if (gamePhase === 'playing') {
            const eliminated = room.eliminateDisconnectedPlayer(socket.id);

            if (eliminated) {
              // Notify all players
              io.to(roomCode).emit('gameState', { gameState: room.getGameState() });

              // Check for game end (if only one player remains)
              checkAndEmitGameEnd(room, roomCode);
            }
          } else if (gamePhase === 'lobby') {
            // If in lobby, remove player after 30 seconds
            setTimeout(() => {
              const stillInRoom = room.getPlayers().find(p => p.id === socket.id);
              if (stillInRoom && !stillInRoom.isConnected) {
                room.removePlayer(socket.id);
                io.to(roomCode).emit('gameState', { gameState: room.getGameState() });
              }
            }, 30000);
          } else {
            // Game ended or other phase - just update connection status
            io.to(roomCode).emit('gameState', { gameState: room.getGameState() });
          }
        }
      }

      // Cleanup empty rooms
      roomManager.cleanupEmptyRooms();
    });
  });
}

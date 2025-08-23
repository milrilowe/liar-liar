import type { Socket } from 'socket.io';
import { GameState } from '../../models/GameState.js';

export const handleGameState = (socket: Socket, io: any) => {
  socket.on('updateGameState', async (updates: any) => {
    try {
      let gameState = await GameState.findOne();
      if (!gameState) {
        gameState = await GameState.create(updates);
      } else {
        await GameState.updateOne({}, updates);
        gameState = await GameState.findOne();
      }
      
      io.emit('gameState', gameState);
      console.log('Game state updated:', updates);
    } catch (error) {
      console.error('Error updating game state:', error);
      socket.emit('error', 'Failed to update game state');
    }
  });
};
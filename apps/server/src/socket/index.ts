import type { Server } from 'socket.io';
import { 
  handleGameState, 
  handleGameplay, 
  handleComedians, 
  handleVotes,
  handleChat,
  handleAudience,
  handleAuth
} from './handlers/';
import { GameState } from '../models/GameState.js';
import { Comedian } from '../models/Comedian.js';

export const setupSocket = (io: Server) => {
    io.on('connection', async (socket) => {
        console.log(`Client connected: ${socket.id}`);

        try {
            // Send initial data
            let gameState = await GameState.findOne();
            if (!gameState) {
                gameState = await GameState.create({});
            }

            const comedians = await Comedian.find();

            socket.emit('gameState', gameState);
            socket.emit('comediansList', comedians);
        } catch (error) {
            console.error('Error sending initial data:', error);
        }

        // Register all handlers
        handleGameState(socket, io);
        handleComedians(socket, io);
        handleVotes(socket, io);
        handleGameplay(socket, io);
        
        // Participate app handlers
        handleChat(socket, io);
        handleAudience(socket, io);
        handleAuth(socket, io);

        socket.on('disconnect', (reason) => {
            console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
        });
    });
};
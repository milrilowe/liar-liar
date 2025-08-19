import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import type { Comedian, ComedianInput, GameState } from './types.js';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 3001;
const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['*'];

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

let gameState: GameState = {
  mode: "intro",
  customText: "Liar, Liar!",
  teams: {
    teamA: { name: "Team Skeptics", score: 0 },
    teamB: { name: "Team Believers", score: 0 }
  }
};

let comedians: Comedian[] = [];

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Send initial data
  socket.emit('gameState', gameState);
  socket.emit('comediansList', comedians);
  console.log(`Sent initial data to ${socket.id}: ${comedians.length} comedians`);

  socket.on('updateGameState', (updates: Partial<GameState>) => {
    gameState = { ...gameState, ...updates };
    io.emit('gameState', gameState);
    console.log('Game state updated:', updates);
  });

  // Comedian management - INSIDE the connection block
  socket.on('addComedian', (comedianData: ComedianInput) => {
    console.log('Received addComedian:', comedianData);
    
    const newComedian: Comedian = {
      id: Date.now().toString(),
      name: comedianData.name,
      instagram: comedianData.instagram,
      score: 0,
      prompts: [],
      team: comedianData.team,
      password: comedianData.password
    };
    
    comedians.push(newComedian);
    
    // Try both approaches to make sure it gets sent
    io.emit('comediansList', comedians);  // Broadcast to all clients
    socket.emit('comediansList', comedians); // Send to the requesting socket
    
    console.log('Added comedian:', newComedian.name);
    console.log('Emitting comediansList with:', comedians.length, 'comedians');
  });

  socket.on('removeComedian', (comedianId: string) => {
    console.log('Removing comedian:', comedianId);
    comedians = comedians.filter(c => c.id !== comedianId);
    io.emit('comediansList', comedians);
    console.log('Removed comedian:', comedianId);
  });

  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
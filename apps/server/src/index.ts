import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { setupSocket } from './socket/index.js';

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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

setupSocket(io);

server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
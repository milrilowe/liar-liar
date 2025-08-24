import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { setupSocket } from './socket/index.js';

dotenv.config();

const port = Number(process.env.PORT) || 3001;
const corsOrigins =
  process.env.CORS_ORIGINS?.split(',').map(s => s.trim()).filter(Boolean) ?? ['*'];
const allowAll = corsOrigins.length === 1 && corsOrigins[0] === '*';

const app = express();

// Allow same-origin and (optionally) specific domains
app.use(cors({ origin: allowAll ? true : corsOrigins, credentials: true }));
app.use(express.json());

// Healthcheck (handy for curl)
app.get('/healthz', (_req, res) => res.send('ok'));

// DB
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const server = http.createServer(app);

const io = new Server(server, {
  path: '/socket.io',
})

setupSocket(io);

server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

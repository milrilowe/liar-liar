// Replace: apps/server/src/models/Vote.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IVote extends Document {
  promptId: string;
  username: string;  // Changed from deviceId to username
  vote: 'truth' | 'lie';
  timestamp: Date;
  
  // Optional: Store game context for analytics
  gameSessionId?: string;
  comedianId?: string;
  promptAnswer?: 'truth' | 'lie';  // Store the actual answer for leaderboard calculation
}

const voteSchema = new Schema<IVote>({
  promptId: { type: String, required: true, index: true },
  username: { type: String, required: true, lowercase: true, index: true },
  vote: { type: String, enum: ['truth', 'lie'], required: true },
  timestamp: { type: Date, default: Date.now },
  
  // Optional analytics fields
  gameSessionId: { type: String, index: true },
  comedianId: { type: String, index: true },
  promptAnswer: { type: String, enum: ['truth', 'lie'] }
});

// Compound index to prevent duplicate votes per prompt per user
voteSchema.index({ promptId: 1, username: 1 }, { unique: true });

// Index for leaderboard queries
voteSchema.index({ gameSessionId: 1, username: 1 });
voteSchema.index({ username: 1, timestamp: -1 });

export const Vote = mongoose.model<IVote>('Vote', voteSchema);
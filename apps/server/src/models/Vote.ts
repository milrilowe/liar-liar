import mongoose, { Document, Schema } from 'mongoose';

export interface IVote extends Document {
  promptId: string;
  deviceId: string;
  vote: 'truth' | 'lie';
  timestamp: Date;
}

const voteSchema = new Schema<IVote>({
  promptId: { type: String, required: true },
  deviceId: { type: String, required: true },
  vote: { type: String, enum: ['truth', 'lie'], required: true },
  timestamp: { type: Date, default: Date.now }
});

export const Vote = mongoose.model<IVote>('Vote', voteSchema);
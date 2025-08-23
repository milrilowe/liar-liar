import mongoose, { Document, Schema } from 'mongoose';

export interface IGameState extends Document {
  mode: 'welcome' | 'game' | 'intermission' | 'scoring' | 'end';
  currentComedianId?: string;
  currentPromptId?: string;
  answerRevealed: boolean;
  customText: string;
  teams: {
    teamA: { name: string; score: number };
    teamB: { name: string; score: number };
  };
}

const gameStateSchema = new Schema<IGameState>({
  mode: { type: String, enum: ['welcome', 'game', 'intermission', 'scoring', 'end'], default: 'welcome' },
  currentComedianId: { type: String, default: null },
  currentPromptId: { type: String, default: null },
  answerRevealed: { type: Boolean, default: false },
  customText: { type: String, default: 'Liar, Liar!' },
  teams: {
    teamA: {
      name: { type: String, default: "Team Skeptics" },
      score: { type: Number, default: 0 }
    },
    teamB: {
      name: { type: String, default: "Team Believers" },
      score: { type: Number, default: 0 }
    }
  }
});

export const GameState = mongoose.model<IGameState>('GameState', gameStateSchema);
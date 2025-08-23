import mongoose, { Document, Schema } from 'mongoose';

export interface IPrompt {
  text: string;
  answer: 'truth' | 'lie'; // Changed from 'actualAnswer' to 'answer'
}

export interface IComedian extends Document<string> {
  name: string;
  instagram: string;
  password: string;
  team: 'teamA' | 'teamB' | 'host'; // Added 'host', removed null
  prompts: IPrompt[];
}

const promptSchema = new Schema<IPrompt>({
  text: { type: String, required: true },
  answer: { type: String, enum: ['truth', 'lie'], required: true }
});

const comedianSchema = new Schema<IComedian>({
  name: { type: String, required: true },
  instagram: { type: String, required: true },
  password: { type: String, required: true },
  team: { type: String, enum: ['teamA', 'teamB', 'host'], required: true },
  prompts: [promptSchema]
});

export const Comedian = mongoose.model<IComedian>('Comedian', comedianSchema);
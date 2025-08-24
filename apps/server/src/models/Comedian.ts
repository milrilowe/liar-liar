import mongoose, { Document, Schema, Types } from 'mongoose'

export interface IPrompt {
    _id?: Types.ObjectId  // Add _id as optional
    text: string
    answer: 'truth' | 'lie'
    guess?: 'truth' | 'lie'
}

export interface IComedian extends Document<string> {
    name: string
    instagram: string
    password: string
    team: 'teamA' | 'teamB' | 'host'
    prompts: (IPrompt & { _id: Types.ObjectId })[]
}

const promptSchema = new Schema<IPrompt>({
    text: { type: String, required: true },
    answer: { type: String, enum: ['truth', 'lie'], required: true },
    guess: { type: String, enum: ['truth', 'lie'], required: false },
})

const comedianSchema = new Schema<IComedian>({
    name: { type: String, required: true },
    instagram: { type: String, required: true },
    password: { type: String, required: true },
    team: { type: String, enum: ['teamA', 'teamB', 'host'], required: true },
    prompts: [promptSchema],
})

export const Comedian = mongoose.model<IComedian>('Comedian', comedianSchema)
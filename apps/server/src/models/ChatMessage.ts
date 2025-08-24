import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
    username: string;
    text: string;
    timestamp: Date;

    // Context when message was sent - can be null if no active game
    comedianId?: string | null;
    comedianName?: string | null;  // denormalized for easy querying
    promptId?: string | null;
    promptText?: string | null;    // denormalized snapshot
    gameMode?: 'welcome' | 'game' | 'intermission' | 'scoring' | 'end' | null;

    // Optional: group by game session
    gameSessionId?: string;
}

const chatMessageSchema = new Schema<IChatMessage>({
    username: { type: String, required: true, index: true },
    text: { type: String, required: true, maxlength: 500 }, // reasonable limit
    timestamp: { type: Date, default: Date.now, index: true },

    // Game context - all optional since game might not be active
    comedianId: { type: String, default: null },
    comedianName: { type: String, default: null },
    promptId: { type: String, default: null },
    promptText: { type: String, default: null },
    gameMode: {
        type: String,
        enum: ['welcome', 'game', 'intermission', 'scoring', 'end'],
        default: null
    },

    gameSessionId: { type: String, default: null, index: true }
});

// Index for efficient querying
chatMessageSchema.index({ timestamp: -1 }); // newest first
chatMessageSchema.index({ gameSessionId: 1, timestamp: -1 }); // by session

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
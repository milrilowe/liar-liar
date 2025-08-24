// Replace: apps/server/src/models/AudienceUser.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IAudienceUser extends Document {
    username: string;           // unique identifier chosen by user
    deviceId: string;           // persistent browser identifier (UUID)
    joinedAt: Date;
    lastActiveAt: Date;
    isActive: boolean;

    // Basic stats
    messageCount: number;
    voteCount: number;
    
    // Leaderboard stats
    correctVotes: number;       // Number of correct predictions
    totalVotes: number;         // Total votes cast (for accuracy percentage)
    
    // Current game session tracking
    currentGameSessionId?: string;
    
    // Optional: streak tracking
    currentStreak: number;      // Current correct answer streak
    longestStreak: number;      // Longest correct answer streak ever
}

const audienceUserSchema = new Schema<IAudienceUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 2,
        maxlength: 20,
        // Case-insensitive uniqueness
        lowercase: true
    },
    deviceId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    joinedAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },

    messageCount: { type: Number, default: 0 },
    voteCount: { type: Number, default: 0 },
    
    // Leaderboard fields
    correctVotes: { type: Number, default: 0 },
    totalVotes: { type: Number, default: 0 },
    
    currentGameSessionId: { type: String, default: null },
    
    // Streak tracking
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 }
});

// Indexes for efficient lookups
audienceUserSchema.index({ username: 1 });
audienceUserSchema.index({ deviceId: 1 });
audienceUserSchema.index({ isActive: 1, lastActiveAt: -1 });

// Indexes for leaderboard queries
audienceUserSchema.index({ correctVotes: -1, username: 1 });
audienceUserSchema.index({ totalVotes: -1, correctVotes: -1 });
audienceUserSchema.index({ currentGameSessionId: 1, correctVotes: -1 });

// Update lastActiveAt on save
audienceUserSchema.pre('save', function (next) {
    this.lastActiveAt = new Date();
    next();
});

// Virtual for accuracy percentage
audienceUserSchema.virtual('accuracy').get(function() {
    if (this.totalVotes === 0) return 0;
    return Math.round((this.correctVotes / this.totalVotes) * 100);
});

// Ensure virtual fields are serialized
audienceUserSchema.set('toJSON', { virtuals: true });

export const AudienceUser = mongoose.model<IAudienceUser>('AudienceUser', audienceUserSchema);
import mongoose, { Document, Schema } from 'mongoose';

export interface IAudienceUser extends Document {
    username: string;           // unique identifier chosen by user
    deviceId: string;           // persistent browser identifier (UUID)
    joinedAt: Date;
    lastActiveAt: Date;
    isActive: boolean;

    // Optional: track some stats
    messageCount: number;
    voteCount: number;

    // Optional: game session tracking
    currentGameSessionId?: string;
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

    currentGameSessionId: { type: String, default: null }
});

// Indexes for efficient lookups
audienceUserSchema.index({ username: 1 });
audienceUserSchema.index({ deviceId: 1 });
audienceUserSchema.index({ isActive: 1, lastActiveAt: -1 });

// Update lastActiveAt on save
audienceUserSchema.pre('save', function (next) {
    this.lastActiveAt = new Date();
    next();
});

export const AudienceUser = mongoose.model<IAudienceUser>('AudienceUser', audienceUserSchema);
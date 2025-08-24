import type { Socket } from 'socket.io';
import { ChatMessage } from '../../models/ChatMessage.js';
import { AudienceUser } from '../../models/AudienceUser.js';
import { GameState } from '../../models/GameState.js';
import { Comedian } from '../../models/Comedian.js';

export const handleChat = (socket: Socket, io: any) => {

    // Submit a chat message (audience only)
    socket.on('submitChatMessage', async (data: {
        username: string;
        text: string;
        deviceId: string;
    }) => {
        try {
            const { username, text, deviceId } = data;

            // Validate input
            if (!username || !text?.trim() || text.length > 500) {
                socket.emit('error', 'Invalid message');
                return;
            }

            // Verify user exists and deviceId matches
            const user = await AudienceUser.findOne({ username: username.toLowerCase() });
            if (!user || user.deviceId !== deviceId) {
                socket.emit('error', 'Unauthorized');
                return;
            }

            // Get current game context
            const gameState = await GameState.findOne();
            let comedian = null;
            let currentPrompt = null;

            if (gameState?.currentComedianId) {
                comedian = await Comedian.findById(gameState.currentComedianId);
                if (comedian && gameState.currentPromptId) {
                    currentPrompt = (comedian.prompts as any).id(gameState.currentPromptId);
                }
            }

            // Create message with full context
            const message = await ChatMessage.create({
                username: user.username, // Use stored username for consistency
                text: text.trim(),
                timestamp: new Date(),

                // Game context snapshot
                comedianId: comedian?._id?.toString() || null,
                comedianName: comedian?.name || null,
                promptId: currentPrompt?._id?.toString() || null,
                promptText: currentPrompt?.text || null,
                gameMode: gameState?.mode || null,
                gameSessionId: gameState?._id?.toString() || null
            });

            // Update user stats
            await AudienceUser.updateOne(
                { _id: user._id },
                {
                    $inc: { messageCount: 1 },
                    lastActiveAt: new Date()
                }
            );

            // Broadcast to comics only (audience can't see messages)
            io.emit('newChatMessage', message);

            console.log(`Chat message from ${username}: ${text}`);

        } catch (error) {
            console.error('Error submitting chat message:', error);
            socket.emit('error', 'Failed to send message');
        }
    });

    // Get chat history (comics only)
    socket.on('getChatMessages', async (data: {
        limit?: number;
        gameSessionId?: string;
        comedianId?: string; // authenticate comic
        password?: string;
    }) => {
        try {
            const { limit = 50, gameSessionId, comedianId, password } = data;

            // Verify this is a comedian making the request
            if (comedianId && password) {
                const comedian = await Comedian.findById(comedianId);
                if (!comedian || comedian.password !== password) {
                    socket.emit('error', 'Unauthorized');
                    return;
                }
            }

            // Build query
            const query: any = {};
            if (gameSessionId) {
                query.gameSessionId = gameSessionId;
            }

            // Get messages
            const messages = await ChatMessage
                .find(query)
                .sort({ timestamp: -1 })
                .limit(Math.min(limit, 200)) // Cap at 200
                .exec();

            socket.emit('chatMessages', messages.reverse()); // Send chronological order

        } catch (error) {
            console.error('Error getting chat messages:', error);
            socket.emit('error', 'Failed to get messages');
        }
    });

    // Clear chat (admin only)
    socket.on('clearChatMessages', async (data: { gameSessionId?: string }) => {
        try {
            const query: any = {};
            if (data.gameSessionId) {
                query.gameSessionId = data.gameSessionId;
            }

            await ChatMessage.deleteMany(query);
            io.emit('chatCleared');
            console.log('Chat messages cleared');

        } catch (error) {
            console.error('Error clearing chat:', error);
            socket.emit('error', 'Failed to clear chat');
        }
    });
};
// Replace: apps/server/src/socket/handlers/votes.ts
import type { Socket } from 'socket.io';
import { Vote } from '../../models/Vote.js';
import { AudienceUser } from '../../models/AudienceUser.js';
import { GameState } from '../../models/GameState.js';
import { Comedian } from '../../models/Comedian.js';

export const handleVotes = (socket: Socket, io: any) => {
    
    // Submit a vote (now using username instead of deviceId)
    socket.on('submitVote', async (data: { promptId: string, username: string, vote: 'truth' | 'lie' }) => {
        try {
            const { promptId, username, vote } = data;

            // Verify user exists
            const user = await AudienceUser.findOne({ username: username.toLowerCase() });
            if (!user) {
                socket.emit('error', 'User not found');
                return;
            }

            // Check if user already voted for this prompt
            const existingVote = await Vote.findOne({
                promptId: promptId,
                username: username.toLowerCase()
            });

            if (existingVote) {
                socket.emit('error', 'Already voted for this prompt');
                return;
            }

            // Get game context for analytics
            const gameState = await GameState.findOne();
            let comedian = null;
            let currentPrompt = null;
            let promptAnswer = null;

            if (gameState?.currentComedianId) {
                comedian = await Comedian.findById(gameState.currentComedianId);
                if (comedian && gameState.currentPromptId) {
                    currentPrompt = (comedian.prompts as any).id(gameState.currentPromptId);
                    promptAnswer = currentPrompt?.answer;
                }
            }

            // Create the vote record with enhanced data
            await Vote.create({
                promptId,
                username: username.toLowerCase(),
                vote,
                timestamp: new Date(),
                gameSessionId: gameState?._id?.toString(),
                comedianId: comedian?._id?.toString(),
                promptAnswer // Store the actual answer for leaderboard calculation
            });

            // Update user stats
            await AudienceUser.updateOne(
                { username: username.toLowerCase() },
                { 
                    $inc: { 
                        voteCount: 1,
                        totalVotes: 1 
                    },
                    lastActiveAt: new Date()
                }
            );

            console.log(`Vote submitted by ${username}: ${vote} for prompt ${promptId}`);

            // Confirm vote submission to the user
            socket.emit('voteConfirmed', {
                promptId,
                userVote: vote
            });

            // Broadcast updated vote counts
            const votes = await Vote.find({ promptId });
            const truthVotes = votes.filter(v => v.vote === 'truth').length;
            const lieVotes = votes.filter(v => v.vote === 'lie').length;

            io.emit('voteResults', {
                promptId,
                truth: truthVotes,
                lie: lieVotes,
                total: votes.length
            });

        } catch (error) {
            console.error('Error submitting vote:', error);
            socket.emit('error', 'Failed to submit vote');
        }
    });

    // Update user accuracy when a prompt gets a guess (called from admin panel)
    socket.on('updateVoteAccuracy', async (data: { promptId: string, actualAnswer: 'truth' | 'lie' }) => {
        try {
            const { promptId, actualAnswer } = data;

            // Get all votes for this prompt
            const votes = await Vote.find({ promptId });

            // Update each voter's accuracy
            for (const vote of votes) {
                const wasCorrect = vote.vote === actualAnswer;
                
                if (wasCorrect) {
                    // Update user stats for correct vote
                    const user = await AudienceUser.findOne({ username: vote.username });
                    if (user) {
                        user.correctVotes += 1;
                        user.currentStreak += 1;
                        
                        // Update longest streak if current streak is longer
                        if (user.currentStreak > user.longestStreak) {
                            user.longestStreak = user.currentStreak;
                        }
                        
                        await user.save();
                    }
                } else {
                    // Reset current streak for incorrect vote
                    await AudienceUser.updateOne(
                        { username: vote.username },
                        { currentStreak: 0 }
                    );
                }
            }

            console.log(`Updated accuracy for ${votes.length} votes on prompt ${promptId}`);
            
            // Optionally emit updated leaderboard
            socket.emit('accuracyUpdated', { promptId, updatedUsers: votes.length });

        } catch (error) {
            console.error('Error updating vote accuracy:', error);
            socket.emit('error', 'Failed to update accuracy');
        }
    });

    // Get vote results (unchanged, still works with username field)
    socket.on('getVoteResults', async (promptId: string) => {
        try {
            const votes = await Vote.find({ promptId });
            const truthVotes = votes.filter(v => v.vote === 'truth').length;
            const lieVotes = votes.filter(v => v.vote === 'lie').length;

            socket.emit('voteResults', {
                promptId,
                truth: truthVotes,
                lie: lieVotes,
                total: votes.length,
                // Additional detail: usernames who voted for each
                truthVoters: votes.filter(v => v.vote === 'truth').map(v => v.username),
                lieVoters: votes.filter(v => v.vote === 'lie').map(v => v.username)
            });
        } catch (error) {
            console.error('Error getting vote results:', error);
            socket.emit('error', 'Failed to get vote results');
        }
    });

    // Get user's specific vote for a prompt (now using username)
    socket.on('getUserVote', async (data: { promptId: string, username: string }) => {
        try {
            const userVote = await Vote.findOne({
                promptId: data.promptId,
                username: data.username.toLowerCase()
            });

            socket.emit('userVoteResult', {
                promptId: data.promptId,
                userVote: userVote?.vote || null,
                hasVoted: !!userVote
            });
        } catch (error) {
            console.error('Error getting user vote:', error);
            socket.emit('error', 'Failed to get user vote');
        }
    });

    // Get leaderboard data
    socket.on('getLeaderboard', async (data?: { gameSessionId?: string, limit?: number }) => {
        try {
            const limit = data?.limit || 20;
            const filter: any = { isActive: true };
            
            // If gameSessionId provided, filter by current game session
            if (data?.gameSessionId) {
                filter.currentGameSessionId = data.gameSessionId;
            }

            const leaderboard = await AudienceUser
                .find(filter)
                .sort({ 
                    correctVotes: -1,      // Primary sort: most correct votes
                    totalVotes: 1,         // Secondary sort: fewer total votes (higher accuracy)
                    username: 1            // Tertiary sort: alphabetical for ties
                })
                .limit(limit)
                .select('username correctVotes totalVotes currentStreak longestStreak joinedAt')
                .lean();

            // Add ranking and accuracy calculation
            const rankedLeaderboard = leaderboard.map((user, index) => ({
                ...user,
                rank: index + 1,
                accuracy: user.totalVotes > 0 ? Math.round((user.correctVotes / user.totalVotes) * 100) : 0
            }));

            socket.emit('leaderboard', {
                leaderboard: rankedLeaderboard,
                totalUsers: await AudienceUser.countDocuments(filter)
            });

        } catch (error) {
            console.error('Error getting leaderboard:', error);
            socket.emit('error', 'Failed to get leaderboard');
        }
    });

    // Clear votes for a specific prompt (admin only)
    socket.on('clearPromptVotes', async (promptId: string) => {
        try {
            // Get votes to revert user stats
            const votes = await Vote.find({ promptId });
            
            // Revert user vote counts
            for (const vote of votes) {
                await AudienceUser.updateOne(
                    { username: vote.username },
                    { 
                        $inc: { 
                            voteCount: -1,
                            totalVotes: -1 
                        }
                    }
                );
            }
            
            // Delete the votes
            await Vote.deleteMany({ promptId });
            console.log('Cleared votes for prompt:', promptId);

            // Notify about cleared votes
            io.emit('voteResults', {
                promptId,
                truth: 0,
                lie: 0,
                total: 0
            });
        } catch (error) {
            console.error('Error clearing votes:', error);
            socket.emit('error', 'Failed to clear votes');
        }
    });
};
// apps/server/src/socket/handlers/votes.ts
import type { Socket } from 'socket.io';
import { Vote } from '../../models/Vote.js';

export const handleVotes = (socket: Socket, io: any) => {
    socket.on('submitVote', async (data: { promptId: string, deviceId: string, vote: 'truth' | 'lie' }) => {
        try {
            // Check if device already voted for this specific prompt
            const existingVote = await Vote.findOne({
                promptId: data.promptId,
                deviceId: data.deviceId
            });

            if (existingVote) {
                socket.emit('error', 'Already voted for this prompt');
                return;
            }

            // Create the vote record
            await Vote.create({
                promptId: data.promptId,
                deviceId: data.deviceId,
                vote: data.vote,
                timestamp: new Date()
            });

            console.log('Vote submitted:', data);

            // Confirm vote submission to the user
            socket.emit('voteConfirmed', {
                promptId: data.promptId,
                userVote: data.vote
            });

            // Optionally broadcast updated vote counts to admins
            const votes = await Vote.find({ promptId: data.promptId });
            const truthVotes = votes.filter(v => v.vote === 'truth').length;
            const lieVotes = votes.filter(v => v.vote === 'lie').length;

            // Emit vote counts to admin panel only
            io.emit('voteResults', {
                promptId: data.promptId,
                truth: truthVotes,
                lie: lieVotes,
                total: votes.length
            });

        } catch (error) {
            console.error('Error submitting vote:', error);
            socket.emit('error', 'Failed to submit vote');
        }
    });

    socket.on('getVoteResults', async (promptId: string) => {
        try {
            const votes = await Vote.find({ promptId });
            const truthVotes = votes.filter(v => v.vote === 'truth').length;
            const lieVotes = votes.filter(v => v.vote === 'lie').length;

            socket.emit('voteResults', {
                promptId,
                truth: truthVotes,
                lie: lieVotes,
                total: votes.length
            });
        } catch (error) {
            console.error('Error getting vote results:', error);
            socket.emit('error', 'Failed to get vote results');
        }
    });

    // Get user's specific vote for a prompt
    socket.on('getUserVote', async (data: { promptId: string, deviceId: string }) => {
        try {
            const userVote = await Vote.findOne({
                promptId: data.promptId,
                deviceId: data.deviceId
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

    // Clear votes for a specific prompt (admin only)
    socket.on('clearPromptVotes', async (promptId: string) => {
        try {
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
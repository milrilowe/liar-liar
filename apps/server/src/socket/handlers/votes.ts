import type { Socket } from 'socket.io';
import { Vote } from '../../models/Vote.js';

export const handleVotes = (socket: Socket, io: any) => {
  socket.on('submitVote', async (data: { promptId: string, deviceId: string, vote: 'truth' | 'lie' }) => {
    try {
      // Check if device already voted
      const existingVote = await Vote.findOne({ 
        promptId: data.promptId, 
        deviceId: data.deviceId 
      });
      
      if (existingVote) {
        socket.emit('error', 'Already voted for this prompt');
        return;
      }
      
      await Vote.create(data);
      console.log('Vote submitted:', data);
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
};
import type { Socket } from 'socket.io';
import { Comedian } from '../../models/Comedian.js';

export const handleComedians = (socket: Socket, io: any) => {
  socket.on('addComedian', async (comedianData: any) => {
    try {
      console.log('Received addComedian:', comedianData);
      
      const newComedian = await Comedian.create({
        ...comedianData,
        prompts: []
      });
      
      const allComedians = await Comedian.find();
      io.emit('comediansList', allComedians);
      console.log('Added comedian:', newComedian.name);
    } catch (error) {
      console.error('Error adding comedian:', error);
      socket.emit('error', 'Failed to add comedian');
    }
  });

  socket.on('removeComedian', async (comedianId: string) => {
    try {
      console.log('Removing comedian:', comedianId);
      await Comedian.findByIdAndDelete(comedianId);
      const allComedians = await Comedian.find();
      io.emit('comediansList', allComedians);
      console.log('Removed comedian:', comedianId);
    } catch (error) {
      console.error('Error removing comedian:', error);
      socket.emit('error', 'Failed to remove comedian');
    }
  });

  socket.on('addPrompt', async (data: { comedianId: string, text: string, answer: 'truth' | 'lie' }) => {
    try {
      await Comedian.findByIdAndUpdate(
        data.comedianId,
        { $push: { prompts: { text: data.text, answer: data.answer } } }
      );
      
      const allComedians = await Comedian.find();
      io.emit('comediansList', allComedians);
      console.log('Added prompt to comedian');
    } catch (error) {
      console.error('Error adding prompt:', error);
      socket.emit('error', 'Failed to add prompt');
    }
  });
};
import type { Socket } from 'socket.io';
import { Comedian, type IComedian, type IPrompt } from '../../models/Comedian.js';

export const handleComedians = (socket: Socket, io: any) => {
  // small helper so we always broadcast the latest list after any mutation
  const broadcastAll = async () => {
    const allComedians = await Comedian.find();
    io.emit('comediansList', allComedians);
  };

  // ---------- CREATE ----------
  socket.on('addComedian', async (comedianData: any) => {
    try {
      console.log('Received addComedian:', comedianData);

      const newComedian = await Comedian.create({
        ...comedianData,
        prompts: [],
      });

      await broadcastAll();
      console.log('Added comedian:', newComedian.name);
    } catch (error) {
      console.error('Error adding comedian:', error);
      socket.emit('error', 'Failed to add comedian');
    }
  });

  // ---------- DELETE COMEDIAN ----------
  socket.on('removeComedian', async (comedianId: string) => {
    try {
      console.log('Removing comedian:', comedianId);
      await Comedian.findByIdAndDelete(comedianId);
      await broadcastAll();
      console.log('Removed comedian:', comedianId);
    } catch (error) {
      console.error('Error removing comedian:', error);
      socket.emit('error', 'Failed to remove comedian');
    }
  });

  // ---------- ADD PROMPT ----------
  // Client payload: { comedianId: string; prompt: { text: string; answer: 'truth' | 'lie' } }
  socket.on(
    'addPrompt',
    async (data: { comedianId: string; prompt: IPrompt }) => {
      try {
        const { comedianId, prompt } = data;

        await Comedian.findByIdAndUpdate(comedianId, {
          $push: { prompts: { text: prompt.text, answer: prompt.answer } },
        });

        await broadcastAll();
        console.log('Added prompt to comedian:', comedianId);
      } catch (error) {
        console.error('Error adding prompt:', error);
        socket.emit('error', 'Failed to add prompt');
      }
    }
  );

  // ---------- UPDATE COMEDIAN (partial) ----------
  // Client payload: Partial<IComedian> & { _id: string }
  socket.on(
    'updateComedian',
    async (payload: { _id: string } & Partial<IComedian>) => {
      try {
        const { _id, ...updates } = payload;
        if (!_id) throw new Error('Missing _id for updateComedian');

        // Guard: prompts should be managed via prompt-specific handlers
        if ('prompts' in updates) {
          delete (updates as any).prompts;
        }

        await Comedian.findByIdAndUpdate(_id, updates, {
          new: true,
          runValidators: true,
        });

        await broadcastAll();
        console.log('Updated comedian:', _id, updates);
      } catch (error) {
        console.error('Error updating comedian:', error);
        socket.emit('error', 'Failed to update comedian');
      }
    }
  );

  // ---------- UPDATE PROMPT (by index) ----------
  // Client payload: { comedianId: string; index: number; prompt: IPrompt }
  socket.on(
    'updatePrompt',
    async (data: {
      comedianId: string;
      index: number;
      prompt: IPrompt;
    }) => {
      try {
        const { comedianId, index, prompt } = data;
        if (index < 0) throw new Error('Invalid prompt index');

        // Validate index exists (clean error instead of silent no-op)
        const comedian = await Comedian.findById(comedianId);
        if (!comedian) throw new Error('Comedian not found');
        if (index >= comedian.prompts.length)
          throw new Error('Prompt index out of range');

        const path = `prompts.${index}`;
        await Comedian.updateOne(
          { _id: comedianId },
          { $set: { [path]: { text: prompt.text, answer: prompt.answer } } }
        );

        await broadcastAll();
        console.log('Updated prompt for comedian:', comedianId, 'index:', index);
      } catch (error) {
        console.error('Error updating prompt:', error);
        socket.emit('error', 'Failed to update prompt');
      }
    }
  );

  // ---------- REMOVE PROMPT (by index) ----------
  // Client payload: { comedianId: string; index: number }
  socket.on(
    'removePrompt',
    async (data: { comedianId: string; index: number }) => {
      try {
        const { comedianId, index } = data;
        if (index < 0) throw new Error('Invalid prompt index');

        const comedian = await Comedian.findById(comedianId);
        if (!comedian) throw new Error('Comedian not found');
        if (index >= comedian.prompts.length)
          throw new Error('Prompt index out of range');

        // Easiest/cleanest: use Mongoose doc ops to splice and save
        comedian.prompts.splice(index, 1);
        await comedian.save();

        await broadcastAll();
        console.log('Removed prompt for comedian:', comedianId, 'index:', index);
      } catch (error) {
        console.error('Error removing prompt:', error);
        socket.emit('error', 'Failed to remove prompt');
      }
    }
  );
};

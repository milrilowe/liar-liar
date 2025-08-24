import type { Socket } from 'socket.io';
import { Comedian } from '../../models/Comedian.js';

export const handleAuth = (socket: Socket, io: any) => {

    // Authenticate comedian for participate app
    socket.on('authenticateComic', async (data: {
        instagram: string;
        password: string;
    }) => {
        try {
            const { instagram, password } = data;

            if (!instagram || !password) {
                socket.emit('authResult', {
                    success: false,
                    error: 'Instagram handle and password required'
                });
                return;
            }

            // Find comedian by instagram handle (case-insensitive)
            const comedian = await Comedian.findOne({
                instagram: new RegExp(`^${instagram}$`, 'i')
            });

            if (!comedian) {
                socket.emit('authResult', {
                    success: false,
                    error: 'Comedian not found'
                });
                return;
            }

            // Check password (direct comparison - in production you'd use hashing)
            if (comedian.password !== password) {
                socket.emit('authResult', {
                    success: false,
                    error: 'Invalid password'
                });
                return;
            }

            // Success! Return comedian info
            socket.emit('authResult', {
                success: true,
                comedian: {
                    _id: comedian._id,
                    name: comedian.name,
                    instagram: comedian.instagram,
                    team: comedian.team
                }
            });

            console.log(`Comedian authenticated: ${comedian.name} (${comedian.instagram})`);

        } catch (error) {
            console.error('Error authenticating comedian:', error);
            socket.emit('authResult', {
                success: false,
                error: 'Server error during authentication'
            });
        }
    });
};
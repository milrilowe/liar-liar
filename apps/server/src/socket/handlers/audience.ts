import type { Socket } from 'socket.io';
import { AudienceUser } from '../../models/AudienceUser.js';
import { v4 as uuidv4 } from 'uuid';

export const handleAudience = (socket: Socket, io: any) => {

    // Check if username is available
    socket.on('checkUsernameAvailable', async (username: string) => {
        try {
            if (!username || username.trim().length < 2) {
                socket.emit('usernameAvailability', { available: false, error: 'Username too short' });
                return;
            }

            const normalizedUsername = username.trim().toLowerCase();
            const existingUser = await AudienceUser.findOne({ username: normalizedUsername });

            socket.emit('usernameAvailability', {
                available: !existingUser,
                error: existingUser ? 'Username already taken' : null
            });

        } catch (error) {
            console.error('Error checking username availability:', error);
            socket.emit('usernameAvailability', { available: false, error: 'Server error' });
        }
    });

    // Register new username
    socket.on('registerUsername', async (data: {
        username: string;
        deviceId?: string; // if they already have one from localStorage
    }) => {
        try {
            const { username, deviceId: existingDeviceId } = data;

            if (!username || username.trim().length < 2) {
                socket.emit('usernameRegistered', {
                    success: false,
                    error: 'Username too short'
                });
                return;
            }

            const normalizedUsername = username.trim().toLowerCase();

            // Check if username is taken
            const existingUser = await AudienceUser.findOne({ username: normalizedUsername });
            if (existingUser) {
                socket.emit('usernameRegistered', {
                    success: false,
                    error: 'Username already taken'
                });
                return;
            }

            // Generate or reuse deviceId
            const deviceId = existingDeviceId || uuidv4();

            // Create user
            const user = await AudienceUser.create({
                username: normalizedUsername,
                deviceId,
                joinedAt: new Date(),
                lastActiveAt: new Date(),
                isActive: true,
                messageCount: 0,
                voteCount: 0
            });

            socket.emit('usernameRegistered', {
                success: true,
                user: {
                    username: user.username,
                    deviceId: user.deviceId,
                    joinedAt: user.joinedAt
                }
            });

            // Broadcast to admins/comics that someone joined
            io.emit('audienceUserJoined', {
                username: user.username,
                totalUsers: await AudienceUser.countDocuments({ isActive: true })
            });

            console.log(`New audience user registered: ${user.username}`);

        } catch (error) {
            console.error('Error registering username:', error);
            socket.emit('usernameRegistered', {
                success: false,
                error: 'Failed to register username'
            });
        }
    });

    // Restore session with existing deviceId
    socket.on('restoreSession', async (deviceId: string) => {
        try {
            if (!deviceId) {
                socket.emit('sessionRestored', { success: false, error: 'No device ID' });
                return;
            }

            const user = await AudienceUser.findOne({ deviceId, isActive: true });
            if (!user) {
                socket.emit('sessionRestored', { success: false, error: 'Session not found' });
                return;
            }

            // Update last active
            user.lastActiveAt = new Date();
            await user.save();

            socket.emit('sessionRestored', {
                success: true,
                user: {
                    username: user.username,
                    deviceId: user.deviceId,
                    joinedAt: user.joinedAt,
                    messageCount: user.messageCount,
                    voteCount: user.voteCount
                }
            });

            console.log(`Session restored for: ${user.username}`);

        } catch (error) {
            console.error('Error restoring session:', error);
            socket.emit('sessionRestored', { success: false, error: 'Failed to restore session' });
        }
    });

    // Get audience stats (for admin panel)
    socket.on('getAudienceStats', async () => {
        try {
            const totalUsers = await AudienceUser.countDocuments({ isActive: true });
            const recentUsers = await AudienceUser
                .find({ isActive: true })
                .sort({ lastActiveAt: -1 })
                .limit(10)
                .select('username joinedAt lastActiveAt messageCount voteCount')
                .exec();

            socket.emit('audienceStats', {
                totalUsers,
                recentUsers
            });

        } catch (error) {
            console.error('Error getting audience stats:', error);
            socket.emit('error', 'Failed to get audience stats');
        }
    });

    // Cleanup inactive users (admin only)
    socket.on('cleanupInactiveUsers', async (data: { olderThanHours?: number }) => {
        try {
            const hours = data.olderThanHours || 24;
            const cutoff = new Date(Date.now() - (hours * 60 * 60 * 1000));

            const result = await AudienceUser.updateMany(
                { lastActiveAt: { $lt: cutoff }, isActive: true },
                { isActive: false }
            );

            socket.emit('usersCleanedUp', {
                deactivated: result.modifiedCount
            });

            console.log(`Deactivated ${result.modifiedCount} inactive users`);

        } catch (error) {
            console.error('Error cleaning up users:', error);
            socket.emit('error', 'Failed to cleanup users');
        }
    });
};
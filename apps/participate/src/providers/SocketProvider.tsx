// apps/participate/src/providers/SocketProvider.tsx
import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'

// Types from server
interface IGameState {
    mode: 'welcome' | 'game' | 'intermission' | 'scoring' | 'end'
    currentComedianId: string | null
    currentPromptId: string | null
    customText: string
    teams: {
        teamA: { name: string; score: number }
        teamB: { name: string; score: number }
    }
}

interface IComedian {
    _id: string
    name: string
    instagram: string
    team: 'teamA' | 'teamB' | 'host'
    prompts: Array<{
        _id: string
        text: string
        answer: 'truth' | 'lie'
        guess?: 'truth' | 'lie'
    }>
}

interface IChatMessage {
    _id: string
    username: string
    text: string
    timestamp: string
    comedianId?: string
    comedianName?: string
    promptId?: string
    promptText?: string
    gameMode?: string
}

interface IAudienceUser {
    username: string
    deviceId: string
    joinedAt: string
    messageCount: number
    voteCount: number
    // New leaderboard fields
    correctVotes?: number
    totalVotes?: number
    currentStreak?: number
    longestStreak?: number
}

type SocketStatus = 'idle' | 'connecting' | 'connected' | 'error'

interface ParticipateSocketContextValue {
    // Connection
    status: SocketStatus
    connected: boolean
    lastError: string | null

    // Game State
    gameState: IGameState | null
    comedians: IComedian[]
    currentComedian: IComedian | null
    currentPrompt: any | null

    // Chat (for comics)
    chatMessages: IChatMessage[]

    // User Management
    currentUser: IAudienceUser | null

    // Actions
    registerUsername: (username: string) => Promise<{ success: boolean; error?: string }>
    restoreSession: (deviceId: string) => Promise<{ success: boolean; error?: string }>
    sendChatMessage: (text: string) => Promise<void>
    submitVote: (vote: 'truth' | 'lie') => Promise<void>
    authenticateComic: (instagram: string, password: string) => Promise<{ success: boolean; error?: string }>
}

const ParticipateSocketContext = createContext<ParticipateSocketContextValue | null>(null)

export function useParticipateSocket(): ParticipateSocketContextValue {
    const ctx = useContext(ParticipateSocketContext)
    if (!ctx) throw new Error('useParticipateSocket must be used within ParticipateSocketProvider')
    return ctx
}

const SOCKET_URL = import.meta.env.VITE_WS_URL ||
    import.meta.env.VITE_SOCKET_URL || window.location.origin;

export function ParticipateSocketProvider({ children }: { children: ReactNode }) {
    const socketRef = useRef<Socket | null>(null)

    // Connection state
    const [status, setStatus] = useState<SocketStatus>('idle')
    const [lastError, setLastError] = useState<string | null>(null)

    // Game state
    const [gameState, setGameState] = useState<IGameState | null>(null)
    const [comedians, setComedians] = useState<IComedian[]>([])
    const [chatMessages, setChatMessages] = useState<IChatMessage[]>([])

    // User state
    const [currentUser, setCurrentUser] = useState<IAudienceUser | null>(null)

    // Derived state
    const currentComedian = gameState?.currentComedianId
        ? comedians.find(c => c._id === gameState.currentComedianId) || null
        : null

    const currentPrompt = currentComedian && gameState?.currentPromptId
        ? currentComedian.prompts.find(p => p._id === gameState.currentPromptId) || null
        : null

    // Initialize socket
    useEffect(() => {
        setStatus('connecting')
        const socket = io(SOCKET_URL, {
            autoConnect: true,
            transports: ['websocket']
        })
        socketRef.current = socket

        // Connection events
        socket.on('connect', () => {
            setStatus('connected')
            setLastError(null)
        })

        socket.on('disconnect', () => {
            setStatus('connecting')
        })

        socket.on('connect_error', (err: Error) => {
            setStatus('error')
            setLastError(err.message)
        })

        // Game state events
        socket.on('gameState', (state: IGameState) => {
            setGameState(state)
        })

        socket.on('comediansList', (list: IComedian[]) => {
            setComedians(list)
        })

        // Chat events (for comics only)
        socket.on('newChatMessage', (message: IChatMessage) => {
            setChatMessages(prev => [...prev, message])
        })

        socket.on('chatMessages', (messages: IChatMessage[]) => {
            setChatMessages(messages)
        })

        socket.on('chatCleared', () => {
            setChatMessages([])
        })

        // Error handling
        socket.on('error', (error: string) => {
            setLastError(error)
        })

        return () => {
            socket.disconnect()
            socketRef.current = null
        }
    }, [])

    // Actions
    const registerUsername = useCallback(async (username: string): Promise<{ success: boolean; error?: string }> => {
        return new Promise((resolve) => {
            const socket = socketRef.current
            if (!socket) {
                resolve({ success: false, error: 'Not connected' })
                return
            }

            // Check if we have existing deviceId
            const existingDeviceId = localStorage.getItem('deviceId')

            socket.emit('registerUsername', {
                username,
                deviceId: existingDeviceId
            })

            const handleResponse = (response: { success: boolean; error?: string; user?: IAudienceUser }) => {
                socket.off('usernameRegistered', handleResponse)

                if (response.success && response.user) {
                    localStorage.setItem('deviceId', response.user.deviceId)
                    localStorage.setItem('username', response.user.username)
                    localStorage.setItem('userType', 'audience')
                    setCurrentUser(response.user)
                }

                resolve({ success: response.success, error: response.error })
            }

            socket.on('usernameRegistered', handleResponse)

            // Timeout after 5 seconds
            setTimeout(() => {
                socket.off('usernameRegistered', handleResponse)
                resolve({ success: false, error: 'Timeout' })
            }, 5000)
        })
    }, [])

    const restoreSession = useCallback(async (deviceId: string): Promise<{ success: boolean; error?: string }> => {
        return new Promise((resolve) => {
            const socket = socketRef.current
            if (!socket) {
                resolve({ success: false, error: 'Not connected' })
                return
            }

            socket.emit('restoreSession', deviceId)

            const handleResponse = (response: { success: boolean; error?: string; user?: IAudienceUser }) => {
                socket.off('sessionRestored', handleResponse)

                if (response.success && response.user) {
                    localStorage.setItem('username', response.user.username)
                    localStorage.setItem('userType', 'audience')
                    setCurrentUser(response.user)
                }

                resolve({ success: response.success, error: response.error })
            }

            socket.on('sessionRestored', handleResponse)

            setTimeout(() => {
                socket.off('sessionRestored', handleResponse)
                resolve({ success: false, error: 'Timeout' })
            }, 5000)
        })
    }, [])

    const sendChatMessage = useCallback(async (text: string): Promise<void> => {
        const socket = socketRef.current
        if (!socket || !currentUser) {
            throw new Error('Not connected or not authenticated')
        }

        socket.emit('submitChatMessage', {
            username: currentUser.username,
            text,
            deviceId: currentUser.deviceId
        })
    }, [currentUser])

    const submitVote = useCallback(async (vote: 'truth' | 'lie'): Promise<void> => {
        const socket = socketRef.current
        if (!socket || !currentUser || !gameState?.currentPromptId) {
            throw new Error('Cannot vote right now')
        }

        // Updated to use username instead of deviceId
        socket.emit('submitVote', {
            promptId: gameState.currentPromptId,
            username: currentUser.username, // Changed from deviceId to username
            vote
        })
    }, [currentUser, gameState])

    const authenticateComic = useCallback(async (instagram: string, password: string): Promise<{ success: boolean; error?: string }> => {
        return new Promise((resolve) => {
            const socket = socketRef.current
            if (!socket) {
                resolve({ success: false, error: 'Not connected' })
                return
            }

            socket.emit('authenticateComic', { instagram, password })

            const handleResponse = (response: { success: boolean; error?: string; comedian?: any }) => {
                socket.off('authResult', handleResponse)

                if (response.success && response.comedian) {
                    localStorage.setItem('auth', 'true')
                    localStorage.setItem('userType', 'comic')
                    localStorage.setItem('userHandle', response.comedian.instagram)
                    localStorage.setItem('comedianId', response.comedian._id)
                    localStorage.setItem('comedianName', response.comedian.name)

                    // Request chat history for this comic
                    socket.emit('getChatMessages', {
                        comedianId: response.comedian._id,
                        password: password,
                        limit: 100
                    })
                }

                resolve({ success: response.success, error: response.error })
            }

            socket.on('authResult', handleResponse)

            // Timeout after 10 seconds
            setTimeout(() => {
                socket.off('authResult', handleResponse)
                resolve({ success: false, error: 'Authentication timeout' })
            }, 10000)
        })
    }, [])

    const value: ParticipateSocketContextValue = {
        status,
        connected: status === 'connected',
        lastError,

        gameState,
        comedians,
        currentComedian,
        currentPrompt,

        chatMessages,
        currentUser,

        registerUsername,
        restoreSession,
        sendChatMessage,
        submitVote,
        authenticateComic
    }

    return (
        <ParticipateSocketContext.Provider value={value}>
            {children}
        </ParticipateSocketContext.Provider>
    )
}

// Export the context for direct access if needed
export { ParticipateSocketContext }
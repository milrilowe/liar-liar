import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import type { IGameState as GameState, IComedian } from '@liar-liar/server/types'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3001'

type GameStateContextValue = {
    connected: boolean
    gameState: GameState        // never null here
    comedians: IComedian[]
    socket: Socket | null
    refreshComedians: () => void
}

const GameStateContext = createContext<GameStateContextValue | null>(null)

export function useGameState() {
    const ctx = useContext(GameStateContext)
    if (!ctx) throw new Error('useGameState must be used within <GameStateProvider>')
    return ctx
}

export function GameStateProvider({ children }: { children: React.ReactNode }) {
    const [connected, setConnected] = useState(false)
    const [gameState, setGameState] = useState<GameState | null>(null)
    const [comedians, setComedians] = useState<IComedian[]>([])
    const sockRef = useRef<Socket | null>(null)

    useEffect(() => {
        const socket = io(SOCKET_URL, { transports: ['websocket'], autoConnect: true })
        sockRef.current = socket

        socket.on('connect', () => {
            setConnected(true)
            socket.emit?.('getComedians')
        })
        socket.on('disconnect', () => setConnected(false))
        socket.on('connect_error', () => setConnected(false))

        socket.on('gameState', (state: GameState) => setGameState(state))
        socket.on('comediansList', (list: IComedian[]) => setComedians(list))

        return () => {
            socket.disconnect()
            sockRef.current = null
        }
    }, [])

    // 🚨 Gate children until gameState exists
    if (!gameState) {
        return <div className="flex h-screen items-center justify-center">Connecting…</div>
    }

    const value: GameStateContextValue = {
        connected,
        gameState,      // now guaranteed non-null
        comedians,
        socket: sockRef.current,
        refreshComedians: () => sockRef.current?.emit?.('getComedians'),
    }

    return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>
}

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { io, type Socket } from 'socket.io-client'
import type { GameState, IComedian } from '@liar-liar/server/types'

/**
 * Minimal Socket provider for a one-off live control app.
 * - Owns the socket lifecycle
 * - Holds server state (gameState, comedians, connection status)
 * - Exposes typed action methods that emit to the server
 * - Keeps UI components dumb/presentational
 */

type TeamKey = 'teamA' | 'teamB'

export type AddComedianPayload = {
  name: string
  instagram?: string
  password: string
  team: 'teamA' | 'teamB' | 'host'
}

export type PromptPayload = { text: string; answer: 'truth' | 'lie' }

export type SocketStatus = 'idle' | 'connecting' | 'connected' | 'error'

export interface SocketContextValue {
  // connection
  status: SocketStatus
  connected: boolean
  lastError: string | null
  reconnect: () => void

  // server state
  gameState: GameState | null
  comedians: IComedian[]

  // game actions
  updateGameState: (partial: Partial<GameState>) => void
  setMode: (mode: GameState['mode']) => void
  setCustomText: (text: string) => void
  incrementScore: (team: TeamKey, delta: number) => void

  // comedian actions
  addComedian: (payload: AddComedianPayload) => void
  updateComedian: (payload: Partial<IComedian> & { _id: string }) => void
  removeComedian: (id: string) => void

  // prompt actions
  addPrompt: (args: { comedianId: string; prompt: PromptPayload }) => void
  updatePrompt: (args: { comedianId: string; index: number; prompt: PromptPayload }) => void
  removePrompt: (args: { comedianId: string; index: number }) => void
}

const SocketCtx = createContext<SocketContextValue | null>(null)

export function useSocket(): SocketContextValue {
  const ctx = useContext(SocketCtx)
  if (!ctx) throw new Error('useSocket must be used within <SocketProvider>')
  return ctx
}

// Prefer env var; fallback for local dev
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3001'

export function SocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null)

  // connection & errors
  const [status, setStatus] = useState<SocketStatus>('idle')
  const [lastError, setLastError] = useState<string | null>(null)

  // server state
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [comedians, setComedians] = useState<IComedian[]>([])

  // Init socket once
  useEffect(() => {
    setStatus('connecting')
    const s = io(SOCKET_URL, {
      autoConnect: true,
      transports: ['websocket'], // lower latency for live control
    })
    socketRef.current = s

    // --- connection lifecycle ---
    const onConnect = () => {
      setStatus('connected')
      setLastError(null)
      // pull initial data you rely on
      s.emit('getComedians')
      // server will also typically push gameState; if not, request it here
      // s.emit('getGameState')
    }

    const onDisconnect = () => {
      setStatus('connecting') // socket.io will try to reconnect by default
    }

    const onConnectError = (err: Error) => {
      setStatus('error')
      setLastError(err.message)
    }

    s.on('connect', onConnect)
    s.on('disconnect', onDisconnect)
    s.on('connect_error', onConnectError)

    // --- server → client data ---
    const onGameState = (state: GameState) => setGameState(state)

    const onComediansList = (list: IComedian[]) => setComedians(list)

    const onComedianAdded = (comedian: IComedian) => {
      setComedians(prev => (prev.some(c => c._id === comedian._id) ? prev : [...prev, comedian]))
    }

    const onComedianUpdated = (updated: IComedian) => {
      setComedians(prev => prev.map(c => (c._id === updated._id ? updated : c)))
    }

    const onComedianRemoved = (id: string) => {
      setComedians(prev => prev.filter(c => c._id !== id))
    }

    s.on('gameState', onGameState)
    s.on('comediansList', onComediansList)
    s.on('comedianAdded', onComedianAdded)
    s.on('comedianUpdated', onComedianUpdated)
    s.on('comedianRemoved', onComedianRemoved)

    return () => {
      s.off('connect', onConnect)
      s.off('disconnect', onDisconnect)
      s.off('connect_error', onConnectError)
      s.off('gameState', onGameState)
      s.off('comediansList', onComediansList)
      s.off('comedianAdded', onComedianAdded)
      s.off('comedianUpdated', onComedianUpdated)
      s.off('comedianRemoved', onComedianRemoved)
      s.disconnect()
      socketRef.current = null
    }
  }, [])

  // --- actions (client → server) ---
  const emit = useCallback(<T,>(event: string, payload?: T) => {
    const s = socketRef.current
    if (!s) return console.warn(`Socket not ready for emit ${event}`)
    s.emit(event, payload as any)
  }, [])

  // Game
  const updateGameState = useCallback((partial: Partial<GameState>) => {
    emit('updateGameState', partial)
  }, [emit])

  const setMode = useCallback((mode: GameState['mode']) => {
    emit('updateGameState', { mode })
  }, [emit])

  const setCustomText = useCallback((text: string) => {
    emit('updateGameState', { customText: text })
  }, [emit])

  const incrementScore = useCallback((team: TeamKey, delta: number) => {
    setGameState(prev => {
      if (!prev) return prev
      const current = prev.teams[team].score
      const nextScore = Math.max(0, current + delta)
      // emit full teams object to keep server authoritative
      emit('updateGameState', {
        teams: {
          ...prev.teams,
          [team]: { ...prev.teams[team], score: nextScore },
        },
      })
      return prev // do not optimistically mutate local state; wait for server echo
    })
  }, [emit])

  // Comedians
  const addComedian = useCallback((payload: AddComedianPayload) => {
    emit('addComedian', payload)
  }, [emit])

  const updateComedian = useCallback((payload: Partial<IComedian> & { _id: string }) => {
    emit('updateComedian', payload)
  }, [emit])

  const removeComedian = useCallback((id: string) => {
    emit('removeComedian', id)
  }, [emit])

  // Prompts
  const addPrompt = useCallback((args: { comedianId: string; prompt: PromptPayload }) => {
    emit('addPrompt', args)
  }, [emit])

  const updatePrompt = useCallback((args: { comedianId: string; index: number; prompt: PromptPayload }) => {
    emit('updatePrompt', args)
  }, [emit])

  const removePrompt = useCallback((args: { comedianId: string; index: number }) => {
    emit('removePrompt', args)
  }, [emit])

  const reconnect = useCallback(() => {
    const s = socketRef.current
    if (!s) return
    setStatus('connecting')
    setLastError(null)
    s.connect()
  }, [])

  const value = useMemo<SocketContextValue>(() => ({
    status,
    connected: status === 'connected',
    lastError,
    reconnect,
    gameState,
    comedians,
    updateGameState,
    setMode,
    setCustomText,
    incrementScore,
    addComedian,
    updateComedian,
    removeComedian,
    addPrompt,
    updatePrompt,
    removePrompt,
  }), [status, lastError, reconnect, gameState, comedians, updateGameState, setMode, setCustomText, incrementScore, addComedian, updateComedian, removeComedian, addPrompt, updatePrompt, removePrompt])

  return <SocketCtx.Provider value={value}>{children}</SocketCtx.Provider>
}

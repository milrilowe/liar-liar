import { createFileRoute } from '@tanstack/react-router'
import { io } from 'socket.io-client'
import { useEffect, useState } from 'react'
import type { GameState } from '@liar-liar/server/types'

export const Route = createFileRoute('/')({
  component: DisplayApp,
})

function DisplayApp() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const socket = io('http://localhost:3001')
    
    socket.on('connect', () => {
      setConnected(true)
      console.log('Display connected to server!')
    })
    
    socket.on('gameState', (state: GameState) => {
      setGameState(state)
      console.log('Display received state:', state)
    })

    socket.on('connect_error', (error) => {
      console.log('Display connection failed:', error)
      setConnected(false)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  if (!connected || !gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white text-4xl">
        Connecting...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white">
      {gameState.mode === 'intro' && <IntroDisplay gameState={gameState} />}
      {gameState.mode === 'game' && <GameDisplay gameState={gameState} />}
      {gameState.mode === 'intermission' && <div className="flex items-center justify-center min-h-screen text-6xl">Intermission</div>}
      {gameState.mode === 'leaderboard' && <div className="flex items-center justify-center min-h-screen text-6xl">Leaderboard</div>}
      {gameState.mode === 'outro' && <div className="flex items-center justify-center min-h-screen text-6xl">Thanks for playing!</div>}
    </div>
  )
}

function IntroDisplay({ gameState }: { gameState: GameState }) {
  return (
    <div className="flex items-center justify-center min-h-screen text-center">
      <div>
        <h1 className="text-8xl font-bold mb-8">{gameState.customText}</h1>
        <p className="text-2xl">Get ready to play!</p>
      </div>
    </div>
  )
}

function GameDisplay({ gameState }: { gameState: GameState }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-6xl font-bold">GAME</div>
    </div>
  )
}
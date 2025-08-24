import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { SocketProvider, useSocket } from '../routes/-context/'

import { GameState, Welcome, Game } from './-components'
import { IGameState } from '@liar-liar/server/types'

export const Route = createFileRoute('/')({
  component: AdminPanel,
})

function AdminPanelWithSocketProvider() {
  const { gameState } = useSocket();
  const [viewMode, setViewMode] = useState<IGameState['mode'] | null>(null);

  if (!gameState) return ('Loading...')

  // Use viewMode if set, otherwise fall back to actual gameState.mode
  const currentMode = viewMode ?? gameState.mode;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <GameState viewedMode={viewMode} setViewedMode={setViewMode} />

      {{
        'welcome': <Welcome />,
        'end': <></>,
        'game': <Game />,
        'intermission': <></>,
        'scoring': <></>,
      }[currentMode]}
    </div>
  )
}

function AdminPanel() {
  return (
    <SocketProvider>
      <AdminPanelWithSocketProvider />
    </SocketProvider>
  )
}
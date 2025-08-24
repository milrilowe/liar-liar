import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SocketProvider, useSocket } from '../routes/-context/'
import { MessageCircle, Gamepad2 } from 'lucide-react'

import { GameState, Welcome, Game, End, Scoring, Chat } from './-components'
import { IGameState } from '@liar-liar/server/types'

export const Route = createFileRoute('/')({
  component: AdminPanel,
})

type ViewType = IGameState['mode'] | 'chat'

function AdminPanelWithSocketProvider() {
  const { gameState } = useSocket();
  const [viewMode, setViewMode] = useState<ViewType>('welcome');

  if (!gameState) return ('Loading...')

  // Use viewMode if it's a game mode, otherwise fall back to actual gameState.mode
  const currentGameMode = viewMode === 'chat' ? gameState.mode : (viewMode ?? gameState.mode);
  const isGameView = viewMode !== 'chat'

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* View Toggle */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant={isGameView ? 'default' : 'outline'}
          onClick={() => setViewMode(gameState.mode)}
          className="flex items-center gap-2"
        >
          <Gamepad2 className="h-4 w-4" />
          Game Control
        </Button>
        <Button
          variant={viewMode === 'chat' ? 'default' : 'outline'}
          onClick={() => setViewMode('chat')}
          className="flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          Audience Chat
        </Button>
      </div>

      {isGameView ? (
        <>
          <GameState viewedMode={currentGameMode as IGameState['mode']} setViewedMode={setViewMode} />

          {{
            'welcome': <Welcome />,
            'end': <End />,
            'game': <Game />,
            'intermission': <></>,
            'scoring': <Scoring />,
          }[currentGameMode as IGameState['mode']]}
        </>
      ) : (
        <Chat />
      )}
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
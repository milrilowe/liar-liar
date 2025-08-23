import { createFileRoute } from '@tanstack/react-router'
import { SocketProvider, useSocket } from '../routes/-context/'

// Feature components (assume they’re all built under routes/-components)
import { GameState, Welcome, Game } from './-components'

export const Route = createFileRoute('/')({
  component: AdminPanel,
})

function AdminPanelWithSocketProvider() {
  const { gameState } = useSocket();

  if (!gameState) return ('Loading...')

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <GameState />

      {{
        'welcome': <Welcome />,
        'end': <></>,
        'game': <Game />,
        'intermission': <></>,
        'scoring': <></>,
      }[gameState.mode]}
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

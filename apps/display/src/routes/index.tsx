import { createFileRoute } from '@tanstack/react-router'
import { FullscreenProvider, GameStateProvider, useGameState } from '@/providers'
import { Game, Welcome, Scoring } from './-components';

export const Route = createFileRoute('/')({
  component: DisplayApp,
})

function DisplayAppWithProviders() {
  const { gameState } = useGameState();

  if (!gameState) return (<>Loading...</>)

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-br from-purple-900 to-blue-900 text-white relative"
    >
      {{
        'welcome': <Welcome />,
        'game': <Game />,
        'intermission': <></>,
        'scoring': <Scoring />,
        'end': <></>
      }[gameState.mode]}

      {/* QR Code in bottom right corner */}
      <div className="fixed bottom-4 right-4 z-50">
        <img
          src="/qr-code.png"
          alt="QR Code"
          className="w-56 h-56 object-contain"
        />
      </div>
    </div>
  )
}

function DisplayApp() {
  return (
    <FullscreenProvider>
      <GameStateProvider>
        <DisplayAppWithProviders />
      </GameStateProvider>
    </FullscreenProvider>
  )
}
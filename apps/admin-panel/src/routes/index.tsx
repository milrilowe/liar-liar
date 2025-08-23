import { createFileRoute } from '@tanstack/react-router'
import { SocketProvider } from '../routes/-context/SocketProvider'
import { Header } from '@/components/Header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Feature components (assume they’re all built under routes/-components)
import { GameStateCard, AddComedianCard, ComedianList } from './-components'

export const Route = createFileRoute('/')({
  component: AdminPanel,
})

function AdminPanel() {
  return (
    <SocketProvider>
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <Header title="Comedy Show Admin" subtitle="Control game state and manage comedians" />

        {/* Connection Badge lives in header or can be separate */}
        <Card className="p-4 flex justify-end">
          <Badge variant="default">Connection handled in SocketProvider</Badge>
        </Card>

        {/* Game State Controls */}
        <GameStateCard />

        {/* Add New Comedian */}
        <AddComedianCard />

        {/* Comedians List */}
        <ComedianList />
      </div>
    </SocketProvider>
  )
}

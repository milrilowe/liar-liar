import { createFileRoute } from '@tanstack/react-router'
import { io, Socket } from 'socket.io-client'
import { useEffect, useState } from 'react'
import type { GameState } from '@liar-liar/server/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/')({
  component: AdminPanel,
})

interface Comedian {
  id: string
  name: string
  instagram: string
  team: 'teamA' | 'teamB' | 'host' | null
  prompts: any[]
  score: number
}

function AdminPanel() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [comedians, setComedians] = useState<Comedian[]>([])
  
  // Form state
  const [comedianForm, setComedianForm] = useState({
    name: '',
    instagram: '',
    password: '',
    team: null as 'teamA' | 'teamB' | 'host' | null
  })

  // Socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:3001')
    setSocket(newSocket)

    newSocket.on('connect', () => {
      setConnected(true)
      console.log('✅ Connected to server')
    })

    newSocket.on('disconnect', () => {
      setConnected(false)
      console.log('❌ Disconnected from server')
    })

    newSocket.on('gameState', (state: GameState) => {
      setGameState(state)
    })

    newSocket.on('comediansList', (list: Comedian[]) => {
      console.log('📝 Received comedians:', list)
      setComedians(list)
    })

    return () => {
      newSocket.disconnect()
    }
  }, [])

  // Handlers
  const changeMode = (mode: GameState['mode']) => {
    socket?.emit('updateGameState', { mode })
  }

  const updateText = (customText: string) => {
    socket?.emit('updateGameState', { customText })
  }

  const addComedian = () => {
    if (!comedianForm.name || !comedianForm.password) return
    
    console.log('🎭 Adding comedian:', comedianForm)
    socket?.emit('addComedian', comedianForm)
    
    // Reset form
    setComedianForm({ name: '', instagram: '', password: '', team: null })
  }

  const removeComedian = (id: string) => {
    socket?.emit('removeComedian', id)
  }

  const updateScore = (team: 'teamA' | 'teamB', change: number) => {
    if (!gameState) return
    
    const newScore = Math.max(0, gameState.teams[team].score + change)
    socket?.emit('updateGameState', {
      teams: {
        ...gameState.teams,
        [team]: {
          ...gameState.teams[team],
          score: newScore
        }
      }
    })
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Comedy Show Admin</h1>
        <Badge variant={connected ? 'default' : 'destructive'}>
          {connected ? '✅ Connected' : '❌ Disconnected'}
        </Badge>
      </div>

      {/* Mode Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Show Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {(["welcome", "game", "intermission", "scoring", "end"] as const).map(mode => (
              <Button
                key={mode}
                onClick={() => changeMode(mode)}
                variant={gameState?.mode === mode ? 'default' : 'outline'}
                className="capitalize"
              >
                {mode}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Text */}
      <Card>
        <CardHeader>
          <CardTitle>Display Text</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={gameState?.customText || ''}
            onChange={(e) => updateText(e.target.value)}
            placeholder="Text to display on screen..."
          />
        </CardContent>
      </Card>

      {/* Comedian Management */}
      <Card>
        <CardHeader>
          <CardTitle>Comedians ({comedians.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add form */}
          <div className="grid grid-cols-5 gap-2">
            <Input
              placeholder="Name"
              value={comedianForm.name}
              onChange={(e) => setComedianForm(prev => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="@instagram"
              value={comedianForm.instagram}
              onChange={(e) => setComedianForm(prev => ({ ...prev, instagram: e.target.value }))}
            />
            <Input
              type="password"
              placeholder="Password"
              value={comedianForm.password}
              onChange={(e) => setComedianForm(prev => ({ ...prev, password: e.target.value }))}
            />
            <select
              value={comedianForm.team || ''}
              onChange={(e) => setComedianForm(prev => ({ 
                ...prev, 
                team: e.target.value === '' ? null : e.target.value as any 
              }))}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">No Team</option>
              <option value="teamA">Team A</option>
              <option value="teamB">Team B</option>
              <option value="host">Host</option>
            </select>
            <Button onClick={addComedian}>Add</Button>
          </div>

          {/* List */}
          <div className="space-y-2">
            {comedians.map(comedian => (
              <div key={comedian.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comedian.name}</span>
                  <span className="text-sm text-gray-500">{comedian.instagram}</span>
                  {comedian.team && (
                    <Badge variant="secondary">
                      {comedian.team === 'teamA' ? 'Team A' : 
                       comedian.team === 'teamB' ? 'Team B' : 'Host'}
                    </Badge>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => removeComedian(comedian.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Team A</span>
                <Badge className="text-lg">{gameState?.teams.teamA.score || 0}</Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => updateScore('teamA', 1)}>+1</Button>
                <Button size="sm" onClick={() => updateScore('teamA', -1)}>-1</Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Team B</span>
                <Badge className="text-lg">{gameState?.teams.teamB.score || 0}</Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => updateScore('teamB', 1)}>+1</Button>
                <Button size="sm" onClick={() => updateScore('teamB', -1)}>-1</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug */}
      <Card>
        <CardHeader>
          <CardTitle>Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify({ gameState, comedians }, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
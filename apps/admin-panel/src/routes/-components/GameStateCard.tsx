import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useSocket } from '../-context/SocketProvider'
import { GameState } from '@liar-liar/server/types'

export function GameStateCard() {
  const { gameState, setMode, setCustomText, incrementScore } = useSocket()
  const [text, setText] = useState<string>(gameState?.customText ?? '')

  // keep input in sync if server changes it externally
  useMemo(() => setText(gameState?.customText ?? ''), [gameState?.customText])

  const currentMode = gameState?.mode
  const scoreA = gameState?.teams.teamA.score ?? 0
  const scoreB = gameState?.teams.teamB.score ?? 0

  const getVariant = (mode: GameState['mode']) =>
    (currentMode === mode ? 'default' : 'outline')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game State Control</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode */}
        <div>
          <h3 className="font-semibold mb-3">
            Current Mode:{' '}
            <span className="text-blue-600">{currentMode ?? 'Unknown'}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button variant={getVariant('welcome')} onClick={() => setMode('welcome')}>Welcome</Button>
            <Button variant={getVariant('game')} onClick={() => setMode('game')}>Game</Button>
            <Button variant={getVariant('intermission')} onClick={() => setMode('intermission')}>Intermission</Button>
            <Button variant={getVariant('scoring')} onClick={() => setMode('scoring')}>Scoring</Button>
            <Button variant={getVariant('end')} onClick={() => setMode('end')}>End</Button>
          </div>
        </div>

        <Separator />

        {/* Custom text */}
        <div>
          <h3 className="font-semibold mb-3">Custom Display Text</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Enter custom text for display..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => setCustomText(text)}>Update Text</Button>
          </div>
        </div>

        <Separator />

        {/* Scores */}
        <div>
          <h3 className="font-semibold mb-3">Team Scores</h3>
          <div className="grid grid-cols-2 gap-4">
            <TeamScore
              label="Team A"
              score={scoreA}
              onDec={() => incrementScore('teamA', -1)}
              onInc={() => incrementScore('teamA', 1)}
            />
            <TeamScore
              label="Team B"
              score={scoreB}
              onDec={() => incrementScore('teamB', -1)}
              onInc={() => incrementScore('teamB', 1)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TeamScore({ label, score, onInc, onDec }: { label: string; score: number; onInc: () => void; onDec: () => void }) {
  return (
    <div className="text-center">
      <h4 className={`font-medium ${label === 'Team A' ? 'text-blue-600' : 'text-red-600'}`}>{label}</h4>
      <div className="text-3xl font-bold mb-2">{score}</div>
      <div className="flex justify-center gap-2">
        <Button size="sm" onClick={onDec}>-1</Button>
        <Button size="sm" onClick={onInc}>+1</Button>
      </div>
    </div>
  )
}

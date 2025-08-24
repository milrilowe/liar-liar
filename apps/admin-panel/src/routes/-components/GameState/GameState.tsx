import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSocket } from '../../-context/SocketProvider'
import { IGameState } from '@liar-liar/server/types'
import { ResetGameButton, SetModeButton } from './components'

export function GameState({ viewedMode, setViewedMode }: {
    viewedMode: IGameState['mode']
    setViewedMode: (mode: IGameState['mode']) => void
}) {
    const { gameState, setMode } = useSocket()
    const currentGameMode = gameState?.mode

    const getVariant = (mode: IGameState['mode']) =>
        (viewedMode === mode ? 'default' : 'outline')

    return (
        <div className="flex gap-3 items-center">
            <Card className='w-full'>
                <CardContent className="space-y-6">
                    {/* Mode Viewer (doesn't change game state) */}
                    <div>
                        <div className="flex flex-wrap gap-2">
                            <Button variant={getVariant('welcome')} onClick={() => setViewedMode('welcome')}>Welcome</Button>
                            <Button variant={getVariant('game')} onClick={() => setViewedMode('game')}>Game</Button>
                            <Button variant={getVariant('intermission')} onClick={() => setViewedMode('intermission')}>Intermission</Button>
                            <Button variant={getVariant('scoring')} onClick={() => setViewedMode('scoring')}>Scoring</Button>
                            <Button variant={getVariant('end')} onClick={() => setViewedMode('end')}>End</Button>
                        </div>
                        {viewedMode !== currentGameMode && (
                            <div className="mt-2 text-xs text-muted-foreground">
                                Viewing: <span className="font-semibold capitalize">{viewedMode}</span> |
                                Actual game mode: <span className="font-semibold capitalize">{currentGameMode}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
            <div className="flex flex-col gap-2">
                <SetModeButton currentlyViewedMode={viewedMode} />
                <ResetGameButton />
            </div>
        </div>
    )
}
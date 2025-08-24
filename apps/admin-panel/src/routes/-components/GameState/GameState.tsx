import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSocket } from '../../-context/SocketProvider'
import { IGameState } from '@liar-liar/server/types'
import { ResetGameButton } from './components'

export function GameState() {
    const { gameState, setMode } = useSocket()

    const currentMode = gameState?.mode

    const getVariant = (mode: IGameState['mode']) =>
        (currentMode === mode ? 'default' : 'outline')

    return (
        <div className="flex gap-3 items-center">
            <Card className='w-full'>
                <CardContent className="space-y-6">
                    {/* Mode */}
                    <div>
                        <div className="flex flex-wrap gap-2">
                            <Button variant={getVariant('welcome')} onClick={() => setMode('welcome')}>Welcome</Button>
                            <Button variant={getVariant('game')} onClick={() => setMode('game')}>Game</Button>
                            <Button variant={getVariant('intermission')} onClick={() => setMode('intermission')}>Intermission</Button>
                            <Button variant={getVariant('scoring')} onClick={() => setMode('scoring')}>Scoring</Button>
                            <Button variant={getVariant('end')} onClick={() => setMode('end')}>End</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <ResetGameButton />
        </div>
    )
}


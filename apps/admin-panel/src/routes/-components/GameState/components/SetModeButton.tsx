import { Button } from '@/components/ui/button'
import { useSocket } from '../../../-context'

interface SetModeButtonProps {
    currentlyViewedMode: string
}

export function SetModeButton({ currentlyViewedMode }: SetModeButtonProps) {
    const { setMode } = useSocket()

    const handleSetMode = () => {
        setMode(currentlyViewedMode as any)
    }

    return (
        <Button variant="default" size="sm" onClick={handleSetMode}>
            Set Mode
        </Button>
    )
}
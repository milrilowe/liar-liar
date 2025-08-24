import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle, 
    AlertDialogTrigger 
} from '@/components/ui/alert-dialog'
import { useSocket } from '@/routes/-context'

export function ResetGameButton() {
    const { resetGame } = useSocket()
    const [isOpen, setIsOpen] = useState(false)

    const handleReset = () => {
        resetGame()
        setIsOpen(false)
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    Reset Game
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Reset Game</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will reset all game state including:
                        <ul className="mt-2 ml-4 list-disc text-sm">
                            <li>Clear current comedian and prompt</li>
                            <li>Reset both team scores to 0</li>
                            <li>Remove all guesses from all prompts</li>
                        </ul>
                        <br />
                        <strong>All comedians and their prompts will be preserved.</strong>
                        <br /><br />
                        Are you sure you want to continue?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset} className="bg-destructive hover:bg-destructive/90">
                        Reset Game
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
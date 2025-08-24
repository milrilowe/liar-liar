import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useGame } from "../context"

export function PromptList() {
    const {
        isViewedComedianCurrent,
        setCurrentComedian,
        viewedComedian,
        viewedPrompts,
        currentPromptId,
        setViewPromptId,
        viewPromptId,
        canSetCurrentPrompt,
        setCurrentPrompt
    } = useGame();

    return (
        <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div className="font-semibold">Prompts</div>
                {isViewedComedianCurrent ? (
                    <Badge>Current Comic</Badge>
                ) : (
                    <Button size="sm" variant="outline" onClick={() => setCurrentComedian(viewedComedian!._id)} disabled={!viewedComedian}>
                        Set Current Comic
                    </Button>
                )}
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
                {viewedPrompts.map((p, idx) => {
                    const isCurrent = currentPromptId === String(p._id)
                    const status = p.guess ? 'Revealed' : isCurrent ? 'Current' : 'Unplayed'
                    return (
                        <Button
                            key={String(p._id)}
                            onClick={() => setViewPromptId(String(p._id))}
                            className={`w-full text-left border rounded p-3 hover:bg-muted transition ${viewPromptId === String(p._id) ? 'ring-2 ring-primary' : ''
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Badge variant={p.guess ? 'default' : isCurrent ? 'secondary' : 'outline'}>{status}</Badge>
                                <div className="text-xs opacity-60">#{idx + 1}</div>
                            </div>
                            <div className="mt-1 line-clamp-2">{p.text}</div>
                            {p.guess && (
                                <div className="mt-1 text-xs opacity-70">Guess: {p.guess.toUpperCase()}</div>
                            )}
                        </Button>
                    )
                })}
            </div>

            <div className="pt-2 border-t mt-2 space-y-2">
                {canSetCurrentPrompt ? (
                    <Button size="sm" onClick={() => setCurrentPrompt(String(viewPromptId))}>
                        Set as Current Prompt
                    </Button>
                ) : (
                    <div className="text-xs opacity-70">
                        {isViewedComedianCurrent
                            ? 'Select a prompt to set it current.'
                            : 'Set this comic as current to choose a live prompt.'}
                    </div>
                )}
            </div>
        </Card>
    )
}
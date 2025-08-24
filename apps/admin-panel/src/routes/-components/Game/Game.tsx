import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSocket } from '../../-context/SocketProvider'

export function Game() {
    const { comedians, gameState, setCurrentComedian, setCurrentPrompt, submitGuess, undoGuess } = useSocket()

    // Local browsing state (does not affect live)
    const [viewComedianId, setViewComedianId] = useState<string | null>(null)
    const [viewPromptId, setViewPromptId] = useState<string | null>(null)
    const [pendingGuess, setPendingGuess] = useState<'truth' | 'lie' | null>(null)

    const currentComedianId = gameState?.currentComedianId ?? null
    const currentPromptId = gameState?.currentPromptId ?? null

    // Pick viewed comedian: default to current, else first in list
    const viewedComedian = useMemo(() => {
        const id = viewComedianId || currentComedianId || comedians[0]?._id || null
        return comedians.find(c => c._id === id) || null
    }, [viewComedianId, currentComedianId, comedians])

    const viewedPrompts = viewedComedian?.prompts ?? []
    const viewedPrompt = useMemo(() => {
        const id = viewPromptId || currentPromptId || null
        return viewedPrompts.find(p => String(p._id) === String(id)) || null
    }, [viewPromptId, currentPromptId, viewedPrompts])

    const isViewedComedianCurrent = viewedComedian && currentComedianId === viewedComedian._id
    const isViewedPromptCurrent = viewedPrompt && currentPromptId === String(viewedPrompt._id)

    const canSetCurrentPrompt = isViewedComedianCurrent && !!viewedPrompt && !isViewedPromptCurrent
    const canSubmit = isViewedComedianCurrent && isViewedPromptCurrent && !viewedPrompt?.guess && !!pendingGuess
    const canUndo = isViewedComedianCurrent && isViewedPromptCurrent && !!viewedPrompt?.guess

    return (
        <div className="flex flex-col gap-6">
            {/* Top 2-col: sidebar (prompts) + main (prompt viewer) */}
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
                {/* Sidebar: Prompts for viewed comedian */}
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
                                <button
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
                                </button>
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

                {/* Main: Prompt viewer & controls */}
                <Card className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm opacity-70">Viewing Comic</div>
                            <div className="text-lg font-semibold">{viewedComedian?.name || '—'}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs opacity-70">Team</div>
                            <div className="font-medium capitalize">{viewedComedian?.team || '—'}</div>
                        </div>
                    </div>

                    <div className="min-h-[120px] border rounded p-4 bg-muted/30">
                        {viewedPrompt ? (
                            <>
                                <div className="text-xs opacity-70">Prompt</div>
                                <div className="mt-1 text-base leading-relaxed">{viewedPrompt.text}</div>
                                {isViewedPromptCurrent && (
                                    <div className="mt-3 text-xs opacity-60">
                                        Answer (admin-only): <span className="font-mono">{viewedPrompt.answer.toUpperCase()}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="opacity-60">Select a prompt from the left.</div>
                        )}
                    </div>

                    {/* Guess selection */}
                    <div className="space-y-2">
                        <div className="text-sm font-medium">Defense Guess</div>
                        <div className="flex gap-2">
                            <Button
                                variant={pendingGuess === 'truth' || viewedPrompt?.guess === 'truth' ? 'default' : 'outline'}
                                onClick={() => setPendingGuess('truth')}
                                disabled={!isViewedPromptCurrent || !!viewedPrompt?.guess}
                            >
                                Truth
                            </Button>
                            <Button
                                variant={pendingGuess === 'lie' || viewedPrompt?.guess === 'lie' ? 'default' : 'outline'}
                                onClick={() => setPendingGuess('lie')}
                                disabled={!isViewedPromptCurrent || !!viewedPrompt?.guess}
                            >
                                Lie
                            </Button>
                        </div>
                        {!isViewedPromptCurrent && (
                            <div className="text-xs opacity-70">Set this prompt as current to enable guessing.</div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={() => pendingGuess && submitGuess(pendingGuess)} disabled={!canSubmit}>
                            Submit Guess
                        </Button>
                        <Button variant="outline" onClick={() => undoGuess()} disabled={!canUndo}>
                            Undo
                        </Button>
                    </div>

                    {viewedPrompt?.guess && (
                        <div className="pt-2 text-sm opacity-80">
                            Guess submitted: <span className="font-semibold">{viewedPrompt.guess.toUpperCase()}</span>
                            {isViewedPromptCurrent ? ' (current prompt)' : ''}
                        </div>
                    )}
                </Card>
            </div>

            {/* Bottom: Roster carousel */}
            
        </div>
    )
}

"use client"

// apps/admin-panel/src/routes/-components/Game/components/MainContent.tsx
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useGame } from "../context"

export function MainContent() {
    const {
        viewedComedian,
        viewedPrompt,
        isViewedPromptCurrent,
        canSubmit,
        canUndo,
        pendingGuess,
        setPendingGuess,
        submitGuess,
        undoGuess,
    } = useGame()

    return (
        <Card className="p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm opacity-70">Viewing Comic</div>
                    <div className="text-lg font-semibold">{viewedComedian?.name || "—"}</div>
                </div>
                <div className="text-right">
                    <div className="text-xs opacity-70">Team</div>
                    <div className="font-medium capitalize">{viewedComedian?.team || "—"}</div>
                </div>
            </div>

            {/* Prompt Display */}
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

            {/* Guess Selection */}
            <div className="space-y-2">
                <div className="text-sm font-medium">Defense Guess</div>
                <div className="flex gap-2">
                    <Button
                        variant={pendingGuess === "truth" || viewedPrompt?.guess === "truth" ? "default" : "outline"}
                        onClick={() => setPendingGuess("truth")}
                        disabled={!isViewedPromptCurrent || !!viewedPrompt?.guess}
                    >
                        Truth
                    </Button>
                    <Button
                        variant={pendingGuess === "lie" || viewedPrompt?.guess === "lie" ? "default" : "outline"}
                        onClick={() => setPendingGuess("lie")}
                        disabled={!isViewedPromptCurrent || !!viewedPrompt?.guess}
                    >
                        Lie
                    </Button>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
                <Button onClick={() => submitGuess(pendingGuess!)} disabled={!canSubmit}>
                    Submit Guess
                </Button>
                <Button variant="secondary" onClick={undoGuess} disabled={!canUndo}>
                    Undo Guess
                </Button>
                <Button variant="outline" onClick={() => setPendingGuess(null)} disabled={!pendingGuess}>
                    Clear Selection
                </Button>
            </div>
        </Card>
    )
}

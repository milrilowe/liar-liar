"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, Clock, Play, Zap } from "lucide-react"
import { useGame } from "../context"

export function PromptDetail() {
    const {
        currentPromptId,
        viewedPrompt,
        viewedComedian,
        isViewedComedianCurrent,
        pendingGuess,
        canSubmit,
        canUndo,
        setCurrentPrompt,
        setPendingGuess,
        submitGuess,
        undoGuess,
        setViewPromptId,
    } = useGame()

    if (!viewedPrompt || !viewedComedian) return null

    const prompt = viewedPrompt
    const comedianName = viewedComedian.name

    const handleBack = () => {
        setViewPromptId(null)
    }

    const isCurrent = currentPromptId === String(prompt._id)
    const status = prompt.guess ? "Revealed" : isCurrent ? "Live" : "Ready"
    const statusColor = prompt.guess ? "default" : isCurrent ? "secondary" : "outline"

    const handleSetCurrent = () => {
        setCurrentPrompt(String(prompt._id))
    }

    const handleSubmitGuess = () => {
        if (pendingGuess) {
            submitGuess(pendingGuess)
        }
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={handleBack}>
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <div className="text-sm text-muted-foreground">Viewing Prompt</div>
                            <div className="font-semibold">{comedianName}</div>
                        </div>
                    </div>
                    <Badge variant={statusColor}>
                        {status === "Live" && <Zap className="w-3 h-3 mr-1" />}
                        {status === "Revealed" && <CheckCircle className="w-3 h-3 mr-1" />}
                        {status === "Ready" && <Clock className="w-3 h-3 mr-1" />}
                        {status}
                    </Badge>
                </div>
            </Card>

            {/* Prompt Content */}
            <Card className="p-6">
                <div className="space-y-4">
                    <div>
                        <div className="text-sm text-muted-foreground mb-2">Prompt</div>
                        <p className="text-lg leading-relaxed">{prompt.text}</p>
                    </div>

                    {isCurrent && prompt.answer && (
                        <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
                            <div className="text-xs text-muted-foreground mb-1">Answer (Admin Only)</div>
                            <div className="font-mono font-semibold text-primary">{prompt.answer.toUpperCase()}</div>
                        </div>
                    )}

                    {prompt.guess && (
                        <div className="flex items-center gap-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
                            <CheckCircle className="w-5 h-5 text-primary" />
                            <div>
                                <div className="text-sm font-semibold">Final Guess</div>
                                <div className="text-sm text-muted-foreground">
                                    Defense guessed: <span className="font-semibold capitalize">{prompt.guess}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Actions */}
            {!isCurrent && isViewedComedianCurrent && (
                <Card className="p-4">
                    <Button onClick={handleSetCurrent} className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        Set as Live Prompt
                    </Button>
                </Card>
            )}

            {isCurrent && !prompt.guess && (
                <Card className="p-4 space-y-4">
                    <div>
                        <div className="text-sm font-semibold mb-3">Defense Guess</div>
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant={pendingGuess === "truth" ? "default" : "outline"}
                                onClick={() => setPendingGuess(pendingGuess === "truth" ? null : "truth")}
                                className="h-12"
                            >
                                Truth
                            </Button>
                            <Button
                                variant={pendingGuess === "lie" ? "default" : "outline"}
                                onClick={() => setPendingGuess(pendingGuess === "lie" ? null : "lie")}
                                className="h-12"
                            >
                                Lie
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                        <Button onClick={handleSubmitGuess} disabled={!canSubmit} className="flex-1">
                            Submit Guess
                        </Button>
                        {pendingGuess && (
                            <Button variant="outline" onClick={() => setPendingGuess(null)}>
                                Clear
                            </Button>
                        )}
                    </div>
                </Card>
            )}

            {canUndo && (
                <Card className="p-4">
                    <Button variant="destructive" onClick={undoGuess} className="w-full">
                        Undo Last Guess
                    </Button>
                </Card>
            )}
        </div>
    )
}

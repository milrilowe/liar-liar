"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronRight, Play, CheckCircle } from "lucide-react"
import { useGame } from "../context"
import { IPrompt } from "@liar-liar/server/types"

interface PromptCardProps {
    prompt: IPrompt
    index: number
    onView?: (promptId: string) => void // Added onView prop to handle navigation
}

export function PromptCard({ prompt, index, onView }: PromptCardProps) {
    const { currentPromptId, viewPromptId, canSetCurrentPrompt, setViewPromptId, setCurrentPrompt } = useGame()

    const promptId = prompt._id ? String(prompt._id) : `prompt-${index}`
    const isCurrent = currentPromptId === promptId
    const isViewed = viewPromptId === promptId

    const handleView = () => {
        if (onView) {
            onView(promptId)
        } else {
            setViewPromptId(promptId)
        }
    }

    const handleSetCurrent = () => {
        setCurrentPrompt(promptId)
    }

    const status = prompt.guess ? "Revealed" : isCurrent ? "Live" : "Ready"
    const statusColor = prompt.guess ? "default" : isCurrent ? "secondary" : "outline"

    return (
        <Card
            className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer border-2 ${isViewed ? "ring-2 ring-primary shadow-lg bg-card" : "border-border hover:border-primary/30"
                } ${isCurrent ? "bg-accent/10 border-accent shadow-md" : ""}`}
            onClick={handleView}
        >
            <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={statusColor}
                            className={`text-xs font-medium ${prompt.guess
                                    ? "bg-muted text-muted-foreground"
                                    : isCurrent
                                        ? "bg-accent text-accent-foreground"
                                        : "bg-card-foreground/10 text-card-foreground"
                                }`}
                        >
                            {status}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">#{index + 1}</span>
                    </div>
                    <ChevronRight
                        className={`w-4 h-4 transition-all flex-shrink-0 ${isViewed
                                ? "rotate-90 text-primary"
                                : "text-muted-foreground group-hover:translate-x-1 group-hover:text-card-foreground"
                            }`}
                    />
                </div>

                <div className="space-y-2">
                    <p className="text-sm leading-relaxed line-clamp-3 text-card-foreground group-hover:text-foreground transition-colors font-medium">
                        {prompt.text}
                    </p>

                    {prompt.guess && (
                        <div className="flex items-center gap-2 pt-2 border-t border-border">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <span className="text-xs text-muted-foreground">
                                Guessed: <span className="font-semibold capitalize text-card-foreground">{prompt.guess}</span>
                            </span>
                        </div>
                    )}
                </div>

                {canSetCurrentPrompt && !isCurrent && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleSetCurrent()
                        }}
                        className="w-full mt-3 bg-secondary text-secondary-foreground hover:bg-secondary/90 border-secondary"
                    >
                        <Play className="w-4 h-4 mr-2" />
                        Set Live
                    </Button>
                )}
            </div>
        </Card>
    )
}
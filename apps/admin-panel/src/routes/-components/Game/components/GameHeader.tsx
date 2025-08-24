"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Users, Zap } from "lucide-react"

interface GameHeaderProps {
    currentComedianName?: string
    totalComedians: number
    onClearCurrent?: () => void
    onBack?: () => void
}

export function GameHeader({ currentComedianName, totalComedians, onClearCurrent, onBack }: GameHeaderProps) {
    return (
        <Card className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <Button variant="ghost" size="sm" onClick={onBack}>
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    )}
                    <div>
                        <h1 className="text-xl font-bold font-serif">Truth or Lie Game</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{totalComedians} comedians</span>
                        </div>
                    </div>
                </div>

                {currentComedianName && (
                    <div className="flex items-center gap-2">
                        <div className="text-right">
                            <div className="text-xs text-muted-foreground">Now Live</div>
                            <div className="font-semibold">{currentComedianName}</div>
                        </div>
                        <Badge variant="secondary" className="bg-secondary">
                            <Zap className="w-3 h-3 mr-1" />
                            Live
                        </Badge>
                        {onClearCurrent && (
                            <Button variant="outline" size="sm" onClick={onClearCurrent}>
                                End
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </Card>
    )
}

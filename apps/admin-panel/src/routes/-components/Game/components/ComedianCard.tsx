"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronRight, Play, Square } from "lucide-react"
import { useGame } from "../context"
import { IComedian } from "@liar-liar/server/types"

interface ComedianCardProps {
    comedian: IComedian
    onView?: (comedianId: string) => void // Added onView prop to handle navigation
}

export function ComedianCard({ comedian, onView }: ComedianCardProps) {
    const { currentComedianId, viewComedianId, setViewComedianId, setCurrentComedian } = useGame()

    const isCurrent = currentComedianId === comedian._id
    const isViewed = viewComedianId === comedian._id

    const handleView = () => {
        if (onView) {
            onView(comedian._id)
        } else {
            setViewComedianId(comedian._id)
        }
    }

    const handleSetCurrent = () => {
        setCurrentComedian(comedian._id)
    }

    const handleClearCurrent = () => {
        setCurrentComedian(null)
    }

    return (
        <Card
            className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer ${isViewed ? "ring-2 ring-primary shadow-lg" : ""
                } ${isCurrent ? "bg-primary/5 border-primary/20" : ""}`}
            onClick={handleView}
        >
            <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg font-serif truncate group-hover:text-primary transition-colors">
                            {comedian.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge
                                variant={isCurrent ? "default" : "secondary"}
                                className={`capitalize text-xs ${isCurrent ? "bg-primary" : ""}`}
                            >
                                {isCurrent ? "Live" : comedian.team}
                            </Badge>
                            {comedian.prompts && (
                                <span className="text-xs text-muted-foreground">{comedian.prompts.length} prompts</span>
                            )}
                        </div>
                    </div>
                    <ChevronRight
                        className={`w-5 h-5 text-muted-foreground transition-all ${isViewed ? "rotate-90 text-primary" : "group-hover:translate-x-1"
                            }`}
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-border/50">
                    <Button
                        size="sm"
                        variant={isViewed ? "default" : "outline"}
                        onClick={(e) => {
                            e.stopPropagation()
                            handleView()
                        }}
                        className="flex-1"
                    >
                        {isViewed ? "Viewing" : "View"}
                    </Button>
                    {isCurrent ? (
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleClearCurrent()
                            }}
                            className="px-3"
                        >
                            <Square className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleSetCurrent()
                            }}
                            className="px-3"
                        >
                            <Play className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    )
}
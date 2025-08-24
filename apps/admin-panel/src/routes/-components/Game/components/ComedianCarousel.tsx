"use client"

import type { IComedian } from "@liar-liar/server/types"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ComedianCarouselProps {
    comedians: IComedian[]
    selectedComedianId: string | null
    currentComedianId: string | null
    onSelectComedian: (comedianId: string) => void
}

export function ComedianCarousel({
    comedians,
    selectedComedianId,
    currentComedianId,
    onSelectComedian,
}: ComedianCarouselProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
            <div className="mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Select Comedian</h3>
            </div>

            <ScrollArea className="w-full">
                <div className="flex gap-3 pb-2">
                    {comedians.map((comedian) => {
                        const isSelected = selectedComedianId === comedian._id
                        const isCurrent = currentComedianId === comedian._id

                        return (
                            <Card
                                key={comedian._id}
                                className={`
                  flex-shrink-0 p-3 cursor-pointer transition-all duration-200 min-w-[140px]
                  ${isSelected ? "bg-primary text-primary-foreground ring-2 ring-primary" : "bg-card hover:bg-card/80"}
                  ${isCurrent ? "ring-2 ring-accent" : ""}
                `}
                                onClick={() => onSelectComedian(comedian._id)}
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold text-sm">
                                            {comedian.name.charAt(0)}
                                        </div>
                                        {isCurrent && <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
                                    </div>

                                    <div>
                                        <div className="font-medium text-sm truncate font-serif">{comedian.name}</div>
                                        <div className="text-xs text-muted-foreground capitalize">{comedian.team}</div>
                                        <div className="text-xs text-muted-foreground">{comedian.prompts?.length || 0} prompts</div>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            </ScrollArea>
        </div>
    )
}

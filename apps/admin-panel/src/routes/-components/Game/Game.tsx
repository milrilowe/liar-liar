"use client"

import { Button } from "@/components/ui/button"

import { useState } from "react"
import { ViewerProvider, useGame } from "./context"
import { GameHeader, ComedianCard, PromptCard, PromptDetail, ComedianCarousel } from "./components"

function GameContent() {
    const {
        comedians,
        currentComedianId,
        viewedComedian,
        viewedPrompts,
        viewedPrompt,
        viewPromptId,
        isViewedComedianCurrent,
        setViewComedianId,
        setViewPromptId,
        setCurrentComedian,
    } = useGame()

    const currentComedianName = comedians.find((c) => c._id === currentComedianId)?.name

    const handleSelectComedian = (comedianId: string) => {
        setViewComedianId(comedianId)
        setViewPromptId(null) // Clear any viewed prompt when switching comedians
    }

    const handleViewPrompt = (promptId: string) => {
        setViewPromptId(promptId)
    }

    const handleBackToPrompts = () => {
        setViewPromptId(null)
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Main content area */}
            <div className="flex-1 p-4 pb-32 space-y-4">
                {!viewedComedian && (
                    <div className="flex flex-col items-center justify-center py-16 space-y-4">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-serif font-bold text-card-foreground">Truth or Lie Game</h2>
                            <p className="text-muted-foreground">Select a comedian from the carousel below to view their prompts</p>
                        </div>
                    </div>
                )}

                {viewPromptId && viewedPrompt && viewedComedian && <PromptDetail />}

                {viewedComedian && !viewPromptId && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <div>
                                <div className="text-sm text-muted-foreground">Prompts for</div>
                                <div className="font-semibold text-xl font-serif text-card-foreground">{viewedComedian.name}</div>
                                <div className="text-sm text-muted-foreground capitalize">{viewedComedian.team}</div>
                            </div>
                            {!isViewedComedianCurrent && (
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentComedian(viewedComedian._id)}
                                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                                >
                                    Set as Live Comedian
                                </Button>
                            )}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {viewedPrompts.map((prompt, index) => (
                                <PromptCard key={String(prompt._id)} prompt={prompt} index={index} onView={handleViewPrompt} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <ComedianCarousel
                comedians={comedians}
                selectedComedianId={viewedComedian?._id || null}
                currentComedianId={currentComedianId}
                onSelectComedian={handleSelectComedian}
            />
        </div>
    )
}

export function Game() {
    return (
        <ViewerProvider>
            <GameContent />
        </ViewerProvider>
    )
}
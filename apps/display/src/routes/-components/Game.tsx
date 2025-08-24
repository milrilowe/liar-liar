"use client"

import { useGameState } from "@/providers"
import { useMemo } from "react"

export function Game() {
    const { gameState, comedians } = useGameState()

    const currentComedian = useMemo(
        () => comedians.find((c) => String(c._id) === String(gameState.currentComedianId)) || null,
        [comedians, gameState.currentComedianId],
    )

    const currentPrompt = useMemo(() => {
        if (!currentComedian || !gameState.currentPromptId) return null
        return currentComedian.prompts.find((p) => String((p as any)._id) === String(gameState.currentPromptId)) || null
    }, [currentComedian, gameState.currentPromptId])

    const gamePhase = useMemo(() => {
        if (!currentComedian) return "waiting-comedian"
        if (!currentPrompt) return "waiting-prompt"
        return "showing-prompt"
    }, [currentComedian, currentPrompt])

    const renderGamePhase = () => {
        switch (gamePhase) {
            case "waiting-comedian":
                return (
                    <div className="text-center">
                        <div className="text-6xl md:text-8xl font-black text-yellow-400 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] mb-4 transform -rotate-2">
                            STAND BY...
                        </div>
                        <div className="text-2xl text-white opacity-80">Awaiting comedian...</div>
                    </div>
                )

            case "waiting-prompt":
                return (
                    <div className="text-center">
                        <div className="text-5xl md:text-7xl font-black text-yellow-400 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] mb-4 transform rotate-1">
                            GET READY!
                        </div>
                        <div className="text-2xl text-white opacity-80">Waiting for prompt...</div>
                    </div>
                )

            case "showing-prompt":
                return (
                    <div className="max-w-5xl px-6 text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="text-4xl md:text-6xl leading-tight font-bold text-white drop-shadow-[3px_3px_0px_rgba(0,0,0,0.8)] mb-8">
                            {(currentPrompt as any).text}
                        </div>

                        {((currentPrompt as any).guess) ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 border-4 border-black shadow-2xl transform rotate-2 animate-in zoom-in-95 duration-700 delay-300">
                                    <div
                                        className={`text-6xl md:text-8xl font-black tracking-wider drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] transform -rotate-1 ${(currentPrompt as any).answer === "truth" ? "text-green-500" : "text-red-500"
                                            }`}
                                    >
                                        {(currentPrompt as any).answer.toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute text-yellow-300 opacity-60 animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            fontSize: `${Math.random() * 20 + 10}px`,
                        }}
                    >
                        ★
                    </div>
                ))}
            </div>

            {currentComedian && (
                <div className="absolute top-8 left-0 right-0 mx-auto w-full max-w-6xl px-6">
                    <div className="flex items-center justify-between bg-black/20 backdrop-blur-sm rounded-2xl p-6 border-4 border-yellow-400">
                        <div className="text-left gap-3 flex flex-col cols-1">
                            <div className="text-3xl md:text-4xl font-black text-yellow-400 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                {currentComedian.name}
                            </div>
                            <div className="text-white opacity-90 text-lg" style={{ fontFamily: 'KGSummerSunshineBlackout' }}>@{currentComedian.instagram}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-yellow-400 capitalize drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                {currentComedian.team === 'host' ? 'Your Host' : currentComedian.team === 'teamA' ? 'Team Advocates' : 'Team Believers'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 flex items-center justify-center" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif', fontWeight: 600 }}>{renderGamePhase()}</div>
        </div>
    )
}

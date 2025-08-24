"use client"

import type React from "react"

import { createContext, useContext, useMemo, useState } from "react"
import { useSocket } from "@/routes/-context"
import type { IComedian, IPrompt } from "@liar-liar/server/types"
import type { Types as MTypes } from "mongoose"

type Guess = "truth" | "lie" | null

type ViewerContextValue = {
    // live game data
    comedians: IComedian[]
    gameState: any
    setCurrentComedian: (id: string | null) => void
    setCurrentPrompt: (id: string | null) => void
    submitGuess: (guess: "truth" | "lie") => void
    undoGuess: () => void

    // local viewer/browsing state
    viewComedianId: string | null
    setViewComedianId: (id: string | null) => void
    viewPromptId: string | null
    setViewPromptId: (id: string | null) => void
    pendingGuess: Guess
    setPendingGuess: (g: Guess) => void

    // derived
    currentComedianId: string | null
    currentPromptId: string | null
    viewedComedian: IComedian | null
    viewedPrompts: IPrompt[]
    viewedPrompt: IPrompt | null
    isViewedComedianCurrent: boolean
    isViewedPromptCurrent: boolean
    canSetCurrentPrompt: boolean
    canSubmit: boolean
    canUndo: boolean
}

const ViewerContext = createContext<ViewerContextValue | null>(null)

export function ViewerProvider({ children }: { children: React.ReactNode }) {
    const { comedians, gameState, setCurrentComedian, setCurrentPrompt, submitGuess, undoGuess } = useSocket()

    const [viewComedianId, setViewComedianId] = useState<string | null>(null)
    const [viewPromptId, setViewPromptId] = useState<string | null>(null)
    const [pendingGuess, setPendingGuess] = useState<Guess>(null)

    const currentComedianId = gameState?.currentComedianId ?? null
    const currentPromptId = gameState?.currentPromptId ?? null

    const viewedComedian = useMemo(() => {
        const id = viewComedianId || currentComedianId || comedians[0]?._id || null
        return comedians.find((c) => String(c._id) === String(id)) || null
    }, [viewComedianId, currentComedianId, comedians])

    const viewedPrompts = (viewedComedian?.prompts ?? []) as (IPrompt & { _id: MTypes.ObjectId })[]

    const viewedPrompt = useMemo(() => {
        const id = viewPromptId || currentPromptId || null
        return viewedPrompts.find((p) => String(p._id) === String(id)) || null
    }, [viewPromptId, currentPromptId, viewedPrompts])

    const isViewedComedianCurrent = !!viewedComedian && String(currentComedianId) === String(viewedComedian._id)

    const isViewedPromptCurrent = !!viewedPrompt && String(currentPromptId) === String((viewedPrompt as any)._id)

    const canSetCurrentPrompt = isViewedComedianCurrent && !!viewedPrompt && !isViewedPromptCurrent

    const canSubmit = isViewedComedianCurrent && isViewedPromptCurrent && !(viewedPrompt as any)?.guess && !!pendingGuess

    const canUndo = isViewedComedianCurrent && isViewedPromptCurrent && !!(viewedPrompt as any)?.guess

    const value: ViewerContextValue = {
        comedians,
        gameState,
        setCurrentComedian,
        setCurrentPrompt,
        submitGuess,
        undoGuess,

        viewComedianId,
        setViewComedianId,
        viewPromptId,
        setViewPromptId,
        pendingGuess,
        setPendingGuess,

        currentComedianId,
        currentPromptId,
        viewedComedian,
        viewedPrompts,
        viewedPrompt,
        isViewedComedianCurrent,
        isViewedPromptCurrent,
        canSetCurrentPrompt,
        canSubmit,
        canUndo,
    }

    return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>
}

export function useGame() {
    const ctx = useContext(ViewerContext)
    if (!ctx) throw new Error("useViewer must be used within <ViewerProvider>")
    return ctx
}

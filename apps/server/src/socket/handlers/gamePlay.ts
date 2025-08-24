// server/handlers/handleGameplay.ts
// Fixes: TS "prompt is possibly undefined" by using subdoc .id() lookup + explicit guards

import type { Socket } from 'socket.io'
import { Types } from 'mongoose'
import { GameState } from '../../models/GameState.js'
import { Comedian } from '../../models/Comedian.js'

// Helper: ensure a GameState doc exists
async function getOrCreateGameState() {
    let gs = await GameState.findOne()
    if (!gs) gs = await GameState.create({})
    return gs
}

// Helper: fetch current comedian or throw
async function getCurrentComedianOrThrow() {
    const gs = await GameState.findOne()
    if (!gs?.currentComedianId) throw new Error('No current comedian')
    const comedian = await Comedian.findById(gs.currentComedianId)
    if (!comedian) throw new Error('Comedian not found')
    return { gs, comedian }
}

// Helper: fetch current prompt subdoc or throw (typed)
function getPromptByIdOrThrow<T extends { _id: any }>(
    prompts: (T & { _id: Types.ObjectId })[],
    promptId: string | Types.ObjectId,
) {
    const prompt = (prompts as any).id?.(promptId) as (T & { _id: Types.ObjectId }) | null
    if (!prompt) throw new Error('Prompt not found')
    return prompt
}

export const handleGameplay = (socket: Socket, io: any) => {
    // ---------- Set current comedian ----------
    socket.on('setCurrentComedian', async (comedianId: string | null) => {
        try {
            await getOrCreateGameState()
            await GameState.updateOne({}, {
                currentComedianId: comedianId,
                currentPromptId: null  // Clear prompt when comedian changes
            })
            const updated = await GameState.findOne()
            io.emit('gameState', updated)
        } catch (err) {
            console.error('setCurrentComedian error', err)
            socket.emit('error', 'Failed to set current comedian')
        }
    })

    // ---------- Set current prompt (must belong to current comedian) ----------
    socket.on('setCurrentPrompt', async (promptId: string | null) => {
        try {
            if (promptId === null) {
                // Clear current prompt
                await GameState.updateOne({}, { currentPromptId: null })
                const updated = await GameState.findOne()
                io.emit('gameState', updated)
                return
            }

            const { gs, comedian } = await getCurrentComedianOrThrow()
            // Ensure the prompt belongs to this comedian
            const prompt = getPromptByIdOrThrow(comedian.prompts as any, promptId)
            // If we got here, the prompt exists under this comedian
            await GameState.updateOne({}, { currentPromptId: String(prompt._id) })
            const updated = await GameState.findOne()
            io.emit('gameState', updated)
        } catch (err) {
            console.error('setCurrentPrompt error', err)
            socket.emit('error', (err as Error).message || 'Failed to set current prompt')
        }
    })

    // ---------- Submit guess → auto score if correct ----------
    socket.on('submitGuess', async (payload: { guess: 'truth' | 'lie' }) => {
        try {
            const gs = await GameState.findOne()
            if (!gs?.currentComedianId || !gs?.currentPromptId) throw new Error('No current question')

            const comedian = await Comedian.findById(gs.currentComedianId)
            if (!comedian) throw new Error('Comedian not found')

            const prompt = getPromptByIdOrThrow(comedian.prompts as any, gs.currentPromptId)

            if ((prompt as any).guess) throw new Error('Guess already submitted')

                // Set guess on subdoc and save parent
                ; (prompt as any).guess = payload.guess
            await comedian.save()

            // Determine defense team (the other team of the current comedian)
            const offense = comedian.team
            let awardPath: 'teams.teamA.score' | 'teams.teamB.score' | null = null
            if (offense === 'teamA') awardPath = 'teams.teamB.score'
            else if (offense === 'teamB') awardPath = 'teams.teamA.score'

            if (awardPath && (prompt as any).answer === payload.guess) {
                await GameState.updateOne({}, { $inc: { [awardPath]: 1 } as any })
            }

            const updatedGS = await GameState.findOne()
            const allComedians = await Comedian.find()
            io.emit('gameState', updatedGS)
            io.emit('comediansList', allComedians)
        } catch (err) {
            console.error('submitGuess error', err)
            socket.emit('error', (err as Error).message || 'Failed to submit guess')
        }
    })

    // ---------- Undo guess ----------
    socket.on('undoGuess', async () => {
        try {
            const gs = await GameState.findOne()
            if (!gs?.currentComedianId || !gs?.currentPromptId) throw new Error('No current question')

            const comedian = await Comedian.findById(gs.currentComedianId)
            if (!comedian) throw new Error('Comedian not found')

            const prompt = getPromptByIdOrThrow(comedian.prompts as any, gs.currentPromptId)

            const existingGuess: 'truth' | 'lie' | undefined = (prompt as any).guess
            if (!existingGuess) throw new Error('Nothing to undo')

            const wasCorrect = existingGuess === (prompt as any).answer

            // Determine defense team decrement path
            const offense = comedian.team
            let awardPath: 'teams.teamA.score' | 'teams.teamB.score' | null = null
            if (offense === 'teamA') awardPath = 'teams.teamB.score'
            else if (offense === 'teamB') awardPath = 'teams.teamA.score'

            // Clear guess and save
            delete (prompt as any).guess
            await comedian.save()

            if (wasCorrect && awardPath) {
                await GameState.updateOne({}, { $inc: { [awardPath]: -1 } as any })
            }

            const updatedGS = await GameState.findOne()
            const allComedians = await Comedian.find()
            io.emit('gameState', updatedGS)
            io.emit('comediansList', allComedians)
        } catch (err) {
            console.error('undoGuess error', err)
            socket.emit('error', (err as Error).message || 'Failed to undo guess')
        }
    })

    socket.on('resetGame', async () => {
        try {
            // 1. Reset game state: clear current comedian/prompt, reset scores
            await GameState.updateOne({}, {
                currentComedianId: null,
                currentPromptId: null,
                'teams.teamA.score': 0,
                'teams.teamB.score': 0,
            })

            // 2. Remove ALL guess fields from ALL prompts in ALL comedians with a single query
            await Comedian.updateMany(
                {}, // Match all comedians
                { $unset: { "prompts.$[].guess": 1 } } // Remove guess from all prompts
            )

            // 3. Send updated state to all clients
            const updatedGS = await GameState.findOne()
            const updatedComedians = await Comedian.find()

            io.emit('gameState', updatedGS)
            io.emit('comediansList', updatedComedians)

            console.log('Game reset successfully')

        } catch (err) {
            console.error('resetGame error', err)
            socket.emit('error', (err as Error).message || 'Failed to reset game')
        }
    })
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Vote as VoteIcon } from "lucide-react";
import { H1 } from "./H1";
import { Sub } from "./Sub";

export function Vote({ gameState, currentPrompt, currentComedian, isSubmitting, handleVote, hasVoted, userVote }: {
    gameState: any,
    currentPrompt: any,
    currentComedian: any,
    handleVote: any,
    isSubmitting: any,
    hasVoted: boolean,
    userVote: 'truth' | 'lie' | null
}) {

    return (
        <>
            {gameState?.mode === 'game' && currentPrompt && !currentPrompt.guess ? (
                <div className="grid gap-4 sm:gap-6 w-full max-w-sm sm:max-w-xl mx-auto px-4 sm:px-0">
                    <Card className="border-2 sm:border-4 border-black/70 bg-white/10 backdrop-blur-sm">
                        <CardHeader className="text-center pb-3 sm:pb-6">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-400 rounded-full border-2 sm:border-4 border-black grid place-items-center mx-auto">
                                <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
                            </div>
                            <CardDescription className="text-white/90 text-sm">Now presenting</CardDescription>
                            <CardTitle
                                className="text-xl sm:text-2xl md:text-3xl font-black text-yellow-400 break-words"
                                style={{ textShadow: '2px 2px 0 rgba(0,0,0,1)' }}
                            >
                                {currentComedian?.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 sm:px-6">
                            <p className="text-white text-base sm:text-lg leading-relaxed text-center break-words">{currentPrompt.text}</p>
                        </CardContent>
                    </Card>

                    {/* Show user's vote if they voted, otherwise show voting buttons */}
                    {hasVoted && userVote ? (
                        <Card className="border-2 sm:border-4 border-black/70 bg-white/10 backdrop-blur-sm">
                            <CardContent className="p-4 sm:p-6 text-center">
                                <div className="mb-3">
                                    <span className="text-white/90 text-sm block mb-2">Your vote:</span>
                                    <span
                                        className={`font-black text-2xl sm:text-3xl ${userVote === 'truth' ? 'text-green-300' : 'text-red-300'
                                            }`}
                                        style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.9)' }}
                                    >
                                        {userVote.toUpperCase()} {userVote === 'truth' ? '✨' : '🔥'}
                                    </span>
                                </div>
                                <p className="text-white/80 text-sm">
                                    Waiting for reveal...
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-3 sm:gap-4">
                            <Button
                                onClick={() => handleVote('truth')}
                                disabled={isSubmitting || hasVoted}
                                className="w-full bg-green-400 text-black border-2 sm:border-4 border-black rounded-xl sm:rounded-2xl h-12 sm:h-14 text-lg sm:text-xl font-black hover:brightness-105 active:translate-y-[1px] disabled:opacity-50"
                                style={{ fontFamily: 'KGSummerSunshineBlackout' }}
                            >
                                <VoteIcon className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                                {isSubmitting ? 'Voting…' : 'TRUTH ✨'}
                            </Button>
                            <Button
                                onClick={() => handleVote('lie')}
                                disabled={isSubmitting || hasVoted}
                                className="w-full bg-red-400 text-black border-2 sm:border-4 border-black rounded-xl sm:rounded-2xl h-12 sm:h-14 text-lg sm:text-xl font-black hover:brightness-105 active:translate-y-[1px] disabled:opacity-50"
                                style={{ fontFamily: 'KGSummerSunshineBlackout' }}
                            >
                                <VoteIcon className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                                {isSubmitting ? 'Voting…' : 'LIE 🔥'}
                            </Button>
                        </div>
                    )}
                </div>
            ) : currentPrompt?.guess ? (
                <Card className="w-full max-w-sm sm:max-w-xl mx-auto border-2 sm:border-4 border-black/70 bg-white/10 backdrop-blur-sm px-4 sm:px-0">
                    <CardHeader className="text-center pb-3 sm:pb-6">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-300 rounded-full border-2 sm:border-4 border-black grid place-items-center mx-auto">
                            <span className="text-2xl sm:text-3xl">🎭</span>
                        </div>
                        <CardTitle><H1 tilt={1}>REVEAL</H1></CardTitle>
                        <CardDescription className="text-white/95 text-sm sm:text-lg break-words px-2">
                            {currentPrompt.text}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6">
                        <Card className="border-2 border-black/70 bg-black/30">
                            <CardContent className="p-3 sm:p-4 text-white">
                                <span className="font-medium text-yellow-200 text-sm sm:text-base">Answer:</span>{' '}
                                <span
                                    className={`font-black text-lg sm:text-2xl ${currentPrompt.answer === 'truth' ? 'text-green-300' : 'text-red-300'}`}
                                    style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.9)' }}
                                >
                                    {currentPrompt.answer.toUpperCase()}
                                </span>
                            </CardContent>
                        </Card>
                        <Card className="border-2 border-black/70 bg-black/30">
                            <CardContent className="p-3 sm:p-4 text-white">
                                <span className="font-medium text-yellow-200 text-sm sm:text-base">Guess:</span>{' '}
                                <span
                                    className={`font-black text-lg sm:text-2xl ${currentPrompt.guess === 'truth' ? 'text-green-300' : 'text-red-300'}`}
                                    style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.9)' }}
                                >
                                    {currentPrompt.guess.toUpperCase()}
                                </span>
                            </CardContent>
                        </Card>
                        <Card
                            className={`border-2 ${currentPrompt.answer === currentPrompt.guess
                                ? 'bg-green-500/25 border-green-400/50'
                                : 'bg-red-500/25 border-red-400/50'
                                }`}
                        >
                            <CardContent className="p-3 sm:p-4">
                                <p
                                    className={`font-black text-base sm:text-lg ${currentPrompt.answer === currentPrompt.guess ? 'text-green-100' : 'text-red-100'
                                        }`}
                                >
                                    {currentPrompt.answer === currentPrompt.guess ? '🎉 Correct Guess!' : '💥 Wrong Guess!'}
                                </p>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid place-items-center py-12 sm:py-20 px-4">
                    <div className="text-center">
                        <H1 tilt={1}>STAND BY…</H1>
                        <Sub>
                            <span className="block sm:inline">Waiting for the next round </span>
                            <span className="capitalize font-bold text-yellow-200" style={{ textShadow: '1px 1px 0 rgba(0,0,0,1)' }}>
                                {gameState?.mode}
                            </span>
                        </Sub>
                    </div>
                </div>
            )}
        </>
    )
}
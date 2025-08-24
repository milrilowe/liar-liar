import { useGameState } from '../../providers'

export function Scoring() {
    const { gameState } = useGameState()

    if (!gameState) return null

    const { teams } = gameState
    const teamAScore = teams.teamA.score
    const teamBScore = teams.teamB.score

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background stars */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute text-yellow-300 opacity-60 animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            fontSize: `${Math.random() * 20 + 15}px`,
                        }}
                    >
                        ★
                    </div>
                ))}
            </div>

            <div className="text-center space-y-32 px-8">
                {/* Title */}
                <h1
                    className="text-yellow-400 text-5xl md:text-7xl font-black uppercase tracking-wider transform -rotate-1 drop-shadow-[0_6px_0_rgba(0,0,0,1)]"
                    style={{
                        textShadow: "4px 4px 0 #000, -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000",
                        fontWeight: 900
                    }}
                >
                    {teamAScore > teamBScore ? "Advocates Win!" :
                        teamBScore > teamAScore ? "Believers Win!" :
                            "It's a Tie!"}
                </h1>

                {/* Score display */}
                <div className="flex items-center justify-center gap-12 md:gap-20">
                    {/* Team A */}
                    <div className="text-center">
                        <div
                            className="text-yellow-400 text-2xl md:text-3xl font-black uppercase mb-4 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] transform rotate-1"
                            style={{
                                textShadow: "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
                            }}
                        >
                            Team Advocates
                        </div>
                        <div
                            className="text-white text-8xl md:text-9xl font-black drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] transform -rotate-2"
                            style={{
                                textShadow: "6px 6px 0 #000, -6px -6px 0 #000, 6px -6px 0 #000, -6px 6px 0 #000",
                                filter: "drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))",
                                fontFamily: '"Baloo 2", system-ui, sans-serif'
                            }}
                        >
                            {teamAScore}
                        </div>
                    </div>

                    {/* VS */}
                    <div
                        className="text-yellow-400 text-4xl md:text-5xl font-black uppercase transform -rotate-12 drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                        style={{
                            textShadow: "3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000",
                            filter: "drop-shadow(0 0 15px rgba(255, 255, 0, 0.4))",
                        }}
                    >
                        VS
                    </div>

                    {/* Team B */}
                    <div className="text-center">
                        <div
                            className="text-yellow-400 text-2xl md:text-3xl font-black uppercase mb-4 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] transform -rotate-1"
                            style={{
                                textShadow: "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
                            }}
                        >
                            Team Believers
                        </div>
                        <div
                            className="text-white text-8xl md:text-9xl font-black drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] transform rotate-2"
                            style={{
                                textShadow: "6px 6px 0 #000, -6px -6px 0 #000, 6px -6px 0 #000, -6px 6px 0 #000",
                                filter: "drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))",
                                fontFamily: '"Baloo 2", system-ui, sans-serif'
                            }}
                        >
                            {teamBScore}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
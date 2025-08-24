import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSocket } from '../../-context/SocketProvider'
import { Trophy, Users, Star, RotateCcw } from 'lucide-react'

export function Scoring() {
    const { gameState, incrementScore, comedians } = useSocket()

    if (!gameState) return null

    const { teams } = gameState
    const teamAScore = teams.teamA.score
    const teamBScore = teams.teamB.score

    // Determine winner or tie
    const getWinnerStatus = () => {
        if (teamAScore > teamBScore) return { winner: 'A', tie: false }
        if (teamBScore > teamAScore) return { winner: 'B', tie: false }
        return { winner: null, tie: true }
    }

    const { winner, tie } = getWinnerStatus()

    // Get team member counts
    const teamAMembers = comedians.filter(c => c.team === 'teamA')
    const teamBMembers = comedians.filter(c => c.team === 'teamB')

    return (
        <div className="space-y-8">
            {/* Main Score Display */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    Current Scores
                </h1>

                {tie && (
                    <Badge variant="outline" className="text-lg py-2 px-4">
                        It's a Tie!
                    </Badge>
                )}

                {winner && (
                    <Badge variant="default" className="text-lg py-2 px-4 bg-green-600">
                        Team {winner} is Leading!
                    </Badge>
                )}
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Team A */}
                <Card className={`${winner === 'A' ? 'ring-2 ring-green-500 bg-green-50' : ''} ${tie ? 'ring-2 ring-yellow-500' : ''}`}>
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl flex items-center justify-center gap-2">
                            <Users className="h-6 w-6" />
                            Team A
                        </CardTitle>
                        <div className="text-6xl font-bold text-blue-600">
                            {teamAScore}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center text-sm text-gray-600">
                            {teamAMembers.length} member{teamAMembers.length !== 1 ? 's' : ''}
                        </div>

                        {/* Team members */}
                        <div className="space-y-1">
                            {teamAMembers.map(comedian => (
                                <div key={comedian._id} className="flex items-center justify-between text-sm">
                                    <span>{comedian.name}</span>
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <Star className="h-3 w-3" />
                                        {comedian.prompts?.length || 0}
                                    </Badge>
                                </div>
                            ))}
                        </div>

                        {/* Score controls */}
                        <div className="flex gap-2 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => incrementScore('teamA', -1)}
                                className="flex-1"
                            >
                                -1
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => incrementScore('teamA', 1)}
                                className="flex-1"
                            >
                                +1
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Team B */}
                <Card className={`${winner === 'B' ? 'ring-2 ring-green-500 bg-green-50' : ''} ${tie ? 'ring-2 ring-yellow-500' : ''}`}>
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl flex items-center justify-center gap-2">
                            <Users className="h-6 w-6" />
                            Team B
                        </CardTitle>
                        <div className="text-6xl font-bold text-red-600">
                            {teamBScore}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center text-sm text-gray-600">
                            {teamBMembers.length} member{teamBMembers.length !== 1 ? 's' : ''}
                        </div>

                        {/* Team members */}
                        <div className="space-y-1">
                            {teamBMembers.map(comedian => (
                                <div key={comedian._id} className="flex items-center justify-between text-sm">
                                    <span>{comedian.name}</span>
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <Star className="h-3 w-3" />
                                        {comedian.prompts?.length || 0}
                                    </Badge>
                                </div>
                            ))}
                        </div>

                        {/* Score controls */}
                        <div className="flex gap-2 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => incrementScore('teamB', -1)}
                                className="flex-1"
                            >
                                -1
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => incrementScore('teamB', 1)}
                                className="flex-1"
                            >
                                +1
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Game Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Game Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold">{comedians.length}</div>
                            <div className="text-sm text-gray-600">Total Players</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">
                                {comedians.reduce((sum, c) => sum + (c.prompts?.length || 0), 0)}
                            </div>
                            <div className="text-sm text-gray-600">Total Prompts</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{teamAScore + teamBScore}</div>
                            <div className="text-sm text-gray-600">Points Scored</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">
                                {Math.abs(teamAScore - teamBScore)}
                            </div>
                            <div className="text-sm text-gray-600">Point Difference</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                incrementScore('teamA', -teamAScore)
                                incrementScore('teamB', -teamBScore)
                            }}
                            className="flex items-center gap-2"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reset All Scores
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => incrementScore('teamA', -teamAScore)}
                        >
                            Reset Team A
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => incrementScore('teamB', -teamBScore)}
                        >
                            Reset Team B
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
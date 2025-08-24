import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useSocket } from '../../-context/SocketProvider'
import { MessageCircle, Trash2, Users, Clock, User } from 'lucide-react'

interface IChatMessage {
    _id: string
    username: string
    text: string
    timestamp: string
    comedianId?: string
    comedianName?: string
    promptId?: string
    promptText?: string
    gameMode?: string
}

interface IAudienceStats {
    totalUsers: number
    recentUsers: Array<{
        username: string
        joinedAt: string
        lastActiveAt: string
        messageCount: number
        voteCount: number
    }>
}

export function Chat() {
    const socket = useSocket()
    const [chatMessages, setChatMessages] = useState<IChatMessage[]>([])
    const [audienceStats, setAudienceStats] = useState<IAudienceStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [clearing, setClearing] = useState(false)

    // Get chat messages and audience stats on load
    useEffect(() => {
        if (socket.connected) {
            // For admin panel, we'll emit directly since we need to add these methods to the socket context
            const socketInstance = (socket as any).socketRef?.current
            if (socketInstance) {
                socketInstance.emit('getChatMessages', { limit: 100 })
                socketInstance.emit('getAudienceStats', {})
            }
            setLoading(false)
        }
    }, [socket.connected])

    // Listen for real-time updates
    useEffect(() => {
        const socketInstance = (socket as any).socketRef?.current
        if (!socketInstance) return

        const handleNewMessage = (message: IChatMessage) => {
            setChatMessages(prev => [...prev, message])
        }

        const handleChatMessages = (messages: IChatMessage[]) => {
            setChatMessages(messages)
        }

        const handleChatCleared = () => {
            setChatMessages([])
        }

        const handleAudienceStats = (stats: IAudienceStats) => {
            setAudienceStats(stats)
        }

        const handleAudienceUserJoined = () => {
            // Refresh audience stats when someone joins
            socketInstance.emit('getAudienceStats', {})
        }

        socketInstance.on('newChatMessage', handleNewMessage)
        socketInstance.on('chatMessages', handleChatMessages)
        socketInstance.on('chatCleared', handleChatCleared)
        socketInstance.on('audienceStats', handleAudienceStats)
        socketInstance.on('audienceUserJoined', handleAudienceUserJoined)

        return () => {
            socketInstance.off('newChatMessage', handleNewMessage)
            socketInstance.off('chatMessages', handleChatMessages)
            socketInstance.off('chatCleared', handleChatCleared)
            socketInstance.off('audienceStats', handleAudienceStats)
            socketInstance.off('audienceUserJoined', handleAudienceUserJoined)
        }
    }, [socket])

    const handleClearChat = async () => {
        if (clearing) return

        setClearing(true)
        try {
            const socketInstance = (socket as any).socketRef?.current
            if (socketInstance) {
                socketInstance.emit('clearChatMessages', {})
            }
        } finally {
            setClearing(false)
        }
    }

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString()
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading chat...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <MessageCircle className="h-8 w-8" />
                    Audience Chat
                </h1>
                <Button
                    onClick={handleClearChat}
                    disabled={clearing || chatMessages.length === 0}
                    variant="destructive"
                    className="flex items-center gap-2"
                >
                    <Trash2 className="h-4 w-4" />
                    {clearing ? 'Clearing...' : 'Clear Chat'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Audience Stats */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Audience Stats
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {audienceStats ? (
                                <>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-blue-600">
                                            {audienceStats.totalUsers}
                                        </div>
                                        <p className="text-sm text-gray-600">Active Users</p>
                                    </div>

                                    {audienceStats.recentUsers.length > 0 && (
                                        <>
                                            <Separator />
                                            <div>
                                                <h4 className="font-medium mb-2">Recent Activity</h4>
                                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                                    {audienceStats.recentUsers.map(user => (
                                                        <div key={user.username} className="flex items-center justify-between text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <User className="h-3 w-3" />
                                                                <span className="font-medium">{user.username}</span>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {user.messageCount}m
                                                                </Badge>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {user.voteCount}v
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <p className="text-gray-500">Loading stats...</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Chat Messages */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Messages ({chatMessages.length})</span>
                                {chatMessages.length > 0 && (
                                    <Badge variant="outline">
                                        Latest: {formatTimestamp(chatMessages[chatMessages.length - 1]?.timestamp)}
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {chatMessages.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No messages yet</p>
                                    <p className="text-sm">Audience messages will appear here</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {chatMessages.map(message => (
                                        <div key={message._id} className="border rounded-lg p-3">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-blue-600">
                                                        {message.username}
                                                    </span>
                                                    {message.gameMode && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {message.gameMode}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Clock className="h-3 w-3" />
                                                    {formatTimestamp(message.timestamp)}
                                                </div>
                                            </div>

                                            <p className="text-gray-900 mb-2">{message.text}</p>

                                            {(message.comedianName || message.promptText) && (
                                                <div className="bg-gray-50 rounded p-2 text-xs space-y-1">
                                                    {message.comedianName && (
                                                        <p><span className="font-medium">During:</span> {message.comedianName}'s turn</p>
                                                    )}
                                                    {message.promptText && (
                                                        <p className="text-gray-600 italic">"{message.promptText}"</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
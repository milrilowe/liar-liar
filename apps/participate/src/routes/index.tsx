// routes/index.tsx
"use client"

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { ParticipateSocketProvider, useParticipateSocket } from '../providers'
import { Users, MessageCircle, Send, LogOut, Crown, Vote, Eye } from 'lucide-react'

// shadcn/ui
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <ParticipateSocketProvider>
      <AppWithProviders />
    </ParticipateSocketProvider>
  )
}

function Starfield({ count = 20 }) {
  const stars = useMemo(
    () => Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      size: `${Math.random() * 20 + 10}px`,
    })),
    [count]
  )
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute text-yellow-300 opacity-60 animate-pulse"
          style={{ left: s.left, top: s.top, animationDelay: s.delay, fontSize: s.size }}
        >
          ★
        </div>
      ))}
    </div>
  )
}

function H1({ children, tilt = -2 }: { children: React.ReactNode; tilt?: number }) {
  return (
    <div
      className="text-5xl md:text-7xl font-black text-yellow-400 mb-1"
      style={{
        textShadow: '4px 4px 0 rgba(0,0,0,1)',
        transform: `rotate(${tilt}deg)`,
        fontFamily: '"KGSummerSunshineBlackout","Baloo 2",system-ui,sans-serif',
      }}
    >
      {children}
    </div>
  )
}

function Sub({ children }: { children: React.ReactNode }) {
  return <div className="text-2xl text-white opacity-90">{children}</div>
}

function AppWithProviders() {
  const navigate = useNavigate()
  const {
    connected,
    gameState,
    currentComedian,
    currentPrompt,
    chatMessages,
    currentUser,
    registerUsername,
    restoreSession,
    sendChatMessage,
    submitVote
  } = useParticipateSocket()

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userType, setUserType] = useState<'comic' | 'audience' | null>(null)
  const [username, setUsername] = useState('')
  const [usernameInput, setUsernameInput] = useState('')
  const [usernameError, setUsernameError] = useState('')

  const [messageInput, setMessageInput] = useState('')
  const [hasVoted, setHasVoted] = useState(false)
  const [vote, setVote] = useState<'truth' | 'lie' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('auth') === 'true'
    const type = localStorage.getItem('userType') as 'comic' | 'audience' | null
    const storedUsername = localStorage.getItem('username')
    const deviceId = localStorage.getItem('deviceId')

    setIsAuthenticated(auth)
    setUserType(type)
    if (storedUsername) setUsername(storedUsername)

    if (type === 'audience' && deviceId && !currentUser && connected) {
      restoreSession(deviceId).then((result) => {
        if (!result.success) {
          localStorage.removeItem('username')
          localStorage.removeItem('deviceId')
          localStorage.removeItem('userType')
          setUsername('')
          setUserType(null)
        }
      })
    }
  }, [connected, currentUser, restoreSession])

  useEffect(() => {
    if (currentPrompt) {
      setHasVoted(false)
      setVote(null)
    }
  }, [currentPrompt?._id])

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUsernameError('')
    if (usernameInput.trim().length < 2) {
      setUsernameError('Username must be at least 2 characters')
      return
    }
    const result = await registerUsername(usernameInput.trim())
    if (result.success) {
      setUsername(usernameInput.trim())
      setUserType('audience')
    } else {
      setUsernameError(result.error || 'Failed to register username')
    }
  }

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      await sendChatMessage(messageInput.trim())
      setMessageInput('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVote = async (voteType: 'truth' | 'lie') => {
    if (hasVoted || isSubmitting) return
    setIsSubmitting(true)
    try {
      await submitVote(voteType)
      setVote(voteType)
      setHasVoted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth')
    localStorage.removeItem('userType')
    localStorage.removeItem('userHandle')
    localStorage.removeItem('username')
    localStorage.removeItem('deviceId')
    localStorage.removeItem('comedianId')
    setIsAuthenticated(false)
    setUserType(null)
    setUsername('')
    setHasVoted(false)
    setVote(null)
  }

  // ---------------- SCREENS (shadcn + your theme) ----------------

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 grid place-items-center relative overflow-hidden">
        <Starfield />
        <div className="text-center">
          <H1>STAND BY…</H1>
          <Sub>Connecting to game…</Sub>
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mt-8" />
        </div>
      </div>
    )
  }

  if (!username && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 flex items-center justify-center px-6 relative overflow-hidden">
        <Starfield />
        <Card className="w-full max-w-md border-4 border-black/70 bg-white/10 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 w-16 h-16 rounded-full bg-yellow-400 border-4 border-black grid place-items-center">
              <Users className="w-8 h-8 text-black" />
            </div>
            <CardTitle>
              <H1 tilt={1}>JOIN THE GAME</H1>
            </CardTitle>
            <CardDescription className="text-white/90">
              Pick a handle to participate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              <Input
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter your username"
                maxLength={20}
                className="bg-white/90 text-black border-4 border-black placeholder:text-black/50 rounded-xl h-12"
                style={{ fontFamily: '"Baloo 2",system-ui,sans-serif', fontWeight: 600 }}
              />
              {usernameError && (
                <p className="text-sm text-red-200 text-center">{usernameError}</p>
              )}
              <Button
                type="submit"
                disabled={!usernameInput.trim()}
                className="w-full bg-yellow-400 text-black border-4 border-black rounded-xl h-12 text-lg font-black hover:brightness-105 active:translate-y-[1px]"
                style={{ fontFamily: 'KGSummerSunshineBlackout' }}
              >
                Join the Fun! 🎭
              </Button>
            </form>
            <Separator className="bg-black/50" />
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => navigate({ to: '/login' })}
                className="text-yellow-200 hover:text-white"
              >
                <Crown className="mr-2 h-4 w-4" />
                Comic Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 relative overflow-hidden">
      <Starfield />

      {/* Main content */}
      <div className="px-6 py-6 ">
        <div className="mx-auto w-full max-w-6xl">
          {userType === 'comic' ? (
            // Comic View (read-only chat)
            <Card className="border-4 border-black/70 bg-white/10 backdrop-blur-sm">
              <CardHeader className="text-center">
                <MessageCircle className="w-12 h-12 text-yellow-200 mx-auto mb-2" />
                <CardTitle className="text-white">
                  Audience Messages{' '}
                  <span className="text-yellow-300">({chatMessages.length})</span>
                </CardTitle>
                <CardDescription className="text-white/80">
                  Live feed from the crowd
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chatMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-white/20 rounded-full border-4 border-black/60 grid place-items-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-white/90">No messages yet…</p>
                    <p className="text-white/80 text-sm mt-1">Audience messages will appear here.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[60vh] pr-2">
                    <div className="space-y-4">
                      {chatMessages.map((msg) => (
                        <Card key={msg._id} className="border-4 border-black/70 bg-white/10 backdrop-blur-sm">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-yellow-400 rounded-full border-4 border-black grid place-items-center">
                                  <span className="text-black text-xs font-black">
                                    {msg.username.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="font-bold text-white">{msg.username}</span>
                              </div>
                              <span className="text-xs text-white/80">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-white leading-relaxed mb-3">{msg.text}</p>
                            {msg.promptText && (
                              <div className="bg-black/30 rounded-lg p-3 border-2 border-black/70">
                                <p className="text-xs text-yellow-200 mb-1">During prompt:</p>
                                <p className="text-white/95 text-sm italic">“{msg.promptText}”</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          ) : (
            // Audience View
            <>
              {gameState?.mode === 'game' && currentPrompt && !currentPrompt.guess ? (
                <div className="grid gap-6 max-w-xl mx-auto">
                  <Card className="border-4 border-black/70 bg-white/10 backdrop-blur-sm">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-yellow-400 rounded-full border-4 border-black grid place-items-center mx-auto">
                        <Crown className="w-8 h-8 text-black" />
                      </div>
                      <CardDescription className="text-white/90">Now presenting</CardDescription>
                      <CardTitle
                        className="text-3xl md:text-4xl font-black text-yellow-400"
                        style={{ textShadow: '3px 3px 0 rgba(0,0,0,1)' }}
                      >
                        {currentComedian?.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white text-lg leading-relaxed text-center">{currentPrompt.text}</p>
                    </CardContent>
                  </Card>

                  <div className="grid gap-4">
                    <Button
                      onClick={() => handleVote('truth')}
                      disabled={isSubmitting}
                      className="w-full bg-green-400 text-black border-4 border-black rounded-2xl h-14 text-xl font-black hover:brightness-105 active:translate-y-[1px]"
                      style={{ fontFamily: 'KGSummerSunshineBlackout' }}
                    >
                      <Vote className="mr-2 h-6 w-6" />
                      {isSubmitting ? 'Voting…' : 'TRUTH ✨'}
                    </Button>
                    <Button
                      onClick={() => handleVote('lie')}
                      disabled={isSubmitting}
                      className="w-full bg-red-400 text-black border-4 border-black rounded-2xl h-14 text-xl font-black hover:brightness-105 active:translate-y-[1px]"
                      style={{ fontFamily: 'KGSummerSunshineBlackout' }}
                    >
                      <Vote className="mr-2 h-6 w-6" />
                      {isSubmitting ? 'Voting…' : 'LIE 🔥'}
                    </Button>
                  </div>
                </div>
              ) : currentPrompt?.guess ? (
                <Card className="max-w-xl mx-auto border-4 border-black/70 bg-white/10 backdrop-blur-sm">
                  <CardHeader className="text-center">
                    <div className="w-20 h-20 bg-yellow-300 rounded-full border-4 border-black grid place-items-center mx-auto">
                      <span className="text-3xl">🎭</span>
                    </div>
                    <CardTitle><H1 tilt={1}>REVEAL</H1></CardTitle>
                    <CardDescription className="text-white/95 text-lg">
                      {currentPrompt.text}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Card className="border-2 border-black/70 bg-black/30">
                      <CardContent className="p-4 text-white">
                        <span className="font-medium text-yellow-200">Answer:</span>{' '}
                        <span
                          className={`font-black text-2xl ${currentPrompt.answer === 'truth' ? 'text-green-300' : 'text-red-300'}`}
                          style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.9)' }}
                        >
                          {currentPrompt.answer.toUpperCase()}
                        </span>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-black/70 bg-black/30">
                      <CardContent className="p-4 text-white">
                        <span className="font-medium text-yellow-200">Guess:</span>{' '}
                        <span
                          className={`font-black text-2xl ${currentPrompt.guess === 'truth' ? 'text-green-300' : 'text-red-300'}`}
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
                      <CardContent className="p-4">
                        <p
                          className={`font-black text-lg ${currentPrompt.answer === currentPrompt.guess ? 'text-green-100' : 'text-red-100'
                            }`}
                        >
                          {currentPrompt.answer === currentPrompt.guess ? '🎉 Correct Guess!' : '💥 Wrong Guess!'}
                        </p>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid place-items-center py-20">
                  <div className="text-center">
                    <H1 tilt={1}>STAND BY…</H1>
                    <Sub>
                      Waiting for the next round{' '}
                      <span className="capitalize font-bold text-yellow-200" style={{ textShadow: '1px 1px 0 rgba(0,0,0,1)' }}>
                        {gameState?.mode}
                      </span>
                    </Sub>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Bottom Input (audience only) */}
          {userType === 'audience' && (
            <div className="mt-auto pt-4">
              <Card className="border-4 border-black/70 bg-white/10 backdrop-blur-sm">
                <CardContent className="p-1">
                  <form onSubmit={handleMessageSubmit} className="flex gap-3">
                    <div className="flex-1 relative">
                      <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Send a message"
                        maxLength={500}
                        disabled={isSubmitting}
                        className="bg-white/90 text-black border-4 border-black placeholder:text-black/50 rounded-xl h-12 pr-10"
                        style={{ fontFamily: '"Baloo 2",system-ui,sans-serif', fontWeight: 600 }}
                      />
                      <MessageCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/50" />
                    </div>
                    <Button
                      type="submit"
                      disabled={!messageInput.trim() || isSubmitting}
                      className="bg-yellow-400 text-black border-4 border-black rounded-xl h-12 text-base font-black hover:brightness-105 active:translate-y-[1px]"
                      style={{ fontFamily: 'KGSummerSunshineBlackout' }}
                    >
                      <Send className="mr-2 h-5 w-5" />
                      {isSubmitting ? '...' : 'Send'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

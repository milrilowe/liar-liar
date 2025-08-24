// routes/index.tsx
"use client"

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ParticipateSocketProvider, useParticipateSocket } from '../providers'
import { Register, Starfield, Chatlog, Sub, Vote } from './-components'
import { H1 } from './-components/H1'
import { ChatInput } from './-components/ChatInput'

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

function AppWithProviders() {
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
  const [userVote, setUserVote] = useState<'truth' | 'lie' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('auth') === 'true'
    const type = localStorage.getItem('userType') as 'comic' | 'audience' | null
    const storedUsername = localStorage.getItem('username')
    const deviceId = localStorage.getItem('deviceId')

    console.log('Loading from localStorage:', { auth, type, storedUsername, deviceId }) // Debug log

    setIsAuthenticated(auth)
    setUserType(type)
    if (storedUsername) setUsername(storedUsername)

    if (type === 'audience' && deviceId && !currentUser && connected) {
      restoreSession(deviceId).then((result) => {
        if (!result.success) {
          console.log('Session restore failed, clearing localStorage') // Debug log
          localStorage.removeItem('username')
          localStorage.removeItem('deviceId')
          localStorage.removeItem('userType')
          localStorage.removeItem('auth')
          setUsername('')
          setUserType(null)
          setIsAuthenticated(false)
        }
      })
    }
  }, [connected, currentUser, restoreSession])

  useEffect(() => {
    if (currentPrompt) {
      setHasVoted(false)
      setUserVote(null)
    }
  }, [currentPrompt?._id])

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUsernameError('')
    if (usernameInput.trim().length < 2) {
      setUsernameError('Username must be at least 2 characters')
      return
    }

    console.log('Attempting to register username:', usernameInput.trim()) // Debug log
    const result = await registerUsername(usernameInput.trim())
    console.log('Registration result:', result) // Debug log

    if (result.success) {
      const newUsername = usernameInput.trim()
      setUsername(newUsername)
      setUserType('audience')
      setIsAuthenticated(true)

      // Save to localStorage (deviceId is handled in the socket provider)
      localStorage.setItem('username', newUsername)
      localStorage.setItem('userType', 'audience')
      localStorage.setItem('auth', 'true')

      console.log('Successfully registered and saved to localStorage') // Debug log
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
      setUserVote(voteType) // Store the user's personal vote
      setHasVoted(true)
      console.log('User voted:', voteType) // Debug log
    } finally {
      setIsSubmitting(false)
    }
  }

  // Debug current state
  console.log('Current state:', {
    connected,
    isAuthenticated,
    userType,
    username,
    currentUser: currentUser?.username
  })

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

  // FIXED: Added missing return statement here
  if (!username && !isAuthenticated) {
    return (
      <Register
        handleUsernameSubmit={handleUsernameSubmit}
        usernameInput={usernameInput}
        setUsernameInput={setUsernameInput}
        usernameError={usernameError}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 relative overflow-hidden">
      <Starfield />

      {/* Main content */}
      <div className="px-3 sm:px-6 py-3 sm:py-6 h-screen flex flex-col">
        <div className="mx-auto w-full max-w-6xl flex-1 flex flex-col min-h-0">
          {userType === 'comic' ? (
            // Comic View (read-only chat) - now takes full height
            <div className="flex-1 min-h-0">
              <Chatlog chatMessages={chatMessages} />
            </div>
          ) : (
            // Audience View - voting area
            <div className="flex-1 flex items-center justify-center min-h-0 py-4">
              <Vote
                gameState={gameState}
                currentPrompt={currentPrompt}
                currentComedian={currentComedian}
                handleVote={handleVote}
                isSubmitting={isSubmitting}
                hasVoted={hasVoted}
                userVote={userVote}
              />
            </div>
          )}

          {/* Bottom Input (audience only) - fixed at bottom */}
          {userType === 'audience' && (
            <div className="flex-shrink-0">
              <ChatInput
                handleMessageSubmit={handleMessageSubmit}
                messageInput={messageInput}
                setMessageInput={setMessageInput}
                isSubmitting={isSubmitting}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
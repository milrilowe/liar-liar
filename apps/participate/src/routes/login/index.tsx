import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ParticipateSocketProvider, useParticipateSocket } from '../../providers'
import { Crown, Instagram, Lock, ArrowLeft, Sparkles } from 'lucide-react'

export const Route = createFileRoute('/login/')({
  component: Login,
})

function LoginWithProviders() {
  const navigate = useNavigate()
  const { authenticateComic, connected } = useParticipateSocket()

  const [handle, setHandle] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // If already authenticated, redirect to home
    if (localStorage.getItem('auth') === 'true') {
      navigate({ to: '/' })
    }
  }, [navigate])

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-2">Connecting to Game Server</h2>
          <p className="text-white/70">Please wait while we connect you...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await authenticateComic(handle, password)

      if (result.success) {
        navigate({ to: '/' })
      } else {
        setError(result.error || 'Authentication failed')
      }
    } catch (err) {
      setError('Connection error - please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 flex flex-col">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            onClick={() => navigate({ to: '/' })}
            className="text-purple-300 hover:text-white transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Audience</span>
          </button>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            Comic Login
          </h1>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 via-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <Crown className="w-12 h-12 text-white" />
              <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
              <Sparkles className="w-3 h-3 text-blue-300 absolute -bottom-1 -left-1 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Welcome Back, Comic!</h2>
            <p className="text-purple-200">Sign in to access your exclusive comic view and see all audience reactions</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Instagram Handle */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Instagram className="h-5 w-5 text-white/60" />
                </div>
                <input
                  id="handle"
                  name="handle"
                  type="text"
                  required
                  className="w-full pl-14 pr-6 py-4 bg-white/10 backdrop-blur border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                  placeholder="Instagram handle (without @)"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-white/60" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full pl-14 pr-6 py-4 bg-white/10 backdrop-blur border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 text-center">
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 px-6 rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-3"
              disabled={!handle || !password || loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Signing you in...
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5" />
                  Enter Comic Zone 🎭
                </>
              )}
            </button>

            {/* Info */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4">
              <p className="text-purple-200 text-sm text-center leading-relaxed">
                💡 <strong>Comics get exclusive access to:</strong><br />
                • Read all audience messages in real-time<br />
                • See reactions with full context<br />
                • Cannot vote (you're too powerful!)
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function Login() {

  return (
    <ParticipateSocketProvider>
      <LoginWithProviders />
    </ParticipateSocketProvider>
  )
}
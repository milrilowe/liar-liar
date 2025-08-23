import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ChevronDown, ChevronRight, Save, Trash2, X, Plus, Eye, EyeOff } from 'lucide-react'
import type { IComedian } from '@liar-liar/server/types'
import { useSocket } from '../../../../../-context/SocketProvider'
import { PromptRow } from './PromptRow'

export function ComedianCard({
  comedian,
  expanded,
  onToggle,
}: {
  comedian: IComedian
  expanded: boolean
  onToggle: () => void
}) {
  const { updateComedian, removeComedian, addPrompt } = useSocket()

  // Single draft for everything (editable only when expanded)
  const [draft, setDraft] = useState({
    name: comedian.name,
    instagram: comedian.instagram ?? '',
    team: comedian.team as 'teamA' | 'teamB' | 'host',
    password: '' as string, // blank means "no change"
  })
  const [showPassword, setShowPassword] = useState(false)

  // Prompts (more prominent)
  const [addingPrompt, setAddingPrompt] = useState(false)
  const [promptText, setPromptText] = useState('')
  const [promptAnswer, setPromptAnswer] = useState<'truth' | 'lie'>('truth')

  // Keep draft in sync when card opens/closes or comedian changes
  useEffect(() => {
    setDraft({
      name: comedian.name,
      instagram: comedian.instagram ?? '',
      team: comedian.team as any,
      password: '',
    })
    setShowPassword(false)
    setAddingPrompt(false)
    setPromptText('')
    setPromptAnswer('truth')
  }, [expanded, comedian._id])

  const save = () => {
    const payload: any = {
      _id: comedian._id,
      name: draft.name.trim(),
      instagram: draft.instagram.trim(),
      team: draft.team,
    }
    if (draft.password.trim()) payload.password = draft.password.trim() // only send if provided
    updateComedian(payload)
  }

  const remove = () => {
    if (confirm('Remove this comedian?')) removeComedian(comedian._id)
  }

  const add = () => {
    if (!promptText.trim()) return alert('Please enter prompt text!')
    addPrompt({ comedianId: comedian._id, prompt: { text: promptText.trim(), answer: promptAnswer } })
    setPromptText('')
    setPromptAnswer('truth')
    setAddingPrompt(false)
  }

  return (
    <Card>
      <CardHeader className="bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onToggle} aria-label={expanded ? 'Collapse' : 'Expand'}>
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>

            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-lg">{comedian.name}</CardTitle>
              <Badge className={teamBadge(comedian.team)}>{comedian.team}</Badge>
              {comedian.instagram && <span className="text-sm text-gray-600">@{comedian.instagram}</span>}
              <span className="text-sm text-gray-500">({comedian.prompts.length} prompts)</span>
            </div>
          </div>

          <div className="flex gap-2">
            {expanded ? (
              <>
                <Button size="sm" onClick={save}>
                  <Save className="w-4 h-4 mr-1" /> Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setDraft({
                      name: comedian.name,
                      instagram: comedian.instagram ?? '',
                      team: comedian.team as any,
                      password: '',
                    })
                  }
                >
                  <X className="w-4 h-4 mr-1" /> Cancel
                </Button>
              </>
            ) : (
              <Button size="sm" variant="destructive" onClick={remove}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="p-4 space-y-6">
          {/* PROMPTS — now the main attraction */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-base">Prompts</h4>
              <Button size="sm" onClick={() => setAddingPrompt(true)} disabled={addingPrompt}>
                <Plus className="w-4 h-4 mr-1" /> Add Prompt
              </Button>
            </div>

            {addingPrompt && (
              <div className="border rounded-lg p-4 bg-blue-50 space-y-3">
                <textarea
                  className="w-full p-3 border rounded-lg resize-none min-h-[80px]"
                  placeholder="Enter the truth or lie statement..."
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                      <input type="radio" value="truth" checked={promptAnswer === 'truth'} onChange={() => setPromptAnswer('truth')} />
                      <span className="text-green-600 font-semibold">Truth</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" value="lie" checked={promptAnswer === 'lie'} onChange={() => setPromptAnswer('lie')} />
                      <span className="text-red-600 font-semibold">Lie</span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={add}>Add Prompt</Button>
                    <Button size="sm" variant="outline" onClick={() => { setAddingPrompt(false); setPromptText(''); setPromptAnswer('truth') }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {comedian.prompts.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No prompts yet</p>
            ) : (
              <div className="space-y-3">
                {comedian.prompts.map((p, idx) => (
                  <PromptRow key={idx} comedianId={comedian._id} index={idx} text={p.text} answer={p.answer} />
                ))}
              </div>
            )}
          </section>

          {/* DETAILS — simple inline edit fields */}
          <section className="space-y-3">
            <h4 className="font-semibold text-base">Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="Name"
                aria-label="Name"
              />
              <Input
                value={draft.instagram}
                onChange={(e) => setDraft((d) => ({ ...d, instagram: e.target.value }))}
                placeholder="Instagram"
                aria-label="Instagram"
              />
              <select
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={draft.team}
                onChange={(e) => setDraft((d) => ({ ...d, team: e.target.value as any }))}
                aria-label="Team"
              >
                <option value="teamA">Team A</option>
                <option value="teamB">Team B</option>
                <option value="host">Host</option>
              </select>
            </div>

            {/* Low-key password row */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 items-center">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={draft.password || (comedian as any).password || ''}
                onChange={(e) => setDraft((d) => ({ ...d, password: e.target.value }))}
                placeholder="Password"
                aria-label="Password"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </section>
        </CardContent>
      )}
    </Card>
  )
}

function teamBadge(team: string) {
  switch (team) {
    case 'teamA':
      return 'bg-blue-500 hover:bg-blue-600'
    case 'teamB':
      return 'bg-red-500 hover:bg-red-600'
    case 'host':
      return 'bg-purple-500 hover:bg-purple-600'
    default:
      return 'bg-gray-500'
  }
}

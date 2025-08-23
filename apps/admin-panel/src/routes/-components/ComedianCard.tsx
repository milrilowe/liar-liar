import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ChevronDown, ChevronRight, Edit, Save, Trash2, X, Plus } from 'lucide-react'
import type { IComedian } from '@liar-liar/server/types'
import { useSocket } from '../-context/SocketProvider'
import { PromptRow } from './PromptRow'

export function ComedianCard({ comedian, expanded, onToggle }: { comedian: IComedian; expanded: boolean; onToggle: () => void }) {
  const { updateComedian, removeComedian, addPrompt } = useSocket()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ name: comedian.name, instagram: comedian.instagram ?? '', team: comedian.team as 'teamA' | 'teamB' | 'host' })

  const [addingPrompt, setAddingPrompt] = useState(false)
  const [promptText, setPromptText] = useState('')
  const [promptAnswer, setPromptAnswer] = useState<'truth' | 'lie'>('truth')

  const save = () => {
    updateComedian({ _id: comedian._id, name: draft.name, instagram: draft.instagram, team: draft.team })
    setEditing(false)
  }

  const remove = () => {
    if (confirm('Remove this comedian?')) removeComedian(comedian._id)
  }

  const add = () => {
    if (!promptText.trim()) return alert('Please enter prompt text!')
    addPrompt({ comedianId: comedian._id, prompt: { text: promptText, answer: promptAnswer } })
    setPromptText('')
    setPromptAnswer('truth')
    setAddingPrompt(false)
  }

  return (
    <Card>
      <CardHeader className="bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onToggle}>
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>

            {editing ? (
              <div className="flex items-center gap-2">
                <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} className="font-bold" />
                <Input value={draft.instagram} onChange={(e) => setDraft((d) => ({ ...d, instagram: e.target.value }))} placeholder="Instagram" />
                <select
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={draft.team}
                  onChange={(e) => setDraft((d) => ({ ...d, team: e.target.value as any }))}
                >
                  <option value="teamA">Team A</option>
                  <option value="teamB">Team B</option>
                  <option value="host">Host</option>
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg">{comedian.name}</CardTitle>
                <Badge className={teamBadge(comedian.team)}>{comedian.team}</Badge>
                {comedian.instagram && <span className="text-sm text-gray-600">@{comedian.instagram}</span>}
                <span className="text-sm text-gray-500">({comedian.prompts.length} prompts)</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {editing ? (
              <>
                <Button size="sm" onClick={save}><Save className="w-4 h-4" /></Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}><X className="w-4 h-4" /></Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}><Edit className="w-4 h-4" /></Button>
                <Button size="sm" variant="destructive" onClick={remove}><Trash2 className="w-4 h-4" /></Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Prompts</h4>
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
                  <Button size="sm" variant="outline" onClick={() => { setAddingPrompt(false); setPromptText(''); setPromptAnswer('truth') }}>Cancel</Button>
                </div>
              </div>
            </div>
          )}

          {/* Existing prompts */}
          {comedian.prompts.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No prompts yet</p>
          ) : (
            <div className="space-y-3">
              {comedian.prompts.map((p, idx) => (
                <PromptRow key={idx} comedianId={comedian._id} index={idx} text={p.text} answer={p.answer} />
              ))}
            </div>
          )}
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
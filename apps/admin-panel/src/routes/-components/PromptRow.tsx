import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Save, Trash2, X } from 'lucide-react'
import { useSocket } from '../-context/SocketProvider'

export function PromptRow({ comedianId, index, text, answer }: { comedianId: string; index: number; text: string; answer: 'truth' | 'lie' }) {
  const { updatePrompt, removePrompt } = useSocket()
  const [editing, setEditing] = useState(false)
  const [draftText, setDraftText] = useState(text)
  const [draftAnswer, setDraftAnswer] = useState<'truth' | 'lie'>(answer)

  const save = () => {
    updatePrompt({ comedianId, index, prompt: { text: draftText, answer: draftAnswer } })
    setEditing(false)
  }

  const remove = () => {
    if (confirm('Remove this prompt?')) removePrompt({ comedianId, index })
  }

  if (editing) {
    return (
      <div className="border rounded-lg p-3 bg-gray-50 space-y-3">
        <textarea className="w-full p-2 border rounded resize-none min-h-[60px]" value={draftText} onChange={(e) => setDraftText(e.target.value)} />
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" value="truth" checked={draftAnswer === 'truth'} onChange={() => setDraftAnswer('truth')} />
              <span className="text-green-600">Truth</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" value="lie" checked={draftAnswer === 'lie'} onChange={() => setDraftAnswer('lie')} />
              <span className="text-red-600">Lie</span>
            </label>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={save}><Save className="w-3 h-3" /></Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}><X className="w-3 h-3" /></Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-3 bg-gray-50 flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm mb-2 whitespace-pre-wrap">{text}</p>
        <Badge variant={answer === 'truth' ? 'default' : 'destructive'} className="text-xs">
          {answer === 'truth' ? '✅ Truth' : '❌ Lie'}
        </Badge>
      </div>
      <div className="flex gap-1 ml-3">
        <Button size="sm" variant="outline" onClick={() => setEditing(true)}><Edit className="w-3 h-3" /></Button>
        <Button size="sm" variant="destructive" onClick={remove}><Trash2 className="w-3 h-3" /></Button>
      </div>
    </div>
  )
}

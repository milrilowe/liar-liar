import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useSocket } from '../-context/SocketProvider'
import { ComedianCard } from './ComedianCard'

export function ComedianList() {
  const { comedians } = useSocket()
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const count = comedians.length

  const isExpanded = (id: string) => expanded.has(id)
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const ordered = useMemo(() => comedians, [comedians])

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Comedians ({count})</h2>
      {count === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">No comedians added yet. Create your first comedian above!</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ordered.map((c) => (
            <ComedianCard key={c._id} comedian={c} expanded={isExpanded(c._id)} onToggle={() => toggle(c._id)} />
          ))}
        </div>
      )}
    </div>
  )
}
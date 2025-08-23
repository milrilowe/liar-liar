import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useSocket } from '../-context/SocketProvider'

export function AddComedianCard() {
  const { addComedian } = useSocket()
  const [form, setForm] = useState({ name: '', instagram: '', password: '', team: 'teamA' as 'teamA' | 'teamB' | 'host' })

  const submit = () => {
    if (!form.name || !form.password) {
      alert('Name and password are required!')
      return
    }
    addComedian(form)
    setForm({ name: '', instagram: '', password: '', team: 'teamA' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Add New Comedian</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <Input placeholder="Instagram handle" value={form.instagram} onChange={(e) => setForm((p) => ({ ...p, instagram: e.target.value }))} />
          <Input placeholder="Password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.team}
            onChange={(e) => setForm((p) => ({ ...p, team: e.target.value as any }))}
          >
            <option value="teamA">Team A</option>
            <option value="teamB">Team B</option>
            <option value="host">Host</option>
          </select>
        </div>
        <Button onClick={submit} className="w-full">Add Comedian</Button>
      </CardContent>
    </Card>
  )
}

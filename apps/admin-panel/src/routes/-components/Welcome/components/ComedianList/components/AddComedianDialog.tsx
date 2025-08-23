import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { useSocket } from '../../../../../-context/SocketProvider'

type TeamKey = 'teamA' | 'teamB' | 'host'

export function AddComedianDialog() {
  const { addComedian } = useSocket()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<{ name: string; instagram: string; password: string; team: TeamKey }>({
    name: '',
    instagram: '',
    password: '',
    team: 'teamA',
  })

  const reset = () =>
    setForm({ name: '', instagram: '', password: '', team: 'teamA' })

  const submit = () => {
    if (!form.name || !form.password) {
      alert('Name and password are required!')
      return
    }
    addComedian(form)
    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger asChild>
        <Button size="sm">Add Comedian</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Comedian</DialogTitle>
          <DialogDescription>
            Create a comedian and assign their team. You can add prompts later.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              autoFocus
              placeholder="e.g. Jane Doe"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="instagram">Instagram handle</Label>
            <Input
              id="instagram"
              placeholder="@janedoe"
              value={form.instagram}
              onChange={(e) => setForm((p) => ({ ...p, instagram: e.target.value }))}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Set a simple show password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            />
          </div>

          <div className="grid gap-2">
            <Label>Team</Label>
            <Select
              value={form.team}
              onValueChange={(v: TeamKey) => setForm((p) => ({ ...p, team: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teamA">Team A</SelectItem>
                <SelectItem value="teamB">Team B</SelectItem>
                <SelectItem value="host">Host</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={submit}>Add Comedian</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

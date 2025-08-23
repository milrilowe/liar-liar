import { Badge } from '@/components/ui/badge'
import { useSocket } from '@/routes/-context/SocketProvider'


export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
const { connected, status } = useSocket()


  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
      </div>
      <Badge variant={connected ? 'default' : 'destructive'} className="px-4 py-2">
        {connected ? '🟢 Connected' : status === 'connecting' ? '🟡 Connecting' : '🔴 Disconnected'}
      </Badge>
    </div>
  )
}
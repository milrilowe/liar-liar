import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useGame } from "../context";

export function RosterCarousel() {
    const { currentComedianId, comedians, viewedComedian, setViewComedianId, setCurrentComedian } = useGame();

    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">Roster</div>
                {currentComedianId && (
                    <Badge variant="secondary">Live: {comedians.find(c => c._id === currentComedianId)?.name}</Badge>
                )}
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
                {comedians.map(c => {
                    const isCurrent = currentComedianId === c._id
                    const isViewed = viewedComedian?._id === c._id
                    return (
                        <div
                            key={c._id}
                            className={`min-w-56 border rounded p-3 flex flex-col gap-2 ${isViewed ? 'ring-2 ring-primary' : ''}`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="font-medium truncate max-w-[10rem]">{c.name}</div>
                                <Badge variant={isCurrent ? 'default' : 'outline'}>{isCurrent ? 'Current' : c.team}</Badge>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="secondary" onClick={() => setViewComedianId(c._id)}>
                                    View
                                </Button>
                                <Button size="sm" onClick={() => setCurrentComedian(c._id)} disabled={isCurrent}>
                                    Set Current
                                </Button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </Card>
    )
}
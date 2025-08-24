import { useMemo } from "react"

export function Starfield({ count = 20 }) {
    const stars = useMemo(
        () => Array.from({ length: count }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            delay: `${Math.random() * 3}s`,
            size: `${Math.random() * 20 + 10}px`,
        })),
        [count]
    )
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {stars.map((s) => (
                <div
                    key={s.id}
                    className="absolute text-yellow-300 opacity-60 animate-pulse"
                    style={{ left: s.left, top: s.top, animationDelay: s.delay, fontSize: s.size }}
                >
                    ★
                </div>
            ))}
        </div>
    )
}
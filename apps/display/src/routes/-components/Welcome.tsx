"use client"

import { useEffect, useState } from "react"

export function Welcome() {
    const [animationType, setAnimationType] = useState<"wave" | "grow" | null>(null)
    const [animationTarget, setAnimationTarget] = useState<"both" | "first" | "second">("both")
    const [growCount, setGrowCount] = useState(0)
    const text = "Liar, Liar!"
    const words = text.split(" ")

    useEffect(() => {
        const scheduleNextAnimation = () => {
            const randomInterval = Math.random() * 6000 + 12000 // 12-18 seconds

            setTimeout(() => {
                const animations = [
                    { type: "wave", target: "both" },
                    { type: "grow", target: "both" },
                    { type: "wave", target: "first" },
                    { type: "wave", target: "second" },
                    { type: "grow", target: "first" },
                    { type: "grow", target: "second" },
                ] as const

                const chosen = animations[Math.floor(Math.random() * animations.length)]
                setAnimationType(chosen.type)
                setAnimationTarget(chosen.target)

                if (chosen.type === "grow") {
                    setGrowCount(1)
                    setTimeout(() => {
                        setGrowCount(0) // Back to normal
                        setTimeout(() => {
                            setGrowCount(1) // Second grow
                            setTimeout(() => {
                                setAnimationType(null)
                                setGrowCount(0)
                                setAnimationTarget("both")
                                scheduleNextAnimation()
                            }, 400) // Second grow duration
                        }, 400) // Back to normal duration
                    }, 400) // First grow duration
                } else {
                    setAnimationType("wave")
                    setTimeout(() => {
                        setAnimationType(null)
                        setAnimationTarget("both")
                        scheduleNextAnimation()
                    }, 2500) // Increased wave duration to allow smooth ending
                }
            }, randomInterval)
        }

        scheduleNextAnimation()
    }, [])

    const shouldAnimate = (letterIndex: number) => {
        if (animationTarget === "both") return true

        const firstWordLength = words[0].length
        if (animationTarget === "first") {
            return letterIndex < firstWordLength
        } else {
            // second
            return letterIndex > firstWordLength // Skip the space
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center p-8">
            <div className="text-center">
                <h1
                    className={`text-yellow-400 text-4xl md:text-7xl lg:text-[6rem] xl:text-[9rem] font-black uppercase tracking-wider transform -rotate-2 drop-shadow-[0_8px_0_rgba(0,0,0,1)] transition-transform duration-300 ease-in-out ${animationType === "grow" && animationTarget === "both" ? (growCount === 1 ? "scale-110" : "scale-100") : ""
                        }`}
                >
                    {words.map((word, wordIndex) => (
                        <span
                            key={wordIndex}
                            className={`inline-block ${wordIndex > 0 ? "ml-8" : ""} transition-transform duration-300 ease-in-out ${animationType === "grow" &&
                                ((animationTarget === "first" && wordIndex === 0) || (animationTarget === "second" && wordIndex === 1))
                                ? growCount === 1
                                    ? "scale-110"
                                    : "scale-100"
                                : ""
                                }`}
                        >
                            {word.split("").map((letter, letterIndex) => {
                                const globalIndex = wordIndex === 0 ? letterIndex : words[0].length + 1 + letterIndex
                                return (
                                    <span
                                        key={globalIndex}
                                        className="inline-block"
                                        style={{
                                            textShadow: "4px 4px 0 #000, -4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000",
                                            filter: "drop-shadow(0 0 10px rgba(255, 255, 0, 0.3))",
                                            animation:
                                                animationType === "wave" && shouldAnimate(globalIndex)
                                                    ? `wave 2s ease-in-out ${globalIndex * 0.1}s`
                                                    : "none",
                                        }}
                                    >
                                        {letter}
                                    </span>
                                )
                            })}
                        </span>
                    ))}
                </h1>

                <div className="absolute top-10 left-10 text-yellow-300 text-6xl animate-pulse">★</div>
                <div className="absolute top-20 right-16 text-yellow-300 text-4xl animate-pulse delay-500">★</div>
                <div className="absolute bottom-16 left-20 text-yellow-300 text-5xl animate-pulse delay-1000">★</div>
                <div className="absolute bottom-10 right-10 text-yellow-300 text-6xl animate-pulse delay-700">★</div>
            </div>

            <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.1); }
        }
      `}</style>
        </div>
    )
}

export function H1({ children, tilt = -2 }: { children: React.ReactNode; tilt?: number }) {
    return (
        <div
            className="text-5xl md:text-7xl font-black text-yellow-400 mb-1"
            style={{
                textShadow: '4px 4px 0 rgba(0,0,0,1)',
                transform: `rotate(${tilt}deg)`,
                fontFamily: '"KGSummerSunshineBlackout","Baloo 2",system-ui,sans-serif',
            }}
        >
            {children}
        </div>
    )
}
import React, { useEffect, useRef } from 'react';

function canFullscreen() {
    const el = document.documentElement as any;
    return !!(el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen);
}

async function requestAnyFullscreen(el: HTMLElement) {
    const anyEl = el as any;
    if (anyEl.requestFullscreen) return anyEl.requestFullscreen();
    if (anyEl.webkitRequestFullscreen) return anyEl.webkitRequestFullscreen();
    if (anyEl.msRequestFullscreen) return anyEl.msRequestFullscreen();
}

export function FullscreenProvider({
    children,
    className = 'min-h-screen flex flex-col',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const targetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!canFullscreen()) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'f') {
                const el = targetRef.current ?? document.documentElement;
                requestAnyFullscreen(el).then(async () => {
                    try {
                        // @ts-expect-error: not always in TS lib
                        await screen.orientation?.lock?.('landscape');
                    } catch { }
                });
            }
        };

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    return (
        <div ref={targetRef} className={className}>
            {children}
        </div>
    );
}

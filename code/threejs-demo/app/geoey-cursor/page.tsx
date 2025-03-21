'use client'

import { useEffect, useRef } from 'react'

const TAIL_LENGTH = 20

export default function Page() {
    const cursorRef = useRef<HTMLDivElement>(null)
    const cursorCircles = Array.from({ length: TAIL_LENGTH }, () => useRef<HTMLDivElement>(null))

    const mouseXRef = useRef(0)
    const mouseYRef = useRef(0)
    const cursorHistoryRef = useRef(
        Array.from({ length: TAIL_LENGTH }, () => ({ x: 0, y: 0 }))
    )

    const handleMouseMove = (event: MouseEvent) => {
        mouseXRef.current = event.clientX
        mouseYRef.current = event.clientY
    }

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove)
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    useEffect(() => {
        let animationFrameId: number

        const updateCursor = () => {
            const cursorHistory = cursorHistoryRef.current

            // Update history
            cursorHistory.shift()
            cursorHistory.push({ x: mouseXRef.current, y: mouseYRef.current })

            for (let i = 0; i < TAIL_LENGTH; i++) {
                const current = cursorHistory[i]
                const next = cursorHistory[i + 1] || cursorHistory[TAIL_LENGTH - 1]

                // Smooth movement
                current.x += (next.x - current.x) * 0.35
                current.y += (next.y - current.y) * 0.35

                const circle = cursorCircles[i].current
                if (circle) {
                    circle.style.transform = `translate(${current.x}px, ${current.y}px) scale(${i / TAIL_LENGTH})`
                }
            }

            animationFrameId = requestAnimationFrame(updateCursor)
        }

        updateCursor()
        return () => cancelAnimationFrame(animationFrameId)
    }, [])

    return (
        <>
            {/* SVG Filter Definition */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="hidden"
                version="1.1"
                width="100%"
            >
                <defs>
                    <filter id="goo">
                        <feGaussianBlur
                            in="SourceGraphic"
                            stdDeviation="6"
                            result="blur"
                        />
                        <feColorMatrix
                            in="blur"
                            mode="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -15"
                            result="goo"
                        />
                        <feComposite
                            in="SourceGraphic"
                            in2="goo"
                            operator="atop"
                        />
                    </filter>
                </defs>
            </svg>

            {/* Page Content */}
            <div className="min-h-screen bg-[#FAF7EE] flex items-center justify-center">
                <h1 className="text-[148px] leading-none font-sans uppercase select-none">
                    Gooey<br />Cursor
                </h1>
            </div>

            {/* Cursor Element */}
            <div
                id="cursor"
                ref={cursorRef}
                className="fixed top-0 left-0 pointer-events-none mix-blend-difference"
                style={{ filter: 'url(#goo)' }}
            >
                {cursorCircles.map((circleRef, index) => (
                    <div
                        key={index}
                        ref={circleRef}
                        className="absolute top-0 left-0 w-[28px] h-[28px] bg-[#FAF7EE] rounded-full"
                    />
                ))}
            </div>
        </>
    )
}
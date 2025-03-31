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

    // Store the event handler in a ref to ensure stability
    const handleMouseMoveRef = useRef<(event: MouseEvent) => void>(() => { })
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        handleMouseMoveRef.current = (event: MouseEvent) => {
            mouseXRef.current = event.clientX
            mouseYRef.current = event.clientY
        }
    }, [])

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            handleMouseMoveRef.current(event)
        }

        const handleMouseLeave = () => {
            // Hide all circles when the mouse leaves the window
            cursorCircles.forEach(circleRef => {
                if (circleRef.current) {
                    circleRef.current.style.opacity = '0'
                }
            })
        }

        const handleMouseEnter = () => {
            // Show all circles when the mouse re-enters the window
            cursorCircles.forEach(circleRef => {
                if (circleRef.current) {
                    circleRef.current.style.opacity = '1'
                }
            })
        }



        containerRef.current?.addEventListener('mousemove', handleMouseMove)
        containerRef.current?.addEventListener('mouseleave', handleMouseLeave)
        containerRef.current?.addEventListener('mouseenter', handleMouseEnter)

        return () => {
            containerRef.current?.removeEventListener('mousemove', handleMouseMove)
            containerRef.current?.removeEventListener('mouseleave', handleMouseLeave)
            containerRef.current?.removeEventListener('mouseenter', handleMouseEnter)
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
            <div className="min-h-screen bg-[#FAF7EE] flex items-center justify-center flex-col" ref={containerRef}>
                <img src="/next.svg" className='w-1/2 bg-blue-100 mix-blend-difference p-4' alt="" />
                <h2 className='text-4xl font-bold mt-4 text-[#785b07]'>from ajn404</h2>
                <svg
                    width="120"
                    height="120"
                >
                    <filter id="dropShadow">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                        <feOffset dx="2" dy="4" />
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <circle cx="60" cy="60" r="50" fill="green" filter="url(#dropShadow)" />
                </svg>

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
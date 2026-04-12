/**
 * Slide engine — manages navigation, transitions, progress, and level indicators.
 * 36 slides across 3 depth levels about Context Management in Claude Code.
 */

import { useEffect, useState, useCallback, useRef, type TouchEvent as ReactTouchEvent } from 'react'
import { level1Slides } from './slides/Level1'
import { level2Slides } from './slides/Level2'
import { level3Slides } from './slides/Level3'

const ALL_SLIDES = [...level1Slides, ...level2Slides, ...level3Slides]

const LEVELS = [
  { name: 'Level 1 — The Big Picture', color: '#d97706', range: [0, 8] },
  { name: 'Level 2 — Each Layer', color: '#818cf8', range: [9, 24] },
  { name: 'Level 3 — The Machinery', color: '#f43f5e', range: [25, 35] },
] as const

// O(1) lookup table — avoids iterating LEVELS for every nav dot (36 calls/render)
const SLIDE_LEVEL_MAP = /* @__PURE__ */ (() => {
  const map: (typeof LEVELS)[number][] = []
  for (const l of LEVELS) {
    for (let i = l.range[0]; i <= l.range[1]; i++) map[i] = l
  }
  return map
})()

function getLevel(idx: number) {
  return SLIDE_LEVEL_MAP[idx] ?? LEVELS[0]
}

export default function App() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [prevSlide, setPrevSlide] = useState<number | null>(null)
  const transitioning = useRef(false)

  const total = ALL_SLIDES.length

  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const goTo = useCallback((n: number, dir?: 'forward' | 'backward') => {
    if (transitioning.current) return
    const next = Math.max(0, Math.min(n, total - 1))
    if (next === current) return

    transitioning.current = true
    const d = dir ?? (next > current ? 'forward' : 'backward')
    setDirection(d)
    setPrevSlide(current)
    setCurrent(next)

    if (transitionTimer.current) clearTimeout(transitionTimer.current)
    transitionTimer.current = setTimeout(() => {
      setPrevSlide(null)
      transitioning.current = false
      transitionTimer.current = null
    }, 550)
  }, [current, total])

  const next = useCallback(() => goTo(current + 1, 'forward'), [goTo, current])
  const prev = useCallback(() => goTo(current - 1, 'backward'), [goTo, current])

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault()
        prev()
      } else if (e.key === 'Home') {
        e.preventDefault()
        goTo(0, 'backward')
      } else if (e.key === 'End') {
        e.preventDefault()
        goTo(total - 1, 'forward')
      } else if (e.key.toLowerCase() === 'f') {
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault()
          if (document.fullscreenElement) {
            document.exitFullscreen()
          } else {
            document.documentElement.requestFullscreen()
          }
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [next, prev, goTo, total])

  // ── Touch swipe navigation ──
  const touchStartX = useRef<number | null>(null)
  const handleTouchStart = useCallback((e: ReactTouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])
  const handleTouchEnd = useCallback((e: ReactTouchEvent) => {
    if (touchStartX.current === null) return
    const diff = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) prev()   // swipe right → previous slide
      else next()             // swipe left  → next slide
    }
    touchStartX.current = null
  }, [next, prev])

  const level = getLevel(current)
  const progress = ((current + 1) / total) * 100

  return (
    <div
      className="h-screen w-screen overflow-hidden relative bg-grid"
      style={{ background: 'var(--bg)' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background grid overlay */}
      <div className="absolute inset-0 bg-grid pointer-events-none" />

      {/* Progress bar */}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Level indicator */}
      <div className="level-badge" style={{ color: level.color }}>
        {level.name}
      </div>

      {/* Slide number */}
      <div className="slide-num">
        {current + 1} / {total}
      </div>

      {/* Slides — direct index access instead of iterating all 36 */}
      <div className="relative h-full w-full">
        {[current, prevSlide].map(idx => {
          if (idx === null || idx === undefined) return null
          const SlideComponent = ALL_SLIDES[idx]
          const isActive = idx === current
          let className = 'slide-container'
          if (isActive) {
            className += ' active'
          } else {
            className += direction === 'forward' ? ' exit-left' : ' exit-right'
          }
          return (
            <div key={idx} className={className}>
              <SlideComponent />
            </div>
          )
        })}
      </div>

      {/* Navigation dots (level separators) */}
      <div className="nav-dots fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-50">
        {ALL_SLIDES.map((_, idx) => {
          const l = getLevel(idx)
          const isLevelStart = idx === 0 || idx === 9 || idx === 25
          return (
            <div key={idx} className="flex items-center">
              {isLevelStart && idx > 0 && (
                <div className="w-px h-3 mx-1" style={{ background: 'rgba(255,255,255,0.15)' }} />
              )}
              <button
                onClick={() => goTo(idx)}
                className="transition-all duration-300"
                style={{
                  width: idx === current ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: idx === current ? l.color : idx < current ? `${l.color}66` : 'rgba(255,255,255,0.12)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
                title={`Slide ${idx + 1}`}
              />
            </div>
          )
        })}
      </div>

      {/* Nav hint */}
      <div className="nav-hint">
        <span className="hidden md:inline">← → navigate{'  '}·{'  '}Space next{'  '}·{'  '}F fullscreen</span>
        <span className="md:hidden">swipe ← → to navigate</span>
      </div>
    </div>
  )
}

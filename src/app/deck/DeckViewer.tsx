'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SlideRenderer from '@/components/slides/SlideRenderer'
import type { SlideConfig } from '@/types/slide'

interface DeckViewerProps {
  slides: SlideConfig[]
  token: string
}

export default function DeckViewer({ slides, token }: DeckViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showNav, setShowNav] = useState(true)

  const [showThumbs, setShowThumbs] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const navTimeout = useRef<NodeJS.Timeout>()

  // Calculate scale for the current viewport
  const [scale, setScale] = useState(1)
  useEffect(() => {
    function updateScale() {
      const scaleW = window.innerWidth / 1920
      const scaleH = window.innerHeight / 1080
      setScale(Math.min(scaleW, scaleH))
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  // Auto-hide nav
  function resetNavTimeout() {
    setShowNav(true)
    if (navTimeout.current) clearTimeout(navTimeout.current)
    navTimeout.current = setTimeout(() => setShowNav(false), 3000)
  }

  useEffect(() => {
    resetNavTimeout()
    return () => { if (navTimeout.current) clearTimeout(navTimeout.current) }
  }, [])

  const goTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, index))
    setCurrentSlide(clamped)
    slideRefs.current[clamped]?.scrollIntoView({ behavior: 'smooth' })
  }, [slides.length])

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      resetNavTimeout()
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        goTo(currentSlide + 1)
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        goTo(currentSlide - 1)
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen()
      } else if (e.key === 'Escape') {
        setShowThumbs(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [currentSlide, goTo])

  // Intersection observer for current slide
  useEffect(() => {
    const observers: IntersectionObserver[] = []
    slideRefs.current.forEach((ref, i) => {
      if (!ref) return
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting && entry.intersectionRatio > 0.5) setCurrentSlide(i) },
        { threshold: 0.5 }
      )
      observer.observe(ref)
      observers.push(observer)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [slides.length])

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  function exportPDF() {
    window.open(`/deck/print?token=${token}`, '_blank')
  }

  return (
    <div
      onMouseMove={resetNavTimeout}
      style={{ background: '#0D1B2A', height: '100vh', overflow: 'hidden', position: 'relative' }}
    >
      {/* Snap scroll container */}
      <div
        ref={containerRef}
        className="deck-container"
        style={{ height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory' }}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.slideIndex}
            ref={el => { slideRefs.current[i] = el }}
            className="deck-slide"
            style={{ scrollSnapAlign: 'start', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}
          >
            <SlideRenderer
              slideConfig={slide}
              scale={scale}
              isAnimated={i === currentSlide}
            />
          </div>
        ))}
      </div>

      {/* Navigation overlay */}
      <AnimatePresence>
        {showNav && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100 }}
          >
            {/* Top bar */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                padding: '20px 32px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(180deg, rgba(7,16,28,0.8) 0%, transparent 100%)',
                pointerEvents: 'all',
              }}
            >
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.25em', color: 'rgba(232,237,242,0.55)', textTransform: 'uppercase' }}>
                PANOPTES · {String(currentSlide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button
                  onClick={exportPDF}
                  style={{
                    background: 'rgba(0,194,203,0.15)',
                    border: '1px solid rgba(0,194,203,0.3)',
                    color: '#00C2CB',
                    padding: '8px 20px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                  }}
                >
                  ↓ PDF
                </button>
                <button
                  onClick={() => setShowThumbs(!showThumbs)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    padding: '8px 16px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    letterSpacing: '0.2em',
                  }}
                >
                  ⊞
                </button>
                <button
                  onClick={toggleFullscreen}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    padding: '8px 16px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                  }}
                >
                  {isFullscreen ? '⊠' : '⊡'}
                </button>
              </div>
            </div>

            {/* Side nav arrows */}
            <button
              onClick={() => goTo(currentSlide - 1)}
              disabled={currentSlide === 0}
              style={{
                position: 'absolute',
                left: 20,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#FFFFFF',
                width: 48,
                height: 48,
                borderRadius: 8,
                cursor: currentSlide === 0 ? 'default' : 'pointer',
                opacity: currentSlide === 0 ? 0.2 : 0.7,
                fontSize: 20,
                pointerEvents: 'all',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ↑
            </button>
            <button
              onClick={() => goTo(currentSlide + 1)}
              disabled={currentSlide === slides.length - 1}
              style={{
                position: 'absolute',
                right: 20,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#FFFFFF',
                width: 48,
                height: 48,
                borderRadius: 8,
                cursor: currentSlide === slides.length - 1 ? 'default' : 'pointer',
                opacity: currentSlide === slides.length - 1 ? 0.2 : 0.7,
                fontSize: 20,
                pointerEvents: 'all',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ↓
            </button>

            {/* Slide indicator dots */}
            <div
              style={{
                position: 'absolute',
                bottom: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 8,
                pointerEvents: 'all',
              }}
            >
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  style={{
                    width: i === currentSlide ? 24 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: i === currentSlide ? '#00C2CB' : 'rgba(232,237,242,0.25)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'width 0.2s, background 0.2s',
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thumbnail panel */}
      <AnimatePresence>
        {showThumbs && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              bottom: 0,
              width: 280,
              background: 'rgba(10,20,34,0.95)',
              borderLeft: '1px solid rgba(0,194,203,0.15)',
              zIndex: 200,
              overflowY: 'auto',
              padding: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.25em', color: '#00C2CB', textTransform: 'uppercase' }}>
                Slides
              </span>
              <button
                onClick={() => setShowThumbs(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(232,237,242,0.5)', cursor: 'pointer', fontSize: 18 }}
              >
                ×
              </button>
            </div>
            {slides.map((slide, i) => (
              <div
                key={i}
                onClick={() => { goTo(i); setShowThumbs(false) }}
                style={{
                  marginBottom: 8,
                  cursor: 'pointer',
                  border: `1px solid ${i === currentSlide ? '#00C2CB' : 'rgba(0,194,203,0.12)'}`,
                  borderRadius: 4,
                  overflow: 'hidden',
                  opacity: i === currentSlide ? 1 : 0.7,
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ position: 'relative', background: slide.theme.background, height: 140 }}>
                  <SlideRenderer slideConfig={slide} scale={0.128} isAnimated={false} />
                </div>
                <div
                  style={{
                    padding: '6px 8px',
                    background: i === currentSlide ? 'rgba(0,194,203,0.1)' : 'transparent',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    letterSpacing: '0.15em',
                    color: i === currentSlide ? '#00C2CB' : 'rgba(232,237,242,0.4)',
                    textTransform: 'uppercase',
                  }}
                >
                  {String(i + 1).padStart(2, '0')} · {slide.label?.replace(/^\d+ /, '')}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

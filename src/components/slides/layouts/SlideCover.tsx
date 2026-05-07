'use client'

import React from 'react'
import { motion } from 'framer-motion'
import type { SlideConfig } from '@/types/slide'
import { GlowBlob } from './SlideBase'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function SlideCover({ config, isAnimated }: { config: SlideConfig; isPrint?: boolean; isAnimated?: boolean }) {
  const anim = isAnimated !== false

  const Wrap = ({ children, delay }: { children: React.ReactNode; delay: number }) =>
    anim ? (
      <motion.div {...fadeUp(delay)}>{children}</motion.div>
    ) : (
      <div>{children}</div>
    )

  return (
    <>
      <GlowBlob size={800} top={-200} right={-200} opacity={0.45} />
      <GlowBlob size={600} bottom={-200} left={-100} opacity={0.25} />

      {/* Cover network dots decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          backgroundImage: `radial-gradient(circle at 70% 50%, rgba(0,194,203,0.06) 0%, transparent 60%)`,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          height: '100%',
          padding: '130px 96px 96px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {/* Panoptes mark */}
        <Wrap delay={0}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 24, marginBottom: 80 }}>
            {/* Eye SVG glyph */}
            <svg width={88} height={88} viewBox="0 0 88 88">
              <defs>
                <linearGradient id="cov-eye" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#9be9ee" />
                  <stop offset="100%" stopColor="#00C2CB" />
                </linearGradient>
                <radialGradient id="cov-iris" cx="42%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#a8e6ff" />
                  <stop offset="40%" stopColor="#00C2CB" />
                  <stop offset="100%" stopColor="#0a2754" />
                </radialGradient>
              </defs>
              <ellipse cx="44" cy="44" rx="40" ry="22" fill="none" stroke="url(#cov-eye)" strokeWidth="2.5" transform="rotate(-12 44 44)" />
              <circle cx="44" cy="44" r="14" fill="url(#cov-iris)" />
              <circle cx="44" cy="44" r="6" fill="#0D1B2A" />
              <circle cx="40" cy="40" r="2" fill="#fff" opacity={0.9} />
              <circle cx="6" cy="36" r="3" fill="#00C2CB" />
              <circle cx="14" cy="28" r="2" fill="#00C2CB" opacity={0.7} />
              <circle cx="78" cy="56" r="3" fill="#00C2CB" />
              <circle cx="70" cy="64" r="2" fill="#00C2CB" opacity={0.7} />
            </svg>

            <div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: 56,
                  letterSpacing: '0.04em',
                  color: '#FFFFFF',
                  lineHeight: 1,
                }}
              >
                PANOPTES
              </div>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400,
                  fontSize: 16,
                  letterSpacing: '0.3em',
                  color: '#00C2CB',
                  textTransform: 'uppercase',
                  marginTop: 4,
                }}
              >
                Real-Time Health Intelligence
              </div>
            </div>
          </div>
        </Wrap>

        <Wrap delay={0.15}>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: 88,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
              margin: '0 0 32px',
              maxWidth: 1500,
            }}
          >
            {config.title}
          </h1>
        </Wrap>

        <Wrap delay={0.3}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 16,
              letterSpacing: '0.4em',
              color: '#00C2CB',
              textTransform: 'uppercase',
            }}
          >
            EARLY DETECTION&nbsp;&nbsp;·&nbsp;&nbsp;REAL-TIME MONITORING&nbsp;&nbsp;·&nbsp;&nbsp;PREDICTIVE INTELLIGENCE
          </div>
        </Wrap>

        <Wrap delay={0.45}>
          <div
            style={{
              marginTop: 96,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              letterSpacing: '0.2em',
              color: 'rgba(232,237,242,0.32)',
              textTransform: 'uppercase',
            }}
          >
            <div>EVERY PHARMACY · A REAL-TIME HEALTH SENSOR</div>
            <div>INVESTOR DECK · 2026</div>
          </div>
        </Wrap>
      </div>
    </>
  )
}

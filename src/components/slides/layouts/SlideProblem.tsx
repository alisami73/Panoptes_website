'use client'

import React from 'react'
import { motion } from 'framer-motion'
import type { SlideConfig } from '@/types/slide'
import SlideBase, { Eyebrow, SlideTitle, SlideSubtitle, GlowBlob, SlideFooter } from './SlideBase'

const ICONS: Record<string, React.ReactNode> = {
  'fragmented-data': (
    <svg viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 56, height: 56 }}>
      <rect x="6" y="6" width="44" height="44" rx="3" />
      <line x1="6" y1="20" x2="50" y2="20" />
      <circle cx="14" cy="13" r="1.5" fill="currentColor" />
      <circle cx="20" cy="13" r="1.5" fill="currentColor" />
      <line x1="14" y1="32" x2="42" y2="32" strokeDasharray="3 3" />
      <line x1="14" y1="40" x2="34" y2="40" strokeDasharray="3 3" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 56, height: 56 }}>
      <circle cx="28" cy="28" r="22" />
      <line x1="28" y1="6" x2="28" y2="28" />
      <line x1="28" y1="28" x2="40" y2="36" />
      <circle cx="28" cy="28" r="2" fill="currentColor" />
    </svg>
  ),
  'chart-up': (
    <svg viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 56, height: 56 }}>
      <path d="M8 44 L20 28 L30 36 L46 14" />
      <path d="M38 14 L46 14 L46 22" />
      <line x1="8" y1="50" x2="48" y2="50" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 56, height: 56 }}>
      <path d="M28 6 L34 22 L50 22 L37 32 L42 48 L28 38 L14 48 L19 32 L6 22 L22 22 Z" />
    </svg>
  ),
}

function ProblemCard({ num, icon, title, body, index, animated }: {
  num: string
  icon: string
  title: string
  body: string
  index: number
  animated: boolean
}) {
  const inner = (
    <div
      style={{
        background: 'linear-gradient(180deg, rgba(0,194,203,0.06) 0%, rgba(0,194,203,0.02) 100%)',
        border: '1px solid rgba(0,194,203,0.18)',
        borderRadius: 8,
        padding: 36,
        minHeight: 280,
        backdropFilter: 'blur(2px)',
        position: 'relative',
      }}
    >
      <div style={{ color: '#00C2CB', marginBottom: 20 }}>{ICONS[icon]}</div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          letterSpacing: '0.3em',
          color: '#00C2CB',
          marginBottom: 16,
        }}
      >
        {num}
      </div>
      <h3
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: 26,
          color: '#FFFFFF',
          margin: '0 0 14px',
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: 16, lineHeight: 1.55, color: '#E8EDF2', opacity: 0.85, margin: 0 }}>{body}</p>
    </div>
  )

  if (!animated) return inner

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 + index * 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      {inner}
    </motion.div>
  )
}

export default function SlideProblem({ config, isAnimated }: { config: SlideConfig; isPrint?: boolean; isAnimated?: boolean }) {
  const anim = isAnimated !== false

  return (
    <>
      <GlowBlob size={600} top={-100} right={-150} opacity={0.18} warm />
      <SlideBase config={config}>
        <Eyebrow text={config.eyebrow || '01 · The Problem'} color={config.theme.accentColor} />
        <SlideTitle>{config.title}</SlideTitle>
        <SlideSubtitle>{config.subtitle}</SlideSubtitle>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24,
          }}
        >
          {config.blocks.map((block, i) => {
            const c = block.content as any
            return (
              <ProblemCard
                key={block.id}
                num={c.num}
                icon={c.icon}
                title={c.title}
                body={c.body}
                index={i}
                animated={anim}
              />
            )
          })}
        </div>

        <SlideFooter
          left={config.footer?.left}
          right={config.footer?.right}
        />
      </SlideBase>
    </>
  )
}

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import type { SlideConfig } from '@/types/slide'
import SlideBase, { Eyebrow, SlideTitle, SlideSubtitle, GlowBlob } from './SlideBase'

const ICONS: Record<string, React.ReactNode> = {
  beacon: (
    <svg viewBox="0 0 72 72" width={72} height={72} fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M36 8 L36 28" strokeLinecap="round" />
      <path d="M22 14 L36 28 L50 14" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="36" cy="48" rx="24" ry="14" />
      <circle cx="36" cy="48" r="6" fill="currentColor" opacity={0.3} />
      <circle cx="36" cy="48" r="3" fill="currentColor" />
      <circle cx="14" cy="44" r="1.5" fill="currentColor" />
      <circle cx="58" cy="44" r="1.5" fill="currentColor" />
      <circle cx="20" cy="58" r="1.5" fill="currentColor" />
      <circle cx="52" cy="58" r="1.5" fill="currentColor" />
    </svg>
  ),
  database: (
    <svg viewBox="0 0 72 72" width={72} height={72} fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="10" y="14" width="52" height="44" rx="3" />
      <line x1="10" y1="22" x2="62" y2="22" />
      <circle cx="16" cy="18" r="1" fill="currentColor" />
      <circle cx="20" cy="18" r="1" fill="currentColor" />
      <line x1="18" y1="32" x2="54" y2="32" />
      <line x1="18" y1="40" x2="48" y2="40" />
      <line x1="18" y1="48" x2="40" y2="48" />
      <path d="M52 44 L60 36 L68 44" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="60" y1="36" x2="60" y2="56" strokeLinecap="round" />
    </svg>
  ),
  brain: (
    <svg viewBox="0 0 72 72" width={72} height={72} fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="36" cy="36" r="26" />
      <path d="M36 18 Q44 22 44 30 Q44 36 38 38 L38 46" strokeLinecap="round" />
      <circle cx="38" cy="50" r="2" fill="currentColor" />
      <circle cx="20" cy="20" r="2" fill="currentColor" />
      <circle cx="54" cy="20" r="2" fill="currentColor" />
      <circle cx="20" cy="52" r="2" fill="currentColor" />
      <circle cx="54" cy="52" r="2" fill="currentColor" />
      <line x1="22" y1="22" x2="36" y2="36" strokeDasharray="2 2" />
      <line x1="52" y1="22" x2="36" y2="36" strokeDasharray="2 2" />
      <line x1="22" y1="50" x2="36" y2="36" strokeDasharray="2 2" />
      <line x1="52" y1="50" x2="36" y2="36" strokeDasharray="2 2" />
    </svg>
  ),
}

function SolutionCol({ block, index, animated }: { block: any; index: number; animated: boolean }) {
  const c = block.content

  const inner = (
    <div
      style={{
        background: 'linear-gradient(180deg, rgba(0,194,203,0.06) 0%, rgba(0,194,203,0.02) 100%)',
        border: '1px solid rgba(0,194,203,0.18)',
        borderRadius: 8,
        padding: '40px 32px',
        minHeight: 480,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 600,
          fontSize: 14,
          letterSpacing: '0.3em',
          color: '#00C2CB',
          marginBottom: 16,
        }}
      >
        {c.num}
      </div>
      <div style={{ color: '#00C2CB', marginBottom: 24 }}>{ICONS[c.icon]}</div>
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: 32,
          color: '#FFFFFF',
          marginBottom: 12,
        }}
      >
        {c.title}
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          letterSpacing: '0.25em',
          color: '#00C2CB',
          textTransform: 'uppercase',
          marginBottom: 20,
        }}
      >
        {c.role}
      </div>
      <p style={{ fontSize: 16, lineHeight: 1.55, color: '#E8EDF2', opacity: 0.85, margin: 0 }}>{c.desc}</p>
      <ul
        style={{
          marginTop: 'auto',
          paddingTop: 24,
          borderTop: '1px solid rgba(0,194,203,0.18)',
          listStyle: 'none',
          paddingLeft: 0,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          letterSpacing: '0.18em',
          color: 'rgba(232,237,242,0.55)',
          textTransform: 'uppercase',
        }}
      >
        {(c.features as string[]).map((f: string, fi: number) => (
          <li key={fi} style={{ padding: '6px 0' }}>{f}</li>
        ))}
      </ul>
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

export default function SlideSolution({ config, isAnimated }: { config: SlideConfig; isPrint?: boolean; isAnimated?: boolean }) {
  const anim = isAnimated !== false

  return (
    <>
      <GlowBlob size={700} top={-200} left={-200} opacity={0.3} />
      <SlideBase config={config}>
        <Eyebrow text={config.eyebrow || '02 · The Solution'} color={config.theme.accentColor} />
        <SlideTitle>{config.title}</SlideTitle>
        <SlideSubtitle>{config.subtitle}</SlideSubtitle>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
          {config.blocks.map((block, i) => (
            <SolutionCol key={block.id} block={block} index={i} animated={anim} />
          ))}
        </div>
      </SlideBase>
    </>
  )
}

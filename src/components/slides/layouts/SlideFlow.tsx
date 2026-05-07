'use client'

import React from 'react'
import { motion } from 'framer-motion'
import type { SlideConfig } from '@/types/slide'
import SlideBase, { Eyebrow, SlideTitle, SlideSubtitle, SlideFooter } from './SlideBase'

function FlowStage({ num, title, desc, highlight, delay, animated }: {
  num: string; title: string; desc: string; highlight?: boolean; delay: number; animated: boolean
}) {
  const inner = (
    <div
      style={{
        background: highlight
          ? 'linear-gradient(180deg, rgba(0,194,203,0.18), rgba(0,194,203,0.04))'
          : 'linear-gradient(180deg, rgba(0,194,203,0.08), rgba(0,194,203,0.02))',
        border: highlight ? '1px solid rgba(0,194,203,0.5)' : '1px solid rgba(0,194,203,0.18)',
        borderRadius: 8,
        padding: '36px 28px',
        textAlign: 'center',
        minHeight: 260,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        flex: 1,
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          letterSpacing: '0.3em',
          color: highlight ? '#00dcff' : '#00C2CB',
          marginBottom: 16,
          textTransform: 'uppercase',
        }}
      >
        {num}
      </div>
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: 22,
          color: '#FFFFFF',
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 13, color: '#E8EDF2', opacity: 0.7 }}>{desc}</div>
    </div>
  )

  if (!animated) return inner
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ flex: 1 }}
    >
      {inner}
    </motion.div>
  )
}

const Arrow = () => (
  <svg width={48} height={64} viewBox="0 0 48 64" fill="none" style={{ color: '#00C2CB', flexShrink: 0 }}>
    <line x1="0" y1="32" x2="40" y2="32" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 4" />
    <path d="M34 26 L42 32 L34 38" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function SlideFlow({ config, isAnimated }: { config: SlideConfig; isPrint?: boolean; isAnimated?: boolean }) {
  const anim = isAnimated !== false

  return (
    <SlideBase config={config}>
      <Eyebrow text={config.eyebrow || '03 · How it works'} color={config.theme.accentColor} />
      <SlideTitle>{config.title}</SlideTitle>
      <SlideSubtitle>{config.subtitle}</SlideSubtitle>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 16, flex: 1 }}>
        {config.blocks.map((block, i) => {
          const c = block.content as any
          return (
            <React.Fragment key={block.id}>
              <FlowStage
                num={c.num}
                title={c.title}
                desc={c.desc}
                highlight={c.highlight || (block.style as any)?.highlight}
                delay={0.1 + i * 0.15}
                animated={anim}
              />
              {i < config.blocks.length - 1 && <Arrow />}
            </React.Fragment>
          )
        })}
      </div>

      {config.footer && (
        <SlideFooter left={config.footer.left} right={config.footer.right} />
      )}
    </SlideBase>
  )
}

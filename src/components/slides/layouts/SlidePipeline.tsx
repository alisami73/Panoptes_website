'use client'

import React from 'react'
import { motion } from 'framer-motion'
import type { SlideConfig } from '@/types/slide'
import SlideBase, { Eyebrow, SlideTitle, SlideSubtitle } from './SlideBase'

export default function SlidePipeline({ config, isAnimated }: { config: SlideConfig; isPrint?: boolean; isAnimated?: boolean }) {
  const anim = isAnimated !== false

  return (
    <SlideBase config={config}>
      <Eyebrow text={config.eyebrow || ''} color={config.theme.accentColor} />
      <SlideTitle>{config.title}</SlideTitle>
      <SlideSubtitle>{config.subtitle}</SlideSubtitle>

      {/* Pipeline steps */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          borderTop: '1px solid rgba(0,194,203,0.18)',
          borderBottom: '1px solid rgba(0,194,203,0.18)',
          margin: '0 0 48px',
        }}
      >
        {config.blocks.map((block, i) => {
          const c = block.content as any
          const inner = (
            <div
              style={{
                padding: '32px 24px',
                borderRight: i < config.blocks.length - 1 ? '1px solid rgba(0,194,203,0.18)' : 'none',
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 32,
                  fontWeight: 600,
                  color: '#00C2CB',
                  lineHeight: 1,
                  marginBottom: 16,
                }}
              >
                {c.num}
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
                {c.name}
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 15,
                  letterSpacing: '0.15em',
                  color: 'rgba(232,237,242,0.55)',
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}
              >
                {c.detail}
              </div>
              <div style={{ fontSize: 18, color: '#E8EDF2', opacity: 0.7, lineHeight: 1.5 }}>{c.desc}</div>
            </div>
          )

          return anim ? (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {inner}
            </motion.div>
          ) : (
            <div key={block.id}>{inner}</div>
          )
        })}
      </div>

      {/* Metrics row */}
      {config.metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
          {config.metrics.map((m, i) => (
            <div key={i}>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 16,
                  letterSpacing: '0.25em',
                  color: 'rgba(232,237,242,0.55)',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                {m.label}
              </div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: 48,
                  color: '#FFFFFF',
                  lineHeight: 1,
                }}
              >
                {m.value}
                {m.unit && (
                  <span style={{ color: '#00C2CB', fontSize: '0.5em', marginLeft: 6 }}>{m.unit}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </SlideBase>
  )
}

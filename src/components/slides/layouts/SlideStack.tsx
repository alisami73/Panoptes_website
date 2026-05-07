'use client'

import React from 'react'
import { motion } from 'framer-motion'
import type { SlideConfig } from '@/types/slide'
import SlideBase, { Eyebrow, SlideTitle, SlideSubtitle, GlowBlob } from './SlideBase'

const tierStyles: Record<string, React.CSSProperties> = {
  'tier-1': {
    background: 'linear-gradient(90deg, rgba(0,194,203,0.12), rgba(0,194,203,0.04))',
    borderColor: 'rgba(0,194,203,0.4)',
  },
  'tier-2': {
    background: 'linear-gradient(90deg, rgba(0,194,203,0.06), rgba(0,194,203,0.02))',
    borderColor: 'rgba(0,194,203,0.18)',
  },
  'tier-3': {
    background: 'linear-gradient(90deg, rgba(232,237,242,0.04), rgba(232,237,242,0.01))',
    borderColor: 'rgba(232,237,242,0.15)',
  },
}

export default function SlideStack({ config, isAnimated }: { config: SlideConfig; isPrint?: boolean; isAnimated?: boolean }) {
  const anim = isAnimated !== false

  return (
    <>
      <GlowBlob size={700} bottom={-300} right={-200} opacity={0.25} />
      <SlideBase config={config}>
        <Eyebrow text={config.eyebrow || ''} color={config.theme.accentColor} />
        <SlideTitle>{config.title}</SlideTitle>
        <SlideSubtitle>{config.subtitle}</SlideSubtitle>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {config.blocks.map((block, i) => {
            const c = block.content as any
            const tierStyle = tierStyles[c.tier] || tierStyles['tier-2']

            const inner = (
              <div
                style={{
                  border: '1px solid',
                  borderRadius: 8,
                  padding: '28px 36px',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  gap: 28,
                  alignItems: 'center',
                  ...tierStyle,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: 48,
                    color: '#00C2CB',
                    lineHeight: 1,
                    width: 80,
                  }}
                >
                  {c.num}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 16,
                      letterSpacing: '0.25em',
                      color: '#00C2CB',
                      textTransform: 'uppercase',
                      marginBottom: 8,
                    }}
                  >
                    {c.tag}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      fontSize: 28,
                      color: '#FFFFFF',
                      marginBottom: 4,
                    }}
                  >
                    {c.name}
                  </div>
                  <div style={{ fontSize: 18, color: '#E8EDF2', opacity: 0.8 }}>{c.desc}</div>
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 15,
                    letterSpacing: '0.15em',
                    color: 'rgba(232,237,242,0.55)',
                    textTransform: 'uppercase',
                    textAlign: 'right',
                  }}
                >
                  <div>{c.meta1}</div>
                  <div style={{ marginTop: 4, color: '#00C2CB' }}>{c.meta2}</div>
                </div>
              </div>
            )

            return anim ? (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                {inner}
              </motion.div>
            ) : (
              <div key={block.id}>{inner}</div>
            )
          })}
        </div>
      </SlideBase>
    </>
  )
}

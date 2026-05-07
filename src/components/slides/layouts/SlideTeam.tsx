'use client'

import React from 'react'
import { motion } from 'framer-motion'
import type { SlideConfig } from '@/types/slide'
import SlideBase, { Eyebrow, SlideTitle, SlideSubtitle, GlowBlob } from './SlideBase'

function ProfileCard({ block, index, animated }: { block: any; index: number; animated: boolean }) {
  const c = block.content

  const inner = (
    <div
      style={{
        border: '1px solid rgba(0,194,203,0.18)',
        borderRadius: 8,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Photo area */}
      <div
        style={{
          aspectRatio: '16/9',
          background: 'linear-gradient(135deg, rgba(0,194,203,0.15), rgba(7,16,28,0.9))',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Hex pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 51.96'><path d='M30 0 L60 17.32 L60 51.96 L30 69.28 L0 51.96 L0 17.32 Z' fill='none' stroke='%2300C2CB' stroke-width='0.4' opacity='0.25'/></svg>")`,
            backgroundSize: '40px',
            opacity: 0.5,
          }}
        />
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: 96,
            color: '#00C2CB',
            zIndex: 1,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          {c.initials}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '32px 36px' }}>
        <h3
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: 32,
            color: '#FFFFFF',
            margin: '0 0 8px',
          }}
        >
          {c.name}
        </h3>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            letterSpacing: '0.3em',
            color: '#00C2CB',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          {c.role}
        </div>
        <p
          style={{
            fontSize: 14,
            color: '#E8EDF2',
            opacity: 0.8,
            lineHeight: 1.5,
            marginBottom: 20,
            margin: '0 0 20px',
          }}
        >
          {c.bio}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {c.badges.map((badge: string, bi: number) => (
            <span
              key={bi}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.18em',
                color: '#00C2CB',
                textTransform: 'uppercase',
                padding: '5px 10px',
                border: '1px solid rgba(0,194,203,0.18)',
                borderRadius: 4,
              }}
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  )

  if (!animated) return inner
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 + index * 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {inner}
    </motion.div>
  )
}

export default function SlideTeam({ config, isAnimated }: { config: SlideConfig; isPrint?: boolean; isAnimated?: boolean }) {
  const anim = isAnimated !== false

  return (
    <>
      <GlowBlob size={700} bottom={-300} left={-200} opacity={0.2} />
      <SlideBase config={config}>
        <Eyebrow text={config.eyebrow || ''} color={config.theme.accentColor} />
        <SlideTitle>{config.title}</SlideTitle>
        <SlideSubtitle>{config.subtitle}</SlideSubtitle>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, flex: 1 }}>
          {config.blocks.map((block, i) => (
            <ProfileCard key={block.id} block={block} index={i} animated={anim} />
          ))}
        </div>
      </SlideBase>
    </>
  )
}

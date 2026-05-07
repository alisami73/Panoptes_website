'use client'

import React from 'react'
import { motion } from 'framer-motion'
import type { SlideConfig } from '@/types/slide'
import SlideBase, { Eyebrow, SlideTitle, SlideSubtitle } from './SlideBase'

export default function SlideFlywheel({ config, isAnimated }: { config: SlideConfig; isPrint?: boolean; isAnimated?: boolean }) {
  const anim = isAnimated !== false
  const flywheelBlock = config.blocks.find(b => b.type === 'flywheel')
  const pillars = config.blocks.filter(b => b.type === 'pillar')

  return (
    <SlideBase config={config}>
      <Eyebrow text={config.eyebrow || ''} color={config.theme.accentColor} />
      <SlideTitle>{config.title}</SlideTitle>
      <SlideSubtitle>{config.subtitle}</SlideSubtitle>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, flex: 1, alignItems: 'center' }}>
        {/* Flywheel SVG */}
        <motion.div
          initial={anim ? { opacity: 0, scale: 0.9 } : {}}
          animate={anim ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <svg viewBox="0 0 540 540" style={{ width: 480, height: 480 }}>
            <defs>
              <linearGradient id="loop-arc" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#00C2CB" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#00C2CB" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* Background concentric */}
            <circle cx="270" cy="270" r="220" fill="none" stroke="rgba(0,194,203,0.12)" strokeWidth="1" />
            <circle cx="270" cy="270" r="180" fill="none" stroke="rgba(0,194,203,0.08)" strokeWidth="1" strokeDasharray="2 6" />
            <circle cx="270" cy="270" r="140" fill="none" stroke="rgba(0,194,203,0.06)" strokeWidth="1" />

            {/* Arc paths */}
            <g fill="none" stroke="url(#loop-arc)" strokeWidth="3" strokeLinecap="round">
              <path d="M 270 50 A 220 220 0 0 1 490 270" />
              <path d="M 490 270 A 220 220 0 0 1 270 490" />
              <path d="M 270 490 A 220 220 0 0 1 50 270" />
              <path d="M 50 270 A 220 220 0 0 1 270 50" />
            </g>

            {/* Arrowheads */}
            <g fill="#00C2CB">
              <polygon points="490,270 480,260 480,280" />
              <polygon points="270,490 260,480 280,480" />
              <polygon points="50,270 60,260 60,280" />
              <polygon points="270,50 260,60 280,60" />
            </g>

            {/* Nodes */}
            {[
              { cx: 270, cy: 50, num: '01', label: 'PHARMACIES' },
              { cx: 490, cy: 270, num: '02', label: 'DATA' },
              { cx: 270, cy: 490, num: '03', label: 'INTELLIGENCE' },
              { cx: 50, cy: 270, num: '04', label: 'VALUE' },
            ].map((node, i) => (
              <g key={i}>
                <circle cx={node.cx} cy={node.cy} r="32" fill="#0D1B2A" stroke="#00C2CB" strokeWidth="2" />
                <text x={node.cx} y={node.cy - 4} textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="13" letterSpacing="0.18em" fill="#00C2CB">{node.num}</text>
                <text x={node.cx} y={node.cy + 12} textAnchor="middle" fontFamily="'Space Grotesk', sans-serif" fontWeight="600" fontSize="13" fill="#FFFFFF">{node.label}</text>
              </g>
            ))}

            {/* Edge labels */}
            <g fontFamily="'JetBrains Mono', monospace" fontSize="13" letterSpacing="0.18em" fill="rgba(232,237,242,0.55)">
              <text x="412" y="148" textAnchor="middle">→ richer</text>
              <text x="416" y="396" textAnchor="middle">→ smarter</text>
              <text x="124" y="396" textAnchor="middle">→ higher</text>
              <text x="128" y="148" textAnchor="middle">→ more</text>
            </g>

            {/* Center */}
            <circle cx="270" cy="270" r="60" fill="rgba(0,194,203,0.08)" stroke="#00C2CB" strokeWidth="1.5" />
            <circle cx="270" cy="270" r="6" fill="#00C2CB" />
            <text x="270" y="266" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="12" letterSpacing="0.25em" fill="#00C2CB">PANOPTES</text>
            <text x="270" y="283" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="12" letterSpacing="0.18em" fill="rgba(232,237,242,0.55)">FLYWHEEL</text>
          </svg>
        </motion.div>

        {/* Pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {pillars.map((block, i) => {
            const c = block.content as any
            return (
              <motion.div
                key={block.id}
                initial={anim ? { opacity: 0, x: 20 } : {}}
                animate={anim ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  borderLeft: '2px solid #00C2CB',
                  padding: '4px 0 4px 20px',
                }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 16,
                    letterSpacing: '0.25em',
                    color: '#00C2CB',
                    marginBottom: 6,
                  }}
                >
                  {c.num}
                </div>
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: 24,
                    color: '#FFFFFF',
                    marginBottom: 4,
                  }}
                >
                  {c.name}
                </div>
                <div style={{ fontSize: 18, color: '#E8EDF2', opacity: 0.75, lineHeight: 1.4 }}>{c.desc}</div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </SlideBase>
  )
}

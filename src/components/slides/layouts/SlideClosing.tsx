'use client'

import React from 'react'
import { motion } from 'framer-motion'
import type { SlideConfig } from '@/types/slide'

export default function SlideClosing({ config, isAnimated }: { config: SlideConfig; isPrint?: boolean; isAnimated?: boolean }) {
  const anim = isAnimated !== false
  const wordsBlock = config.blocks.find(b => b.id === 'closing-words')
  const tagBlock = config.blocks.find(b => b.id === 'closing-tag')

  return (
    <>
      {/* Full-screen glow */}
      <div
        style={{
          position: 'absolute',
          width: 1000,
          height: 1000,
          borderRadius: '50%',
          filter: 'blur(80px)',
          opacity: 0.18,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, #00C2CB 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: 96,
          boxSizing: 'border-box',
        }}
      >
        <motion.p
          initial={anim ? { opacity: 0, y: 40 } : {}}
          animate={anim ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: 120,
            lineHeight: 1.15,
            letterSpacing: '-0.04em',
            color: '#FFFFFF',
            margin: 0,
          }}
        >
          Always <span style={{ color: '#00C2CB' }}>Watching</span>.<br />
          Always <span style={{ color: '#00C2CB' }}>Learning</span>.<br />
          Always <span style={{ color: '#00C2CB' }}>Protecting</span> health.
        </motion.p>

        <motion.div
          initial={anim ? { opacity: 0 } : {}}
          animate={anim ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 18,
            letterSpacing: '0.4em',
            color: 'rgba(232,237,242,0.55)',
            textTransform: 'uppercase',
            marginTop: 64,
          }}
        >
          {(tagBlock?.content as any)?.value || 'PANOPTES · REAL-TIME HEALTH INTELLIGENCE · 2026'}
        </motion.div>
      </div>
    </>
  )
}

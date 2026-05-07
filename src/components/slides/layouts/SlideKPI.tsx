'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import type { SlideConfig } from '@/types/slide'
import SlideBase, { Eyebrow, SlideTitle, SlideSubtitle, GlowBlob } from './SlideBase'

function useCountUp(target: number, duration = 1500, started: boolean) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!started) return
    const isNumeric = !isNaN(target)
    if (!isNumeric) return

    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, started])

  return count
}

function KPICell({ block, index, animated }: { block: any; index: number; animated: boolean }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const c = block.content
  const rawValue = String(c.value)
  const numericVal = parseInt(rawValue.replace(/[^0-9]/g, ''), 10) || 0
  const isNumeric = !isNaN(numericVal) && numericVal > 0 && c.value !== 'Multi'
  // Capture any non-numeric suffix trailing the first run of digits (e.g. "3M+" → "M+")
  const inlineSuffix = isNumeric ? rawValue.replace(/^[^0-9]*\d+/, '') : ''
  const displayCount = useCountUp(numericVal, 1500, animated && isInView)

  const displayValue = animated && isNumeric ? String(displayCount) + inlineSuffix : rawValue

  return (
    <motion.div
      ref={ref}
      initial={animated ? { opacity: 0, y: 20 } : {}}
      animate={animated ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      style={{
        padding: '56px 48px',
        borderRight: index % 2 === 0 ? '1px solid rgba(0,194,203,0.18)' : 'none',
        borderBottom: index < 2 ? '1px solid rgba(0,194,203,0.18)' : 'none',
        background: 'linear-gradient(180deg, rgba(0,194,203,0.04), transparent)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 32,
          right: 32,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 16,
          letterSpacing: '0.25em',
          color: '#00C2CB',
        }}
      >
        0{index + 1}
      </div>

      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: 110,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          color: '#FFFFFF',
        }}
      >
        {c.prefix && (
          <span style={{ fontSize: '0.5em', color: '#00C2CB', fontWeight: 500, verticalAlign: '0.4em' }}>
            {c.prefix}
          </span>
        )}
        {displayValue}
        {c.suffix && (
          <span style={{ fontSize: '0.5em', color: '#00C2CB', fontWeight: 500, verticalAlign: '0.4em' }}>
            {c.suffix}
          </span>
        )}
      </div>

      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 18,
          letterSpacing: '0.25em',
          color: 'rgba(232,237,242,0.55)',
          marginTop: 16,
          textTransform: 'uppercase',
        }}
      >
        {c.label}
      </div>

      {/* Mini chart/decoration */}
      {c.tags && (
        <div style={{ display: 'flex', gap: 8, marginTop: 32 }}>
          {c.tags.map((tag: string, ti: number) => (
            <div
              key={ti}
              style={{
                border: '1px solid rgba(0,194,203,0.18)',
                borderRadius: 4,
                padding: '4px 10px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                color: '#00C2CB',
                letterSpacing: '0.18em',
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default function SlideKPI({ config, isAnimated }: { config: SlideConfig; isPrint?: boolean; isAnimated?: boolean }) {
  const anim = isAnimated !== false

  return (
    <>
      <GlowBlob size={800} top={-300} left="50%" opacity={0.2} />
      <SlideBase config={config}>
        <Eyebrow text={config.eyebrow || ''} color={config.theme.accentColor} />
        <SlideTitle>{config.title}</SlideTitle>
        <SlideSubtitle>{config.subtitle}</SlideSubtitle>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            border: '1px solid rgba(0,194,203,0.18)',
            borderRadius: 8,
            overflow: 'hidden',
            flex: 1,
            marginTop: 16,
          }}
        >
          {config.blocks.map((block, i) => (
            <KPICell key={block.id} block={block} index={i} animated={anim} />
          ))}
        </div>
      </SlideBase>
    </>
  )
}

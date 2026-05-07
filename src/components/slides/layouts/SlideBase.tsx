'use client'

import React from 'react'
import type { SlideConfig } from '@/types/slide'

interface SlideBaseProps {
  config: SlideConfig
  children: React.ReactNode
  justifyContent?: string
}

export default function SlideBase({ config, children, justifyContent = 'flex-start' }: SlideBaseProps) {
  return (
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
        justifyContent,
        color: config.theme.textColor,
      }}
    >
      {children}
    </div>
  )
}

export function Eyebrow({ text, color = '#00C2CB' }: { text: string; color?: string }) {
  return (
    <p
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 18,
        letterSpacing: '0.3em',
        color,
        textTransform: 'uppercase',
        margin: '0 0 24px',
      }}
    >
      {text}
    </p>
  )
}

export function SlideTitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h1
      style={{
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        fontWeight: 600,
        fontSize: 82,
        lineHeight: 1.05,
        letterSpacing: '-0.02em',
        color: '#FFFFFF',
        margin: '0 0 24px',
        maxWidth: 1400,
        whiteSpace: 'pre-line',
        ...style,
      }}
    >
      {children}
    </h1>
  )
}

export function SlideSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "'Inter', sans-serif",
        fontWeight: 400,
        fontSize: 34,
        lineHeight: 1.4,
        color: '#E8EDF2',
        margin: '0 0 48px',
        maxWidth: 1200,
        opacity: 0.85,
      }}
    >
      {children}
    </h2>
  )
}

export function GlowBlob({ size, top, left, right, bottom, opacity = 0.45, warm = false }: {
  size: number
  top?: number | string
  left?: number | string
  right?: number | string
  bottom?: number | string
  opacity?: number
  warm?: boolean
}) {
  return (
    <div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        filter: 'blur(80px)',
        opacity,
        pointerEvents: 'none',
        zIndex: 0,
        top,
        left,
        right,
        bottom,
        background: warm
          ? 'radial-gradient(circle, #ff9456 0%, transparent 70%)'
          : 'radial-gradient(circle, #00C2CB 0%, transparent 70%)',
      }}
    />
  )
}

export function SlideFooter({ left, right }: { left?: string; right?: string }) {
  return (
    <div
      style={{
        marginTop: 'auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 16,
        letterSpacing: '0.2em',
        color: 'rgba(232,237,242,0.32)',
        textTransform: 'uppercase',
      }}
    >
      <div>{left}</div>
      <div style={{ color: 'rgba(232,237,242,0.55)' }}>{right}</div>
    </div>
  )
}

export function ChartFrame({ title, subtitle, children }: {
  title?: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        background: 'linear-gradient(180deg, rgba(0,194,203,0.04), rgba(7,16,28,0.6))',
        border: '1px solid rgba(0,194,203,0.18)',
        borderRadius: 8,
        padding: 32,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
      }}
    >
      {(title || subtitle) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 15,
            letterSpacing: '0.25em',
            color: 'rgba(232,237,242,0.55)',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          <span>{title}</span>
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
      {children}
    </div>
  )
}

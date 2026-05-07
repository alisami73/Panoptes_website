'use client'

import React, { useState, useEffect } from 'react'
import type { SlideConfig } from '@/types/slide'

interface EntityProps {
  t: number; i: number; id: string; label: string; sub: string
  status: string; x: number; y: number; w: number; h: number
  signal: string; delay: string
}

const Radar = ({ t, cx, cy }: { t: number; cx: number; cy: number }) => {
  const sweep = (t * 25) % 360
  return (
    <g>
      <circle cx={cx} cy={cy} r="380" fill="url(#v1-radar-glow)" />
      {[120, 200, 280, 360].map((r, i) => (
        <circle key={r} cx={cx} cy={cy} r={r} fill="none"
          stroke={`rgba(100,170,230,${0.18 - i * 0.03})`} strokeWidth="1"
          strokeDasharray={i % 2 ? '2 6' : '0'} />
      ))}
      <g stroke="rgba(100,170,230,0.18)" strokeWidth="0.8">
        <line x1={cx - 380} y1={cy} x2={cx + 380} y2={cy} strokeDasharray="3 8" />
        <line x1={cx} y1={cy - 380} x2={cx} y2={cy + 380} strokeDasharray="3 8" />
      </g>
      <g transform={`rotate(${sweep} ${cx} ${cy})`} opacity="0.55">
        <path d={`M ${cx} ${cy} L ${cx + 360} ${cy} A 360 360 0 0 0 ${cx + Math.cos(-Math.PI / 4) * 360} ${cy + Math.sin(-Math.PI / 4) * 360} Z`}
          fill="url(#v1-sweep)" />
      </g>
      {[
        { a: 0.4, r: 250, off: 0 },
        { a: 2.1, r: 180, off: 1 },
        { a: 4.5, r: 310, off: 2 },
      ].map((b, i) => {
        const phase = ((t + b.off * 1.7) % 6) / 6
        const op = phase < 0.15 ? phase / 0.15 : Math.max(0, 1 - (phase - 0.15) / 0.85)
        const px = cx + Math.cos(b.a) * b.r
        const py = cy + Math.sin(b.a) * b.r
        return (
          <g key={i} opacity={op}>
            <circle cx={px} cy={py} r="20" fill="url(#v1-alert)" />
            <circle cx={px} cy={py} r="3" fill="#ff5060" />
          </g>
        )
      })}
      <g fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
        <circle cx={cx} cy={cy} r="6" fill="#86c5ff" filter="url(#v1-glow)" />
        <circle cx={cx} cy={cy} r="14" fill="none" stroke="rgba(134,197,255,0.4)" strokeWidth="1" />
        <text x={cx} y={cy + 50} fill="rgba(180,210,240,0.85)" fontSize="13" letterSpacing="0.3em">OUTBREAK RADAR</text>
        <text x={cx} y={cy + 70} fill="rgba(255,90,100,0.7)" fontSize="10" letterSpacing="0.25em">DETECTION · LATE</text>
        <text x={cx} y={cy - 40} fill="rgba(150,200,240,0.5)" fontSize="9" letterSpacing="0.2em">T+13.4d AVG LATENCY</text>
      </g>
    </g>
  )
}

const HeatZone = ({ t, cx, cy, delay }: { t: number; cx: number; cy: number; delay: string }) => {
  const phase = ((t * 0.4) % 4) / 4
  const scale = 0.6 + phase * 0.8
  const op = phase < 0.2 ? phase / 0.2 : Math.max(0.3, 1 - (phase - 0.2) / 0.8)
  return (
    <g opacity={op}>
      <circle cx={cx} cy={cy} r={70 * scale} fill="url(#v1-alert)" />
      <circle cx={cx} cy={cy} r="3" fill="#ff5060" />
      <text x={cx} y={cy + 95} textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9" letterSpacing="0.2em"
        fill="rgba(255,140,150,0.75)">{delay}</text>
    </g>
  )
}

const BrokenPipeline = ({ t, x1, y1, x2, y2 }: { t: number; x1: number; y1: number; x2: number; y2: number }) => {
  const dx = x2 - x1, dy = y2 - y1
  const gapStart = 0.42, gapEnd = 0.58
  const ax = x1 + dx * gapStart, ay = y1 + dy * gapStart
  const bx = x1 + dx * gapEnd, by = y1 + dy * gapEnd
  const partPhase = (t * 0.18) % 1
  const px = x1 + dx * (partPhase * gapStart)
  const py = y1 + dy * (partPhase * gapStart)
  const partOp = partPhase < 0.85 ? 1 : Math.max(0, 1 - (partPhase - 0.85) / 0.15)
  return (
    <g>
      <line x1={x1} y1={y1} x2={ax} y2={ay} stroke="rgba(120,180,230,0.28)" strokeWidth="1" strokeDasharray="2 5" />
      <line x1={bx} y1={by} x2={x2} y2={y2} stroke="rgba(120,180,230,0.28)" strokeWidth="1" strokeDasharray="2 5" />
      <g transform={`translate(${(ax + bx) / 2} ${(ay + by) / 2})`} opacity="0.55">
        <circle r="6" fill="rgba(10,15,30,0.9)" stroke="rgba(255,90,100,0.6)" strokeWidth="1" />
        <line x1="-2.5" y1="-2.5" x2="2.5" y2="2.5" stroke="rgba(255,120,130,0.85)" strokeWidth="1.2" />
        <line x1="-2.5" y1="2.5" x2="2.5" y2="-2.5" stroke="rgba(255,120,130,0.85)" strokeWidth="1.2" />
      </g>
      <circle cx={px} cy={py} r="2" fill="#86c5ff" opacity={partOp * 0.8} filter="url(#v1-glow)" />
    </g>
  )
}

const EntityCard = ({ t, i, label, sub, status, x, y, w, h, signal, delay }: EntityProps) => {
  const dx = Math.sin(t * 0.4 + i) * 4
  const dy = Math.cos(t * 0.3 + i * 1.3) * 3
  const bars = Array.from({ length: 12 }, (_, k) => {
    return 0.3 + 0.7 * Math.abs(Math.sin(k * 0.7 + i + t * 0.3))
  })
  const statusColors: Record<string, string> = {
    isolated: '#ff8090', siloed: '#ffb070', lagging: '#ff8090',
    asynchronous: '#ffb070', disconnected: '#ff5060', unlinked: '#ffb070',
  }
  const statusColor = statusColors[status] || '#ff8090'
  return (
    <g transform={`translate(${x + dx} ${y + dy})`}>
      <rect x="0" y="0" width={w} height={h} rx="10" fill="rgba(8,14,32,0.72)"
        stroke="rgba(120,180,230,0.18)" strokeWidth="1" />
      <rect x="0" y="0" width={w} height={h} rx="10" fill="url(#v1-glass)" />
      <rect x="0" y="0" width={w} height="22" rx="10" fill="rgba(120,180,230,0.05)" />
      <rect x="0" y="14" width={w} height="8" fill="rgba(120,180,230,0.05)" />
      <circle cx="12" cy="11" r="3" fill={statusColor} opacity="0.85">
        <animate attributeName="opacity" values="0.4;0.95;0.4" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <text x="22" y="14" fontFamily="'JetBrains Mono', monospace" fontSize="8" letterSpacing="0.25em"
        fill="rgba(180,210,240,0.7)">{status.toUpperCase()}</text>
      <text x={w - 8} y="14" textAnchor="end" fontFamily="'JetBrains Mono', monospace" fontSize="8"
        letterSpacing="0.18em" fill="rgba(255,140,150,0.75)">+{delay}</text>
      <text x="14" y="42" fontFamily="'Inter', sans-serif" fontSize="13" fontWeight="600"
        letterSpacing="0.08em" fill="rgba(220,235,250,0.95)">{label}</text>
      <text x="14" y="56" fontFamily="'JetBrains Mono', monospace" fontSize="9"
        letterSpacing="0.15em" fill="rgba(150,200,240,0.55)">{sub}</text>
      <g transform={`translate(14 ${h - 38})`}>
        {bars.map((v, k) => (
          <rect key={k} x={k * 10} y={20 - v * 18} width="6" height={v * 18}
            fill={`rgba(120,180,230,${0.3 + v * 0.4})`} />
        ))}
      </g>
      <text x="14" y={h - 46} fontFamily="'JetBrains Mono', monospace" fontSize="9"
        letterSpacing="0.1em" fill="rgba(180,220,255,0.7)">SIGNAL · {signal}</text>
      <g transform={`translate(${w - 30} 38)`} opacity="0.7">
        <circle r="9" fill="none" stroke="rgba(255,120,130,0.5)" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="-4" y1="-4" x2="4" y2="4" stroke="rgba(255,120,130,0.7)" strokeWidth="1.2" />
      </g>
    </g>
  )
}

const Timeline = ({ t }: { t: number }) => {
  const x0 = 200, y0 = 920, w = 1520
  const ticks = 14
  const events = [
    { day: 1, label: 'antibiotic ↑', detected: false },
    { day: 3, label: 'cough OTC ↑', detected: false },
    { day: 5, label: 'PCR positivity', detected: false },
    { day: 7, label: 'oseltamivir ↑', detected: false },
    { day: 11, label: 'ER visits ↑', detected: false },
    { day: 13, label: '⚠ DETECTED', detected: true },
  ]
  return (
    <g opacity="0.78">
      <line x1={x0} y1={y0} x2={x0 + w} y2={y0} stroke="rgba(120,180,230,0.25)" strokeWidth="1" />
      {Array.from({ length: ticks + 1 }, (_, i) => (
        <g key={i}>
          <line x1={x0 + (i * w) / ticks} y1={y0 - 4} x2={x0 + (i * w) / ticks} y2={y0 + 4}
            stroke="rgba(120,180,230,0.25)" strokeWidth="1" />
          <text x={x0 + (i * w) / ticks} y={y0 + 18} textAnchor="middle"
            fontFamily="'JetBrains Mono', monospace" fontSize="9" letterSpacing="0.1em"
            fill="rgba(150,200,240,0.4)">D{i}</text>
        </g>
      ))}
      {events.map((e, i) => {
        const px = x0 + (e.day * w) / ticks
        return (
          <g key={i}>
            <line x1={px} y1={y0} x2={px} y2={y0 - 30}
              stroke={e.detected ? 'rgba(255,90,100,0.7)' : 'rgba(120,180,230,0.35)'}
              strokeWidth="1" strokeDasharray="2 3" />
            <circle cx={px} cy={y0 - 30} r="3" fill={e.detected ? '#ff5060' : 'rgba(134,197,255,0.7)'} />
            <text x={px} y={y0 - 40} textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="9"
              letterSpacing="0.1em" fill={e.detected ? 'rgba(255,140,150,0.85)' : 'rgba(180,220,255,0.6)'}>{e.label}</text>
          </g>
        )
      })}
      <rect x={x0 + w / ticks} y={y0 - 60} width={(12 * w) / ticks} height="58"
        fill="rgba(255,90,100,0.06)" stroke="rgba(255,90,100,0.18)" strokeWidth="0.5" strokeDasharray="3 3" />
      <text x={x0 + (7 * w) / ticks} y={y0 + 38} textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="10" letterSpacing="0.3em"
        fill="rgba(255,140,150,0.8)">— BLIND SPOT · 12 DAYS LOST —</text>
    </g>
  )
}

export default function SlideVisualFragmented({ isPrint, isAnimated }: { config: SlideConfig; isPrint?: boolean; isAnimated?: boolean }) {
  const [t, setT] = useState(0)

  useEffect(() => {
    if (isPrint || isAnimated === false) return
    let raf: number
    const start = performance.now()
    const loop = (now: number) => {
      setT((now - start) / 1000)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [isPrint, isAnimated])

  const entities = [
    { id: 'pharma', label: 'PHARMACIES', sub: '14,238 nodes', status: 'isolated', x: 220, y: 240, w: 200, h: 110, signal: 'antibiotic sales ↑ 34%', delay: '8d' },
    { id: 'hosp', label: 'HOSPITALS', sub: 'EHR cluster', status: 'siloed', x: 1500, y: 220, w: 210, h: 110, signal: 'ICU admits irregular', delay: '11d' },
    { id: 'lab', label: 'LABORATORIES', sub: 'PCR pipeline', status: 'lagging', x: 180, y: 720, w: 210, h: 110, signal: 'positivity 18%', delay: '6d' },
    { id: 'min', label: 'MINISTRY OF HEALTH', sub: 'reporting', status: 'asynchronous', x: 1530, y: 720, w: 210, h: 110, signal: 'weekly bulletin', delay: '14d' },
    { id: 'ins', label: 'INSURANCE', sub: 'claims stream', status: 'disconnected', x: 100, y: 480, w: 190, h: 100, signal: 'reimburse codes J01', delay: '21d' },
    { id: 'rx', label: 'PRESCRIPTION SOFTWARE', sub: 'e-Rx · 9.4k', status: 'unlinked', x: 1620, y: 480, w: 210, h: 100, signal: 'oseltamivir spike', delay: '5d' },
  ]

  const cx = 960, cy = 480

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
      <svg viewBox="0 0 1920 1080" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="v1-bg" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#0b1530" />
            <stop offset="55%" stopColor="#070b1c" />
            <stop offset="100%" stopColor="#020410" />
          </radialGradient>
          <radialGradient id="v1-radar-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(120,180,220,0.35)" />
            <stop offset="60%" stopColor="rgba(60,110,180,0.08)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <linearGradient id="v1-sweep" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="rgba(120,200,255,0.0)" />
            <stop offset="80%" stopColor="rgba(120,200,255,0.18)" />
            <stop offset="100%" stopColor="rgba(150,220,255,0.45)" />
          </linearGradient>
          <radialGradient id="v1-alert" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,70,80,0.85)" />
            <stop offset="60%" stopColor="rgba(255,70,80,0.15)" />
            <stop offset="100%" stopColor="rgba(255,70,80,0)" />
          </radialGradient>
          <linearGradient id="v1-glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(150,200,255,0.10)" />
            <stop offset="100%" stopColor="rgba(20,40,90,0.04)" />
          </linearGradient>
          <pattern id="v1-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(80,140,220,0.05)" strokeWidth="1" />
          </pattern>
          <filter id="v1-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="v1-glow-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect width="1920" height="1080" fill="url(#v1-bg)" />
        <rect width="1920" height="1080" fill="url(#v1-grid)" />

        <g opacity="0.18" stroke="rgba(80,150,220,0.4)" fill="none" strokeWidth="0.8">
          <ellipse cx="960" cy="540" rx="900" ry="240" />
          <ellipse cx="960" cy="540" rx="700" ry="170" />
          <ellipse cx="960" cy="540" rx="500" ry="110" />
        </g>

        <HeatZone t={t} cx={1750} cy={150} delay="DETECTED · DAY 18" />
        <HeatZone t={t + 1.4} cx={170} cy={920} delay="DETECTED · DAY 22" />
        <HeatZone t={t + 0.7} cx={1750} cy={930} delay="DETECTED · DAY 14" />

        {entities.map((e, i) => (
          <BrokenPipeline key={e.id} t={t + i * 0.4} x1={cx} y1={cy} x2={e.x + e.w / 2} y2={e.y + e.h / 2} />
        ))}

        <Radar t={t} cx={cx} cy={cy} />

        {entities.map((e, i) => (
          <EntityCard key={e.id} t={t} i={i} {...e} />
        ))}

        <Timeline t={t} />

        <g fontFamily="'JetBrains Mono', ui-monospace, monospace" fill="rgba(150,200,240,0.5)" fontSize="11" letterSpacing="0.18em">
          <text x="60" y="60">PANOPTES // EPIDEMIOLOGICAL LATENCY MAP</text>
          <text x="60" y="80" fill="rgba(255,90,100,0.7)">STATE: FRAGMENTED · SIGNALS UNCORRELATED</text>
          <text x="1860" y="60" textAnchor="end">NATIONAL GRID · {Math.floor(t * 2) % 100}.{String(Math.floor(t * 60) % 60).padStart(2, '0')}</text>
          <text x="1860" y="80" textAnchor="end" fill="rgba(255,90,100,0.7)">MEAN DETECTION DELAY: 13.4 DAYS</text>
        </g>

        <g fontFamily="'Space Grotesk', sans-serif">
          <text x="960" y="1000" textAnchor="middle" fill="rgba(220,230,250,0.92)" fontSize="38" letterSpacing="-0.01em">
            Critical signals already exist.
          </text>
          <text x="960" y="1042" textAnchor="middle" fill="rgba(255,90,100,0.85)" fontSize="22" fontStyle="italic" letterSpacing="0.02em">
            Healthcare fails to connect them in time.
          </text>
        </g>
      </svg>
    </div>
  )
}

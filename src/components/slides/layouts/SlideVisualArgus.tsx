'use client'

import React, { useState, useEffect, useMemo } from 'react'
import type { SlideConfig } from '@/types/slide'

interface EyeProps {
  t: number; cx: number; cy: number; size: number; seed: number
  variant?: 'cool' | 'warm'; drift?: boolean; pulse?: boolean
}

const PrimaryEye = ({ cx, cy, t }: { cx: number; cy: number; t: number }) => {
  const blinkPhase = (t * 0.18) % 1
  const blinking = blinkPhase > 0.96
  const lidY = blinking ? Math.sin((blinkPhase - 0.96) / 0.04 * Math.PI) * 16 : 0
  const lookX = Math.sin(t * 0.4) * 3
  const lookY = Math.cos(t * 0.31) * 1.5
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <path d="M -42 0 Q -30 -22 0 -22 Q 30 -22 42 0 Q 30 22 0 22 Q -30 22 -42 0 Z"
        fill="rgba(245,250,255,0.95)" stroke="url(#v3-eye-frame)" strokeWidth="2" />
      <circle cx={lookX} cy={lookY} r="20" fill="url(#v3-iris)" opacity="0.95" />
      <circle cx={lookX} cy={lookY} r="9" fill="#0a1430" />
      <circle cx={lookX - 6} cy={lookY - 6} r="3.5" fill="rgba(255,255,255,0.95)" />
      <circle cx={lookX + 5} cy={lookY + 4} r="1.4" fill="rgba(255,255,255,0.55)" />
      {blinking && (
        <>
          <rect x="-44" y={-22} width="88" height={lidY} fill="rgba(20,40,85,0.95)" />
          <rect x="-44" y={22 - lidY} width="88" height={lidY} fill="rgba(20,40,85,0.95)" />
        </>
      )}
      <circle cx="-42" cy="0" r="3.5" fill="rgba(0,220,255,0.9)" filter="url(#v3-glow)" />
      <circle cx="42" cy="0" r="2.5" fill="rgba(0,220,255,0.7)" />
    </g>
  )
}

const SmallEye = ({ cx, cy, size, t, seed = 0, variant = 'cool', drift = false, pulse = false }: EyeProps) => {
  const dx = drift ? Math.sin(t * 0.4 + seed) * 4 : 0
  const dy = drift ? Math.cos(t * 0.3 + seed * 1.4) * 3 : 0
  const blinkPhase = ((t + seed * 0.7) * (0.1 + (seed % 3) * 0.04)) % 1
  const blinking = blinkPhase > 0.95
  const lidY = blinking ? Math.sin((blinkPhase - 0.95) / 0.05 * Math.PI) * size * 0.7 : 0
  const lookX = Math.sin(t * 0.3 + seed) * (size * 0.12)
  const lookY = Math.cos(t * 0.25 + seed * 0.8) * (size * 0.06)
  const irisFill = variant === 'warm' ? 'url(#v3-iris-warm)' : 'url(#v3-iris)'
  const accent = variant === 'warm' ? 'rgba(255,150,80,0.9)' : 'rgba(0,220,255,0.9)'
  const pulseScale = pulse ? 1 + Math.sin(t * 1.5) * 0.08 : 1
  return (
    <g transform={`translate(${cx + dx} ${cy + dy}) scale(${pulseScale})`}>
      <circle r={size * 1.6} fill="url(#v3-node-glow)" opacity={variant === 'warm' ? 0.4 : 0.55} />
      <path d={`M -${size * 1.5} 0 Q -${size} -${size * 0.78} 0 -${size * 0.78} Q ${size} -${size * 0.78} ${size * 1.5} 0 Q ${size} ${size * 0.78} 0 ${size * 0.78} Q -${size} ${size * 0.78} -${size * 1.5} 0 Z`}
        fill="rgba(240,250,255,0.92)" stroke={accent} strokeWidth={Math.max(0.8, size * 0.08)} />
      <circle cx={lookX} cy={lookY} r={size * 0.7} fill={irisFill} />
      <circle cx={lookX} cy={lookY} r={size * 0.32} fill="#0a1430" />
      <circle cx={lookX - size * 0.22} cy={lookY - size * 0.22} r={size * 0.12} fill="rgba(255,255,255,0.95)" />
      {blinking && (
        <>
          <rect x={-size * 1.5} y={-size * 0.78} width={size * 3} height={lidY} fill="rgba(20,40,85,0.95)" />
          <rect x={-size * 1.5} y={size * 0.78 - lidY} width={size * 3} height={lidY} fill="rgba(20,40,85,0.95)" />
        </>
      )}
      <circle cx={-size * 1.5} cy="0" r={Math.max(1.2, size * 0.16)} fill={accent} filter="url(#v3-glow)" />
    </g>
  )
}

const CircuitLaurel = () => {
  const leaves: { x: number; y: number; rot: number; i: number }[] = []
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI * 0.9 + (i / 8) * Math.PI * 0.8
    const r = 200
    const x = 960 + Math.cos(a) * r
    const y = 430 + Math.sin(a) * r * 0.7
    const rot = (a * 180) / Math.PI + 90
    leaves.push({ x, y, rot, i })
  }
  return (
    <g>
      <path d="M 760 430 Q 960 200 1160 430"
        fill="none" stroke="url(#v3-crown)" strokeWidth="1.6"
        strokeDasharray="3 5" filter="url(#v3-glow)" opacity="0.85" />
      {leaves.map((l) => (
        <g key={l.i} transform={`translate(${l.x} ${l.y}) rotate(${l.rot})`}>
          <path d="M 0 0 Q -6 -22 0 -44 Q 6 -22 0 0 Z"
            fill="rgba(60,150,220,0.25)" stroke="rgba(168,230,255,0.85)" strokeWidth="1" />
          <line x1="0" y1="-2" x2="0" y2="-42" stroke="rgba(168,230,255,0.7)" strokeWidth="0.8" />
          <circle cx="0" cy="-44" r="2.5" fill="rgba(0,220,255,0.95)" filter="url(#v3-glow)" />
          <circle cx="0" cy="-22" r="1.5" fill="rgba(168,230,255,0.85)" />
        </g>
      ))}
    </g>
  )
}

interface BodyNode { cx: number; cy: number; r: number }

const BodyConstellation = ({ t, nodes }: { t: number; nodes: BodyNode[] }) => (
  <g>
    {nodes.map((a, i) =>
      nodes.slice(i + 1).filter(b => Math.hypot(b.cx - a.cx, b.cy - a.cy) < 180).map((b, j) => (
        <line key={`bn-${i}-${j}`} x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy}
          stroke="rgba(0,220,255,0.22)" strokeWidth="0.7" strokeDasharray="2 4" />
      ))
    )}
    {nodes.map((n, i) => {
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.5 + i * 0.6)
      return (
        <g key={i}>
          <circle cx={n.cx} cy={n.cy} r={n.r * 2.2} fill="url(#v3-node-glow)" opacity={0.5 + pulse * 0.4} />
          <circle cx={n.cx} cy={n.cy} r={n.r} fill="#00dcff" filter="url(#v3-glow)" />
          <circle cx={n.cx} cy={n.cy} r={n.r * 0.45} fill="#fff" opacity="0.9" />
        </g>
      )
    })}
  </g>
)

interface EyePos { cx: number; cy: number; size: number; seed: number; layer: string }

const Filaments = ({ t, haloEyes, fieldEyes }: { t: number; haloEyes: EyePos[]; fieldEyes: EyePos[]; bodyNodes: BodyNode[] }) => {
  const anchors = [
    { x: 960, y: 290 }, { x: 880, y: 350 }, { x: 1040, y: 350 },
    { x: 820, y: 470 }, { x: 1100, y: 470 },
    { x: 960, y: 740 }, { x: 880, y: 770 }, { x: 1040, y: 770 },
  ]
  const allEyes = [...haloEyes, ...fieldEyes]
  return (
    <g opacity="0.55">
      {allEyes.map((e, i) => {
        let nearest = anchors[0], best = 1e9
        for (const a of anchors) {
          const d = Math.hypot(a.x - e.cx, a.y - e.cy)
          if (d < best) { best = d; nearest = a }
        }
        const phase = ((t * 0.4 + i * 0.13) % 1)
        const px = e.cx + (nearest.x - e.cx) * phase
        const py = e.cy + (nearest.y - e.cy) * phase
        return (
          <g key={i}>
            <line x1={e.cx} y1={e.cy} x2={nearest.x} y2={nearest.y}
              stroke="rgba(0,220,255,0.18)" strokeWidth="0.5" strokeDasharray="2 6" />
            <circle cx={px} cy={py} r="1.6" fill="#00dcff" opacity={0.85} filter="url(#v3-glow)" />
          </g>
        )
      })}
    </g>
  )
}

const ArgusFigure = ({ t }: { t: number }) => {
  const breath = 1 + Math.sin(t * 0.6) * 0.004
  return (
    <g transform={`translate(960 540) scale(${breath}) translate(-960 -540)`}>
      <ellipse cx="960" cy="700" rx="380" ry="420" fill="rgba(0,150,220,0.06)" filter="url(#v3-glow-strong)" />
      <path d="M 720 1080 L 720 880 Q 740 800 820 760 Q 880 740 960 740 Q 1040 740 1100 760 Q 1180 800 1200 880 L 1200 1080 Z"
        fill="url(#v3-figure)" stroke="rgba(168,230,255,0.35)" strokeWidth="1.2" />
      <g stroke="rgba(168,230,255,0.18)" strokeWidth="0.8" fill="none">
        <path d="M 800 1080 Q 820 950 840 880" />
        <path d="M 880 1080 Q 890 940 900 860" />
        <path d="M 1040 1080 Q 1030 940 1020 860" />
        <path d="M 1120 1080 Q 1100 950 1080 880" />
      </g>
      <path d="M 910 760 L 910 700 Q 910 680 935 675 L 985 675 Q 1010 680 1010 700 L 1010 760 Z"
        fill="url(#v3-figure)" stroke="rgba(168,230,255,0.3)" strokeWidth="1" />
      <path d="M 820 470 Q 820 350 880 290 Q 920 250 960 250 Q 1000 250 1040 290 Q 1100 350 1100 470 Q 1100 560 1080 620 Q 1060 680 1020 700 L 900 700 Q 860 680 840 620 Q 820 560 820 470 Z"
        fill="url(#v3-figure)" stroke="rgba(168,230,255,0.4)" strokeWidth="1.3" />
      <g fill="rgba(15,28,60,0.95)" stroke="rgba(168,230,255,0.3)" strokeWidth="0.9">
        <path d="M 820 380 Q 800 300 850 260 Q 880 235 920 235 Q 940 240 940 270 Q 920 280 900 295 Q 870 310 855 345 Q 840 380 825 410 Z" />
        <path d="M 1100 380 Q 1120 300 1070 260 Q 1040 235 1000 235 Q 980 240 980 270 Q 1000 280 1020 295 Q 1050 310 1065 345 Q 1080 380 1095 410 Z" />
        <path d="M 880 250 Q 920 220 960 220 Q 1000 220 1040 250 Q 1020 240 990 245 Q 960 248 930 245 Q 900 240 880 250 Z" />
      </g>
      <CircuitLaurel />
      <g>
        <path d="M 880 580 Q 880 640 900 680 Q 920 700 960 705 Q 1000 700 1020 680 Q 1040 640 1040 580 Q 1020 600 1000 605 Q 960 612 920 605 Q 900 600 880 580 Z"
          fill="rgba(20,40,85,0.95)" stroke="rgba(168,230,255,0.45)" strokeWidth="1" />
        <g stroke="rgba(168,230,255,0.35)" strokeWidth="0.8" strokeLinecap="round">
          {Array.from({ length: 16 }, (_, i) => {
            const x = 890 + i * 9.5
            const y0 = 595 + Math.sin(i * 0.8) * 4
            const y1 = y0 + 30 + Math.sin(i) * 8
            return <line key={i} x1={x} y1={y0} x2={x} y2={y1} />
          })}
        </g>
        <path d="M 905 555 Q 940 565 960 562 Q 980 565 1015 555 Q 1000 545 960 543 Q 920 545 905 555 Z"
          fill="rgba(15,30,65,0.95)" stroke="rgba(168,230,255,0.3)" strokeWidth="0.7" />
      </g>
      <g fill="none" stroke="rgba(168,230,255,0.35)" strokeWidth="1">
        <path d="M 950 440 Q 945 480 940 520 Q 950 535 970 535 Q 985 530 980 520 Q 975 480 970 440" />
      </g>
      <PrimaryEye cx={895} cy={445} t={t} />
      <PrimaryEye cx={1025} cy={445} t={t} />
      <g stroke="rgba(168,230,255,0.55)" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <path d="M 858 410 Q 895 400 935 412" />
        <path d="M 985 412 Q 1025 400 1062 410" />
      </g>
      <g stroke="rgba(168,230,255,0.18)" strokeWidth="0.7" fill="none">
        <path d="M 855 470 Q 860 510 880 540" />
        <path d="M 1065 470 Q 1060 510 1040 540" />
        <path d="M 875 360 Q 960 350 1045 360" />
      </g>
      <SmallEye cx={960} cy={355} size={14} t={t} seed={0} variant="cool" drift={false} pulse />
      <SmallEye cx={815} cy={510} size={11} t={t} seed={1} variant="cool" drift={false} />
      <SmallEye cx={1105} cy={510} size={11} t={t} seed={2} variant="cool" drift={false} />
    </g>
  )
}

export default function SlideVisualArgus({ isPrint, isAnimated }: { config: SlideConfig; isPrint?: boolean; isAnimated?: boolean }) {
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

  const haloEyes = useMemo<EyePos[]>(() => {
    const arr: EyePos[] = []
    for (let i = 0; i < 11; i++) {
      const a = -Math.PI + (i / 10) * Math.PI
      const r = 230 + (i % 2) * 14
      arr.push({ cx: 960 + Math.cos(a) * r, cy: 380 + Math.sin(a) * r * 0.85, size: 14 + (i % 3) * 4, seed: i, layer: 'crown' })
    }
    return arr
  }, [])

  const fieldEyes = useMemo<EyePos[]>(() => {
    const positions: [number, number, number][] = [
      [180, 220, 22], [320, 140, 18], [1620, 200, 24], [1740, 340, 19],
      [120, 540, 20], [1800, 560, 22], [200, 760, 18], [1700, 800, 24],
      [380, 880, 16], [1540, 940, 18], [80, 360, 14], [1860, 760, 14],
      [420, 250, 12], [1500, 130, 14], [240, 920, 13], [1620, 120, 12],
    ]
    return positions.map(([x, y, s], i) => ({ cx: x, cy: y, size: s, seed: i + 100, layer: 'field' }))
  }, [])

  const bodyNodes = useMemo<BodyNode[]>(() => [
    { cx: 820, cy: 720, r: 8 }, { cx: 1100, cy: 720, r: 8 },
    { cx: 920, cy: 820, r: 7 }, { cx: 1000, cy: 820, r: 7 },
    { cx: 960, cy: 880, r: 9 }, { cx: 880, cy: 900, r: 6 }, { cx: 1040, cy: 900, r: 6 },
    { cx: 880, cy: 770, r: 5 }, { cx: 1040, cy: 770, r: 5 },
    { cx: 940, cy: 660, r: 4 }, { cx: 980, cy: 660, r: 4 },
  ], [])

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
      <svg viewBox="0 0 1920 1080" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="v3-bg" cx="50%" cy="48%" r="70%">
            <stop offset="0%" stopColor="#0d1c3e" />
            <stop offset="45%" stopColor="#070e23" />
            <stop offset="100%" stopColor="#02040d" />
          </radialGradient>
          <radialGradient id="v3-rim" cx="78%" cy="40%" r="55%">
            <stop offset="0%" stopColor="rgba(255,160,80,0.28)" />
            <stop offset="40%" stopColor="rgba(255,120,60,0.08)" />
            <stop offset="100%" stopColor="rgba(255,120,60,0)" />
          </radialGradient>
          <radialGradient id="v3-rim-cool" cx="22%" cy="45%" r="55%">
            <stop offset="0%" stopColor="rgba(0,180,255,0.18)" />
            <stop offset="50%" stopColor="rgba(0,150,220,0.05)" />
            <stop offset="100%" stopColor="rgba(0,150,220,0)" />
          </radialGradient>
          <pattern id="v3-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(80,150,220,0.04)" strokeWidth="1" />
          </pattern>
          <radialGradient id="v3-iris" cx="42%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#a8e6ff" />
            <stop offset="35%" stopColor="#3ec5ff" />
            <stop offset="75%" stopColor="#1b6fc9" />
            <stop offset="100%" stopColor="#0a2754" />
          </radialGradient>
          <radialGradient id="v3-iris-warm" cx="42%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ffe1b8" />
            <stop offset="35%" stopColor="#ffa860" />
            <stop offset="75%" stopColor="#c44820" />
            <stop offset="100%" stopColor="#3a1108" />
          </radialGradient>
          <linearGradient id="v3-eye-frame" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(168,230,255,0.95)" />
            <stop offset="100%" stopColor="rgba(60,150,220,0.5)" />
          </linearGradient>
          <radialGradient id="v3-node-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,220,255,0.85)" />
            <stop offset="60%" stopColor="rgba(0,220,255,0.12)" />
            <stop offset="100%" stopColor="rgba(0,220,255,0)" />
          </radialGradient>
          <linearGradient id="v3-figure" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(20,50,100,0.95)" />
            <stop offset="50%" stopColor="rgba(8,20,55,0.98)" />
            <stop offset="100%" stopColor="rgba(40,28,18,0.95)" />
          </linearGradient>
          <linearGradient id="v3-crown" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(168,230,255,0.95)" />
            <stop offset="60%" stopColor="rgba(60,150,220,0.7)" />
            <stop offset="100%" stopColor="rgba(20,60,120,0.4)" />
          </linearGradient>
          <filter id="v3-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="v3-glow-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect width="1920" height="1080" fill="url(#v3-bg)" />
        <rect width="1920" height="1080" fill="url(#v3-grid)" />
        <rect width="1920" height="1080" fill="url(#v3-rim)" />
        <rect width="1920" height="1080" fill="url(#v3-rim-cool)" />

        <g opacity="0.45">
          {[170, 220, 280, 350, 430, 520, 620].map((r, i) => (
            <circle key={r} cx="960" cy="430" r={r} fill="none"
              stroke={`rgba(100,180,240,${0.28 - i * 0.035})`}
              strokeWidth="0.8" strokeDasharray={i % 2 ? '2 8' : '0'} />
          ))}
        </g>

        <g opacity="0.22" stroke="rgba(80,150,220,0.45)" fill="none" strokeWidth="0.7">
          <path d="M 200 540 Q 960 400 1720 540" />
          <path d="M 200 600 Q 960 460 1720 600" />
          <path d="M 200 660 Q 960 520 1720 660" />
        </g>

        <Filaments t={t} haloEyes={haloEyes} fieldEyes={fieldEyes} bodyNodes={bodyNodes} />
        <ArgusFigure t={t} />
        <BodyConstellation t={t} nodes={bodyNodes} />

        {haloEyes.map((e, i) => (
          <SmallEye key={'crown-' + i} t={t} cx={e.cx} cy={e.cy} size={e.size} seed={e.seed} variant="cool" />
        ))}
        {fieldEyes.map((e, i) => (
          <SmallEye key={'field-' + i} t={t} cx={e.cx} cy={e.cy} size={e.size} seed={e.seed}
            variant={i % 5 === 0 ? 'warm' : 'cool'} drift />
        ))}

        {/* PANOPTES brand wordmark + headline */}
        <g textAnchor="middle">
          <text x="960" y="64" fontFamily="'Space Grotesk', sans-serif" fontWeight="700" fontSize="56"
            letterSpacing="0.12em" fill="rgba(255,255,255,0.97)">PANOPTES</text>
          <text x="960" y="114" fontFamily="'Space Grotesk', sans-serif" fontSize="38" letterSpacing="-0.01em"
            fill="rgba(220,235,250,0.95)">A hundred eyes never close.</text>
          <text x="960" y="148" fontFamily="'Space Grotesk', sans-serif" fontSize="21" fontStyle="italic" letterSpacing="0.02em"
            fill="rgba(0,220,255,0.85)">Argus reborn — every pharmacy a sensor, every signal seen.</text>
        </g>

        {/* Atmospheric side annotations — very low opacity */}
        <g fontFamily="'JetBrains Mono', monospace" fontSize="10" letterSpacing="0.22em" fill="rgba(100,160,220,0.28)">
          <text x="60" y="540">ΑΡΓΟΣ ΠΑΝΟΠΤΗΣ</text>
          <text x="60" y="558">— THE ALL-SEEING ONE —</text>
        </g>

        {/* Bottom tagline */}
        <text x="960" y="1012" textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace" fontSize="22" letterSpacing="0.42em"
          fill="rgba(0,220,255,0.75)">REAL-TIME HEALTH INTELLIGENCE</text>

        {/* Corner markers */}
        <g fontFamily="'JetBrains Mono', monospace" fontSize="9" letterSpacing="0.2em" fill="rgba(100,150,220,0.32)">
          <text x="60" y="1066">BLINK PHARMACIE · PANOPTES</text>
          <text x="1860" y="1066" textAnchor="end">INVESTOR DECK · 2026</text>
        </g>
      </svg>
    </div>
  )
}

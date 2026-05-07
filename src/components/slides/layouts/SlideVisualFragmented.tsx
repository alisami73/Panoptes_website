'use client'

import React from 'react'
import type { SlideConfig } from '@/types/slide'

export default function SlideVisualFragmented({ config }: { config: SlideConfig; isPrint?: boolean; isAnimated?: boolean }) {
  return (
    <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%' }}>
      {/* Visualization: Fragmented Health Data */}
      <svg viewBox="0 0 1920 1080" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="frag-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00C2CB" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00C2CB" stopOpacity="0" />
          </radialGradient>
          <filter id="frag-blur">
            <feGaussianBlur stdDeviation="40" result="blur" />
          </filter>
        </defs>

        {/* Central hub */}
        <circle cx="960" cy="540" r="300" fill="url(#frag-glow)" />
        <circle cx="960" cy="540" r="120" fill="none" stroke="rgba(0,194,203,0.3)" strokeWidth="1" />
        <circle cx="960" cy="540" r="200" fill="none" stroke="rgba(0,194,203,0.15)" strokeWidth="1" strokeDasharray="4 8" />
        <circle cx="960" cy="540" r="280" fill="none" stroke="rgba(0,194,203,0.08)" strokeWidth="1" />

        {/* Center eye */}
        <ellipse cx="960" cy="540" rx="90" ry="50" fill="none" stroke="#00C2CB" strokeWidth="2" transform="rotate(-8 960 540)" />
        <circle cx="960" cy="540" r="30" fill="#00C2CB" opacity="0.6" />
        <circle cx="960" cy="540" r="12" fill="#0D1B2A" />
        <circle cx="950" cy="532" r="5" fill="#fff" opacity="0.8" />

        {/* Fragmented data nodes */}
        {[
          { x: 480, y: 240, label: 'PHARMACY', size: 60 },
          { x: 1440, y: 240, label: 'HOSPITAL', size: 55 },
          { x: 320, y: 540, label: 'LAB', size: 50 },
          { x: 1600, y: 540, label: 'INSURER', size: 52 },
          { x: 480, y: 840, label: 'CLINIC', size: 48 },
          { x: 1440, y: 840, label: 'MINISTRY', size: 58 },
          { x: 960, y: 180, label: 'SENTINEL', size: 45 },
          { x: 960, y: 900, label: 'EMERGENCY', size: 47 },
        ].map(({ x, y, label, size }, i) => (
          <g key={i}>
            {/* Broken connection lines */}
            <line
              x1={x}
              y1={y}
              x2={960}
              y2={540}
              stroke="rgba(255,148,86,0.2)"
              strokeWidth="1"
              strokeDasharray={`${4 + i * 2} ${8 + i}`}
            />
            {/* Node */}
            <circle cx={x} cy={y} r={size} fill="rgba(255,148,86,0.06)" stroke="rgba(255,148,86,0.35)" strokeWidth="1.5" />
            <text
              x={x}
              y={y + 5}
              textAnchor="middle"
              fontFamily="'JetBrains Mono', monospace"
              fontSize="10"
              letterSpacing="0.2em"
              fill="rgba(255,148,86,0.7)"
            >
              {label}
            </text>
            {/* Data fragment indicators */}
            <circle
              cx={x + size * 0.6}
              cy={y - size * 0.6}
              r="8"
              fill="rgba(255,80,96,0.4)"
              stroke="rgba(255,80,96,0.6)"
              strokeWidth="1"
            />
          </g>
        ))}

        {/* Title overlay */}
        <text x="960" y="980" textAnchor="middle" fontFamily="'Space Grotesk', sans-serif" fontWeight="600" fontSize="18" fill="rgba(232,237,242,0.4)" letterSpacing="0.3em" textDecoration="">
          FRAGMENTED · SILOED · DELAYED
        </text>

        {/* Delay badge */}
        <rect x="820" y="472" width="280" height="136" rx="8" fill="rgba(13,27,42,0.9)" stroke="rgba(255,148,86,0.4)" strokeWidth="1" />
        <text x="960" y="520" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="11" fill="rgba(255,148,86,0.7)" letterSpacing="0.2em">MEAN DETECTION DELAY</text>
        <text x="960" y="580" textAnchor="middle" fontFamily="'Space Grotesk', sans-serif" fontWeight="700" fontSize="56" fill="#ff9456">13.4d</text>
      </svg>
    </div>
  )
}

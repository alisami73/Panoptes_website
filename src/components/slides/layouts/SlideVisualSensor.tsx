'use client'

import React from 'react'
import type { SlideConfig } from '@/types/slide'

export default function SlideVisualSensor({ config }: { config: SlideConfig; isPrint?: boolean; isAnimated?: boolean }) {
  const nodes = [
    { x: 240, y: 200, size: 8 }, { x: 480, y: 320, size: 6 }, { x: 720, y: 180, size: 10 },
    { x: 960, y: 300, size: 8 }, { x: 1200, y: 200, size: 7 }, { x: 1440, y: 340, size: 9 },
    { x: 1680, y: 220, size: 6 }, { x: 320, y: 480, size: 7 }, { x: 560, y: 560, size: 11 },
    { x: 800, y: 440, size: 8 }, { x: 1040, y: 520, size: 9 }, { x: 1280, y: 460, size: 7 },
    { x: 1520, y: 540, size: 8 }, { x: 1760, y: 480, size: 6 }, { x: 160, y: 680, size: 9 },
    { x: 400, y: 740, size: 7 }, { x: 640, y: 660, size: 10 }, { x: 880, y: 700, size: 8 },
    { x: 1120, y: 640, size: 9 }, { x: 1360, y: 720, size: 7 }, { x: 1600, y: 680, size: 8 },
    { x: 1840, y: 640, size: 6 }, { x: 280, y: 880, size: 8 }, { x: 520, y: 820, size: 7 },
    { x: 760, y: 900, size: 9 }, { x: 1000, y: 840, size: 8 }, { x: 1240, y: 880, size: 7 },
    { x: 1480, y: 820, size: 9 }, { x: 1720, y: 860, size: 6 },
  ]

  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [7, 8], [8, 9], [9, 10],
    [10, 11], [11, 12], [12, 13], [14, 15], [15, 16], [16, 17], [17, 18], [18, 19],
    [19, 20], [21, 22], [22, 23], [23, 24], [24, 25], [25, 26], [26, 27], [27, 28],
    [0, 7], [7, 14], [14, 21], [1, 8], [8, 15], [15, 22], [2, 9], [9, 16], [16, 23],
    [3, 10], [10, 17], [17, 24], [4, 11], [11, 18], [18, 25], [5, 12], [12, 19], [19, 26],
  ]

  return (
    <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%' }}>
      <svg viewBox="0 0 1920 1080" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="sensor-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00C2CB" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#00C2CB" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background glow */}
        <ellipse cx="960" cy="540" rx="700" ry="500" fill="url(#sensor-glow)" />

        {/* Network edges */}
        <g stroke="rgba(0,194,203,0.15)" strokeWidth="0.8">
          {edges.map(([a, b], i) => (
            <line
              key={i}
              x1={nodes[a]?.x}
              y1={nodes[a]?.y}
              x2={nodes[b]?.x}
              y2={nodes[b]?.y}
            />
          ))}
        </g>

        {/* Signal pulses (concentric circles on active nodes) */}
        {[nodes[8], nodes[10], nodes[17], nodes[24]].map((n, i) => n && (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r={30} fill="none" stroke="rgba(0,194,203,0.12)" strokeWidth="1" />
            <circle cx={n.x} cy={n.y} r={50} fill="none" stroke="rgba(0,194,203,0.07)" strokeWidth="1" strokeDasharray="2 6" />
          </g>
        ))}

        {/* Network nodes */}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r={n.size + 8} fill="rgba(0,194,203,0.06)" />
            <circle cx={n.x} cy={n.y} r={n.size} fill={i % 5 === 0 ? '#00C2CB' : 'rgba(0,194,203,0.5)'} />
          </g>
        ))}

        {/* Central hub */}
        <circle cx="960" cy="540" r="80" fill="rgba(0,194,203,0.08)" stroke="rgba(0,194,203,0.4)" strokeWidth="1.5" />
        <circle cx="960" cy="540" r="48" fill="rgba(0,194,203,0.12)" stroke="rgba(0,194,203,0.6)" strokeWidth="1.5" />
        <circle cx="960" cy="540" r="16" fill="#00C2CB" />

        {/* Labels */}
        <text x="960" y="620" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="11" letterSpacing="0.3em" fill="rgba(0,194,203,0.7)">PANOPTES NETWORK</text>
        <text x="960" y="640" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="10" letterSpacing="0.2em" fill="rgba(232,237,242,0.35)">14,238 PHARMACIES LIVE</text>

        {/* KPI callouts */}
        <rect x="100" y="460" width="220" height="80" rx="6" fill="rgba(13,27,42,0.85)" stroke="rgba(0,194,203,0.25)" strokeWidth="1" />
        <text x="210" y="492" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="10" letterSpacing="0.2em" fill="rgba(232,237,242,0.55)">INGEST RATE</text>
        <text x="210" y="524" textAnchor="middle" fontFamily="'Space Grotesk', sans-serif" fontWeight="700" fontSize="28" fill="#FFFFFF">3.4M<tspan fontSize="14" fill="#00C2CB">/day</tspan></text>

        <rect x="1600" y="460" width="220" height="80" rx="6" fill="rgba(13,27,42,0.85)" stroke="rgba(0,194,203,0.25)" strokeWidth="1" />
        <text x="1710" y="492" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="10" letterSpacing="0.2em" fill="rgba(232,237,242,0.55)">DETECTION LEAD</text>
        <text x="1710" y="524" textAnchor="middle" fontFamily="'Space Grotesk', sans-serif" fontWeight="700" fontSize="28" fill="#FFFFFF">−9<tspan fontSize="14" fill="#00C2CB">d</tspan></text>
      </svg>
    </div>
  )
}

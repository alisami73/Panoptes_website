'use client'

import React from 'react'
import type { SlideConfig } from '@/types/slide'
import SlideCover from './layouts/SlideCover'
import SlideProblem from './layouts/SlideProblem'
import SlideVisualFragmented from './layouts/SlideVisualFragmented'
import SlideSolution from './layouts/SlideSolution'
import SlideFlow from './layouts/SlideFlow'
import SlideVisualSensor from './layouts/SlideVisualSensor'
import SlideChartFull from './layouts/SlideChartFull'
import SlidePipeline from './layouts/SlidePipeline'
import SlideStatsChart from './layouts/SlideStatsChart'
import SlideStack from './layouts/SlideStack'
import SlideKPI from './layouts/SlideKPI'
import SlideFlywheel from './layouts/SlideFlywheel'
import SlideTwoCharts from './layouts/SlideTwoCharts'
import SlideInvestment from './layouts/SlideInvestment'
import SlideTeam from './layouts/SlideTeam'
import SlideClosing from './layouts/SlideClosing'

interface SlideRendererProps {
  slideConfig: SlideConfig
  scale?: number
  isPrint?: boolean
  isAnimated?: boolean
}

const layoutMap: Record<string, React.ComponentType<{ config: SlideConfig; isPrint?: boolean; isAnimated?: boolean }>> = {
  cover: SlideCover,
  problem: SlideProblem,
  'visual-fragmented': SlideVisualFragmented,
  solution: SlideSolution,
  flow: SlideFlow,
  'visual-sensor': SlideVisualSensor,
  'chart-full': SlideChartFull,
  pipeline: SlidePipeline,
  'stats-chart': SlideStatsChart,
  stack: SlideStack,
  kpi: SlideKPI,
  flywheel: SlideFlywheel,
  'two-charts': SlideTwoCharts,
  investment: SlideInvestment,
  team: SlideTeam,
  closing: SlideClosing,
}

export default function SlideRenderer({
  slideConfig,
  scale = 1,
  isPrint = false,
  isAnimated = true,
}: SlideRendererProps) {
  const Layout = layoutMap[slideConfig.layout]

  if (!Layout) {
    return (
      <div
        style={{ background: slideConfig.theme.background }}
        className="w-full h-full flex items-center justify-center"
      >
        <p className="text-white font-mono text-sm opacity-50">
          Layout &quot;{slideConfig.layout}&quot; not found
        </p>
      </div>
    )
  }

  const content = (
    <div
      style={{
        width: '1920px',
        height: '1080px',
        position: 'relative',
        background: slideConfig.theme.background,
        overflow: 'hidden',
        transformOrigin: 'top left',
        transform: scale !== 1 ? `scale(${scale})` : undefined,
      }}
    >
      {/* Hex background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(180deg, rgba(13,27,42,0.92) 0%, rgba(7,16,28,1) 100%),
            url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 86.6'><path d='M50 0 L100 28.87 L100 86.6 L50 115.47 L0 86.6 L0 28.87 Z M50 5.77 L5 31.74 L5 83.73 L50 109.7 L95 83.73 L95 31.74 Z' fill='none' stroke='%2300C2CB' stroke-width='0.4' opacity='0.18'/></svg>")
          `,
          backgroundSize: 'cover, 60px 51.96px',
          zIndex: 0,
        }}
      />

      {/* Slide chrome */}
      <div
        className="absolute flex justify-between items-center"
        style={{
          top: 48,
          left: 64,
          right: 64,
          zIndex: 5,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'rgba(232,237,242,0.55)',
        }}
      >
        <div style={{ color: slideConfig.theme.accentColor }}>
          PANOPTES {slideConfig.label ? `// ${slideConfig.label.replace(/^\d+ /, '').toUpperCase()}` : ''}
        </div>
        <div style={{ color: 'rgba(232,237,242,0.32)' }}>
          {String(slideConfig.slideIndex).padStart(2, '0')} / 17
        </div>
      </div>

      {/* Slide content */}
      <Layout config={slideConfig} isPrint={isPrint} isAnimated={isAnimated && !isPrint} />
    </div>
  )

  if (scale === 1) return content

  return (
    <div
      style={{
        width: Math.round(1920 * scale),
        height: Math.round(1080 * scale),
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {content}
    </div>
  )
}

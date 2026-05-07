'use client'

import React from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Filler } from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import type { SlideConfig } from '@/types/slide'
import SlideBase, { Eyebrow, SlideTitle, SlideSubtitle, ChartFrame } from './SlideBase'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Filler)

const mkLineData = (content: any) => ({
  labels: content.labels,
  datasets: content.datasets.map((d: any) => ({
    label: d.label,
    data: d.data,
    borderColor: d.color || '#00C2CB',
    backgroundColor: d.fill ? `${(d.color || '#00C2CB')}40` : 'transparent',
    fill: d.fill || false,
    borderWidth: 3,
    pointRadius: 4,
    pointBackgroundColor: d.color || '#00C2CB',
    tension: 0.4,
  })),
})

const mkBarData = (content: any) => ({
  labels: content.labels,
  datasets: content.datasets.map((d: any) => ({
    label: d.label,
    data: d.data,
    backgroundColor: d.color || '#00C2CB',
    borderRadius: 2,
  })),
})

const baseOptions = (content: any): any => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: {
      display: content.showLegend ?? false,
      labels: {
        color: 'rgba(232,237,242,0.6)',
        font: { family: "'JetBrains Mono', monospace", size: 10 },
        boxWidth: 12,
        padding: 16,
      },
    },
    tooltip: {
      backgroundColor: '#0D1B2A',
      borderColor: 'rgba(0,194,203,0.3)',
      borderWidth: 1,
      titleColor: '#00C2CB',
      bodyColor: '#E8EDF2',
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(232,237,242,0.06)', display: content.showGrid ?? true },
      ticks: { color: 'rgba(232,237,242,0.4)', font: { family: "'JetBrains Mono', monospace", size: 12 }, maxRotation: 0 },
      border: { color: 'transparent' },
    },
    y: {
      min: content.yMin,
      max: content.yMax,
      grid: { color: 'rgba(232,237,242,0.06)', display: content.showGrid ?? true },
      ticks: {
        color: 'rgba(232,237,242,0.4)',
        font: { family: "'JetBrains Mono', monospace", size: 12 },
        callback: (v: any) => {
          if (content.yMax && content.yMax <= 100) return `${v}%`
          if (v >= 1000) return `$${(v / 1000).toFixed(0)}M`
          return v
        },
      },
      border: { color: 'transparent' },
    },
  },
})

export default function SlideTwoCharts({ config, isAnimated }: { config: SlideConfig; isPrint?: boolean; isAnimated?: boolean }) {
  const chartBlocks = config.blocks.filter(b => b.type === 'chart')

  return (
    <SlideBase config={config}>
      <Eyebrow text={config.eyebrow || ''} color={config.theme.accentColor} />
      <SlideTitle>{config.title}</SlideTitle>
      <SlideSubtitle>{config.subtitle}</SlideSubtitle>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, flex: 1, minHeight: 0 }}>
        {chartBlocks.map((block) => {
          const c = block.content as any
          return (
            <ChartFrame key={block.id} title={c.chartTitle}>
              <div style={{ flex: 1, minHeight: 260, position: 'relative' }}>
                {c.chartType === 'line' && <Line data={mkLineData(c)} options={baseOptions(c)} />}
                {c.chartType === 'bar' && <Bar data={mkBarData(c)} options={baseOptions(c)} />}
              </div>
            </ChartFrame>
          )
        })}
      </div>

      {config.metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 32 }}>
          {config.metrics.map((m, i) => (
            <div
              key={i}
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
                  color: 'rgba(232,237,242,0.55)',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                {m.label}
              </div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: 42,
                  color: '#FFFFFF',
                  lineHeight: 1,
                }}
              >
                {m.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </SlideBase>
  )
}

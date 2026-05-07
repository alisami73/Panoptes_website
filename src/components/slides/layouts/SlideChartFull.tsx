'use client'

import React from 'react'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import type { SlideConfig } from '@/types/slide'
import SlideBase, { Eyebrow, SlideTitle, SlideSubtitle, ChartFrame, SlideFooter } from './SlideBase'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler)

function buildChartData(content: any) {
  const { chartType, labels, datasets } = content

  if (chartType === 'line') {
    return {
      labels,
      datasets: datasets.map((d: any) => ({
        label: d.label,
        data: d.data,
        borderColor: d.color || '#00C2CB',
        backgroundColor: d.fill ? `${(d.color || '#00C2CB')}40` : 'transparent',
        fill: d.fill || false,
        borderDash: d.dashed ? [6, 4] : [],
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: d.color || '#00C2CB',
        tension: 0.3,
      })),
    }
  }

  if (chartType === 'bar') {
    return {
      labels,
      datasets: datasets.map((d: any, i: number) => ({
        label: d.label,
        data: d.data,
        backgroundColor: d.color || '#00C2CB',
        borderRadius: 2,
        stack: content.stacked ? 'stack' : undefined,
        order: i,
      })),
    }
  }

  return { labels, datasets: [] }
}

const chartOptions = (content: any): any => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: {
      display: content.showLegend ?? true,
      labels: {
        color: 'rgba(232,237,242,0.6)',
        font: { family: "'JetBrains Mono', monospace", size: 11 },
        boxWidth: 12,
        padding: 20,
      },
    },
    tooltip: {
      backgroundColor: '#0D1B2A',
      borderColor: 'rgba(0,194,203,0.3)',
      borderWidth: 1,
      titleColor: '#00C2CB',
      bodyColor: '#E8EDF2',
      titleFont: { family: "'JetBrains Mono', monospace", size: 11 },
      bodyFont: { family: "'Inter', sans-serif", size: 12 },
    },
  },
  scales: {
    x: {
      stacked: content.stacked || false,
      grid: { color: 'rgba(232,237,242,0.06)', display: content.showGrid ?? true },
      ticks: {
        color: 'rgba(232,237,242,0.4)',
        font: { family: "'JetBrains Mono', monospace", size: 10 },
        maxRotation: 0,
      },
      border: { color: 'transparent' },
    },
    y: {
      stacked: content.stacked || false,
      min: content.yMin,
      max: content.yMax,
      grid: { color: 'rgba(232,237,242,0.06)', display: content.showGrid ?? true },
      ticks: {
        color: 'rgba(232,237,242,0.4)',
        font: { family: "'JetBrains Mono', monospace", size: 10 },
        callback: (v: any) => {
          if (content.yMax <= 100) return `${v}%`
          if (v >= 1000) return `$${(v / 1000).toFixed(0)}M`
          return v
        },
      },
      border: { color: 'transparent' },
    },
  },
})

export default function SlideChartFull({ config, isAnimated }: { config: SlideConfig; isPrint?: boolean; isAnimated?: boolean }) {
  const block = config.blocks[0]
  if (!block) return null
  const content = block.content as any

  const chartData = buildChartData(content)

  return (
    <SlideBase config={config}>
      <Eyebrow text={config.eyebrow || ''} color={config.theme.accentColor} />
      <SlideTitle>{config.title}</SlideTitle>
      <SlideSubtitle>{config.subtitle}</SlideSubtitle>

      <ChartFrame title={content.chartTitle} subtitle={content.chartSubtitle}>
        <div style={{ flex: 1, minHeight: 400, position: 'relative' }}>
          {content.chartType === 'line' && (
            <Line data={chartData} options={chartOptions(content)} />
          )}
          {content.chartType === 'bar' && (
            <Bar data={chartData} options={chartOptions(content)} />
          )}
        </div>

        {/* Annotation callouts for revenue slide */}
        {content.annotations && (
          <div style={{ display: 'flex', gap: 24, marginTop: 16, justifyContent: 'flex-end' }}>
            {content.annotations.map((ann: any, i: number) => (
              <div
                key={i}
                style={{
                  border: '1px solid rgba(0,194,203,0.18)',
                  borderRadius: 6,
                  padding: '12px 16px',
                  background: 'rgba(0,194,203,0.06)',
                }}
              >
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.2em', color: '#00C2CB', marginBottom: 4 }}>
                  {ann.label}
                </div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 22, color: '#FFFFFF' }}>
                  {ann.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </ChartFrame>

      {config.footer && <SlideFooter left={config.footer.left} right={config.footer.right} />}
    </SlideBase>
  )
}

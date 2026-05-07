'use client'

import React from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Filler } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import type { SlideConfig } from '@/types/slide'
import SlideBase, { Eyebrow, SlideTitle, SlideSubtitle, ChartFrame } from './SlideBase'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Filler)

export default function SlideStatsChart({ config, isAnimated }: { config: SlideConfig; isPrint?: boolean; isAnimated?: boolean }) {
  const statsBlock = config.blocks.find(b => b.type === 'stats-table')
  const chartBlock = config.blocks.find(b => b.type === 'chart')

  const stats = statsBlock?.content as any
  const chart = chartBlock?.content as any

  const chartData = chart ? {
    labels: chart.labels,
    datasets: [
      {
        label: chart.datasets[0]?.label,
        data: chart.datasets[0]?.data,
        backgroundColor: chart.datasets[0]?.color || 'rgba(0,194,203,0.65)',
        borderRadius: 2,
      },
    ],
  } : null

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: false },
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
        grid: { color: 'rgba(232,237,242,0.06)' },
        ticks: { color: 'rgba(232,237,242,0.4)', font: { family: "'JetBrains Mono', monospace", size: 10 } },
        border: { color: 'transparent' },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(232,237,242,0.06)' },
        ticks: { color: 'rgba(232,237,242,0.4)', font: { family: "'JetBrains Mono', monospace", size: 10 } },
        border: { color: 'transparent' },
      },
    },
  }

  return (
    <SlideBase config={config}>
      <Eyebrow text={config.eyebrow || ''} color={config.theme.accentColor} />
      <SlideTitle>{config.title}</SlideTitle>
      <SlideSubtitle>{config.subtitle}</SlideSubtitle>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 56, flex: 1, alignItems: 'stretch' }}>
        {/* Stats table */}
        <div>
          {stats && (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>
                <thead>
                  <tr>
                    {stats.headers.map((h: string, i: number) => (
                      <th
                        key={i}
                        style={{
                          textAlign: 'left',
                          padding: '14px 16px',
                          borderBottom: '1px solid rgba(0,194,203,0.18)',
                          color: 'rgba(232,237,242,0.55)',
                          fontWeight: 500,
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          fontSize: 10,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.rows.map((row: string[], ri: number) => (
                    <tr key={ri}>
                      {row.map((cell: string, ci: number) => (
                        <td
                          key={ci}
                          style={{
                            padding: '18px 16px',
                            borderBottom: '1px solid rgba(0,194,203,0.08)',
                            color: ci === 0 ? '#FFFFFF' : ci === stats.highlightCol ? '#00C2CB' : '#E8EDF2',
                            fontWeight: ci === 0 || ci === stats.highlightCol ? 600 : 400,
                            fontSize: ci === stats.highlightCol ? 16 : 14,
                          }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {(config as any).validationNote && (
                <div
                  style={{
                    marginTop: 24,
                    padding: '18px 22px',
                    background: 'rgba(0,194,203,0.06)',
                    border: '1px solid rgba(0,194,203,0.18)',
                    borderRadius: 6,
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    gap: 16,
                    alignItems: 'center',
                  }}
                >
                  <svg width={32} height={32} viewBox="0 0 32 32" fill="none" stroke="#00C2CB" strokeWidth="1.5">
                    <circle cx="16" cy="16" r="13" />
                    <path d="M16 9 L16 17 L21 20" strokeLinecap="round" />
                  </svg>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      letterSpacing: '0.15em',
                      color: '#E8EDF2',
                      lineHeight: 1.5,
                    }}
                  >
                    {(config as any).validationNote.split('·').map((part: string, i: number) => (
                      <span key={i}>
                        {i === 0 ? part : <span style={{ color: '#00C2CB' }}>{part}</span>}
                        {i < 1 && '·'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Fingerprint chart */}
        {chart && chartData && (
          <ChartFrame title={chart.chartTitle}>
            <div style={{ flex: 1, minHeight: 240, position: 'relative' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </ChartFrame>
        )}
      </div>
    </SlideBase>
  )
}

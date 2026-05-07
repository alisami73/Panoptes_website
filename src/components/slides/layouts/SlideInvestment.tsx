'use client'

import React from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { motion } from 'framer-motion'
import type { SlideConfig } from '@/types/slide'
import SlideBase, { Eyebrow, SlideTitle, SlideSubtitle, GlowBlob } from './SlideBase'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function SlideInvestment({ config, isAnimated }: { config: SlideConfig; isPrint?: boolean; isAnimated?: boolean }) {
  const anim = isAnimated !== false
  const dealBlock = config.blocks.find(b => b.type === 'deal-terms')
  const chartBlock = config.blocks.find(b => b.type === 'chart')

  const dealTerms = (dealBlock?.content as any)?.terms || []
  const chartContent = chartBlock?.content as any

  const donutData = chartContent ? {
    labels: chartContent.labels,
    datasets: [
      {
        data: chartContent.datasets[0].data,
        backgroundColor: chartContent.datasets[0].colors,
        borderColor: '#0D1B2A',
        borderWidth: 3,
        hoverOffset: 4,
      },
    ],
  } : null

  const donutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0D1B2A',
        borderColor: 'rgba(0,194,203,0.3)',
        borderWidth: 1,
        titleColor: '#00C2CB',
        bodyColor: '#E8EDF2',
        callbacks: {
          label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed}%`,
        },
      },
    },
  }

  return (
    <>
      <GlowBlob size={800} top={-200} right={-300} opacity={0.25} />
      <SlideBase config={config}>
        <Eyebrow text={config.eyebrow || ''} color={config.theme.accentColor} />
        <SlideTitle>{config.title}</SlideTitle>
        <SlideSubtitle>{config.subtitle}</SlideSubtitle>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, flex: 1, alignItems: 'center' }}>
          {/* Deal terms */}
          <motion.ul
            initial={anim ? { opacity: 0, x: -20 } : {}}
            animate={anim ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ listStyle: 'none', padding: 0, margin: 0 }}
          >
            {dealTerms.map((t: any, i: number) => (
              <li
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '200px 1fr',
                  padding: '18px 0',
                  borderBottom: '1px solid rgba(0,194,203,0.08)',
                  alignItems: 'baseline',
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 16,
                    letterSpacing: '0.25em',
                    color: 'rgba(232,237,242,0.55)',
                    textTransform: 'uppercase',
                  }}
                >
                  {t.term}
                </span>
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: 34,
                    color: '#FFFFFF',
                  }}
                >
                  {t.value}
                  {t.unit && (
                    <span style={{ fontSize: '0.5em', color: '#00C2CB', marginLeft: 6 }}>{t.unit}</span>
                  )}
                </span>
              </li>
            ))}
          </motion.ul>

          {/* Donut chart */}
          {donutData && (
            <motion.div
              initial={anim ? { opacity: 0, scale: 0.9 } : {}}
              animate={anim ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <div style={{ position: 'relative', width: 400, height: 400 }}>
                <Doughnut data={donutData} options={donutOptions} />
                {/* Center label */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 15,
                      letterSpacing: '0.3em',
                      color: 'rgba(232,237,242,0.55)',
                      marginBottom: 8,
                    }}
                  >
                    ALLOCATION
                  </div>
                  <div
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      fontSize: 42,
                      color: '#FFFFFF',
                    }}
                  >
                    $500K
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div
                style={{
                  position: 'absolute',
                  right: -20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {[
                  { pct: '60%', label: 'R&D · ENGINEERING', color: '#00C2CB' },
                  { pct: '25%', label: 'GTM · NETWORK', color: 'rgba(0,194,203,0.55)' },
                  { pct: '15%', label: 'OPS · LEGAL', color: 'rgba(232,237,242,0.35)' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 18, color: '#00C2CB', letterSpacing: '0.18em' }}>{item.pct}</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: '#E8EDF2', opacity: 0.7, letterSpacing: '0.12em' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </SlideBase>
    </>
  )
}

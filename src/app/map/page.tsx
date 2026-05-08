'use client'

import { useState } from 'react'
import { REGIONS, DISEASES, SIGNAL_MAP } from '@/data/dashboard-mock'

const REGION_PATHS: Record<string, string> = {
  tta: 'M 80 20 L 200 20 L 220 60 L 190 90 L 150 100 L 80 80 Z',
  ori: 'M 200 20 L 320 30 L 340 80 L 220 90 L 220 60 Z',
  fes: 'M 80 80 L 190 90 L 220 90 L 230 140 L 180 160 L 100 150 L 80 120 Z',
  rsk: 'M 80 120 L 180 160 L 190 200 L 140 220 L 60 210 L 50 160 Z',
  bmk: 'M 180 160 L 230 140 L 260 170 L 240 220 L 200 240 L 180 220 L 190 200 Z',
  cas: 'M 40 210 L 140 220 L 190 200 L 200 240 L 180 280 L 100 290 L 40 260 Z',
  mar: 'M 100 290 L 180 280 L 240 270 L 260 310 L 240 360 L 180 370 L 120 350 L 90 320 Z',
  dra: 'M 200 240 L 260 220 L 300 260 L 280 340 L 240 360 L 260 310 L 240 270 Z',
  sus: 'M 90 320 L 180 370 L 200 420 L 160 450 L 90 440 L 70 390 Z',
  gon: 'M 70 390 L 160 450 L 170 490 L 120 510 L 60 480 L 50 430 Z',
  lse: 'M 50 430 L 120 510 L 130 580 L 80 600 L 30 560 L 20 490 Z',
  doe: 'M 80 600 L 130 580 L 140 660 L 100 700 L 60 680 L 70 630 Z',
}

function getIntensityColor(value: number): string {
  if (value <= 20) return 'rgba(0,194,203,0.15)'
  if (value <= 40) return 'rgba(0,194,203,0.35)'
  if (value <= 60) return 'rgba(0,194,203,0.55)'
  if (value <= 80) return 'rgba(239,159,39,0.7)'
  return 'rgba(226,75,74,0.85)'
}

function getIntensityLabel(value: number): string {
  if (value <= 20) return 'Very Low'
  if (value <= 40) return 'Low'
  if (value <= 60) return 'Moderate'
  if (value <= 80) return 'High'
  return 'Critical'
}

interface TooltipData {
  x: number
  y: number
  region: (typeof REGIONS)[number]
  intensity: number
}

export default function MapPage() {
  const [selectedDisease, setSelectedDisease] = useState('ili')
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)

  const signals = SIGNAL_MAP[selectedDisease] || {}

  const sortedRegions = [...REGIONS]
    .map((region) => ({ ...region, intensity: signals[region.id] || 0 }))
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 3)

  const disease = DISEASES.find((item) => item.id === selectedDisease)

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1
          className="grotesk"
          style={{ fontSize: '20px', fontWeight: 700, color: '#E8EDF2', marginBottom: '4px' }}
        >
          PANOPTES{' '}
          <span style={{ color: 'rgba(232,237,242,0.35)', fontWeight: 400 }}>//</span>{' '}
          <span style={{ color: '#00C2CB' }}>REGIONAL SIGNAL MAP</span>
        </h1>
        <div className="mono" style={{ fontSize: '10px', color: 'rgba(232,237,242,0.4)' }}>
          Morocco — 12 regions · Signal intensity by drug proxy
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        {DISEASES.map((item) => {
          const isActive = item.id === selectedDisease
          return (
            <button
              key={item.id}
              onClick={() => setSelectedDisease(item.id)}
              style={{
                padding: '7px 16px',
                borderRadius: '5px',
                border: isActive ? `1px solid ${item.color}60` : '1px solid rgba(0,194,203,0.15)',
                background: isActive ? `${item.color}18` : 'rgba(0,194,203,0.04)',
                color: isActive ? item.color : 'rgba(232,237,242,0.55)',
                fontSize: '12px',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <span className="mono" style={{ fontSize: '9px', marginRight: '5px', opacity: 0.7 }}>
                {item.code}
              </span>
              {item.name}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <div className="panel" style={{ flex: '1', padding: '24px', position: 'relative', minWidth: 0 }}>
          <svg
            viewBox="0 0 460 760"
            style={{ width: '100%', maxWidth: '420px', display: 'block', margin: '0 auto' }}
          >
            {REGIONS.map((region) => {
              const path = REGION_PATHS[region.id]
              const intensity = signals[region.id] || 0
              const fillColor = getIntensityColor(intensity)
              const isHovered = hoveredRegion === region.id

              return (
                <path
                  key={region.id}
                  d={path}
                  fill={fillColor}
                  stroke={isHovered ? '#00C2CB' : 'rgba(0,194,203,0.3)'}
                  strokeWidth={isHovered ? 1.5 : 0.8}
                  style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                  onMouseEnter={(event) => {
                    setHoveredRegion(region.id)
                    const svgRect = (event.currentTarget.closest('svg') as SVGSVGElement)?.getBoundingClientRect()
                    if (svgRect) {
                      setTooltip({
                        x: event.clientX - svgRect.left,
                        y: event.clientY - svgRect.top,
                        region,
                        intensity,
                      })
                    }
                  }}
                  onMouseMove={(event) => {
                    const svgRect = (event.currentTarget.closest('svg') as SVGSVGElement)?.getBoundingClientRect()
                    if (svgRect) {
                      setTooltip((previous) =>
                        previous
                          ? { ...previous, x: event.clientX - svgRect.left, y: event.clientY - svgRect.top }
                          : previous,
                      )
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredRegion(null)
                    setTooltip(null)
                  }}
                />
              )
            })}
          </svg>

          {tooltip && (
            <div
              style={{
                position: 'absolute',
                left: tooltip.x + 12,
                top: tooltip.y - 10,
                background: 'rgba(13,27,42,0.96)',
                border: '1px solid rgba(0,194,203,0.35)',
                borderRadius: '6px',
                padding: '10px 14px',
                pointerEvents: 'none',
                zIndex: 100,
                minWidth: '180px',
              }}
            >
              <div
                className="grotesk"
                style={{ fontSize: '12px', fontWeight: 600, color: '#E8EDF2', marginBottom: '4px' }}
              >
                {tooltip.region.name}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span className="mono" style={{ fontSize: '9px', color: 'rgba(232,237,242,0.4)' }}>
                    INTENSITY
                  </span>
                  <span
                    className="mono"
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: `${getIntensityColor(tooltip.intensity)
                        .replace('rgba', 'rgb')
                        .split(',')
                        .slice(0, 3)
                        .join(',')},1)`,
                    }}
                  >
                    {tooltip.intensity} — {getIntensityLabel(tooltip.intensity)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span className="mono" style={{ fontSize: '9px', color: 'rgba(232,237,242,0.4)' }}>
                    PHARMACIES
                  </span>
                  <span className="mono" style={{ fontSize: '10px', color: 'rgba(232,237,242,0.7)' }}>
                    {tooltip.region.pharmacies.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ width: '280px', flexShrink: 0 }}>
          <div className="panel" style={{ padding: '16px 18px', marginBottom: '16px' }}>
            <div
              className="mono"
              style={{ fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(232,237,242,0.35)', marginBottom: '12px' }}
            >
              INTENSITY SCALE
            </div>
            {[
              { range: '0 – 20', label: 'Very Low', color: 'rgba(0,194,203,0.35)' },
              { range: '21 – 40', label: 'Low', color: 'rgba(0,194,203,0.55)' },
              { range: '41 – 60', label: 'Moderate', color: 'rgba(0,194,203,0.85)' },
              { range: '61 – 80', label: 'High', color: 'rgba(239,159,39,0.9)' },
              { range: '81 – 100', label: 'Critical', color: '#E24B4A' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '7px',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '12px',
                    background: item.color,
                    borderRadius: '2px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    flexShrink: 0,
                  }}
                />
                <span className="mono" style={{ fontSize: '9px', color: 'rgba(232,237,242,0.5)' }}>
                  {item.range}
                </span>
                <span style={{ fontSize: '11px', color: 'rgba(232,237,242,0.7)', marginLeft: 'auto' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div className="panel" style={{ padding: '16px 18px', marginBottom: '16px' }}>
            <div
              className="mono"
              style={{ fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(232,237,242,0.35)', marginBottom: '12px' }}
            >
              TOP REGIONS — {disease?.code}
            </div>
            {sortedRegions.map((region, index) => (
              <div key={region.id} style={{ marginBottom: '12px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '5px',
                    alignItems: 'flex-end',
                  }}
                >
                  <span style={{ fontSize: '11px', color: '#E8EDF2', fontWeight: 500 }}>
                    {index + 1}. {region.name.length > 22 ? `${region.name.slice(0, 22)}…` : region.name}
                  </span>
                  <span
                    className="mono"
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: getIntensityColor(region.intensity).replace('0.', '').endsWith(')')
                        ? '#EF9F27'
                        : '#00C2CB',
                    }}
                  >
                    {region.intensity}
                  </span>
                </div>
                <div
                  style={{
                    height: '5px',
                    background: 'rgba(0,194,203,0.1)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${region.intensity}%`,
                      background: getIntensityColor(region.intensity),
                      borderRadius: '3px',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {disease && (
            <div className="panel" style={{ padding: '16px 18px' }}>
              <div
                className="mono"
                style={{ fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(232,237,242,0.35)', marginBottom: '12px' }}
              >
                SELECTED SYNDROME
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: disease.color,
                    flexShrink: 0,
                  }}
                />
                <span className="grotesk" style={{ fontSize: '13px', fontWeight: 600, color: '#E8EDF2' }}>
                  {disease.name}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  className="mono"
                  style={{
                    fontSize: '10px',
                    color: disease.color,
                    background: `${disease.color}18`,
                    padding: '2px 8px',
                    borderRadius: '3px',
                    border: `1px solid ${disease.color}30`,
                  }}
                >
                  ICD-10 {disease.code}
                </span>
              </div>

              <div style={{ marginTop: '14px' }}>
                <div
                  className="mono"
                  style={{ fontSize: '9px', color: 'rgba(232,237,242,0.35)', marginBottom: '8px' }}
                >
                  NATIONAL AVG INTENSITY
                </div>
                {(() => {
                  const values = Object.values(signals)
                  const average = values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0

                  return (
                    <>
                      <div
                        className="grotesk"
                        style={{ fontSize: '24px', fontWeight: 700, color: disease.color, marginBottom: '4px' }}
                      >
                        {average}
                      </div>
                      <div
                        style={{
                          height: '5px',
                          background: 'rgba(255,255,255,0.08)',
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${average}%`,
                            background: disease.color,
                            borderRadius: '3px',
                          }}
                        />
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

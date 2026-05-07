'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js'
import {
  DiseaseConfig,
  Level,
  LEVEL_COLORS,
  LEVEL_HOVER_COLORS,
  LEVEL_LABELS,
  Period,
  PERIODS,
  RegionData,
} from '@/data/epi-map-data'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler)

// SVG polygon paths for Morocco's 12 regions (viewBox="0 0 460 760")
const REGION_PATHS: { id: string; points: string; labelX: number; labelY: number; labelShort: string }[] = [
  { id: 'tanger-tetouan', points: '110,42 190,38 245,55 248,82 210,100 155,102 105,85 100,60', labelX: 175, labelY: 70, labelShort: 'Tanger-Tétouan' },
  { id: 'oriental',       points: '260,50 342,44 392,63 394,93 356,113 293,112 252,92 250,66', labelX: 318, labelY: 80, labelShort: 'Oriental' },
  { id: 'fes-meknes',     points: '178,128 298,120 336,142 332,168 296,185 236,186 178,168 170,145', labelX: 252, labelY: 155, labelShort: 'Fès-Meknès' },
  { id: 'rabat-sale',     points: '88,198 175,190 208,212 205,242 174,258 112,258 80,238 78,215', labelX: 145, labelY: 224, labelShort: 'Rabat-Salé' },
  { id: 'beni-mellal',    points: '234,222 330,215 372,238 370,268 326,284 260,282 216,260 218,238', labelX: 295, labelY: 250, labelShort: 'Béni Mellal' },
  { id: 'casablanca-settat', points: '68,282 162,278 195,300 192,330 158,346 96,344 62,326 60,300', labelX: 128, labelY: 312, labelShort: 'Casablanca' },
  { id: 'marrakech-safi', points: '132,352 272,346 322,370 318,405 272,428 196,430 136,415 106,390 118,360', labelX: 218, labelY: 388, labelShort: 'Marrakech-Safi' },
  { id: 'draa-tafilalet', points: '288,360 395,353 442,378 438,418 394,448 322,444 278,424 268,390', labelX: 358, labelY: 402, labelShort: 'Drâa-Tafilalet' },
  { id: 'souss-massa',    points: '100,446 242,440 272,462 268,494 224,512 145,510 92,493 82,466', labelX: 178, labelY: 476, labelShort: 'Souss-Massa' },
  { id: 'guelmim',        points: '86,536 196,530 222,554 218,580 180,596 112,594 76,576 72,548', labelX: 148, labelY: 562, labelShort: 'Guelmim' },
  { id: 'laayoune',       points: '74,616 196,610 222,634 218,664 178,680 106,678 62,658 60,630', labelX: 140, labelY: 646, labelShort: 'Laâyoune' },
  { id: 'dakhla',         points: '62,698 188,692 214,718 210,752 168,772 98,772 52,748 48,715', labelX: 130, labelY: 732, labelShort: 'Dakhla' },
]

interface TooltipState {
  visible: boolean
  x: number
  y: number
  region: RegionData | null
}

interface Props {
  diseases: DiseaseConfig[]
  initialDiseaseId?: string
}

export default function MoroccoEpiMap({ diseases, initialDiseaseId }: Props) {
  const [activeDiseaseId, setActiveDiseaseId] = useState(initialDiseaseId ?? diseases[0]?.id ?? 'grippe')
  const [activePeriod, setActivePeriod] = useState<Period>('today')
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, region: null })
  const mapRef = useRef<HTMLDivElement>(null)

  const activeDisease = diseases.find(d => d.id === activeDiseaseId) ?? diseases[0]
  const regionMap = Object.fromEntries(activeDisease.regions.map(r => [r.regionId, r]))

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGPolygonElement>, regionId: string) => {
    const rect = mapRef.current?.getBoundingClientRect()
    if (!rect) return
    setTooltip({
      visible: true,
      x: e.clientX - rect.left + 12,
      y: e.clientY - rect.top - 10,
      region: regionMap[regionId] ?? null,
    })
  }, [regionMap])

  const handleMouseLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }))
    setHoveredRegion(null)
  }, [])

  const handleExportPNG = async () => {
    if (!mapRef.current) return
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(mapRef.current, { backgroundColor: '#f8f5ef', scale: 2 })
    const link = document.createElement('a')
    link.download = `PANOPTES_epi_${activeDiseaseId}_${activePeriod}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const legendItems: { level: Level; label: string }[] = [
    { level: 5, label: 'Epidemic Alert' },
    { level: 4, label: 'High Incidence' },
    { level: 3, label: 'Rising' },
    { level: 2, label: 'Stable' },
    { level: 1, label: 'Low' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5ef', color: '#1a1a1a', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e8e4dd', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'linear-gradient(135deg, #6C48D6 0%, #00C2CB 100%)', borderRadius: 8, padding: '6px 12px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 14, color: '#fff' }}>
            <span style={{ color: '#a78bfa' }}>blink</span>pharma
          </div>
          <div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 18, color: '#111' }}>PANOPTES — Epidemiological Surveillance</div>
            <div style={{ fontSize: 13, color: '#666' }}>Interactive Map of Morocco · Real-Time Data</div>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <a href="/" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, background: '#f0f0f0', color: '#444', textDecoration: 'none', border: '1px solid #ddd' }}>← Home</a>
          <button onClick={handleExportPNG} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, background: '#0D1B2A', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Export PNG
          </button>
        </div>
      </div>

      {/* Disease selector */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e8e4dd', padding: '12px 32px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {diseases.map(d => (
          <button
            key={d.id}
            onClick={() => { setActiveDiseaseId(d.id); setSelectedRegion(null) }}
            style={{
              padding: '8px 18px',
              borderRadius: 999,
              fontSize: 14,
              fontWeight: activeDiseaseId === d.id ? 600 : 400,
              background: activeDiseaseId === d.id ? '#0D1B2A' : 'transparent',
              color: activeDiseaseId === d.id ? '#fff' : '#444',
              border: `1.5px solid ${activeDiseaseId === d.id ? '#0D1B2A' : '#ccc'}`,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >{d.name}</button>
        ))}
      </div>

      {/* Period selector */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e8e4dd', padding: '10px 32px', display: 'flex', gap: 8 }}>
        {PERIODS.map(p => (
          <button
            key={p.id}
            onClick={() => setActivePeriod(p.id)}
            style={{
              padding: '6px 16px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: activePeriod === p.id ? 600 : 400,
              background: activePeriod === p.id ? '#fff' : 'transparent',
              color: activePeriod === p.id ? '#111' : '#666',
              border: `1.5px solid ${activePeriod === p.id ? '#111' : '#ddd'}`,
              cursor: 'pointer',
            }}
          >{p.label}</button>
        ))}
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 160px)', overflow: 'hidden' }}>
        {/* Map area */}
        <div ref={mapRef} style={{ flex: 1, padding: '24px 32px', overflowY: 'auto', position: 'relative' }}>
          <div style={{ display: 'flex', gap: 24 }}>
            {/* SVG Map */}
            <div style={{ position: 'relative', flex: '0 0 auto' }}>
              <svg
                viewBox="0 0 460 760"
                width={420}
                height={690}
                style={{ display: 'block' }}
              >
                {REGION_PATHS.map(rp => {
                  const rd = regionMap[rp.id]
                  const level = (rd?.level ?? 1) as Level
                  const isHovered = hoveredRegion === rp.id
                  const isSelected = selectedRegion?.regionId === rp.id
                  const fill = isHovered ? LEVEL_HOVER_COLORS[level] : LEVEL_COLORS[level]
                  return (
                    <g key={rp.id}>
                      <polygon
                        points={rp.points}
                        fill={fill}
                        stroke={isSelected ? '#0D1B2A' : '#f8f5ef'}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        style={{ cursor: 'pointer', transition: 'fill 0.15s' }}
                        onMouseEnter={() => setHoveredRegion(rp.id)}
                        onMouseMove={(e) => handleMouseMove(e, rp.id)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => setSelectedRegion(rd ?? null)}
                      />
                      <text
                        x={rp.labelX}
                        y={rp.labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ fontSize: 9, fill: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 600, pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                      >{rp.labelShort}</text>
                    </g>
                  )
                })}
              </svg>

              {/* Tooltip */}
              {tooltip.visible && tooltip.region && (
                <div style={{
                  position: 'absolute',
                  left: tooltip.x,
                  top: tooltip.y,
                  background: '#0D1B2A',
                  color: '#fff',
                  borderRadius: 10,
                  padding: '12px 16px',
                  fontSize: 13,
                  pointerEvents: 'none',
                  zIndex: 100,
                  minWidth: 200,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>{tooltip.region.regionName}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#aaa' }}>Cases</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#00C2CB' }}>{tooltip.region.cases.toLocaleString('en-US')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#aaa' }}>Trend</span>
                    <span style={{ color: tooltip.region.evolutionPct >= 0 ? '#EF9F27' : '#639922' }}>
                      {tooltip.region.evolutionPct >= 0 ? '+' : ''}{tooltip.region.evolutionPct}%
                    </span>
                  </div>
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 12, color: '#aaa' }}>
                    {tooltip.region.forecast}
                  </div>
                </div>
              )}
            </div>

            {/* Right panel: KPIs + Legend + Alerts */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 240 }}>
              {/* KPIs */}
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  { label: 'Alerts', value: activeDisease.stats.alert, color: '#E24B4A' },
                  { label: 'Rising', value: activeDisease.stats.up, color: '#EF9F27' },
                  { label: 'Stable', value: activeDisease.stats.stable, color: '#639922' },
                ].map(kpi => (
                  <div key={kpi.label} style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '16px 12px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#111', fontFamily: 'Space Grotesk, sans-serif' }}>{kpi.value}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{kpi.label}</div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#888', marginBottom: 12 }}>INCIDENCE LEVEL</div>
                {legendItems.map(item => (
                  <div key={item.level} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 14, height: 14, borderRadius: 4, background: LEVEL_COLORS[item.level], flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#444' }}>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Active Alerts */}
              <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#888', marginBottom: 12 }}>ACTIVE ALERTS</div>
                {activeDisease.alerts.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#aaa' }}>No active alerts</div>
                ) : activeDisease.alerts.map((alert, i) => (
                  <div key={i} style={{ borderLeft: `3px solid ${alert.color}`, paddingLeft: 10, marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{alert.type}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{alert.regions}</div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{alert.action}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Region detail panel */}
        {selectedRegion && (
          <RegionDetailPanel region={selectedRegion} onClose={() => setSelectedRegion(null)} />
        )}
      </div>
    </div>
  )
}

function RegionDetailPanel({ region, onClose }: { region: RegionData; onClose: () => void }) {
  const level = region.level as Level
  const color = LEVEL_COLORS[level]
  const label = LEVEL_LABELS[level]

  const chartData = {
    labels: ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'Today'],
    datasets: [{
      data: region.historique,
      borderColor: color,
      backgroundColor: `${color}22`,
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: color,
    }],
  }

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 10 } } },
    },
  }

  return (
    <div style={{
      width: 320,
      background: '#ffffff',
      borderLeft: '1px solid #e8e4dd',
      padding: 24,
      overflowY: 'auto',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111', fontFamily: 'Space Grotesk, sans-serif' }}>{region.regionName}</div>
          <div style={{ display: 'inline-block', marginTop: 6, padding: '3px 10px', borderRadius: 999, background: `${color}22`, color, fontSize: 12, fontWeight: 600 }}>{label}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#999', padding: 4 }}>×</button>
      </div>

      {/* Main metric */}
      <div style={{ background: '#f8f5ef', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: '#111', fontFamily: 'Space Grotesk, sans-serif' }}>
          {region.cases.toLocaleString('en-US')}
        </div>
        <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>reported cases</div>
        <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600, color: region.evolutionPct >= 0 ? '#EF9F27' : '#639922' }}>
          {region.evolutionPct >= 0 ? '↑' : '↓'} {Math.abs(region.evolutionPct)}% vs previous period
        </div>
      </div>

      {/* Sparkline */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#888', marginBottom: 8 }}>7-DAY TREND</div>
        <Line data={chartData} options={chartOptions} height={120} />
      </div>

      {/* Forecast */}
      <div style={{ marginBottom: 12, padding: 12, background: '#f0f7ff', borderRadius: 8, borderLeft: `3px solid #4a90d9` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#4a90d9', marginBottom: 4 }}>FORECAST</div>
        <div style={{ fontSize: 13, color: '#333' }}>{region.forecast}</div>
      </div>

      {/* Action */}
      <div style={{ padding: 12, background: `${color}11`, borderRadius: 8, borderLeft: `3px solid ${color}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 4 }}>RECOMMENDED ACTION</div>
        <div style={{ fontSize: 13, color: '#333' }}>{region.action}</div>
      </div>
    </div>
  )
}

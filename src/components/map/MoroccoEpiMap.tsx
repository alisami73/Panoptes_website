'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import styles from './MoroccoEpiMap.module.css'
import {
  DiseaseConfig,
  LEVEL_LABELS,
  Period,
  PERIODS,
  RegionData,
} from '@/data/epi-map-data'

type RegionLayout = {
  id: string
  shortLabel: string
  points: string
  labelX: number
  labelY: number
  valueX: number
  valueY: number
  pulseX?: number
  pulseY?: number
}

const REGION_LAYOUTS: RegionLayout[] = [
  { id: 'tanger-tetouan', shortLabel: 'TANGER-TETOUAN', points: '260,90 430,90 470,135 440,180 280,180 240,135', labelX: 340, labelY: 129, valueX: 340, valueY: 153, pulseX: 340, pulseY: 135 },
  { id: 'oriental', shortLabel: 'ORIENTAL', points: '500,100 660,90 700,140 680,230 540,230 480,170', labelX: 590, labelY: 160, valueX: 590, valueY: 184 },
  { id: 'fes-meknes', shortLabel: 'FES-MEKNES', points: '320,210 500,210 540,265 500,330 330,330 280,275', labelX: 410, labelY: 270, valueX: 410, valueY: 294 },
  { id: 'rabat-sale', shortLabel: 'RABAT-SALE', points: '180,260 290,250 320,310 290,370 200,370 150,320', labelX: 235, labelY: 309, valueX: 235, valueY: 333, pulseX: 235, pulseY: 315 },
  { id: 'beni-mellal', shortLabel: 'BENI MELLAL', points: '360,360 510,360 540,410 510,470 370,470 330,410', labelX: 435, labelY: 412, valueX: 435, valueY: 436 },
  { id: 'casablanca-settat', shortLabel: 'CASABLANCA', points: '160,400 290,400 320,455 290,520 170,520 120,455', labelX: 220, labelY: 454, valueX: 220, valueY: 478, pulseX: 220, pulseY: 460 },
  { id: 'marrakech-safi', shortLabel: 'MARRAKECH-SAFI', points: '200,540 380,540 420,595 380,660 220,660 170,595', labelX: 295, labelY: 598, valueX: 295, valueY: 622 },
  { id: 'draa-tafilalet', shortLabel: 'DRAA-TAFILALET', points: '450,500 660,490 700,560 670,640 480,640 420,580', labelX: 560, labelY: 568, valueX: 560, valueY: 592 },
  { id: 'souss-massa', shortLabel: 'SOUSS-MASSA', points: '200,690 380,690 420,745 380,810 220,810 170,745', labelX: 295, labelY: 748, valueX: 295, valueY: 772 },
  { id: 'guelmim', shortLabel: 'GUELMIM-OUED NOUN', points: '180,840 360,840 400,890 360,950 200,950 150,890', labelX: 275, labelY: 893, valueX: 275, valueY: 917 },
  { id: 'laayoune', shortLabel: 'LAAYOUNE-SAKIA', points: '160,1000 380,1000 430,1040 400,1080 200,1080 130,1040', labelX: 280, labelY: 1042, valueX: 280, valueY: 1066 },
  { id: 'dakhla', shortLabel: 'DAKHLA-OUED ED-DAHAB', points: '470,1000 660,1000 700,1040 670,1080 500,1080 440,1040', labelX: 570, labelY: 1042, valueX: 570, valueY: 1066 },
]

const CONNECTIONS = [
  [340, 135, 590, 160],
  [410, 270, 590, 160],
  [340, 135, 235, 315],
  [235, 315, 220, 460],
  [410, 270, 435, 412],
  [435, 412, 295, 598],
  [220, 460, 295, 598],
  [295, 598, 560, 568],
  [295, 598, 295, 748],
  [295, 748, 275, 893],
  [275, 893, 280, 1042],
  [280, 1042, 570, 1042],
] as const

const LEGEND_META: Record<number, string> = {
  5: '≥ 200 / 100k',
  4: '120 — 199',
  3: '60 — 119',
  2: '25 — 59',
  1: '< 25',
}

const LEVEL_STYLES: Record<number, { fill: string; stroke: string; pulse: string; valueFill?: string }> = {
  5: { fill: 'rgba(255,80,96,0.26)', stroke: '#ff5060', pulse: '#ff5060' },
  4: { fill: 'rgba(255,148,86,0.25)', stroke: '#ff9456', pulse: '#ff9456' },
  3: { fill: 'rgba(184,115,51,0.28)', stroke: '#b87333', pulse: '#b87333' },
  2: { fill: 'rgba(0,194,203,0.18)', stroke: '#00C2CB', pulse: '#00C2CB' },
  1: { fill: 'rgba(0,194,203,0.10)', stroke: '#00C2CB', pulse: '#00C2CB', valueFill: 'rgba(255,255,255,0.55)' },
}

const LATITUDE_GUIDES = [
  { y: 150, label: '35°N' },
  { y: 300, label: '32°N' },
  { y: 450, label: '29°N' },
  { y: 600, label: '26°N' },
  { y: 750, label: '23°N' },
  { y: 900, label: '21°N' },
]

interface Props {
  diseases: DiseaseConfig[]
  initialDiseaseId?: string
}

function formatSyncSeconds(value: number) {
  return `${value.toFixed(2)}s`
}

function buildIncidenceMap(regions: RegionData[]) {
  const ranges: Record<number, [number, number]> = {
    5: [200, 240],
    4: [120, 199],
    3: [60, 119],
    2: [25, 59],
    1: [9, 24],
  }

  const byLevel = new Map<number, RegionData[]>()
  for (const region of regions) {
    const level = Number(region.level)
    const bucket = byLevel.get(level) || []
    bucket.push(region)
    byLevel.set(level, bucket)
  }

  const result = new Map<string, number>()

  byLevel.forEach((items, level) => {
    const [rangeMin, rangeMax] = ranges[level] || [10, 25]
    const caseMin = Math.min(...items.map(item => item.cases))
    const caseMax = Math.max(...items.map(item => item.cases))

    for (const item of items) {
      const ratio = caseMax === caseMin ? 0.5 : (item.cases - caseMin) / (caseMax - caseMin)
      result.set(item.regionId, Math.round(rangeMin + ratio * (rangeMax - rangeMin)))
    }
  })

  return result
}

export default function MoroccoEpiMap({ diseases, initialDiseaseId }: Props) {
  const pageRef = useRef<HTMLDivElement>(null)
  const [activeDiseaseId, setActiveDiseaseId] = useState(initialDiseaseId ?? diseases[0]?.id ?? 'grippe')
  const [activePeriod, setActivePeriod] = useState<Period>('today')
  const [syncSeconds, setSyncSeconds] = useState(0)
  const [updatedTime, setUpdatedTime] = useState('')

  const activeDisease = useMemo(
    () => diseases.find(disease => disease.id === activeDiseaseId) ?? diseases[0],
    [activeDiseaseId, diseases],
  )

  const regionsById = useMemo(
    () => new Map(activeDisease?.regions.map(region => [region.regionId, region]) ?? []),
    [activeDisease],
  )

  const incidenceByRegion = useMemo(
    () => buildIncidenceMap(activeDisease?.regions ?? []),
    [activeDisease],
  )

  const levelCounts = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    for (const region of activeDisease?.regions ?? []) {
      counts[Number(region.level)] += 1
    }
    return counts
  }, [activeDisease])

  useEffect(() => {
    const start = performance.now()
    const timer = window.setInterval(() => {
      const elapsed = ((performance.now() - start) / 1000) % 60
      setSyncSeconds(elapsed)

      const now = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      }).format(new Date())

      setUpdatedTime(now)
    }, 120)

    return () => window.clearInterval(timer)
  }, [])

  async function handleExportPng() {
    if (!pageRef.current) return
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(pageRef.current, {
      backgroundColor: '#07101c',
      scale: 2,
    })
    const link = document.createElement('a')
    link.download = `panoptes-map-${activeDiseaseId}-${activePeriod}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  if (!activeDisease) return null

  return (
    <div className={styles.page}>
      <div ref={pageRef} className={styles.captureFrame}>
        <div className={styles.syncBar}>
          <div className={styles.syncLeft}>
            <span className={styles.live}><span className={styles.dot} />STATE · LIVE</span>
            <span>14,238 PHARMACIES STREAMING</span>
            <span>SYNC · {formatSyncSeconds(syncSeconds)}</span>
          </div>
          <div className={styles.syncRight}>
            <span>DETECTION LEAD · <span style={{ color: '#00C2CB' }}>−9.1 DAYS</span></span>
            <span>v2026.05.08</span>
          </div>
        </div>

        <div className={styles.pageHeader}>
          <div className={styles.brandMark}>
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <defs>
                <radialGradient id="logo-iris-map" cx="42%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#a8e6ff" />
                  <stop offset="40%" stopColor="#00C2CB" />
                  <stop offset="100%" stopColor="#0a2754" />
                </radialGradient>
              </defs>
              <ellipse cx="16" cy="16" rx="14" ry="8" fill="none" stroke="#00C2CB" strokeWidth="1.5" transform="rotate(-12 16 16)" />
              <circle cx="16" cy="16" r="5" fill="url(#logo-iris-map)" />
              <circle cx="16" cy="16" r="2.2" fill="#0D1B2A" />
              <circle cx="14.5" cy="14.5" r="0.8" fill="#fff" opacity="0.9" />
            </svg>
            <span className={styles.wordmark}>blink<span className={styles.pharma}>pharma</span></span>
          </div>

          <div className={styles.titleBlock}>
            <h1>PANOPTES — Epidemiological Surveillance</h1>
            <div className={styles.subtitle}>
              <span>Interactive map of Morocco</span>
              <span className={styles.sep}>·</span>
              <span>Real-time data</span>
            </div>
          </div>

          <div className={styles.pageActions}>
            <Link href="/" className={styles.btn}>← Home</Link>
            <button type="button" className={styles.btnPrimary} onClick={handleExportPng}>Export PNG</button>
          </div>
        </div>

        <div className={styles.filters}>
          <div className={styles.filterRow}>
            <span className={styles.filterLabel}>Condition</span>
            {diseases.map(disease => (
              <button
                key={disease.id}
                type="button"
                className={`${styles.chip} ${activeDiseaseId === disease.id ? styles.chipActive : ''}`}
                onClick={() => setActiveDiseaseId(disease.id)}
              >
                {disease.name}
              </button>
            ))}
          </div>

          <div className={styles.filterRow}>
            <span className={styles.filterLabel}>Period</span>
            {PERIODS.map(period => (
              <button
                key={period.id}
                type="button"
                className={`${styles.chip} ${activePeriod === period.id ? styles.chipActive : ''}`}
                onClick={() => setActivePeriod(period.id)}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.main}>
          <div className={`${styles.panel} ${styles.mapPanel}`}>
            <div className={styles.mapFrame}>
              <div className={styles.mapOverlay}>12 REGIONS · {activeDisease.name.toUpperCase()}</div>
              <div className={styles.mapOverlayRight}>UPDATED · {updatedTime || 'LIVE FEED'}</div>
              <div className={styles.mapCoords}>31.7917° N · 7.0926° W</div>

              <svg className={styles.mapSvg} viewBox="0 0 800 1100" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Panoptes epidemiological dashboard map">
                <defs>
                  <filter id="map-blur-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="1.2" />
                  </filter>
                </defs>

                <g stroke="rgba(0,194,203,0.05)" strokeWidth="0.5">
                  <line x1="0" y1="150" x2="800" y2="150" />
                  <line x1="0" y1="300" x2="800" y2="300" />
                  <line x1="0" y1="450" x2="800" y2="450" />
                  <line x1="0" y1="600" x2="800" y2="600" />
                  <line x1="0" y1="750" x2="800" y2="750" />
                  <line x1="0" y1="900" x2="800" y2="900" />
                  <line x1="160" y1="0" x2="160" y2="1100" />
                  <line x1="320" y1="0" x2="320" y2="1100" />
                  <line x1="480" y1="0" x2="480" y2="1100" />
                  <line x1="640" y1="0" x2="640" y2="1100" />
                </g>

                <g>
                  {LATITUDE_GUIDES.map(guide => (
                    <text key={guide.label} className={styles.latLabel} x="12" y={guide.y + 4}>{guide.label}</text>
                  ))}
                </g>

                <g stroke="rgba(0,194,203,0.14)" strokeWidth="0.5" strokeDasharray="1 4" fill="none">
                  {CONNECTIONS.map(([x1, y1, x2, y2], index) => (
                    <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} />
                  ))}
                </g>

                {REGION_LAYOUTS.map(regionLayout => {
                  const region = regionsById.get(regionLayout.id)
                  if (!region) return null

                  const level = Number(region.level)
                  const palette = LEVEL_STYLES[level] || LEVEL_STYLES[1]
                  const incidence = incidenceByRegion.get(region.regionId) ?? 0
                  const showPulse = level >= 4 && regionLayout.pulseX && regionLayout.pulseY

                  return (
                    <g key={regionLayout.id} className={styles.region}>
                      <polygon
                        points={regionLayout.points}
                        fill={palette.fill}
                        stroke={palette.stroke}
                        strokeWidth={level >= 4 ? 1.5 : 1.15}
                      />

                      {showPulse && (
                        <>
                          <circle cx={regionLayout.pulseX} cy={regionLayout.pulseY} r="3" fill={palette.pulse} filter="url(#map-blur-glow)">
                            <animate attributeName="r" values="3;15;3" dur="2.2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="1;0;1" dur="2.2s" repeatCount="indefinite" />
                          </circle>
                          <circle cx={regionLayout.pulseX} cy={regionLayout.pulseY} r="3" fill={palette.pulse} />
                        </>
                      )}

                      <text className={styles.regionLabel} x={regionLayout.labelX} y={regionLayout.labelY}>
                        {regionLayout.shortLabel}
                      </text>
                      <text
                        className={styles.regionValue}
                        x={regionLayout.valueX}
                        y={regionLayout.valueY}
                        fill={palette.valueFill || 'rgba(255,255,255,0.85)'}
                      >
                        {incidence} / 100K
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>

          <div className={styles.rightCol}>
            <div className={styles.kpiStrip}>
              <div className={styles.kpiCell}>
                <div className={styles.kpiLabel}>Alerts</div>
                <div className={`${styles.kpiNum} ${styles.kpiAlert}`}>{activeDisease.stats.alert}</div>
                <div className={styles.kpiDelta}>VS D−1 · {activeDisease.stats.alert > 0 ? `↑ +${activeDisease.stats.alert}` : '= 0'}</div>
              </div>
              <div className={styles.kpiCell}>
                <div className={styles.kpiLabel}>Rising</div>
                <div className={`${styles.kpiNum} ${styles.kpiUp}`}>{activeDisease.stats.up}</div>
                <div className={styles.kpiDelta}>VS D−1 · {activeDisease.stats.up > 0 ? `↑ +${activeDisease.stats.up}` : '= 0'}</div>
              </div>
              <div className={styles.kpiCell}>
                <div className={styles.kpiLabel}>Stable</div>
                <div className={`${styles.kpiNum} ${styles.kpiStable}`}>{activeDisease.stats.stable}</div>
                <div className={styles.kpiDelta}>VS D−1 · = {activeDisease.stats.stable}</div>
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <span className={styles.panelTitle}>Incidence level</span>
                <span>SCALE · PER 100K POP.</span>
              </div>

              <div className={styles.legendList}>
                {[5, 4, 3, 2, 1].map(level => (
                  <div key={level} className={styles.legendItem}>
                    <span className={styles.swatch} style={{ background: LEVEL_STYLES[level].stroke, color: LEVEL_STYLES[level].stroke }} />
                    <span className={styles.legendName}>{LEVEL_LABELS[level as keyof typeof LEVEL_LABELS]}</span>
                    <span className={styles.legendMeta}>{LEGEND_META[level]}</span>
                    <span className={styles.legendCount}>{levelCounts[level]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <span className={styles.panelTitle}>Active alerts</span>
                <span>WINDOW · 24H</span>
              </div>

              {activeDisease.alerts.length === 0 ? (
                <div className={styles.alertsEmpty}>
                  <div className={styles.check}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="M5 12 L10 17 L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className={styles.alertsLabel}>No active alerts</div>
                  <div className={styles.alertsSub}>All regions below the epidemic threshold.</div>
                </div>
              ) : (
                <div className={styles.alertsList}>
                  {activeDisease.alerts.map((alert, index) => (
                    <div key={`${alert.type}-${index}`} className={styles.alertItem}>
                      <div>
                        <div className={styles.alertType}>{alert.type}</div>
                        <div className={styles.alertRegions}>{alert.regions}</div>
                        <div className={styles.alertAction}>{alert.action}</div>
                      </div>
                      <span className={styles.alertBadge} style={{ color: alert.color }}>
                        ACTIVE
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.statusBar}>
          <div className={styles.statusNet}>
            <span>NETWORK · 14,238 NODES</span>
            <span>UPTIME · 99.97%</span>
            <span>LATENCY · 3.2s</span>
          </div>
          <div>k=15 anonymized · GDPR + LAW 09-08 compliant</div>
        </div>
      </div>
    </div>
  )
}

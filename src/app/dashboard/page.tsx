'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ACTIVE_ALERTS, SYSTEM_STATS, DISEASES } from '@/data/dashboard-mock'

const SEVERITY_COLORS = {
  critical: '#E24B4A',
  warning: '#EF9F27',
  watch: 'rgba(0,194,203,0.85)',
}

const SEVERITY_BG = {
  critical: 'rgba(226,75,74,0.12)',
  warning: 'rgba(239,159,39,0.12)',
  watch: 'rgba(0,194,203,0.12)',
}

function LiveClock() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'UTC',
        }) + ' UTC'
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="mono" style={{ fontSize: '13px', color: 'rgba(232,237,242,0.6)', letterSpacing: '0.05em' }}>
      {time}
    </span>
  )
}

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub?: string
  accent?: boolean
}) {
  return (
    <div
      className="panel panel-hover"
      style={{ padding: '20px 24px', flex: 1 }}
    >
      <div
        className="mono"
        style={{ fontSize: '10px', letterSpacing: '0.12em', color: 'rgba(232,237,242,0.45)', marginBottom: '10px' }}
      >
        {label}
      </div>
      <div
        className="grotesk"
        style={{
          fontSize: '36px',
          fontWeight: 700,
          color: accent ? '#00C2CB' : '#E8EDF2',
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          className="mono"
          style={{ fontSize: '10px', color: 'rgba(232,237,242,0.4)', marginTop: '6px' }}
        >
          {sub}
        </div>
      )}
    </div>
  )
}

// Inline SVG sparkline — avoids Chart.js SSR issues
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const W = 200
  const H = 48
  const barW = Math.floor(W / data.length) - 2

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {data.map((v, i) => {
        const barH = Math.round(((v - min) / range) * (H - 6)) + 4
        const x = i * (barW + 2)
        const y = H - barH
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={barH}
            fill={color}
            opacity={0.5 + (i / data.length) * 0.5}
            rx="1"
          />
        )
      })}
    </svg>
  )
}

function AlertRow({ alert }: { alert: (typeof ACTIVE_ALERTS)[number] }) {
  const sColor = SEVERITY_COLORS[alert.severity]
  const sBg = SEVERITY_BG[alert.severity]
  const detectedTime = new Date(alert.detectedAt).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })

  return (
    <div
      className="panel panel-hover"
      style={{ padding: '14px 18px', marginBottom: '8px' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        {/* Left content */}
        <div style={{ flex: 1 }}>
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            {/* Severity badge with pulse */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: sBg,
                border: `1px solid ${sColor}40`,
                borderRadius: '4px',
                padding: '2px 8px',
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: sColor,
                  flexShrink: 0,
                }}
                className={alert.severity === 'critical' ? 'pulse-dot' : undefined}
              />
              <span
                className="mono"
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  color: sColor,
                }}
              >
                {alert.severity.toUpperCase()}
              </span>
            </div>

            {/* Disease code + name */}
            <span className="mono" style={{ fontSize: '11px', color: 'rgba(232,237,242,0.5)' }}>
              {alert.diseaseCode}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#E8EDF2' }}>
              {alert.disease}
            </span>

            {/* Region */}
            <span style={{ fontSize: '12px', color: 'rgba(232,237,242,0.55)' }}>
              · {alert.region}
            </span>
          </div>

          {/* Metrics row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <MetricChip label="z" value={`${alert.zscore.toFixed(1)}`} />
            <MetricChip label="confidence" value={`${Math.round(alert.confidence * 100)}%`} />
            <MetricChip label="lead" value={`${alert.lead}d`} />
            <MetricChip label="pharmacies" value={alert.pharmaciesTriggered.toString()} />
            <span className="mono" style={{ fontSize: '10px', color: 'rgba(232,237,242,0.35)' }}>
              {detectedTime} UTC
            </span>
          </div>
        </div>

        {/* View button */}
        <Link
          href={`/scenario/${alert.id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 14px',
            background: 'rgba(0,194,203,0.1)',
            border: '1px solid rgba(0,194,203,0.3)',
            borderRadius: '5px',
            color: '#00C2CB',
            fontSize: '12px',
            fontWeight: 600,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
        >
          View →
        </Link>
      </div>
    </div>
  )
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span className="mono" style={{ fontSize: '10px', color: 'rgba(232,237,242,0.35)' }}>
        {label}=
      </span>
      <span className="mono" style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(232,237,242,0.8)' }}>
        {value}
      </span>
    </div>
  )
}

const PIPELINE_STAGES = [
  { label: 'Data Ingestion', status: 'ok', latency: '1.1ms' },
  { label: 'Signal Extraction', status: 'ok', latency: '0.8ms' },
  { label: 'Anomaly Detection', status: 'ok', latency: '0.9ms' },
  { label: 'Alert Dispatch', status: 'ok', latency: '0.4ms' },
]

export default function DashboardPage() {
  const topDiseases = DISEASES.slice(0, 3)

  // Map disease id to alert trend
  const trendMap: Record<string, number[]> = {
    ili: ACTIVE_ALERTS[0].trend,
    gas: ACTIVE_ALERTS[1].trend,
    rsv: ACTIVE_ALERTS[2].trend,
  }

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh' }}>
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1
            className="grotesk"
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#E8EDF2',
              letterSpacing: '0.04em',
            }}
          >
            PANOPTES{' '}
            <span style={{ color: 'rgba(232,237,242,0.35)', fontWeight: 400 }}>//</span>{' '}
            <span style={{ color: '#00C2CB' }}>COMMAND CENTER</span>
          </h1>
          <div className="mono" style={{ fontSize: '10px', color: 'rgba(232,237,242,0.4)', marginTop: '3px' }}>
            Morocco — Pharmacovigilance Sentinel Network
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <LiveClock />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: 'rgba(59,109,17,0.12)',
              border: '1px solid rgba(59,109,17,0.3)',
              borderRadius: '6px',
            }}
          >
            <div
              style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3B6D11' }}
              className="beacon-pulse"
            />
            <span className="mono" style={{ fontSize: '10px', color: '#3B6D11', letterSpacing: '0.1em' }}>
              BEACON ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Row 1 — KPI Cards */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <KpiCard
          label="PHARMACIES LIVE"
          value={SYSTEM_STATS.pharmaciesLive.toLocaleString()}
          sub="across 12 regions"
          accent
        />
        <KpiCard
          label="TRANSACTIONS TODAY"
          value="3.4M"
          sub="≈ 240/min rolling avg"
        />
        <KpiCard
          label="ACTIVE ALERTS"
          value="5"
          sub="1 critical · 2 warning · 2 watch"
        />
        <KpiCard
          label="DISEASES TRACKED"
          value="240"
          sub="ICD-10 coded syndromes"
        />
      </div>

      {/* Row 2 — Alert Feed + System Status */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        {/* Alert Feed */}
        <div style={{ flex: '2', minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <span
              className="mono"
              style={{ fontSize: '10px', letterSpacing: '0.12em', color: 'rgba(232,237,242,0.45)' }}
            >
              ACTIVE ALERT FEED
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <div
                style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#E24B4A' }}
                className="pulse-dot"
              />
              <span className="mono" style={{ fontSize: '9px', color: 'rgba(232,237,242,0.35)' }}>
                LIVE
              </span>
            </div>
          </div>
          {ACTIVE_ALERTS.map((alert) => (
            <AlertRow key={alert.id} alert={alert} />
          ))}
        </div>

        {/* System Status */}
        <div style={{ flex: '1', minWidth: '240px' }}>
          <div
            className="mono"
            style={{ fontSize: '10px', letterSpacing: '0.12em', color: 'rgba(232,237,242,0.45)', marginBottom: '12px' }}
          >
            SYSTEM STATUS
          </div>
          <div className="panel" style={{ padding: '20px' }}>
            {/* Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <StatusRow label="UPTIME" value={`${SYSTEM_STATS.uptimePercent}%`} color="#3B6D11" />
              <StatusRow label="AVG LATENCY" value={`${SYSTEM_STATS.latencyMs}ms`} color="#00C2CB" />
              <StatusRow
                label="LAST UPDATE"
                value={new Date(SYSTEM_STATS.lastUpdateAt).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  timeZone: 'UTC',
                }) + ' UTC'}
                color="rgba(232,237,242,0.7)"
              />
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid rgba(0,194,203,0.1)', marginBottom: '16px' }} />

            {/* Pipeline stages */}
            <div
              className="mono"
              style={{ fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(232,237,242,0.3)', marginBottom: '10px' }}
            >
              PIPELINE STAGES
            </div>
            {PIPELINE_STAGES.map((stage) => (
              <div
                key={stage.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '1px solid rgba(0,194,203,0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: '#3B6D11',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: 'rgba(232,237,242,0.6)' }}>{stage.label}</span>
                </div>
                <span className="mono" style={{ fontSize: '10px', color: 'rgba(232,237,242,0.4)' }}>
                  {stage.latency}
                </span>
              </div>
            ))}

            {/* Divider */}
            <div style={{ borderTop: '1px solid rgba(0,194,203,0.1)', margin: '16px 0' }} />

            {/* Alert breakdown */}
            <div
              className="mono"
              style={{ fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(232,237,242,0.3)', marginBottom: '10px' }}
            >
              ALERT BREAKDOWN
            </div>
            {[
              { label: 'Critical', count: 1, color: '#E24B4A' },
              { label: 'Warning', count: 2, color: '#EF9F27' },
              { label: 'Watch', count: 2, color: 'rgba(0,194,203,0.8)' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.color }} />
                  <span className="mono" style={{ fontSize: '10px', color: 'rgba(232,237,242,0.5)' }}>
                    {item.label}
                  </span>
                </div>
                <span
                  className="mono"
                  style={{ fontSize: '12px', fontWeight: 600, color: item.color }}
                >
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3 — Signal Sparklines */}
      <div>
        <div
          className="mono"
          style={{ fontSize: '10px', letterSpacing: '0.12em', color: 'rgba(232,237,242,0.45)', marginBottom: '12px' }}
        >
          SIGNAL TRENDS — TOP 3 SYNDROMES (10-WEEK WINDOW)
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {topDiseases.map((disease) => {
            const trendData = trendMap[disease.id] || []
            return (
              <div
                key={disease.id}
                className="panel panel-hover"
                style={{ flex: 1, padding: '16px 20px' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#E8EDF2', marginBottom: '2px' }}>
                      {disease.name}
                    </div>
                    <div className="mono" style={{ fontSize: '9px', color: 'rgba(232,237,242,0.4)' }}>
                      {disease.code}
                    </div>
                  </div>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: disease.color,
                    }}
                  />
                </div>
                <Sparkline data={trendData} color={disease.color} />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                  }}
                >
                  <span className="mono" style={{ fontSize: '9px', color: 'rgba(232,237,242,0.3)' }}>
                    W1
                  </span>
                  <span className="mono" style={{ fontSize: '9px', color: 'rgba(232,237,242,0.3)' }}>
                    W10 (now)
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatusRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span className="mono" style={{ fontSize: '10px', color: 'rgba(232,237,242,0.4)', letterSpacing: '0.08em' }}>
        {label}
      </span>
      <span className="mono" style={{ fontSize: '12px', fontWeight: 600, color }}>
        {value}
      </span>
    </div>
  )
}

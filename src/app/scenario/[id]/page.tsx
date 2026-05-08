'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ACTIVE_ALERTS, getScenarioTimeSeries } from '@/data/dashboard-mock'

// Dynamic import for Chart.js to avoid SSR
const TimeSeriesChart = dynamic(() => import('@/components/dashboard/TimeSeriesChart'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: '240px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(232,237,242,0.3)',
        fontSize: '12px',
        fontFamily: 'JetBrains Mono, monospace',
      }}
    >
      Loading chart…
    </div>
  ),
})

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

function MetricChip({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: string
  sub?: string
  color?: string
}) {
  return (
    <div
      className="panel"
      style={{
        padding: '14px 20px',
        flex: 1,
        minWidth: '120px',
      }}
    >
      <div
        className="mono"
        style={{ fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(232,237,242,0.4)', marginBottom: '8px' }}
      >
        {label}
      </div>
      <div
        className="grotesk"
        style={{ fontSize: '28px', fontWeight: 700, color: color || '#00C2CB', lineHeight: 1 }}
      >
        {value}
      </div>
      {sub && (
        <div className="mono" style={{ fontSize: '9px', color: 'rgba(232,237,242,0.35)', marginTop: '4px' }}>
          {sub}
        </div>
      )}
    </div>
  )
}

// Horizontal bar chart for drug fingerprint
function DrugFingerprint({ drugs }: { drugs: string[] }) {
  // Assign mock weights to drugs
  const weights = [0.52, 0.31, 0.17]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {drugs.map((drug, i) => {
        const weight = weights[i] || Math.random() * 0.3
        const pct = Math.round(weight * 100)
        return (
          <div key={drug}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px',
              }}
            >
              <span style={{ fontSize: '12px', color: '#E8EDF2', fontWeight: 500 }}>{drug}</span>
              <span className="mono" style={{ fontSize: '10px', color: 'rgba(232,237,242,0.5)' }}>
                {pct}%
              </span>
            </div>
            <div
              style={{
                height: '6px',
                background: 'rgba(0,194,203,0.1)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: i === 0 ? '#00C2CB' : i === 1 ? '#EF9F27' : 'rgba(232,237,242,0.4)',
                  borderRadius: '3px',
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function ScenarioPage() {
  const params = useParams()
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : ''

  const alert = ACTIVE_ALERTS.find((a) => a.id === id)

  if (!alert) {
    return (
      <div
        style={{
          padding: '60px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '20px',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(226,75,74,0.12)',
            border: '1px solid rgba(226,75,74,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: '24px', color: '#E24B4A' }}>!</span>
        </div>
        <div className="grotesk" style={{ fontSize: '18px', color: '#E8EDF2', fontWeight: 600 }}>
          Scenario not found
        </div>
        <div className="mono" style={{ fontSize: '11px', color: 'rgba(232,237,242,0.45)' }}>
          Alert ID &ldquo;{id}&rdquo; does not exist in the system
        </div>
        <Link
          href="/dashboard"
          style={{
            padding: '8px 20px',
            background: 'rgba(0,194,203,0.1)',
            border: '1px solid rgba(0,194,203,0.3)',
            borderRadius: '6px',
            color: '#00C2CB',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          ← Return to Dashboard
        </Link>
      </div>
    )
  }

  const ts = getScenarioTimeSeries(alert.id)
  const sColor = SEVERITY_COLORS[alert.severity]
  const sBg = SEVERITY_BG[alert.severity]

  const detectedFormatted = new Date(alert.detectedAt).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })

  // Estimate next peak (lead + current week offset)
  const weeksToAdd = Math.abs(alert.lead) + 1
  const peakDate = new Date('2026-05-07')
  peakDate.setDate(peakDate.getDate() + weeksToAdd * 7)
  const peakStr = peakDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh' }}>
      {/* Back button */}
      <Link
        href="/dashboard"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'rgba(232,237,242,0.5)',
          textDecoration: 'none',
          fontSize: '12px',
          marginBottom: '24px',
          transition: 'color 0.15s',
        }}
      >
        ← Dashboard
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <h1
            className="grotesk"
            style={{ fontSize: '26px', fontWeight: 700, color: '#E8EDF2', letterSpacing: '-0.01em' }}
          >
            {alert.disease}
          </h1>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: sBg,
              border: `1px solid ${sColor}50`,
              borderRadius: '5px',
              padding: '3px 10px',
            }}
          >
            <div
              style={{ width: '6px', height: '6px', borderRadius: '50%', background: sColor, flexShrink: 0 }}
              className={alert.severity === 'critical' ? 'pulse-dot' : undefined}
            />
            <span
              className="mono"
              style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', color: sColor }}
            >
              {alert.severity.toUpperCase()}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: 'rgba(232,237,242,0.6)' }}>{alert.region}</span>
          <span className="mono" style={{ fontSize: '10px', color: 'rgba(232,237,242,0.35)' }}>
            ICD-10 {alert.diseaseCode}
          </span>
          <span className="mono" style={{ fontSize: '10px', color: 'rgba(232,237,242,0.35)' }}>
            Detected: {detectedFormatted} UTC
          </span>
        </div>
      </div>

      {/* Row 1 — Metric chips */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <MetricChip
          label="Z-SCORE"
          value={alert.zscore.toFixed(1)}
          sub="standard deviations above baseline"
          color={sColor}
        />
        <MetricChip
          label="CONFIDENCE"
          value={`${Math.round(alert.confidence * 100)}%`}
          sub="model certainty score"
          color="#00C2CB"
        />
        <MetricChip
          label="DETECTION LEAD"
          value={`${alert.lead}d`}
          sub="days ahead of clinical reports"
          color="#EF9F27"
        />
        <MetricChip
          label="PHARMACIES TRIGGERED"
          value={alert.pharmaciesTriggered.toString()}
          sub={`of ${alert.regionId === 'cas' ? '3,200' : alert.regionId === 'rsk' ? '2,100' : '1,500'} in region`}
          color="rgba(232,237,242,0.85)"
        />
      </div>

      {/* Row 2 — Chart + Drug fingerprint */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        {/* Time series chart */}
        <div className="panel" style={{ flex: '2', padding: '20px', minWidth: 0 }}>
          <div
            className="mono"
            style={{ fontSize: '10px', letterSpacing: '0.12em', color: 'rgba(232,237,242,0.45)', marginBottom: '16px' }}
          >
            SIGNAL TIME SERIES — 12 WEEKS
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '16px', height: '2px', background: '#00C2CB', borderRadius: '1px' }} />
              <span className="mono" style={{ fontSize: '9px', color: 'rgba(232,237,242,0.5)' }}>
                Drug Proxy (Beacon Signal)
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: '16px',
                  height: '2px',
                  background: '#ff9456',
                  borderRadius: '1px',
                  borderTop: '2px dashed #ff9456',
                }}
              />
              <span className="mono" style={{ fontSize: '9px', color: 'rgba(232,237,242,0.5)' }}>
                Confirmed Cases (lagged)
              </span>
            </div>
          </div>
          {ts && (
            <TimeSeriesChart
              weeks={ts.weeks}
              proxy={ts.proxy}
              confirmed={ts.confirmed}
            />
          )}
        </div>

        {/* Drug fingerprint */}
        <div className="panel" style={{ flex: '1', padding: '20px', minWidth: '220px' }}>
          <div
            className="mono"
            style={{ fontSize: '10px', letterSpacing: '0.12em', color: 'rgba(232,237,242,0.45)', marginBottom: '6px' }}
          >
            DRUG BASKET FINGERPRINT
          </div>
          <div
            style={{ fontSize: '11px', color: 'rgba(232,237,242,0.4)', marginBottom: '20px' }}
          >
            Signal contribution by drug class
          </div>
          <DrugFingerprint drugs={alert.drugs} />

          <div
            style={{
              marginTop: '24px',
              padding: '10px 14px',
              background: 'rgba(0,194,203,0.06)',
              border: '1px solid rgba(0,194,203,0.12)',
              borderRadius: '6px',
            }}
          >
            <div
              className="mono"
              style={{ fontSize: '9px', color: 'rgba(232,237,242,0.35)', letterSpacing: '0.08em', marginBottom: '4px' }}
            >
              PROXY DRUGS
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {alert.drugs.map((d) => (
                <span
                  key={d}
                  className="mono"
                  style={{
                    fontSize: '10px',
                    color: '#00C2CB',
                    background: 'rgba(0,194,203,0.1)',
                    padding: '2px 7px',
                    borderRadius: '3px',
                    border: '1px solid rgba(0,194,203,0.2)',
                  }}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3 — Alert message + Peak estimate */}
      <div style={{ display: 'flex', gap: '16px' }}>
        {/* Alert message */}
        <div
          className="panel"
          style={{
            flex: '2',
            padding: '20px 24px',
            borderColor: `${sColor}30`,
            background: `${sBg}`,
          }}
        >
          <div
            style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: `${sColor}20`,
                border: `1px solid ${sColor}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '16px', color: sColor }}>!</span>
            </div>
            <div>
              <div
                className="grotesk"
                style={{ fontSize: '14px', fontWeight: 600, color: '#E8EDF2', marginBottom: '6px' }}
              >
                Regional Alert — {alert.region}
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(232,237,242,0.7)', lineHeight: 1.6 }}>
                The PANOPTES Beacon has detected a statistically significant anomaly in drug
                purchasing patterns across{' '}
                <strong style={{ color: '#E8EDF2' }}>{alert.pharmaciesTriggered} pharmacies</strong> in the{' '}
                <strong style={{ color: '#E8EDF2' }}>{alert.region}</strong> region. The signal is
                consistent with early-stage <strong style={{ color: '#E8EDF2' }}>{alert.disease}</strong> (
                {alert.diseaseCode}), with a z-score of{' '}
                <strong style={{ color: sColor }}>{alert.zscore.toFixed(1)}</strong> and model confidence
                of <strong style={{ color: '#00C2CB' }}>{Math.round(alert.confidence * 100)}%</strong>. This
                signal leads clinical reporting by approximately{' '}
                <strong style={{ color: '#EF9F27' }}>{Math.abs(alert.lead)} days</strong>, providing an
                early-warning window for public health response.
              </p>
            </div>
          </div>
        </div>

        {/* Peak estimate */}
        <div className="panel" style={{ flex: '1', padding: '20px 24px', minWidth: '220px' }}>
          <div
            className="mono"
            style={{ fontSize: '10px', letterSpacing: '0.12em', color: 'rgba(232,237,242,0.45)', marginBottom: '16px' }}
          >
            PEAK PROJECTION
          </div>
          <div
            className="grotesk"
            style={{ fontSize: '22px', fontWeight: 700, color: '#EF9F27', marginBottom: '6px' }}
          >
            {peakStr}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(232,237,242,0.5)', marginBottom: '16px' }}>
            Estimated outbreak peak based on proxy signal trajectory
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="mono" style={{ fontSize: '10px', color: 'rgba(232,237,242,0.4)' }}>
                CONFIDENCE INTERVAL
              </span>
              <span className="mono" style={{ fontSize: '10px', color: 'rgba(232,237,242,0.65)' }}>
                ±3 days
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="mono" style={{ fontSize: '10px', color: 'rgba(232,237,242,0.4)' }}>
                RESPONSE WINDOW
              </span>
              <span className="mono" style={{ fontSize: '10px', color: '#3B6D11', fontWeight: 600 }}>
                {Math.abs(alert.lead)} days remaining
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

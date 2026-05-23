'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { medindex, DashboardData } from '@/lib/medindex-api'

const C = {
  bg: '#0D1B2A',
  panel: 'rgba(255,255,255,0.04)',
  border: 'rgba(0,194,203,0.12)',
  accent: '#00C2CB',
  text: '#E8EDF2',
  muted: 'rgba(232,237,242,0.45)',
  red: '#FF6B6B',
  orange: '#FFB347',
  blue: '#6EA8FE',
  green: '#52D9A0',
}

function StatCard({ label, value, color, sub }: { label: string; value: string | number; color?: string; sub?: string }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: '20px 24px' }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.15em', color: C.muted, marginBottom: 8 }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: color ?? C.text, fontFamily: "'Space Grotesk', sans-serif" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function Band({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ width: 12, height: 12, borderRadius: 3, background: color, flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 13, color: C.text }}>{label}</span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.muted }}>{count}</span>
    </div>
  )
}

export default function MedindexDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    medindex.dashboard()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: C.bg }}>
      {/* Header */}
      <div style={{ padding: '20px 32px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: '#FFF', margin: 0 }}>
          💊 MedIndex
        </h1>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.15em', color: C.accent, margin: '4px 0 0' }}>
          TABLEAU DE BORD · FHIR MEDICATION KNOWLEDGE
        </p>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
        {loading && <div style={{ color: C.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>Chargement…</div>}
        {error && <div style={{ color: C.red, padding: 16, background: 'rgba(255,107,107,0.1)', borderRadius: 8, fontSize: 13 }}>{error}</div>}

        {data && (
          <>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
              <StatCard label="Dosages total" value={data.total_dosages} />
              <StatCard label="Non transformés" value={data.untransformed} color={data.untransformed > 0 ? C.orange : C.green} />
              <StatCard label="File de révision" value={data.pending_review} color={data.pending_review > 0 ? C.orange : C.green} />
              <StatCard label="Coût extraction" value={`$${data.cost_total.toFixed(2)}`} color={C.accent} sub="USD total" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
              {/* Score bands */}
              <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: '20px 24px' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.15em', color: C.muted, marginBottom: 16 }}>
                  BANDES DE QUALITÉ
                </div>
                <Band color={C.green}  label="Excellent  ≥ 90" count={data.score_bands.green  ?? 0} />
                <Band color={C.blue}   label="Bon        80–89" count={data.score_bands.blue   ?? 0} />
                <Band color={C.orange} label="Moyen      60–79" count={data.score_bands.orange ?? 0} />
                <Band color={C.red}    label="Insuffisant < 60" count={data.score_bands.red    ?? 0} />
              </div>

              {/* Validation states */}
              <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: '20px 24px' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.15em', color: C.muted, marginBottom: 16 }}>
                  ÉTATS DE VALIDATION
                </div>
                {Object.entries(data.fhir_by_validation).map(([state, n]) => (
                  <div key={state} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                    <span style={{ color: C.text, textTransform: 'capitalize' }}>{state ?? 'non défini'}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.muted }}>{n}</span>
                  </div>
                ))}
              </div>

              {/* Extraction stats */}
              <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: '20px 24px' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.15em', color: C.muted, marginBottom: 16 }}>
                  EXTRACTION LLM
                </div>
                {Object.entries(data.extraction_stats).map(([state, n]) => (
                  <div key={state} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                    <span style={{ color: state === 'success' ? C.green : state === 'failed' ? C.red : C.orange, textTransform: 'capitalize' }}>{state}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.muted }}>{n}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 10 problems + nav */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: '20px 24px' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.15em', color: C.muted, marginBottom: 16 }}>
                  TOP 10 SCORES LES PLUS BAS
                </div>
                {data.top_problems.map((p) => (
                  <Link key={p.id} href={`/admin/medindex/medicaments/${p.id}`}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.border}`, textDecoration: 'none', cursor: 'pointer' }}>
                    <span style={{ fontSize: 13, color: C.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, marginLeft: 12,
                      color: p.score < 60 ? C.red : p.score < 80 ? C.orange : C.blue }}>
                      {Math.round(p.score)}
                    </span>
                  </Link>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <NavCard href="/admin/medindex/medicaments" icon="💊" title="Médicaments" desc="Liste complète · validation · scores" />
                <NavCard href="/admin/medindex/review-queue" icon="🔍" title="File de révision" desc={`${data.pending_review} item(s) en attente`} highlight={data.pending_review > 0} />
                <NavCard href="/admin/medindex/terminology" icon="🧬" title="Terminologie FR/EN" desc="Révision SNOMED CT · cohérence · validation" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function NavCard({ href, icon, title, desc, highlight }: { href: string; icon: string; title: string; desc: string; highlight?: boolean }) {
  return (
    <Link href={href} style={{
      display: 'block', background: C.panel, borderRadius: 10, padding: '20px 24px',
      border: `1px solid ${highlight ? C.orange : C.border}`,
      textDecoration: 'none',
    }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, color: '#FFF', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: highlight ? C.orange : C.muted }}>{desc}</div>
    </Link>
  )
}

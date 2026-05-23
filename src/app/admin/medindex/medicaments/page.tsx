'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { medindex, MedicamentRow, ListParams } from '@/lib/medindex-api'

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
  yellow: '#FFD166',
}

function scoreBadge(score: number | null) {
  if (score === null) return { bg: 'rgba(255,209,102,0.15)', color: C.yellow, label: '—' }
  if (score >= 90) return { bg: 'rgba(82,217,160,0.15)', color: C.green, label: Math.round(score).toString() }
  if (score >= 80) return { bg: 'rgba(110,168,254,0.15)', color: C.blue, label: Math.round(score).toString() }
  if (score >= 60) return { bg: 'rgba(255,179,71,0.15)', color: C.orange, label: Math.round(score).toString() }
  return { bg: 'rgba(255,107,107,0.15)', color: C.red, label: Math.round(score).toString() }
}

function stateBadge(state: string | null) {
  const map: Record<string, { color: string; bg: string }> = {
    approved: { color: C.green, bg: 'rgba(82,217,160,0.12)' },
    reviewed: { color: C.blue, bg: 'rgba(110,168,254,0.12)' },
    rejected: { color: C.red, bg: 'rgba(255,107,107,0.12)' },
  }
  if (!state) return { color: C.yellow, bg: 'rgba(255,209,102,0.12)', label: 'non transformé' }
  return { ...(map[state] ?? { color: C.muted, bg: C.panel }), label: state }
}

function extractionDot(state: string | null) {
  if (!state) return '○'
  return state === 'success' ? '●' : state === 'failed' ? '✕' : '◐'
}

const INPUT_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, borderRadius: 6,
  color: C.text, padding: '6px 12px', fontSize: 13, fontFamily: "'Inter', sans-serif", outline: 'none',
}

export default function MedicamentListPage() {
  const [rows, setRows] = useState<MedicamentRow[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 50, untransformed_count: 0 })
  const [params, setParams] = useState<ListParams>({ sortBy: 'quality_score_composite', sortDir: 'asc', perPage: 50, page: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback((p: ListParams) => {
    setLoading(true)
    medindex.list(p)
      .then(r => { setRows(r.data); setMeta(r.meta) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load(params) }, [params]) // eslint-disable-line

  const set = (patch: Partial<ListParams>) => setParams(p => ({ ...p, ...patch, page: 1 }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 32px', borderBottom: `1px solid ${C.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/admin/medindex" style={{ color: C.muted, textDecoration: 'none', fontSize: 13 }}>← Dashboard</Link>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: '#FFF', margin: 0, flex: 1 }}>
          Médicaments
        </h1>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.muted }}>{meta.total} entrées</span>
      </div>

      {/* Filters */}
      <div style={{ padding: '12px 32px', borderBottom: `1px solid ${C.border}`, flexShrink: 0, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input
          placeholder="Rechercher un médicament…"
          style={{ ...INPUT_STYLE, width: 260 }}
          onChange={e => set({ search: e.target.value })}
        />
        <select style={INPUT_STYLE} onChange={e => set({ filterBand: e.target.value })}>
          <option value="">Toutes qualités</option>
          <option value="green">Excellent ≥ 90</option>
          <option value="blue">Bon 80–89</option>
          <option value="orange">Moyen 60–79</option>
          <option value="red">Insuffisant &lt; 60</option>
        </select>
        <select style={INPUT_STYLE} onChange={e => set({ filterState: e.target.value })}>
          <option value="">Tous états</option>
          <option value="untransformed">Non transformé</option>
          <option value="approved">Approuvé</option>
          <option value="reviewed">Révisé</option>
          <option value="rejected">Rejeté</option>
        </select>
        <select style={INPUT_STYLE} onChange={e => set({ filterExtraction: e.target.value })}>
          <option value="">Toutes extractions</option>
          <option value="success">Succès</option>
          <option value="pending">En attente</option>
          <option value="failed">Échoué</option>
        </select>
        {meta.untransformed_count > 0 && (
          <div style={{ padding: '6px 12px', background: 'rgba(255,209,102,0.1)', border: '1px solid rgba(255,209,102,0.3)', borderRadius: 6, color: C.yellow, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
            ⚠ {meta.untransformed_count} non transformé(s)
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 32px 24px' }}>
        {error && <div style={{ color: C.red, padding: '12px 0', fontSize: 13 }}>{error}</div>}
        {loading && <div style={{ color: C.muted, padding: '16px 0', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>Chargement…</div>}
        {!loading && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {['Médicament', 'Score global', 'Extraction', 'Terminologie', 'Projection', 'État validation', 'Extraction LLM', ''].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.1em', color: C.muted, fontWeight: 400 }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const sb = scoreBadge(r.quality_score_composite)
                const st = stateBadge(r.validation_state)
                return (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,194,203,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '10px 12px', color: C.text, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.name}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: sb.bg, color: sb.color, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                        {sb.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: C.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                      {r.quality_score_extraction !== null ? Math.round(r.quality_score_extraction) : '—'}
                    </td>
                    <td style={{ padding: '10px 12px', color: C.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                      {r.quality_score_terminology !== null ? Math.round(r.quality_score_terminology) : '—'}
                    </td>
                    <td style={{ padding: '10px 12px', color: C.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                      {r.quality_score_projection !== null ? Math.round(r.quality_score_projection) : '—'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: st.bg, color: st.color, fontSize: 12 }}>
                        {st.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: r.extraction_state === 'success' ? C.green : r.extraction_state === 'failed' ? C.red : C.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>
                      {extractionDot(r.extraction_state)}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <Link href={`/admin/medindex/medicaments/${r.id}`}
                        style={{ color: C.accent, textDecoration: 'none', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                        VOIR →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'center' }}>
            {Array.from({ length: Math.min(meta.last_page, 10) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setParams(prev => ({ ...prev, page: p }))}
                style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${p === meta.current_page ? C.accent : C.border}`,
                  background: p === meta.current_page ? 'rgba(0,194,203,0.12)' : 'transparent',
                  color: p === meta.current_page ? C.accent : C.muted, cursor: 'pointer', fontSize: 13 }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

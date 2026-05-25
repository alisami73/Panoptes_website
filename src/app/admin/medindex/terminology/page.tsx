'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { medindex, ClinicalConcept, ConceptsResponse, LookupResult } from '@/lib/medindex-api'

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

const INPUT: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  color: C.text,
  padding: '6px 10px',
  fontSize: 12,
  fontFamily: "'JetBrains Mono', monospace",
  outline: 'none',
  width: '100%',
}

const SELECT: React.CSSProperties = { ...INPUT, cursor: 'pointer' }

function confidenceColor(score: number | null) {
  if (score === null) return C.muted
  if (score >= 0.8) return C.green
  if (score >= 0.5) return C.yellow
  return C.red
}

function Badge({ label, color, active, onClick }: { label: string; color?: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '3px 10px', borderRadius: 20, fontSize: 11, cursor: onClick ? 'pointer' : 'default',
        border: `1px solid ${active ? (color ?? C.accent) : C.border}`,
        background: active ? `rgba(${hexToRgb(color ?? C.accent)},0.15)` : 'transparent',
        color: active ? (color ?? C.accent) : C.muted,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >{label}</button>
  )
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

type LookupTerminology = 'snomed' | 'meddra' | 'rxnorm' | 'ucum'

const TERMINOLOGY_LABELS: Record<LookupTerminology, string> = {
  snomed: 'SNOMED CT',
  meddra: 'MedDRA',
  rxnorm: 'RxNorm',
  ucum: 'UCUM',
}

const SYSTEM_MAP: Record<LookupTerminology, string> = {
  snomed: 'http://snomed.info/sct',
  meddra: 'http://www.meddra.org',
  rxnorm: 'http://www.nlm.nih.gov/research/umls/rxnorm',
  ucum: 'http://unitsofmeasure.org',
}

function systemToTerminology(system: string): LookupTerminology {
  if (system.includes('snomed')) return 'snomed'
  if (system.includes('meddra')) return 'meddra'
  if (system.includes('rxnorm')) return 'rxnorm'
  if (system.includes('unitsofmeasure')) return 'ucum'
  return 'snomed'
}

interface EditState {
  id: string
  label_fr: string
  label_en: string
  primary_code: string
  primary_system: string
  primary_display: string
}

export default function TerminologyPage() {
  const [data, setData] = useState<ConceptsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterTable, setFilterTable] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterValidated, setFilterValidated] = useState('')
  const [minConf, setMinConf] = useState(0)
  const [maxConf, setMaxConf] = useState(1)
  const [editState, setEditState] = useState<EditState | null>(null)
  const [lookupResults, setLookupResults] = useState<LookupResult[]>([])
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupTerminology, setLookupTerminology] = useState<LookupTerminology>('snomed')
  const [toast, setToast] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const notify = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback((silent = false) => {
    if (!silent) setLoading(true)
    medindex.concepts({
      page, perPage: 50,
      search: debouncedSearch,
      source_table: filterTable,
      concept_type: filterType,
      validated: filterValidated,
      min_confidence: minConf,
      max_confidence: maxConf,
    }).then(d => { setData(d); setLastRefresh(new Date()) }).catch(e => notify(e.message)).finally(() => setLoading(false))
  }, [page, debouncedSearch, filterTable, filterType, filterValidated, minConf, maxConf])

  useEffect(() => { load() }, [load])

  // Auto-refresh toutes les 30s pendant que le bootstrap tourne
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => load(true), 30000)
    return () => clearInterval(interval)
  }, [autoRefresh, load])

  const approve = async (id: string) => {
    setBusy(id + '_approve')
    try { await medindex.approveConcept(id); notify('Approuvé ✓'); load() }
    catch (e: any) { notify(e.message) }
    finally { setBusy(null) }
  }

  const flag = async (id: string) => {
    setBusy(id + '_flag')
    try { await medindex.flagConcept(id); notify('Signalé'); load() }
    catch (e: any) { notify(e.message) }
    finally { setBusy(null) }
  }

  const openEdit = (c: ClinicalConcept) => {
    setLookupResults([])
    setLookupTerminology(systemToTerminology(c.primary_system ?? ''))
    setEditState({
      id: c.id,
      label_fr: c.label_fr ?? '',
      label_en: c.label_en ?? '',
      primary_code: c.primary_code ?? '',
      primary_system: c.primary_system ?? 'http://snomed.info/sct',
      primary_display: c.primary_display ?? '',
    })
  }

  const lookupCandidates = async () => {
    if (!editState?.label_en.trim()) return
    setLookupLoading(true)
    setLookupResults([])
    try {
      const r = await medindex.conceptsLookup(lookupTerminology, editState.label_en, editState.label_fr || undefined)
      setLookupResults(r.results)
      if (!r.results.length) notify(`${TERMINOLOGY_LABELS[lookupTerminology]}: aucun résultat`)
    } catch (e: any) { notify(e.message) }
    finally { setLookupLoading(false) }
  }

  const pickCandidate = (r: LookupResult) => {
    if (!editState) return
    setEditState({
      ...editState,
      primary_code: r.code,
      primary_display: r.display,
      primary_system: r.system || SYSTEM_MAP[lookupTerminology],
    })
    setLookupResults([])
  }

  const saveEdit = async () => {
    if (!editState) return
    setBusy('save')
    try {
      await medindex.updateConcept(editState.id, {
        label_en: editState.label_en || undefined,
        primary_code: editState.primary_code || undefined,
        primary_system: editState.primary_system || undefined,
        primary_display: editState.primary_display || undefined,
        mapping_method: 'human_curated',
        validated_by_human: true,
      } as any)
      notify('Sauvegardé ✓')
      setEditState(null)
      load()
    } catch (e: any) { notify(e.message) }
    finally { setBusy(null) }
  }

  const stats = data?.stats
  const tables = data?.tables ?? {}
  const types = data?.types ?? {}
  const meta = data?.meta

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: C.bg }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 200, background: C.accent, color: '#000', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '20px 32px 16px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: '#FFF', margin: 0 }}>
          Révision Terminologie FR → EN
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.15em', color: C.accent, margin: 0 }}>
            MEDINDEX · SNOMED CT · COHÉRENCE FR/EN
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => setAutoRefresh(v => !v)} style={{
              padding: '2px 8px', borderRadius: 10, fontSize: 10, cursor: 'pointer',
              border: `1px solid ${autoRefresh ? C.green : C.border}`,
              background: autoRefresh ? `rgba(82,217,160,0.1)` : 'transparent',
              color: autoRefresh ? C.green : C.muted,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {autoRefresh ? '● LIVE' : '○ PAUSE'}
            </button>
            {lastRefresh && (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.muted }}>
                màj {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
            {[
              { label: 'TOTAL', val: stats.total, color: C.text },
              { label: 'VALIDÉS', val: stats.validated, color: C.green },
              { label: 'NON MAPPÉS', val: stats.unmapped, color: C.red },
              { label: 'SIGNALÉS', val: stats.flagged, color: C.orange },
            ].map(s => (
              <div key={s.label} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 16px', minWidth: 100 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.15em', color: C.muted }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: "'Space Grotesk', sans-serif" }}>{s.val.toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Source table chips */}
      {Object.keys(tables).length > 0 && (
        <div style={{ padding: '12px 32px', borderBottom: `1px solid ${C.border}`, display: 'flex', flexWrap: 'wrap', gap: 6, flexShrink: 0 }}>
          <Badge label="Toutes" active={!filterTable} onClick={() => { setFilterTable(''); setPage(1) }} />
          {Object.entries(tables).map(([tbl, n]) => (
            <Badge key={tbl} label={`${tbl} (${n})`} active={filterTable === tbl} onClick={() => { setFilterTable(filterTable === tbl ? '' : tbl); setPage(1) }} />
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ padding: '12px 32px', borderBottom: `1px solid ${C.border}`, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, flexShrink: 0 }}>
        <input
          style={INPUT} placeholder="Rechercher FR, EN, code SNOMED…"
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <select style={SELECT} value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1) }}>
          <option value="">Tous les types</option>
          {Object.entries(types).map(([t, n]) => <option key={t} value={t}>{t} ({n})</option>)}
        </select>
        <select style={SELECT} value={filterValidated} onChange={e => { setFilterValidated(e.target.value); setPage(1) }}>
          <option value="">Tous statuts</option>
          <option value="no">Non validés</option>
          <option value="yes">Validés</option>
        </select>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.muted, marginBottom: 4 }}>
            CONFIANCE : {minConf.toFixed(2)} – {maxConf.toFixed(2)}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input type="range" min={0} max={1} step={0.05} value={minConf}
              onChange={e => { setMinConf(Number(e.target.value)); setPage(1) }}
              style={{ flex: 1, accentColor: C.accent }} />
            <input type="range" min={0} max={1} step={0.05} value={maxConf}
              onChange={e => { setMaxConf(Number(e.target.value)); setPage(1) }}
              style={{ flex: 1, accentColor: C.accent }} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 32px 32px' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: C.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>Chargement…</div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16, fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {['Terme FR', 'Terme EN', 'Code / Display', 'Score', 'Table', 'Type', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.15em', color: C.muted, fontWeight: 600 }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.data ?? []).map(c => (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}`, background: c.mapping_method === 'flagged' ? 'rgba(255,179,71,0.04)' : 'transparent' }}>
                    <td style={{ padding: '8px 10px', color: C.text, maxWidth: 200 }}>
                      <span style={{ wordBreak: 'break-word' }}>{c.label_fr}</span>
                      {c.validated_by_human && c.mapping_method !== 'flagged' && (
                        <span style={{ marginLeft: 6, width: 7, height: 7, borderRadius: '50%', background: C.green, display: 'inline-block', verticalAlign: 'middle' }} />
                      )}
                      {c.mapping_method === 'flagged' && (
                        <span style={{ marginLeft: 6, width: 7, height: 7, borderRadius: '50%', background: C.orange, display: 'inline-block', verticalAlign: 'middle' }} />
                      )}
                    </td>
                    <td style={{ padding: '8px 10px', color: C.muted, maxWidth: 200, wordBreak: 'break-word' }}>{c.label_en ?? '—'}</td>
                    <td style={{ padding: '8px 10px', maxWidth: 200 }}>
                      {c.primary_code && c.primary_code !== 'unmapped' ? (
                        <>
                          <a href={`https://browser.ihtsdotools.org/?perspective=full&conceptId1=${c.primary_code}`}
                            target="_blank" rel="noreferrer"
                            style={{ color: C.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, textDecoration: 'none' }}>
                            {c.primary_code}
                          </a>
                          <div style={{ color: C.muted, fontSize: 11, wordBreak: 'break-word', maxWidth: 180 }}>
                            {c.primary_display}
                          </div>
                        </>
                      ) : (
                        <span style={{ color: C.red, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>non mappé</span>
                      )}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 10, fontSize: 11,
                        fontFamily: "'JetBrains Mono', monospace",
                        background: `rgba(${hexToRgb(confidenceColor(c.mapping_confidence))},0.15)`,
                        color: confidenceColor(c.mapping_confidence),
                        border: `1px solid rgba(${hexToRgb(confidenceColor(c.mapping_confidence))},0.3)`,
                      }}>
                        {c.mapping_confidence !== null ? `${Math.round(c.mapping_confidence * 100)}%` : '—'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', color: C.muted, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>{c.source_table ?? '—'}</td>
                    <td style={{ padding: '8px 10px', color: C.muted, fontSize: 11 }}>{c.concept_type ?? '—'}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {(!c.validated_by_human || c.mapping_method === 'flagged') && (
                          <button
                            onClick={() => approve(c.id)}
                            disabled={busy === c.id + '_approve'}
                            style={{ padding: '3px 10px', borderRadius: 5, fontSize: 11, cursor: 'pointer', border: `1px solid ${C.green}`, background: `rgba(82,217,160,0.12)`, color: C.green, fontFamily: "'JetBrains Mono', monospace" }}>
                            ✓
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(c)}
                          style={{ padding: '3px 10px', borderRadius: 5, fontSize: 11, cursor: 'pointer', border: `1px solid ${C.accent}`, background: `rgba(0,194,203,0.1)`, color: C.accent, fontFamily: "'JetBrains Mono', monospace" }}>
                          Éditer
                        </button>
                        {c.mapping_method !== 'flagged' && (
                          <button
                            onClick={() => flag(c.id)}
                            disabled={busy === c.id + '_flag'}
                            style={{ padding: '3px 10px', borderRadius: 5, fontSize: 11, cursor: 'pointer', border: `1px solid ${C.orange}`, background: `rgba(255,179,71,0.1)`, color: C.orange, fontFamily: "'JetBrains Mono', monospace" }}>
                            !
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!data?.data.length && (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: C.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                    Aucun terme trouvé.
                  </td></tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '20px 0', alignItems: 'center' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: '5px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer', border: `1px solid ${C.border}`, background: 'transparent', color: page === 1 ? C.muted : C.text, fontFamily: "'JetBrains Mono', monospace" }}>
                  ← Préc
                </button>
                <span style={{ color: C.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                  {page} / {meta.last_page} · {meta.total.toLocaleString()} termes
                </span>
                <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page}
                  style={{ padding: '5px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer', border: `1px solid ${C.border}`, background: 'transparent', color: page === meta.last_page ? C.muted : C.text, fontFamily: "'JetBrains Mono', monospace" }}>
                  Suiv →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit modal */}
      {editState && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0F2035', border: `1px solid ${C.border}`, borderRadius: 12, padding: 28, width: 580, maxWidth: '92vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: '#FFF', margin: '0 0 6px' }}>
              Correction du terme
            </h2>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.muted, marginBottom: 18 }}>
              {editState.label_fr}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Terminology selector */}
              <div>
                <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.15em', color: C.muted, marginBottom: 8 }}>TERMINOLOGIE CIBLE</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(['snomed', 'meddra', 'rxnorm', 'ucum'] as LookupTerminology[]).map(t => (
                    <button key={t} onClick={() => { setLookupTerminology(t); setLookupResults([]) }}
                      style={{
                        padding: '4px 12px', borderRadius: 20, fontSize: 11, cursor: 'pointer',
                        fontFamily: "'JetBrains Mono', monospace",
                        border: `1px solid ${lookupTerminology === t ? C.accent : C.border}`,
                        background: lookupTerminology === t ? `rgba(0,194,203,0.15)` : 'transparent',
                        color: lookupTerminology === t ? C.accent : C.muted,
                      }}>
                      {TERMINOLOGY_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* English term + lookup button */}
              <div>
                <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.15em', color: C.muted, marginBottom: 6 }}>TERME ANGLAIS (EN)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input style={{ ...INPUT, flex: 1 }} value={editState.label_en}
                    onChange={e => setEditState({ ...editState, label_en: e.target.value })}
                    placeholder="Standard English term…" />
                  <button onClick={lookupCandidates} disabled={lookupLoading}
                    style={{ padding: '6px 14px', borderRadius: 6, fontSize: 11, cursor: 'pointer', border: `1px solid ${C.accent}`, background: `rgba(0,194,203,0.1)`, color: C.accent, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
                    {lookupLoading ? '…' : `${TERMINOLOGY_LABELS[lookupTerminology]} ↗`}
                  </button>
                </div>

                {/* GPT candidates picklist */}
                {lookupResults.length > 0 && (
                  <div style={{ marginTop: 8, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
                    {lookupResults.map((r, i) => (
                      <button key={r.code + i} onClick={() => pickCandidate(r)}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left',
                          padding: '9px 12px', background: i === 0 ? 'rgba(0,194,203,0.06)' : 'transparent',
                          border: 'none', borderBottom: i < lookupResults.length - 1 ? `1px solid ${C.border}` : 'none',
                          color: C.text, cursor: 'pointer',
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          {i === 0 && (
                            <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", padding: '1px 6px', borderRadius: 10, background: `rgba(0,194,203,0.2)`, color: C.accent, letterSpacing: '0.1em' }}>
                              BEST
                            </span>
                          )}
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.accent }}>{r.code}</span>
                          <span style={{ fontSize: 12, color: C.text, flex: 1 }}>{r.display}</span>
                          {r.confidence !== null && (
                            <span style={{
                              fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                              padding: '1px 7px', borderRadius: 10,
                              background: `rgba(${hexToRgb(confidenceColor(r.confidence))},0.15)`,
                              color: confidenceColor(r.confidence),
                              border: `1px solid rgba(${hexToRgb(confidenceColor(r.confidence))},0.3)`,
                            }}>
                              {Math.round(r.confidence * 100)}%
                            </span>
                          )}
                        </div>
                        {r.reasoning && (
                          <div style={{ marginTop: 3, fontSize: 10, color: C.muted, fontStyle: 'italic', paddingLeft: i === 0 ? 52 : 0 }}>
                            {r.reasoning}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.15em', color: C.muted, marginBottom: 6 }}>
                    CODE {TERMINOLOGY_LABELS[lookupTerminology].toUpperCase()}
                  </label>
                  <input style={INPUT} value={editState.primary_code}
                    onChange={e => setEditState({ ...editState, primary_code: e.target.value })}
                    placeholder="ex: 38341003" />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.15em', color: C.muted, marginBottom: 6 }}>SYSTÈME</label>
                  <input style={INPUT} value={editState.primary_system}
                    onChange={e => setEditState({ ...editState, primary_system: e.target.value })} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.15em', color: C.muted, marginBottom: 6 }}>DISPLAY OFFICIEL</label>
                <input style={INPUT} value={editState.primary_display}
                  onChange={e => setEditState({ ...editState, primary_display: e.target.value })}
                  placeholder="Ex: Essential hypertension" />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
              <button onClick={() => setEditState(null)}
                style={{ padding: '7px 18px', borderRadius: 7, fontSize: 12, cursor: 'pointer', border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                Annuler
              </button>
              <button onClick={saveEdit} disabled={busy === 'save'}
                style={{ padding: '7px 18px', borderRadius: 7, fontSize: 12, cursor: 'pointer', border: `1px solid ${C.accent}`, background: `rgba(0,194,203,0.15)`, color: C.accent, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                {busy === 'save' ? 'Sauvegarde…' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

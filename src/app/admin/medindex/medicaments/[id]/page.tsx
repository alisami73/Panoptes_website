'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { medindex, MedicamentDetail } from '@/lib/medindex-api'

const C = {
  bg: '#0D1B2A',
  panel: 'rgba(255,255,255,0.04)',
  panel2: 'rgba(255,255,255,0.07)',
  border: 'rgba(0,194,203,0.12)',
  accent: '#00C2CB',
  text: '#E8EDF2',
  muted: 'rgba(232,237,242,0.45)',
  red: '#FF6B6B',
  orange: '#FFB347',
  blue: '#6EA8FE',
  green: '#52D9A0',
  yellow: '#FFD166',
  // VSCode Dark+ palette for JSON highlighting
  jsKey: '#9cdcfe',
  jsStr: '#ce9178',
  jsNum: '#b5cea8',
  jsBool: '#569cd6',
  jsBracket: '#ffd700',
}

const INPUT_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, borderRadius: 6,
  color: C.text, padding: '5px 10px', fontSize: 12, fontFamily: "'JetBrains Mono', monospace", outline: 'none', width: '100%',
}

const BTN = (color = C.accent, ghost = false): React.CSSProperties => ({
  padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
  border: `1px solid ${color}`, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em',
  background: ghost ? 'transparent' : `rgba(${hexToRgb(color)},0.15)`,
  color: ghost ? color : color,
})

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

// ── JSON syntax highlighter ─────────────────────────────────────────────────

function highlightJson(json: string): React.ReactNode {
  const tokens = json.split(/("(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|(true|false|null)|([\[\]{},:])/g)
  return tokens.map((token, i) => {
    if (!token) return null
    if (token.startsWith('"')) {
      // key or string value — detect key by following ":"
      const nextNonEmpty = tokens.slice(i + 1).find(t => t && t.trim())
      if (nextNonEmpty === ':') return <span key={i} style={{ color: C.jsKey }}>{token}</span>
      return <span key={i} style={{ color: C.jsStr }}>{token}</span>
    }
    if (/^\d/.test(token)) return <span key={i} style={{ color: C.jsNum }}>{token}</span>
    if (token === 'true' || token === 'false' || token === 'null') return <span key={i} style={{ color: C.jsBool }}>{token}</span>
    if (token === '[' || token === ']' || token === '{' || token === '}') return <span key={i} style={{ color: C.jsBracket }}>{token}</span>
    return <span key={i} style={{ color: C.muted }}>{token}</span>
  })
}

function JsonViewer({ data }: { data: any }) {
  const json = JSON.stringify(data, null, 2)
  return (
    <pre style={{
      margin: 0, padding: '16px', borderRadius: 8, background: 'rgba(0,0,0,0.35)',
      fontSize: 11, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.6,
      overflowY: 'auto', maxHeight: 600, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
    }}>
      {highlightJson(json)}
    </pre>
  )
}

// ── Score badge ─────────────────────────────────────────────────────────────

function ScoreBadge({ score, label }: { score: number | null; label: string }) {
  const color = score === null ? C.muted : score >= 90 ? C.green : score >= 80 ? C.blue : score >= 60 ? C.orange : C.red
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: "'Space Grotesk', sans-serif" }}>
        {score !== null ? Math.round(score) : '—'}
      </div>
      <div style={{ fontSize: 10, color: C.muted, letterSpacing: '0.1em', fontFamily: "'JetBrains Mono', monospace" }}>
        {label.toUpperCase()}
      </div>
    </div>
  )
}

// ── Tab component ───────────────────────────────────────────────────────────

function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)} style={{
          padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
          color: active === t ? C.accent : C.muted, fontSize: 13,
          borderBottom: active === t ? `2px solid ${C.accent}` : '2px solid transparent',
          fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em', transition: 'color 0.15s',
        }}>
          {t}
        </button>
      ))}
    </div>
  )
}

// ── Links tab ───────────────────────────────────────────────────────────────

function LinksTab({ data, mid, onRefresh }: { data: MedicamentDetail; mid: string; onRefresh: () => void }) {
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ source_text: '', code: '', system: '', label_fr: '', label_en: '', rel_type: 'indication' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const notify = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const removeLink = async (lid: string) => {
    if (!confirm('Supprimer ce lien ?')) return
    await medindex.deleteLink(mid, lid)
    notify('Lien supprimé'); onRefresh()
  }

  const submitCreate = async () => {
    setSaving(true)
    try { await medindex.createLink(mid, form); notify('Lien créé'); setCreating(false); onRefresh() }
    catch (e: any) { notify(e.message) }
    finally { setSaving(false) }
  }

  const allLinks = Object.entries(data.links)

  return (
    <div style={{ padding: 24 }}>
      {toast && <div style={{ marginBottom: 12, padding: '8px 16px', background: 'rgba(82,217,160,0.12)', color: C.green, borderRadius: 6, fontSize: 13 }}>{toast}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.muted, letterSpacing: '0.1em' }}>LIENS CLINIQUES</span>
        <button onClick={() => setCreating(!creating)} style={BTN(C.accent)}>+ NOUVEAU LIEN</button>
      </div>

      {creating && (
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div><div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>TEXTE SOURCE</div><input style={INPUT_STYLE} value={form.source_text} onChange={e => setForm(f => ({ ...f, source_text: e.target.value }))} /></div>
            <div><div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>CODE</div><input style={INPUT_STYLE} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} /></div>
            <div><div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>SYSTÈME</div><input style={INPUT_STYLE} value={form.system} placeholder="http://snomed.info/sct" onChange={e => setForm(f => ({ ...f, system: e.target.value }))} /></div>
            <div><div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>LABEL FR</div><input style={INPUT_STYLE} value={form.label_fr} onChange={e => setForm(f => ({ ...f, label_fr: e.target.value }))} /></div>
            <div><div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>LABEL EN</div><input style={INPUT_STYLE} value={form.label_en} onChange={e => setForm(f => ({ ...f, label_en: e.target.value }))} /></div>
            <div><div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>TYPE</div>
              <select style={INPUT_STYLE} value={form.rel_type} onChange={e => setForm(f => ({ ...f, rel_type: e.target.value }))}>
                <option value="indication">indication</option>
                <option value="contraindication">contraindication</option>
                <option value="precaution">precaution</option>
                <option value="adverse_reaction">adverse_reaction</option>
                <option value="ingredient">ingredient</option>
                <option value="drug_form">drug_form</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={submitCreate} disabled={saving} style={BTN(C.green)}>{saving ? '…' : 'CRÉER'}</button>
            <button onClick={() => setCreating(false)} style={BTN(C.muted, true)}>ANNULER</button>
          </div>
        </div>
      )}

      {allLinks.length === 0 && <div style={{ color: C.muted, fontSize: 13 }}>Aucun lien.</div>}
      {allLinks.map(([type, links]) => (
        <div key={type} style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.accent, letterSpacing: '0.1em', marginBottom: 8 }}>
            {type.toUpperCase()} ({links.length})
          </div>
          {links.map((l: any) => (
            <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 6, background: C.panel, border: `1px solid ${C.border}`, marginBottom: 6 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: C.text }}>{l.clinical_concept?.label_fr ?? l.source_text}</div>
                <div style={{ fontSize: 11, color: C.muted, fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                  {l.clinical_concept?.primary_code} · {l.mapping_method} · conf {((l.confidence ?? 0) * 100).toFixed(0)}%
                </div>
              </div>
              <ConfidenceEditor mid={mid} lid={l.id} initial={l.confidence ?? 0} onDone={onRefresh} />
              <button onClick={() => removeLink(l.id)} style={{ ...BTN(C.red, true), padding: '4px 10px' }}>✕</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function ConfidenceEditor({ mid, lid, initial, onDone }: { mid: string; lid: string; initial: number; onDone: () => void }) {
  const [val, setVal] = useState((initial * 100).toFixed(0))
  const [editing, setEditing] = useState(false)

  const save = async () => {
    await medindex.updateLinkConfidence(mid, lid, parseFloat(val) / 100)
    setEditing(false); onDone()
  }

  if (!editing) return <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>{val}%</button>
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <input type="number" min={0} max={100} value={val} onChange={e => setVal(e.target.value)} style={{ ...INPUT_STYLE, width: 60 }} />
      <button onClick={save} style={{ ...BTN(C.green), padding: '4px 8px' }}>✓</button>
    </div>
  )
}

// ── Extraction tab ──────────────────────────────────────────────────────────

function ExtractionTab({ data, mid, onRefresh }: { data: MedicamentDetail; mid: string; onRefresh: () => void }) {
  const [editField, setEditField] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')
  const [toast, setToast] = useState('')
  const notify = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const saveField = async () => {
    if (!editField) return
    await medindex.updateExtractionField(mid, editField, editVal)
    notify('Champ mis à jour'); setEditField(null); onRefresh()
  }

  const ext = data.extraction?.extracted_data ?? {}

  return (
    <div style={{ padding: 24 }}>
      {toast && <div style={{ marginBottom: 12, padding: '8px 16px', background: 'rgba(82,217,160,0.12)', color: C.green, borderRadius: 6, fontSize: 13 }}>{toast}</div>}
      {!data.extraction ? (
        <div style={{ color: C.muted, fontSize: 13 }}>Aucune extraction disponible.</div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.muted, letterSpacing: '0.1em' }}>
              EXTRACTION LLM · {data.extraction.extraction_state?.toUpperCase()} · ${(data.extraction.cost_usd ?? 0).toFixed(4)}
            </span>
          </div>
          {Object.entries(ext).map(([key, val]) => (
            <div key={key} style={{ marginBottom: 12, padding: '12px', borderRadius: 8, background: C.panel, border: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.accent }}>{key}</span>
                <button onClick={() => { setEditField(key); setEditVal(typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)) }}
                  style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                  ÉDITER
                </button>
              </div>
              {editField === key ? (
                <div>
                  <textarea value={editVal} onChange={e => setEditVal(e.target.value)}
                    style={{ ...INPUT_STYLE, height: 120, resize: 'vertical', display: 'block' }} />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button onClick={saveField} style={BTN(C.green)}>SAUVEGARDER</button>
                    <button onClick={() => setEditField(null)} style={BTN(C.muted, true)}>ANNULER</button>
                  </div>
                </div>
              ) : typeof val === 'object' ? <JsonViewer data={val} /> : (
                <div style={{ fontSize: 13, color: C.text, wordBreak: 'break-word' }}>{String(val)}</div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  )
}

// ── Validation tab ──────────────────────────────────────────────────────────

function ValidationTab({ data, mid, onRefresh }: { data: MedicamentDetail; mid: string; onRefresh: () => void }) {
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const notify = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const act = async (action: string) => {
    setBusy(true)
    try { await medindex.action(mid, action, notes); notify('Mis à jour'); onRefresh() }
    catch (e: any) { notify(e.message) }
    finally { setBusy(false) }
  }

  const state = data.fhir?.validation_state
  const stateColor = state === 'approved' ? C.green : state === 'rejected' ? C.red : C.orange

  return (
    <div style={{ padding: 24 }}>
      {toast && <div style={{ marginBottom: 16, padding: '8px 16px', background: 'rgba(82,217,160,0.12)', color: C.green, borderRadius: 6, fontSize: 13 }}>{toast}</div>}

      {/* Scores */}
      {data.scores && (
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: '20px 32px', marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, textAlign: 'center' }}>
            <ScoreBadge score={data.fhir?.quality_score_composite} label="Global" />
            <ScoreBadge score={data.fhir?.quality_score_extraction} label="Extraction" />
            <ScoreBadge score={data.fhir?.quality_score_terminology} label="Terminologie" />
            <ScoreBadge score={data.fhir?.quality_score_projection} label="Projection" />
          </div>
        </div>
      )}

      {/* Current state */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: C.muted, fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>ÉTAT ACTUEL</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: state ? stateColor : C.yellow }}>
          {state ?? 'non transformé'}
        </div>
      </div>

      {data.fhir && (
        <>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>NOTES</div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes de validation…"
              style={{ ...INPUT_STYLE, height: 80, resize: 'vertical', display: 'block' }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button disabled={busy} onClick={() => act('approved')} style={BTN(C.green)}>✓ APPROUVER</button>
            <button disabled={busy} onClick={() => act('reviewed')} style={BTN(C.blue)}>◐ RÉVISÉ</button>
            <button disabled={busy} onClick={() => act('rejected')} style={BTN(C.red)}>✕ REJETER</button>
          </div>
        </>
      )}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function MedicamentDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [data, setData] = useState<MedicamentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('FHIR')

  const load = () => {
    setLoading(true)
    medindex.get(id)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [id]) // eslint-disable-line

  const TABS = ['FHIR', 'Extraction', 'Liens', 'Validation']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 32px', borderBottom: `1px solid ${C.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/admin/medindex/medicaments" style={{ color: C.muted, textDecoration: 'none', fontSize: 13 }}>← Liste</Link>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: '#FFF', margin: 0, flex: 1 }}>
          {data?.name ?? id}
        </h1>
        {data?.fhir?.validation_state && (
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.muted }}>
            {data.fhir.validation_state.toUpperCase()}
          </span>
        )}
      </div>

      {loading && <div style={{ padding: '20px 32px', color: C.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>Chargement…</div>}
      {error && <div style={{ padding: '20px 32px', color: C.red, fontSize: 13 }}>{error}</div>}

      {data && (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {tab === 'FHIR' && (
              <div style={{ padding: 24 }}>
                {!data.fhir ? (
                  <div style={{ color: C.yellow, fontSize: 13 }}>Ce médicament n'a pas encore été transformé en FHIR MedicationKnowledge.</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.muted, letterSpacing: '0.1em', marginBottom: 8 }}>MEDICATION KNOWLEDGE</div>
                      <JsonViewer data={data.fhir} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.muted, letterSpacing: '0.1em', marginBottom: 8 }}>
                        CLINICAL USE DEFINITIONS ({data.cuds.length})
                      </div>
                      <JsonViewer data={data.cuds} />
                    </div>
                  </div>
                )}
              </div>
            )}
            {tab === 'Extraction' && <ExtractionTab data={data} mid={id} onRefresh={load} />}
            {tab === 'Liens' && <LinksTab data={data} mid={id} onRefresh={load} />}
            {tab === 'Validation' && <ValidationTab data={data} mid={id} onRefresh={load} />}
          </div>
        </div>
      )}
    </div>
  )
}

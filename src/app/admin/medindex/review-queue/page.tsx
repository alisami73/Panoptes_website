'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { medindex, QueueItem } from '@/lib/medindex-api'

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

const INPUT_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, borderRadius: 6,
  color: C.text, padding: '6px 10px', fontSize: 12, fontFamily: "'JetBrains Mono', monospace", outline: 'none',
}

const BTN = (color: string, ghost = false): React.CSSProperties => ({
  padding: '5px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
  border: `1px solid ${color}`,
  background: ghost ? 'transparent' : `rgba(${parseInt(color.slice(1, 3), 16)},${parseInt(color.slice(3, 5), 16)},${parseInt(color.slice(5, 7), 16)},0.15)`,
  color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em',
})

function statusColor(s: string) {
  return s === 'approved' ? C.green : s === 'rejected' ? C.red : s === 'needs_data' ? C.orange : C.blue
}

function QueueCard({ item, onDone }: { item: QueueItem; onDone: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [notes, setNotes] = useState('')
  const [manualForm, setManualForm] = useState({ code: '', system: '', label_fr: '', label_en: '' })
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const notify = (msg: string, color = C.green) => { setToast(`${color}|${msg}`); setTimeout(() => setToast(''), 3000) }

  const act = async (action: string, candidateIndex?: number) => {
    setBusy(true)
    try {
      await medindex.reviewQueueAction(item.id, action, notes || undefined, candidateIndex)
      notify(action === 'approved' ? 'Approuvé ✓' : action === 'rejected' ? 'Rejeté' : 'Données demandées')
      setTimeout(onDone, 600)
    } catch (e: any) { notify(e.message, C.red) }
    finally { setBusy(false) }
  }

  const reopen = async () => {
    await medindex.reopenQueueItem(item.id)
    onDone()
  }

  const saveManual = async () => {
    if (!manualForm.code || !manualForm.system) return
    setBusy(true)
    try {
      await medindex.saveManualCandidate({ queue_item_id: item.id, ...manualForm })
      notify('Candidat sauvegardé ✓'); setTimeout(onDone, 600)
    } catch (e: any) { notify(e.message, C.red) }
    finally { setBusy(false) }
  }

  const toastColor = toast.split('|')[0]
  const toastMsg = toast.split('|')[1]

  return (
    <div style={{ background: C.panel, border: `1px solid ${item.status === 'pending' ? C.border : statusColor(item.status) + '44'}`, borderRadius: 10, marginBottom: 12, overflow: 'hidden' }}>
      {/* Card header */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: C.text, marginBottom: 2 }}>
            <span style={{ color: C.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, marginRight: 8 }}>{item.relationship_type}</span>
            {item.source_text}
          </div>
          <div style={{ fontSize: 11, color: C.muted, fontFamily: "'JetBrains Mono', monospace" }}>
            {item.molecule_dosage?.name ?? item.molecule_dosage_id} · {item.candidates?.length ?? 0} candidat(s)
          </div>
        </div>
        <span style={{ fontSize: 11, color: statusColor(item.status), fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>
          {item.status.toUpperCase()}
        </span>
        <span style={{ color: C.muted, fontSize: 14 }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${C.border}` }}>
          {toast && <div style={{ padding: '6px 12px', borderRadius: 6, marginTop: 12, marginBottom: 8, fontSize: 12, background: `rgba(${toastColor === C.green ? '82,217,160' : '255,107,107'},0.1)`, color: toastColor }}>{toastMsg}</div>}

          {/* Candidates */}
          {(item.candidates ?? []).length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.muted, letterSpacing: '0.1em', marginBottom: 8 }}>CANDIDATS</div>
              {item.candidates.map((c: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px', borderRadius: 6, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, marginBottom: 6 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: C.text }}>{c.display_fr ?? c.label_fr ?? c.primary_display ?? '—'}</div>
                    <div style={{ fontSize: 10, color: C.muted, fontFamily: "'JetBrains Mono', monospace', marginTop: 2" }}>
                      {c.primary_code ?? c.code} · {(c.cosine_score ?? c.score ?? 0).toFixed ? ((c.cosine_score ?? c.score ?? 0) * 100).toFixed(0) + '%' : ''}
                    </div>
                  </div>
                  <button onClick={() => act('approved', i)} disabled={busy || item.status !== 'pending'} style={BTN(C.green)}>✓ CHOISIR</button>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {item.status === 'pending' && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', marginBottom: 4 }}>NOTES</div>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes optionnelles…"
                style={{ ...INPUT_STYLE, width: '100%', height: 60, resize: 'none', display: 'block', boxSizing: 'border-box' }} />
            </div>
          )}

          {/* Manual candidate */}
          {item.status === 'pending' && (
            <details style={{ marginTop: 12 }}>
              <summary style={{ fontSize: 11, color: C.muted, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>+ CANDIDAT MANUEL</summary>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                <div><div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>CODE</div><input style={{ ...INPUT_STYLE, width: '100%', boxSizing: 'border-box' }} value={manualForm.code} onChange={e => setManualForm(f => ({ ...f, code: e.target.value }))} /></div>
                <div><div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>SYSTÈME</div><input style={{ ...INPUT_STYLE, width: '100%', boxSizing: 'border-box' }} value={manualForm.system} placeholder="http://snomed.info/sct" onChange={e => setManualForm(f => ({ ...f, system: e.target.value }))} /></div>
                <div><div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>LABEL FR</div><input style={{ ...INPUT_STYLE, width: '100%', boxSizing: 'border-box' }} value={manualForm.label_fr} onChange={e => setManualForm(f => ({ ...f, label_fr: e.target.value }))} /></div>
                <div><div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>LABEL EN</div><input style={{ ...INPUT_STYLE, width: '100%', boxSizing: 'border-box' }} value={manualForm.label_en} onChange={e => setManualForm(f => ({ ...f, label_en: e.target.value }))} /></div>
              </div>
              <button onClick={saveManual} disabled={busy} style={{ ...BTN(C.accent), marginTop: 8 }}>SAUVEGARDER MANUEL</button>
            </details>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {item.status === 'pending' ? (
              <>
                <button disabled={busy} onClick={() => act('approved')} style={BTN(C.green)}>✓ APPROUVER SANS CANDIDAT</button>
                <button disabled={busy} onClick={() => act('needs_data')} style={BTN(C.orange)}>◐ DONNÉES MANQUANTES</button>
                <button disabled={busy} onClick={() => act('rejected')} style={BTN(C.red)}>✕ REJETER</button>
              </>
            ) : (
              <button onClick={reopen} style={BTN(C.muted, true)}>↺ ROUVRIR</button>
            )}
          </div>

          {item.review_notes && (
            <div style={{ marginTop: 12, fontSize: 12, color: C.muted, fontStyle: 'italic' }}>{item.review_notes}</div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ReviewQueuePage() {
  const [items, setItems] = useState<QueueItem[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 30 })
  const [status, setStatus] = useState('pending')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = (s = status, p = page) => {
    setLoading(true)
    medindex.reviewQueue(s, p)
      .then(r => { setItems(r.data); setMeta(r.meta) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => load(), [status, page]) // eslint-disable-line

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 32px', borderBottom: `1px solid ${C.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/admin/medindex" style={{ color: C.muted, textDecoration: 'none', fontSize: 13 }}>← Dashboard</Link>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: '#FFF', margin: 0, flex: 1 }}>
          File de révision
        </h1>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.muted }}>{meta.total} entrée(s)</span>
      </div>

      {/* Filters */}
      <div style={{ padding: '10px 32px', borderBottom: `1px solid ${C.border}`, flexShrink: 0, display: 'flex', gap: 10 }}>
        {['pending', 'approved', 'rejected', 'needs_data', 'all'].map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1) }}
            style={{ padding: '5px 14px', borderRadius: 20, border: `1px solid ${status === s ? C.accent : C.border}`,
              background: status === s ? 'rgba(0,194,203,0.1)' : 'transparent',
              color: status === s ? C.accent : C.muted, fontSize: 12, cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace" }}>
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 32px' }}>
        {error && <div style={{ color: C.red, fontSize: 13, marginBottom: 12 }}>{error}</div>}
        {loading && <div style={{ color: C.muted, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>Chargement…</div>}
        {!loading && items.length === 0 && <div style={{ color: C.muted, fontSize: 13 }}>Aucun élément pour ce filtre.</div>}
        {!loading && items.map(item => <QueueCard key={item.id} item={item} onDone={() => load()} />)}

        {meta.last_page > 1 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
            {Array.from({ length: Math.min(meta.last_page, 10) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{ padding: '5px 10px', borderRadius: 5, border: `1px solid ${p === page ? C.accent : C.border}`,
                  background: p === page ? 'rgba(0,194,203,0.1)' : 'transparent',
                  color: p === page ? C.accent : C.muted, cursor: 'pointer', fontSize: 12 }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

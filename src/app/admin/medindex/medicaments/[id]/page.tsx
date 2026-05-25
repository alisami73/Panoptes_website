'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { medindex, MedicamentDetail } from '@/lib/medindex-api'

// ── Styles ────────────────────────────────────────────────────────────────────

const VSC = {
  bg: '#1e1e1e', panel: '#252526', border: '#3c3c3c', text: '#d4d4d4', muted: '#858585',
  key: '#9cdcfe', str: '#ce9178', num: '#b5cea8', bool: '#569cd6', bracket: '#ffd700',
  green: '#4ec9b0', red: '#f48771', orange: '#dcdcaa', purple: '#c586c0', blue: '#4fc3f7',
  activeRowBg: 'rgba(79,195,247,0.13)', activeRowBorder: '#4fc3f7',
  critBg: '#3b1212', critBorder: '#6b2020', critText: '#f87171',
  warnBg: '#2d2612', warnBorder: '#7a6020', warnText: '#fbbf24',
}

const stateColor = (s: string | null) =>
  s === 'approved' ? '#16a34a' : s === 'rejected' ? '#dc2626' : s === 'reviewed' ? '#2563eb' : '#6b7280'

const stateBg = (s: string | null) =>
  s === 'approved' ? '#dcfce7' : s === 'rejected' ? '#fee2e2' : s === 'reviewed' ? '#dbeafe' : '#f3f4f6'

const confColor = (c: number) => c >= 0.88 ? VSC.green : c >= 0.75 ? VSC.orange : VSC.red

function scoreColor(s: number | null) {
  if (s === null) return '#9ca3af'
  if (s >= 90) return '#16a34a'
  if (s >= 80) return '#2563eb'
  if (s >= 60) return '#d97706'
  return '#dc2626'
}

// ── JSON colorizer ────────────────────────────────────────────────────────────

function colorJson(obj: any): string {
  const str = JSON.stringify(obj, null, 2)
  return str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(
      /("(?:\\u[0-9a-fA-F]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (m) => {
        if (/^"/.test(m)) return /:$/.test(m) ? `<span style="color:${VSC.key}">${m}</span>` : `<span style="color:${VSC.str}">${m}</span>`
        if (/true|false/.test(m)) return `<span style="color:${VSC.bool}">${m}</span>`
        if (/null/.test(m)) return `<span style="color:${VSC.bool}">${m}</span>`
        return `<span style="color:${VSC.num}">${m}</span>`
      }
    )
}

// ── Score badge ───────────────────────────────────────────────────────────────

function ScoreBadge({ score, label, large }: { score: number | null; label: string; large?: boolean }) {
  const color = scoreColor(score)
  const size = large ? 40 : 32
  return (
    <div style={{ textAlign: 'center', minWidth: large ? 80 : 64 }}>
      <div style={{
        width: large ? 72 : 56, height: large ? 72 : 56, borderRadius: '50%',
        border: `3px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 4px', background: `${color}10`,
      }}>
        <span style={{ fontSize: size, fontWeight: 700, color, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>
          {score !== null ? Math.round(score) : '—'}
        </span>
      </div>
      <div style={{ fontSize: 10, color: '#6b7280', letterSpacing: '0.06em', fontFamily: "'JetBrains Mono',monospace" }}>
        {label.toUpperCase()}
      </div>
    </div>
  )
}

// ── Source panel (right side, light) ─────────────────────────────────────────

function SourcePanel({ source, sfx, activeId }: {
  source: MedicamentDetail['source']
  sfx: string
  activeId: string | null
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeId) return
    const el = document.getElementById(activeId)
    if (!el || !panelRef.current) return
    const containerRect = panelRef.current.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const targetScrollTop = panelRef.current.scrollTop + (elRect.top - containerRect.top) - 50
    panelRef.current.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' })
    el.style.background = '#fef9c3'
    el.style.boxShadow = '0 0 0 2px #f59e0b'
    setTimeout(() => { el.style.background = ''; el.style.boxShadow = '' }, 2800)
  }, [activeId])

  const Section = ({ id, label, labelColor, children }: { id: string; label: string; labelColor?: string; children: React.ReactNode }) => (
    <div id={id} style={{ borderRadius: 8, padding: '8px 10px', transition: 'background .25s,box-shadow .25s', marginBottom: 10 }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: labelColor ?? '#9ca3af', marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  )

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Source — Base de données <span style={{ color: '#9ca3af', fontWeight: 400 }}>(originale)</span></div>
        <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>La section correspondante s'illumine au clic ←</div>
      </div>
      <div ref={panelRef} style={{ flex: 1, padding: '16px' }}>

        <Section id={`src-principle${sfx}`} label="Principe actif">
          {source.principles.length ? source.principles.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
              <span style={{ fontWeight: 600, color: '#1d4ed8', fontSize: 13 }}>{p.molecule_name}</span>
              <span style={{ color: '#9ca3af', fontSize: 12 }}>{p.dosage} {p.unit}</span>
            </div>
          )) : <span style={{ color: '#d1d5db', fontSize: 12 }}>—</span>}
        </Section>

        <Section id={`src-indications${sfx}`} label="Indications">
          {source.indications.length ? (
            <ul style={{ paddingLeft: 16, margin: 0 }}>
              {source.indications.map((v, i) => <li key={i} style={{ fontSize: 12, color: '#374151', marginBottom: 2 }}>• {v}</li>)}
            </ul>
          ) : <span style={{ color: '#d1d5db', fontSize: 12 }}>—</span>}
        </Section>

        <Section id={`src-ci${sfx}`} label="Contre-indications" labelColor="#f87171">
          {source.contra_indications.length ? (
            <ul style={{ paddingLeft: 16, margin: 0 }}>
              {source.contra_indications.map((v, i) => <li key={i} style={{ fontSize: 12, color: '#b91c1c', marginBottom: 2 }}>• {v}</li>)}
            </ul>
          ) : <span style={{ color: '#d1d5db', fontSize: 12 }}>—</span>}
        </Section>

        <Section id={`src-precautions${sfx}`} label="Précautions d'emploi" labelColor="#fb923c">
          {source.precautions.length ? (
            <ul style={{ paddingLeft: 16, margin: 0 }}>
              {source.precautions.map((v, i) => <li key={i} style={{ fontSize: 12, color: '#92400e', marginBottom: 2 }}>• {v}</li>)}
            </ul>
          ) : <span style={{ color: '#d1d5db', fontSize: 12 }}>—</span>}
        </Section>

        <Section id={`src-warnings${sfx}`} label="Mises en garde">
          {source.warnings.length ? (
            <ul style={{ paddingLeft: 16, margin: 0 }}>
              {source.warnings.map((v, i) => <li key={i} style={{ fontSize: 12, color: '#374151', marginBottom: 2 }}>• {v}</li>)}
            </ul>
          ) : <span style={{ color: '#d1d5db', fontSize: 12 }}>—</span>}
        </Section>

        <Section id={`src-pregnancy${sfx}`} label="Grossesse" labelColor="#a855f7">
          {source.pregnancy_risks.length ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {source.pregnancy_risks.map((p, i) => (
                <span key={i} style={{
                  padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                  background: p.value === 'X' ? '#fee2e2' : p.value === 'D' ? '#ffedd5' : '#f3f4f6',
                  color: p.value === 'X' ? '#b91c1c' : p.value === 'D' ? '#c2410c' : '#374151',
                }}>M{p.months}: {p.value}</span>
              ))}
            </div>
          ) : <span style={{ color: '#d1d5db', fontSize: 12 }}>—</span>}
        </Section>

        <Section id={`src-allaitement${sfx}`} label="Allaitement" labelColor="#ec4899">
          {source.reproductive_healths.length ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {source.reproductive_healths.map((v, i) => (
                <span key={i} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: '#fdf2f8', color: '#9d174d' }}>{v}</span>
              ))}
            </div>
          ) : <span style={{ color: '#d1d5db', fontSize: 12 }}>—</span>}
        </Section>

        <Section id={`src-posologie${sfx}`} label="Posologie" labelColor="#818cf8">
          {source.posologie ? (
            <div
              style={{ fontSize: 12, lineHeight: 1.6, color: '#374151', border: '1px solid #e5e7eb', borderRadius: 6, padding: 10, background: '#f9fafb', maxHeight: 420, overflowY: 'auto' }}
              dangerouslySetInnerHTML={{ __html: source.posologie }}
            />
          ) : <span style={{ color: '#d1d5db', fontSize: 12 }}>—</span>}
        </Section>

      </div>
    </div>
  )
}

// ── VSCode field row ──────────────────────────────────────────────────────────

function VscRow({ field, value, srcId, onClick, active, onEdit }: {
  field: string; value: any; srcId: string; onClick: () => void; active: boolean; onEdit: () => void
}) {
  const isArr = Array.isArray(value) || (typeof value === 'object' && value !== null)
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10, padding: '4px 14px',
        borderLeft: `2px solid ${active ? VSC.activeRowBorder : 'transparent'}`,
        background: active ? VSC.activeRowBg : 'transparent',
        cursor: 'pointer', transition: 'background .12s,border-color .12s',
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.04)' }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <span style={{ color: VSC.key, fontSize: 11, minWidth: 155, paddingTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 0, fontFamily: "'JetBrains Mono',monospace" }}>{field}</span>
      <div style={{ flex: 1, fontSize: 12, lineHeight: 1.6, wordBreak: 'break-word', minWidth: 0, fontFamily: "'JetBrains Mono',monospace" }}>
        {isArr ? (
          <details onClick={e => e.stopPropagation()}>
            <summary style={{ cursor: 'pointer', listStyle: 'none', userSelect: 'none' }}>
              <span style={{ color: VSC.bracket }}>[</span>
              <span style={{ color: VSC.num }}> {Array.isArray(value) ? value.length : Object.keys(value).length} </span>
              <span style={{ color: VSC.bracket }}>]</span>
              <span style={{ fontSize: 10, color: VSC.muted, marginLeft: 4 }}>▶ dérouler</span>
            </summary>
            <pre style={{ margin: '4px 0 0', padding: '6px 10px', borderLeft: `1px solid ${VSC.border}`, fontSize: 10, lineHeight: 1.55, maxHeight: 200, overflowY: 'auto', whiteSpace: 'pre-wrap' }}
              dangerouslySetInnerHTML={{ __html: colorJson(value) }} />
          </details>
        ) : value === null ? (
          <span style={{ color: VSC.bool }}>null</span>
        ) : typeof value === 'boolean' ? (
          <span style={{ color: VSC.bool }}>{value ? 'true' : 'false'}</span>
        ) : typeof value === 'number' ? (
          <span style={{ color: VSC.num }}>{value}</span>
        ) : (
          <span style={{ color: VSC.str }}>"{String(value)}"</span>
        )}
      </div>
      <button
        onClick={e => { e.stopPropagation(); onEdit() }}
        style={{ background: 'none', border: `1px solid ${VSC.border}`, color: VSC.muted, cursor: 'pointer', fontSize: 10, padding: '1px 6px', borderRadius: 3, flexShrink: 0, fontFamily: "'JetBrains Mono',monospace" }}
      >✎</button>
    </div>
  )
}

// ── Couche A tab ──────────────────────────────────────────────────────────────

function ExtractionTab({ data, mid, source, onRefresh }: { data: MedicamentDetail; mid: string; source: MedicamentDetail['source']; onRefresh: () => void }) {
  const [activeField, setActiveField] = useState<string | null>(null)
  const [activeSrc, setActiveSrc] = useState<string | null>(null)
  const [editField, setEditField] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')
  const [toast, setToast] = useState('')

  const notify = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const fieldSrcId = (field: string) => {
    if (['medication_label','is_combination_product','form','presentation','dose_form_inferred'].includes(field)) return 'src-principle'
    if (['patient_blocks','dose_unit','dose_value','dose_route','administration_route','treatment_duration','posologie'].includes(field)) return 'src-posologie'
    if ((field.includes('indication') && !field.includes('contra')) || field === 'indication_guidelines') return 'src-indications'
    if (field.includes('contra') || field.startsWith('ci_')) return 'src-ci'
    if (field.includes('precaution')) return 'src-precautions'
    if (['adverse_effects','side_effects','warnings','warning_items','warnings_summary','adverse_reactions'].includes(field) || field.includes('warning') || field.includes('adverse')) return 'src-warnings'
    if (field.includes('pregnanc') || field.includes('grossesse') || field === 'pregnancy_risk') return 'src-pregnancy'
    if (field.includes('breastfeed') || field.includes('allaitement') || field.includes('lactat') || field.includes('reproduct')) return 'src-allaitement'
    return ''
  }

  const handleRowClick = (field: string) => {
    const sid = fieldSrcId(field)
    if (!sid) return
    setActiveField(field)
    setActiveSrc(sid)
  }

  const startEdit = (field: string, val: any) => {
    setEditField(field)
    setEditVal(typeof val === 'object' && val !== null ? JSON.stringify(val, null, 2) : String(val ?? ''))
  }

  const saveEdit = async () => {
    if (!editField) return
    try {
      await medindex.updateExtractionField(mid, editField, editVal)
      notify('Champ mis à jour'); setEditField(null); onRefresh()
    } catch (e: any) { notify(e.message) }
  }

  const ext = data.extraction?.extracted_data ?? {}
  const issues = data.extraction?.deterministic_validation?.issues ?? []

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {/* LEFT — VSCode dark panel */}
      <div style={{ background: VSC.bg, borderRadius: 12, border: `1px solid ${VSC.border}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: VSC.panel, borderBottom: `1px solid ${VSC.border}`, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, borderRadius: '12px 12px 0 0' }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#cccccc', fontFamily: "'JetBrains Mono',monospace" }}>Extraction LLM</span>
            <span style={{ fontSize: 10, color: VSC.muted, marginLeft: 8, fontStyle: 'italic' }}>cliquez sur un champ pour le localiser →</span>
          </div>
          {data.extraction && (
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 10,
              background: data.extraction.extraction_state === 'success' ? '#1a3a1a' : '#3a1a1a',
              color: data.extraction.extraction_state === 'success' ? '#4ec9b0' : VSC.red,
              border: `1px solid currentColor`, fontFamily: "'JetBrains Mono',monospace",
            }}>{data.extraction.extraction_state ?? '—'}</span>
          )}
        </div>
        <div style={{ flex: 1, paddingTop: 8 }}>
          {toast && <div style={{ margin: '4px 14px 8px', padding: '6px 12px', borderRadius: 6, fontSize: 12, background: 'rgba(78,201,176,0.1)', color: VSC.green }}>{toast}</div>}
          {!data.extraction ? (
            <p style={{ padding: '24px 16px', color: VSC.muted, fontSize: 13 }}>Aucune extraction disponible.</p>
          ) : (
            <>
              {issues.map((issue: any, i: number) => (
                <div key={i} style={{ margin: '2px 14px', padding: '3px 8px', fontSize: 11, borderRadius: 4, background: issue.severity === 'critical' ? VSC.critBg : VSC.warnBg, border: `1px solid ${issue.severity === 'critical' ? VSC.critBorder : VSC.warnBorder}`, color: issue.severity === 'critical' ? VSC.critText : VSC.warnText }}>
                  [{(issue.severity ?? 'warn').toUpperCase()}] {issue.message ?? issue.code ?? ''}
                </div>
              ))}
              {Object.entries(ext).map(([field, val]) => (
                editField === field ? (
                  <div key={field} style={{ margin: '4px 8px', padding: 12, borderRadius: 6, background: VSC.panel, border: `1px solid #4e9ed4` }}>
                    <div style={{ fontSize: 11, color: VSC.key, marginBottom: 6, fontFamily: "'JetBrains Mono',monospace" }}>{field}</div>
                    <textarea
                      value={editVal} onChange={e => setEditVal(e.target.value)} rows={5}
                      style={{ width: '100%', background: '#0d0d0d', color: VSC.text, border: `1px solid ${VSC.border}`, borderRadius: 4, padding: '6px 8px', fontSize: 11, fontFamily: "'JetBrains Mono',monospace", resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button onClick={saveEdit} style={{ fontSize: 11, padding: '4px 12px', borderRadius: 4, background: '#0e639c', color: '#fff', border: 'none', cursor: 'pointer' }}>Sauvegarder</button>
                      <button onClick={() => setEditField(null)} style={{ fontSize: 11, padding: '4px 12px', borderRadius: 4, background: 'none', color: '#cccccc', border: `1px solid ${VSC.border}`, cursor: 'pointer' }}>Annuler</button>
                    </div>
                  </div>
                ) : (
                  <VscRow key={field} field={field} value={val} srcId={fieldSrcId(field)}
                    active={activeField === field}
                    onClick={() => handleRowClick(field)}
                    onEdit={() => startEdit(field, val)} />
                )
              ))}
            </>
          )}
        </div>
      </div>
      {/* RIGHT — Source panel */}
      <SourcePanel source={source} sfx="" activeId={activeSrc} />
    </div>
  )
}

// ── Couche B tab ──────────────────────────────────────────────────────────────

function MappingTab({ data, mid, source, onRefresh }: { data: MedicamentDetail; mid: string; source: MedicamentDetail['source']; onRefresh: () => void }) {
  const [activeRel, setActiveRel] = useState<string | null>(null)
  const [activeSrc, setActiveSrc] = useState<string | null>(null)
  const [editConceptId, setEditConceptId] = useState<string | null>(null)
  const [editLabelFr, setEditLabelFr] = useState('')
  const [editLabelEn, setEditLabelEn] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [showManual, setShowManual] = useState(false)
  const [manual, setManual] = useState({ source_text: '', rel_type: 'indication', code: '', system: 'http://snomed.info/sct', label_fr: '', label_en: '' })
  const [toast, setToast] = useState('')
  const notify = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const relSrcId = (rel: string) => {
    if (rel.includes('indication') && !rel.includes('contra')) return 'src-indications-b'
    if (rel.includes('contra')) return 'src-ci-b'
    if (rel.includes('precaution')) return 'src-precautions-b'
    if (rel.includes('warning')) return 'src-warnings-b'
    if (rel.includes('pregnanc')) return 'src-pregnancy-b'
    if (rel.includes('breastfeed') || rel.includes('allaitement')) return 'src-allaitement-b'
    if (rel.includes('ingredient')) return 'src-principle-b'
    return 'src-posologie-b'
  }

  const handleRowClick = (relType: string) => {
    const sid = relSrcId(relType)
    setActiveRel(relType)
    setActiveSrc(sid)
  }

  const updateConf = async (lid: string, val: string) => {
    await medindex.updateLinkConfidence(mid, lid, parseFloat(val))
    onRefresh()
  }

  const saveConceptLabel = async () => {
    if (!editConceptId) return
    await medindex.updateConceptLabel(mid, editConceptId, editLabelFr, editLabelEn)
    notify('Labels mis à jour'); setEditConceptId(null); onRefresh()
  }

  const deleteLink = async (lid: string) => {
    await medindex.deleteLink(mid, lid)
    notify('Lien supprimé'); setConfirmDeleteId(null); onRefresh()
  }

  const saveManual = async () => {
    await medindex.createLink(mid, { source_text: manual.source_text, code: manual.code, system: manual.system, label_fr: manual.label_fr, label_en: manual.label_en, rel_type: manual.rel_type })
    notify('Lien créé'); setShowManual(false); onRefresh()
  }

  const allLinks = Object.entries(data.links)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {/* LEFT */}
      <div style={{ background: VSC.bg, borderRadius: 12, border: `1px solid ${VSC.border}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: VSC.panel, borderBottom: `1px solid ${VSC.border}`, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, borderRadius: '12px 12px 0 0' }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#cccccc', fontFamily: "'JetBrains Mono',monospace" }}>Couche B — Mapping</span>
            <span style={{ fontSize: 10, color: VSC.muted, marginLeft: 8, fontStyle: 'italic' }}>cliquez sur une ligne pour localiser la source →</span>
          </div>
          <button onClick={() => setShowManual(true)} style={{ fontSize: 11, padding: '4px 12px', borderRadius: 4, background: '#0e639c', color: '#fff', border: 'none', cursor: 'pointer' }}>+ Lien manuel</button>
        </div>
        <div style={{ flex: 1 }}>
          {toast && <div style={{ margin: '8px 14px', padding: '6px 12px', borderRadius: 6, fontSize: 12, background: 'rgba(78,201,176,0.1)', color: VSC.green }}>{toast}</div>}
          {showManual && (
            <div style={{ margin: '8px', padding: 12, borderRadius: 6, background: VSC.panel, border: `1px solid #4e9ed4` }}>
              <div style={{ fontSize: 11, color: VSC.key, marginBottom: 8, fontFamily: "'JetBrains Mono',monospace" }}>Nouveau lien manuel</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                {[
                  ['Texte source', 'source_text', 'text'],
                  ['Type relation', 'rel_type', 'select-rel'],
                  ['Code', 'code', 'text'],
                  ['Système', 'system', 'select-sys'],
                  ['Label FR', 'label_fr', 'text'],
                  ['Label EN', 'label_en', 'text'],
                ].map(([lbl, key, type]) => (
                  <div key={key as string}>
                    <div style={{ fontSize: 10, color: VSC.muted, marginBottom: 3 }}>{lbl}</div>
                    {type === 'select-rel' ? (
                      <select value={(manual as any)[key as string]} onChange={e => setManual(m => ({ ...m, [key as string]: e.target.value }))}
                        style={{ width: '100%', background: VSC.border, color: VSC.text, border: `1px solid #555`, borderRadius: 4, padding: '4px 6px', fontSize: 11 }}>
                        {['indication','contraindication','precaution','ingredient','dose_form','warning','pregnancy_risk'].map(r => <option key={r}>{r}</option>)}
                      </select>
                    ) : type === 'select-sys' ? (
                      <select value={(manual as any)[key as string]} onChange={e => setManual(m => ({ ...m, [key as string]: e.target.value }))}
                        style={{ width: '100%', background: VSC.border, color: VSC.text, border: `1px solid #555`, borderRadius: 4, padding: '4px 6px', fontSize: 11 }}>
                        <option value="http://snomed.info/sct">SNOMED CT</option>
                        <option value="http://hl7.org/fhir/sid/icd-10">ICD-10</option>
                        <option value="http://id.who.int/icd/release/11/mms">ICD-11</option>
                        <option value="http://www.nlm.nih.gov/research/umls/rxnorm">RxNorm</option>
                        <option value="http://www.whocc.no/atc">ATC</option>
                      </select>
                    ) : (
                      <input type="text" value={(manual as any)[key as string]} onChange={e => setManual(m => ({ ...m, [key as string]: e.target.value }))}
                        style={{ width: '100%', background: VSC.border, color: VSC.text, border: `1px solid #555`, borderRadius: 4, padding: '4px 6px', fontSize: 11, boxSizing: 'border-box' }} />
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={saveManual} style={{ fontSize: 11, padding: '4px 12px', borderRadius: 4, background: '#0e639c', color: '#fff', border: 'none', cursor: 'pointer' }}>Créer</button>
                <button onClick={() => setShowManual(false)} style={{ fontSize: 11, padding: '4px 12px', borderRadius: 4, background: 'none', color: '#cccccc', border: `1px solid ${VSC.border}`, cursor: 'pointer' }}>Annuler</button>
              </div>
            </div>
          )}
          {allLinks.length === 0 ? (
            <p style={{ padding: '24px 16px', color: VSC.muted, fontSize: 12 }}>Aucun mapping.</p>
          ) : allLinks.map(([relType, group]) => (
            <div key={relType}>
              <div style={{ padding: '6px 16px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: VSC.muted, background: VSC.panel, borderTop: `1px solid ${VSC.border}` }}>
                <span style={{ color: VSC.bracket }}>// </span>
                <span style={{ color: VSC.purple }}>{relType}</span>
                <span style={{ color: VSC.muted }}> ({group.length})</span>
              </div>
              {group.map((link: any) => {
                const conf = Number(link.confidence ?? 0)
                const isEditing = editConceptId === link.clinical_concept?.id
                const isDeleting = confirmDeleteId === link.id
                return (
                  <div key={link.id}
                    onClick={() => !isEditing && !isDeleting && handleRowClick(relType)}
                    style={{ borderBottom: `1px solid ${VSC.border}`, background: isDeleting ? VSC.critBg : 'transparent', cursor: 'pointer' }}>
                    {isEditing ? (
                      <div style={{ padding: '10px 12px', background: VSC.panel }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                          <div>
                            <div style={{ fontSize: 10, color: VSC.key, marginBottom: 3 }}>Label FR</div>
                            <input value={editLabelFr} onChange={e => setEditLabelFr(e.target.value)} style={{ width: '100%', background: VSC.border, color: VSC.str, border: `1px solid #4e9ed4`, borderRadius: 4, padding: '3px 6px', fontSize: 11, boxSizing: 'border-box' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: VSC.muted, marginBottom: 3 }}>Label EN</div>
                            <input value={editLabelEn} onChange={e => setEditLabelEn(e.target.value)} style={{ width: '100%', background: VSC.border, color: VSC.text, border: `1px solid #555`, borderRadius: 4, padding: '3px 6px', fontSize: 11, boxSizing: 'border-box' }} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={saveConceptLabel} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 4, background: '#0e639c', color: '#fff', border: 'none', cursor: 'pointer' }}>✓ Sauver</button>
                          <button onClick={() => setEditConceptId(null)} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 4, background: 'none', color: '#ccc', border: `1px solid ${VSC.border}`, cursor: 'pointer' }}>Annuler</button>
                        </div>
                      </div>
                    ) : isDeleting ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px' }} onClick={e => e.stopPropagation()}>
                        <span style={{ fontSize: 12, color: '#f87171' }}>Supprimer « {String(link.source_text ?? '').slice(0, 30)} » ?</span>
                        <button onClick={() => deleteLink(link.id)} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 4, background: '#6b2020', color: '#fca5a5', border: 'none', cursor: 'pointer' }}>Oui</button>
                        <button onClick={() => setConfirmDeleteId(null)} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 4, background: 'none', color: '#ccc', border: `1px solid ${VSC.border}`, cursor: 'pointer' }}>Non</button>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px' }}>
                          <span style={{ color: VSC.str, fontSize: 11, minWidth: 110, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: "'JetBrains Mono',monospace" }} title={link.source_text}>"{String(link.source_text ?? '').slice(0, 22)}"</span>
                          <span style={{ color: VSC.num, fontSize: 11, minWidth: 80, fontFamily: "'JetBrains Mono',monospace" }}>{link.clinical_concept?.primary_code ?? '—'}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {link.clinical_concept?.label_fr && <span style={{ color: VSC.key, fontSize: 11 }}>{String(link.clinical_concept.label_fr).slice(0, 28)}</span>}
                            {link.clinical_concept?.label_en && <span style={{ color: VSC.muted, fontSize: 10, fontStyle: 'italic' }}> / {String(link.clinical_concept.label_en).slice(0, 24)}</span>}
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: confColor(conf), flexShrink: 0 }}>{Math.round(conf * 100)}%</span>
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => { setEditConceptId(link.clinical_concept?.id ?? null); setEditLabelFr(link.clinical_concept?.label_fr ?? ''); setEditLabelEn(link.clinical_concept?.label_en ?? '') }}
                              style={{ background: 'none', border: 'none', color: VSC.key, cursor: 'pointer', fontSize: 12 }} title="Éditer">✎</button>
                            <button onClick={() => setConfirmDeleteId(link.id)} style={{ background: 'none', border: 'none', color: VSC.red, cursor: 'pointer', fontSize: 12 }} title="Supprimer">✕</button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 12px 8px', background: '#1a1a1a' }} onClick={e => e.stopPropagation()}>
                          <span style={{ fontSize: 10, color: '#5a5a5a' }}>conf:</span>
                          <input type="number" step={0.01} min={0} max={1} defaultValue={conf.toFixed(2)}
                            onBlur={e => updateConf(link.id, e.target.value)}
                            style={{ width: 52, textAlign: 'center', fontSize: 11, fontWeight: 700, color: confColor(conf), background: '#2d2d2d', border: `1px solid ${VSC.border}`, borderRadius: 3, padding: '1px 4px' }} />
                          <span style={{ fontSize: 10, color: '#5a5a5a' }}>· {link.mapping_method ?? ''}</span>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <SourcePanel source={source} sfx="-b" activeId={activeSrc} />
    </div>
  )
}

// ── Couche C tab ──────────────────────────────────────────────────────────────

function FhirTab({ data, source }: { data: MedicamentDetail; source: MedicamentDetail['source'] }) {
  const [activeField, setActiveField] = useState<string | null>(null)
  const [activeSrc, setActiveSrc] = useState<string | null>(null)

  const fhirSrcMap: Record<string, string> = {
    ingredient: 'src-principle-c', code: 'src-principle-c', drugCharacteristic: 'src-principle-c',
    doseForm: 'src-posologie-c', administrationGuidelines: 'src-posologie-c', preparationInstruction: 'src-posologie-c',
    indication: 'src-indications-c', indicationGuideline: 'src-indications-c',
    contraIndication: 'src-ci-c', precaution: 'src-precautions-c',
    regulatory: 'src-warnings-c', monitoringProgram: 'src-warnings-c',
  }

  const resource = data.fhir?.resource ?? {}

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(resource, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `medication-${data.id}.json`; a.click()
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div style={{ background: VSC.bg, borderRadius: 12, border: `1px solid ${VSC.border}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: VSC.panel, borderBottom: `1px solid ${VSC.border}`, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, borderRadius: '12px 12px 0 0' }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#cccccc', fontFamily: "'JetBrains Mono',monospace" }}>Couche C — FHIR R5</span>
            <span style={{ fontSize: 10, color: VSC.muted, marginLeft: 8, fontStyle: 'italic' }}>cliquez sur une section pour localiser →</span>
          </div>
          {data.fhir && (
            <button onClick={handleDownload} style={{ fontSize: 11, padding: '4px 12px', borderRadius: 4, background: VSC.panel, color: VSC.key, border: `1px solid ${VSC.border}`, cursor: 'pointer' }}>↓ .json</button>
          )}
        </div>
        <div style={{ flex: 1, paddingTop: 8 }}>
          {!data.fhir ? (
            <p style={{ padding: '24px 16px', color: VSC.muted, fontSize: 13 }}>Aucune ressource FHIR.</p>
          ) : Object.entries(resource).map(([key, val]) => {
            const sid = fhirSrcMap[key] ?? (key !== 'meta' && key !== 'id' && key !== 'resourceType' && key !== 'status' ? 'src-posologie-c' : '')
            return (
              <VscRow key={key} field={key} value={val} srcId={sid}
                active={activeField === key}
                onClick={() => { if (sid) { setActiveField(key); setActiveSrc(sid) } }}
                onEdit={() => {}} />
            )
          })}
        </div>
      </div>
      <SourcePanel source={source} sfx="-c" activeId={activeSrc} />
    </div>
  )
}

// ── ClinicalUseDef tab ────────────────────────────────────────────────────────

function CudsTab({ data, source }: { data: MedicamentDetail; source: MedicamentDetail['source'] }) {
  const [activeCud, setActiveCud] = useState<string | null>(null)
  const [activeSrc, setActiveSrc] = useState<string | null>(null)

  const cudSrc = (type: string) => {
    if (type.includes('contraind')) return 'src-ci-d'
    if (type.includes('precaution')) return 'src-precautions-d'
    if (type.includes('warning')) return 'src-warnings-d'
    if (type.includes('pregnanc') || type.includes('pregnancy')) return 'src-pregnancy-d'
    if (type.includes('breastfeed') || type.includes('lact')) return 'src-allaitement-d'
    if (type.includes('indication')) return 'src-indications-d'
    return 'src-warnings-d'
  }

  const typeColor: Record<string, string> = {
    contraindication: VSC.red, precaution: VSC.orange, warning: VSC.str,
    indication: VSC.green, 'pregnancy-risk': VSC.purple, 'breastfeeding-risk': VSC.purple,
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div style={{ background: VSC.bg, borderRadius: 12, border: `1px solid ${VSC.border}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: VSC.panel, borderBottom: `1px solid ${VSC.border}`, padding: '10px 16px', flexShrink: 0, borderRadius: '12px 12px 0 0' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#cccccc', fontFamily: "'JetBrains Mono',monospace" }}>ClinicalUseDefinition</span>
          <span style={{ fontSize: 10, color: VSC.muted, marginLeft: 8 }}>({data.cuds.length} ressources) — cliquez pour localiser →</span>
        </div>
        <div style={{ flex: 1, padding: '8px' }}>
          {data.cuds.length === 0 ? (
            <p style={{ padding: '24px 8px', color: VSC.muted, fontSize: 13 }}>Aucune ClinicalUseDefinition.</p>
          ) : data.cuds.map((cud: any) => {
            const sid = cudSrc(cud.type ?? '')
            const color = typeColor[cud.type] ?? VSC.key
            const isActive = activeCud === cud.id
            return (
              <div key={cud.id}
                onClick={() => { setActiveCud(cud.id); setActiveSrc(sid) }}
                style={{ borderRadius: 4, overflow: 'hidden', marginBottom: 4, border: `1px solid ${isActive ? VSC.activeRowBorder : 'transparent'}`, background: isActive ? VSC.activeRowBg : 'transparent', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', background: VSC.panel }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color, textTransform: 'capitalize' }}>{cud.type || 'unknown'}</span>
                  <span style={{ fontSize: 10, color: VSC.muted, fontFamily: "'JetBrains Mono',monospace" }}>{String(cud.id ?? '').slice(0, 20)}</span>
                </div>
                <details onClick={e => e.stopPropagation()}>
                  <summary style={{ cursor: 'pointer', listStyle: 'none', padding: '4px 12px', fontSize: 11, color: VSC.muted, userSelect: 'none' }}>
                    <span style={{ color: VSC.bracket }}>{'{'}</span>
                    <span style={{ color: VSC.num }}> {Object.keys(cud.resource ?? {}).length} </span>
                    <span style={{ color: VSC.bracket }}>{'}'}</span>
                    <span style={{ fontSize: 10, color: VSC.muted, marginLeft: 4 }}>▶ dérouler</span>
                  </summary>
                  <pre style={{ margin: 0, padding: '8px 12px', fontSize: 10, lineHeight: 1.5, maxHeight: 220, overflowY: 'auto', borderTop: `1px solid #2d2d2d`, whiteSpace: 'pre-wrap' }}
                    dangerouslySetInnerHTML={{ __html: colorJson(cud.resource ?? {}) }} />
                </details>
              </div>
            )
          })}
        </div>
      </div>
      <SourcePanel source={source} sfx="-d" activeId={activeSrc} />
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MedicamentDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [data, setData] = useState<MedicamentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'extraction' | 'mapping' | 'fhir' | 'cuds'>('extraction')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')

  const notify = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = useCallback(() => {
    medindex.get(id)
      .then(d => { setData(d); setError('') })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { load() }, [load])

  const executeAction = async (action: string) => {
    setBusy(true)
    try {
      await medindex.action(id, action, notes)
      notify(`Action « ${action} » enregistrée.`)
      setNotes('')
      load()
    } catch (e: any) { notify(e.message) }
    finally { setBusy(false) }
  }

  const s = data?.scores
  const state = data?.fhir?.validation_state ?? null

  const TABS = [
    { key: 'extraction', label: 'Couche A — Extraction' },
    { key: 'mapping', label: 'Couche B — Mapping' },
    { key: 'fhir', label: 'Couche C — FHIR' },
    { key: 'cuds', label: 'ClinicalUseDef' },
  ] as const

  if (loading) return (
    <div style={{ padding: 40, color: '#6b7280', fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>Chargement…</div>
  )
  if (error) return (
    <div style={{ padding: 40, color: '#dc2626', fontSize: 13 }}>{error}</div>
  )
  if (!data) return null

  return (
    <div style={{ background: '#f9fafb', minHeight: '100%', padding: '0 0 40px' }}>

      {/* ── Header card ── */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px 24px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Link href="/admin/medindex/medicaments" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 13 }}>← Retour liste</Link>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 4px', fontFamily: "'Space Grotesk',sans-serif" }}>{data.name}</h1>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 8px', fontFamily: "'JetBrains Mono',monospace" }}>ID : {id}</p>
            <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, fontSize: 12, background: stateBg(state), color: stateColor(state), fontWeight: 500 }}>{state ?? 'pending'}</span>
          </div>
          {s && (
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              <ScoreBadge score={s.composite} label="Composite" large />
              <ScoreBadge score={s.extraction} label="Extraction" />
              <ScoreBadge score={s.terminology} label="Terminologie" />
              <ScoreBadge score={s.projection} label="Projection" />
            </div>
          )}
        </div>

        {s && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 16, background: '#f9fafb', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#6b7280' }}>
            <div>
              <strong style={{ color: '#374151' }}>Extraction</strong><br />
              LLM: {s.breakdown.extraction.llm_confidence ?? '—'} ·
              Validator: {s.breakdown.extraction.validator_score ?? '—'} ·
              Issues critiques: {s.breakdown.extraction.critical_issues}
            </div>
            <div>
              <strong style={{ color: '#374151' }}>Terminologie</strong><br />
              Auto: {s.breakdown.terminology.auto_links}/{s.breakdown.terminology.total_links} ·
              Conf moy: {s.breakdown.terminology.avg_confidence ?? '—'} ·
              Flagged: {s.breakdown.terminology.flagged_links}
            </div>
            <div>
              <strong style={{ color: '#374151' }}>Projection</strong><br />
              Structure: {s.breakdown.projection.structural_score ?? '—'} ·
              Codings/concept: {s.breakdown.projection.avg_codings_per_concept ?? '—'} ·
              CUD types: {s.breakdown.projection.cud_types_present}
            </div>
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: 16, background: '#fff', borderRadius: '8px 8px 0 0', overflow: 'hidden' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13,
              color: tab === t.key ? '#4f46e5' : '#6b7280',
              borderBottom: tab === t.key ? '2px solid #4f46e5' : '2px solid transparent',
              fontFamily: "'JetBrains Mono',monospace", transition: 'color .15s',
              fontWeight: tab === t.key ? 600 : 400,
            }}>{t.label}</button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {tab === 'extraction' && <ExtractionTab data={data} mid={id} source={data.source} onRefresh={load} />}
      {tab === 'mapping' && <MappingTab data={data} mid={id} source={data.source} onRefresh={load} />}
      {tab === 'fhir' && <FhirTab data={data} source={data.source} />}
      {tab === 'cuds' && <CudsTab data={data} source={data.source} />}

      {/* ── Validation action panel ── */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px 24px', marginTop: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
        {toast && <div style={{ marginBottom: 12, padding: '8px 16px', background: '#f0fdf4', color: '#16a34a', borderRadius: 6, fontSize: 13, border: '1px solid #bbf7d0' }}>{toast}</div>}
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 12px', fontFamily: "'Space Grotesk',sans-serif" }}>Action de validation</h2>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
          placeholder="Notes optionnelles…"
          style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 12px', fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 10 }} />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button disabled={busy} onClick={() => executeAction('approved')}
            style={{ padding: '8px 18px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>✓ Approuver</button>
          <button disabled={busy} onClick={() => executeAction('flagged_suspect')}
            style={{ padding: '8px 18px', background: '#f97316', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>⚠ Marquer suspect</button>
          <button disabled={busy} onClick={() => executeAction('rejected')}
            style={{ padding: '8px 18px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>✗ Rejeter</button>
          <button disabled={busy} onClick={() => executeAction('commented')}
            style={{ padding: '8px 18px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>💬 Commenter</button>
        </div>
      </div>

    </div>
  )
}

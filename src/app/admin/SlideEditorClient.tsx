'use client'

import React, { useState, useRef, useEffect } from 'react'
import SlideRenderer from '@/components/slides/SlideRenderer'
import type { SlideConfig, Block } from '@/types/slide'

interface SlideEntry { id: string; config: SlideConfig }
interface Props { slides: SlideEntry[] }

export default function SlideEditorClient({ slides }: Props) {
  const [slideList, setSlideList] = useState<SlideEntry[]>(slides)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [swapping, setSwapping] = useState(false)

  const previewAreaRef = useRef<HTMLDivElement>(null)
  const [previewScale, setPreviewScale] = useState(0.38)

  useEffect(() => {
    const el = previewAreaRef.current
    if (!el) return
    const update = () => {
      const w = el.clientWidth - 56
      const h = el.clientHeight - 56
      if (w > 0 && h > 0) setPreviewScale(Math.min(w / 1920, h / 1080))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const current = slideList[selectedIndex]
  const config = current?.config
  const selectedBlock = config?.blocks.find(b => b.id === selectedBlockId)

  function updateConfig(updates: Partial<SlideConfig>) {
    setSlideList(list =>
      list.map((s, i) => i === selectedIndex ? { ...s, config: { ...s.config, ...updates } } : s)
    )
    setSavedOk(false)
  }

  function updateBlockContent(blockId: string, contentKey: string, value: unknown) {
    setSlideList(list =>
      list.map((s, i) =>
        i === selectedIndex
          ? { ...s, config: { ...s.config, blocks: s.config.blocks.map(b => b.id === blockId ? { ...b, content: { ...b.content, [contentKey]: value } } : b) } }
          : s
      )
    )
    setSavedOk(false)
  }

  async function saveSlide() {
    setSaving(true)
    try {
      await fetch(`/api/admin/slides/${current.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configJson: config }),
      })
      setSavedOk(true)
    } finally {
      setSaving(false)
    }
  }

  async function swapSlides(indexA: number, indexB: number) {
    if (swapping || indexB < 0 || indexB >= slideList.length) return
    const slideA = slideList[indexA]
    const slideB = slideList[indexB]
    setSwapping(true)
    try {
      const res = await fetch('/api/admin/slides/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idA: slideA.id, idB: slideB.id }),
      })
      if (!res.ok) return
      const idxA = slideA.config.slideIndex
      const idxB = slideB.config.slideIndex
      setSlideList(list => {
        const next = [...list]
        next[indexA] = { ...slideB, config: { ...slideB.config, slideIndex: idxA } }
        next[indexB] = { ...slideA, config: { ...slideA.config, slideIndex: idxB } }
        return next
      })
      if (selectedIndex === indexA) setSelectedIndex(indexB)
      else if (selectedIndex === indexB) setSelectedIndex(indexA)
    } finally {
      setSwapping(false)
    }
  }

  async function toggleHidden(index: number) {
    const slide = slideList[index]
    const newHidden = !slide.config.hidden
    const updatedConfig = { ...slide.config, hidden: newHidden }
    setSlideList(list => list.map((s, i) => i === index ? { ...s, config: updatedConfig } : s))
    await fetch(`/api/admin/slides/${slide.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ configJson: updatedConfig }),
    })
  }

  if (!config) return null

  const visibleCount = slideList.filter(s => !s.config.hidden).length

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* ── Slide list sidebar ── */}
      <div style={{
        width: sidebarCollapsed ? 36 : 220,
        background: '#07101c',
        borderRight: '1px solid rgba(0,194,203,0.1)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.18s ease',
        overflow: 'hidden',
      }}>
        {/* Header row */}
        <div style={{
          padding: sidebarCollapsed ? '14px 0' : '12px 10px',
          borderBottom: '1px solid rgba(0,194,203,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          flexShrink: 0,
        }}>
          {!sidebarCollapsed && (
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.22em', color: 'rgba(232,237,242,0.35)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              {visibleCount}/{slideList.length} SLIDES
            </span>
          )}
          <button
            onClick={() => setSidebarCollapsed(c => !c)}
            title={sidebarCollapsed ? 'Afficher' : 'Réduire'}
            style={{ background: 'none', border: 'none', color: 'rgba(0,194,203,0.55)', cursor: 'pointer', fontSize: 16, padding: '2px 4px', lineHeight: 1, flexShrink: 0 }}
          >
            {sidebarCollapsed ? '›' : '‹'}
          </button>
        </div>

        {/* Slide list (hidden when collapsed) */}
        {!sidebarCollapsed && (
          <div style={{ overflowY: 'auto', flex: 1, padding: '4px 0' }}>
            {slideList.map((slide, i) => {
              const isHidden = !!slide.config.hidden
              const isSelected = i === selectedIndex
              return (
                <div
                  key={slide.id}
                  style={{
                    margin: '5px 7px',
                    borderRadius: 5,
                    overflow: 'hidden',
                    opacity: isHidden ? 0.45 : 1,
                    border: `1px solid ${isSelected ? 'rgba(0,194,203,0.55)' : 'rgba(0,194,203,0.1)'}`,
                    background: isSelected ? 'rgba(0,194,203,0.04)' : 'transparent',
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    onClick={() => { setSelectedIndex(i); setSelectedBlockId(null) }}
                    style={{ position: 'relative', height: 64, overflow: 'hidden', background: slide.config.theme.background, cursor: 'pointer' }}
                  >
                    <SlideRenderer slideConfig={slide.config} scale={0.098} isAnimated={false} />
                    {isHidden && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 16, opacity: 0.8 }}>🚫</span>
                      </div>
                    )}
                  </div>

                  {/* Label + controls */}
                  <div style={{ padding: '4px 5px', display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(5,9,15,0.6)' }}>
                    <div
                      onClick={() => { setSelectedIndex(i); setSelectedBlockId(null) }}
                      style={{ flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: 8.5, letterSpacing: '0.1em', color: isSelected ? '#00C2CB' : 'rgba(232,237,242,0.35)', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}
                    >
                      {String(slide.config.slideIndex).padStart(2, '0')} · {slide.config.label?.replace(/^\d+ /, '')}
                    </div>
                    <button onClick={() => swapSlides(i, i - 1)} disabled={i === 0 || swapping} style={ctrlBtn} title="Monter">↑</button>
                    <button onClick={() => swapSlides(i, i + 1)} disabled={i === slideList.length - 1 || swapping} style={ctrlBtn} title="Descendre">↓</button>
                    <button
                      onClick={() => toggleHidden(i)}
                      style={{ ...ctrlBtn, color: isHidden ? '#00C2CB' : 'rgba(232,237,242,0.3)' }}
                      title={isHidden ? 'Afficher dans le deck' : 'Masquer du deck'}
                    >
                      {isHidden ? '●' : '○'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Live preview ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#05090f', overflow: 'hidden', minWidth: 0 }}>
        {/* Preview header */}
        <div style={{ padding: '10px 20px', borderBottom: '1px solid rgba(0,194,203,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.2em', color: 'rgba(232,237,242,0.5)', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {config.label} · {config.layout}
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
            {savedOk && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#00C2CB' }}>✓ Sauvegardé</span>}
            <button
              onClick={saveSlide}
              disabled={saving}
              style={{ background: saving ? 'rgba(0,194,203,0.3)' : '#00C2CB', color: '#0D1B2A', border: 'none', borderRadius: 4, padding: '6px 18px', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.15em', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving ? 'SAVING...' : 'SAUVEGARDER'}
            </button>
          </div>
        </div>

        {/* Preview area — fills remaining space, scale computed dynamically */}
        <div
          ref={previewAreaRef}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28, overflow: 'hidden' }}
        >
          <div style={{ boxShadow: '0 0 60px rgba(0,0,0,0.6)', border: '1px solid rgba(0,194,203,0.15)', borderRadius: 4, flexShrink: 0 }}>
            <SlideRenderer slideConfig={config} scale={previewScale} isAnimated={false} />
          </div>
        </div>
      </div>

      {/* ── Properties panel ── */}
      <div style={{ width: 300, background: '#0a1422', borderLeft: '1px solid rgba(0,194,203,0.1)', overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ padding: 16, borderBottom: '1px solid rgba(0,194,203,0.1)' }}>
          <div style={sectionLabel}>PARAMÈTRES SLIDE</div>

          {/* Theme colors */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ ...fieldLabel, marginBottom: 8 }}>Couleurs</div>
            {[
              { key: 'background', label: 'Background' },
              { key: 'textColor', label: 'Texte' },
              { key: 'accentColor', label: 'Accent' },
            ].map(({ key, label }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'rgba(232,237,242,0.65)' }}>{label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'rgba(232,237,242,0.4)' }}>
                    {(config.theme as unknown as Record<string, string>)[key]}
                  </span>
                  <input
                    type="color"
                    value={String((config.theme as unknown as Record<string, string>)[key] ?? '#000000')}
                    onChange={e => updateConfig({ theme: { ...config.theme, [key]: e.target.value } })}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Title */}
          <div style={{ marginBottom: 14 }}>
            <label style={fieldLabel}>Titre</label>
            <textarea value={config.title} onChange={e => updateConfig({ title: e.target.value })} rows={2} style={taStyle} />
          </div>

          {/* Subtitle */}
          {config.subtitle !== undefined && (
            <div style={{ marginBottom: 14 }}>
              <label style={fieldLabel}>Sous-titre</label>
              <textarea value={config.subtitle} onChange={e => updateConfig({ subtitle: e.target.value })} rows={3} style={taStyle} />
            </div>
          )}

          {/* Eyebrow */}
          {config.eyebrow !== undefined && (
            <div style={{ marginBottom: 14 }}>
              <label style={fieldLabel}>Eyebrow</label>
              <input value={config.eyebrow} onChange={e => updateConfig({ eyebrow: e.target.value })} style={inStyle} />
            </div>
          )}

          {/* Footer */}
          {config.footer && (
            <div style={{ marginBottom: 14 }}>
              <label style={fieldLabel}>Pied de page — gauche</label>
              <input value={config.footer.left} onChange={e => updateConfig({ footer: { ...config.footer!, left: e.target.value } })} style={{ ...inStyle, marginBottom: 6 }} />
              <label style={fieldLabel}>Pied de page — droite</label>
              <input value={config.footer.right} onChange={e => updateConfig({ footer: { ...config.footer!, right: e.target.value } })} style={inStyle} />
            </div>
          )}

          {/* Validation note */}
          {config.validationNote !== undefined && (
            <div style={{ marginBottom: 14 }}>
              <label style={fieldLabel}>Note de validation</label>
              <textarea value={config.validationNote} onChange={e => updateConfig({ validationNote: e.target.value })} rows={3} style={taStyle} />
            </div>
          )}

          {/* Metrics */}
          {config.metrics && config.metrics.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={fieldLabel}>Métriques</div>
              {config.metrics.map((m, mi) => (
                <div key={mi} style={{ marginBottom: 8, padding: '8px 10px', background: 'rgba(0,194,203,0.04)', border: '1px solid rgba(0,194,203,0.1)', borderRadius: 4 }}>
                  <div style={{ fontSize: 9, color: 'rgba(232,237,242,0.35)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.15em', marginBottom: 6, textTransform: 'uppercase' }}>
                    Métrique {mi + 1}
                  </div>
                  <input
                    placeholder="Label"
                    value={m.label}
                    onChange={e => { const next = [...config.metrics!]; next[mi] = { ...next[mi], label: e.target.value }; updateConfig({ metrics: next }) }}
                    style={{ ...inStyle, marginBottom: 5 }}
                  />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      placeholder="Valeur"
                      value={m.value}
                      onChange={e => { const next = [...config.metrics!]; next[mi] = { ...next[mi], value: e.target.value }; updateConfig({ metrics: next }) }}
                      style={{ ...inStyle, flex: 2 }}
                    />
                    <input
                      placeholder="Unité"
                      value={m.unit ?? ''}
                      onChange={e => { const next = [...config.metrics!]; next[mi] = { ...next[mi], unit: e.target.value }; updateConfig({ metrics: next }) }}
                      style={{ ...inStyle, flex: 1 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Visibility toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid rgba(0,194,203,0.08)', marginTop: 4 }}>
            <span style={{ fontSize: 13, color: 'rgba(232,237,242,0.55)' }}>{config.hidden ? 'Masquée du deck' : 'Visible dans le deck'}</span>
            <button
              onClick={() => toggleHidden(selectedIndex)}
              style={{ background: config.hidden ? 'rgba(0,194,203,0.15)' : 'rgba(232,237,242,0.06)', border: `1px solid ${config.hidden ? 'rgba(0,194,203,0.4)' : 'rgba(232,237,242,0.12)'}`, color: config.hidden ? '#00C2CB' : 'rgba(232,237,242,0.4)', borderRadius: 4, padding: '4px 12px', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer', letterSpacing: '0.1em' }}
            >
              {config.hidden ? 'AFFICHER' : 'MASQUER'}
            </button>
          </div>
        </div>

        {/* Blocks list */}
        {config.blocks.length > 0 && (
          <div style={{ padding: 16, borderBottom: '1px solid rgba(0,194,203,0.1)' }}>
            <div style={sectionLabel}>BLOCS ({config.blocks.length})</div>
            {config.blocks.map(block => (
              <div
                key={block.id}
                onClick={() => setSelectedBlockId(selectedBlockId === block.id ? null : block.id)}
                style={{
                  padding: '8px 12px', marginBottom: 4, borderRadius: 4, cursor: 'pointer',
                  border: `1px solid ${selectedBlockId === block.id ? 'rgba(0,194,203,0.5)' : 'rgba(0,194,203,0.1)'}`,
                  background: selectedBlockId === block.id ? 'rgba(0,194,203,0.08)' : 'transparent',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 12, color: selectedBlockId === block.id ? '#00C2CB' : '#E8EDF2' }}>{block.id}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(232,237,242,0.35)', letterSpacing: '0.15em' }}>{block.type}</span>
              </div>
            ))}
          </div>
        )}

        {/* Block properties */}
        {selectedBlock && (
          <div style={{ padding: 16 }}>
            <div style={{ ...sectionLabel, color: '#00C2CB' }}>BLOC · {selectedBlock.type}</div>
            {Object.entries(selectedBlock.content).map(([key, value]) => {
              if (typeof value === 'string') {
                return (
                  <div key={key} style={{ marginBottom: 12 }}>
                    <label style={fieldLabel}>{key}</label>
                    {value.length > 60
                      ? <textarea value={value} onChange={e => updateBlockContent(selectedBlock.id, key, e.target.value)} rows={3} style={taStyle} />
                      : <input type="text" value={value} onChange={e => updateBlockContent(selectedBlock.id, key, e.target.value)} style={inStyle} />
                    }
                  </div>
                )
              }
              if (typeof value === 'number') {
                return (
                  <div key={key} style={{ marginBottom: 12 }}>
                    <label style={fieldLabel}>{key}</label>
                    <input type="number" value={value} onChange={e => updateBlockContent(selectedBlock.id, key, Number(e.target.value))} style={inStyle} />
                  </div>
                )
              }
              if (Array.isArray(value) && value.every(v => typeof v === 'string')) {
                return (
                  <div key={key} style={{ marginBottom: 12 }}>
                    <label style={fieldLabel}>{key}</label>
                    <textarea value={(value as string[]).join('\n')} onChange={e => updateBlockContent(selectedBlock.id, key, e.target.value.split('\n'))} rows={Math.min(value.length + 1, 8)} style={taStyle} />
                  </div>
                )
              }
              return null
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const ctrlBtn: React.CSSProperties = {
  background: 'none', border: 'none', color: 'rgba(232,237,242,0.35)', cursor: 'pointer',
  fontSize: 11, padding: '1px 3px', lineHeight: 1, borderRadius: 3,
  fontFamily: 'monospace', flexShrink: 0,
}

const sectionLabel: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.25em',
  color: 'rgba(232,237,242,0.35)', textTransform: 'uppercase', marginBottom: 14,
}

const fieldLabel: React.CSSProperties = {
  display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
  letterSpacing: '0.2em', color: 'rgba(232,237,242,0.4)', textTransform: 'uppercase', marginBottom: 6,
}

const baseInput: React.CSSProperties = {
  width: '100%', padding: '8px 10px', boxSizing: 'border-box',
  background: 'rgba(0,194,203,0.06)', border: '1px solid rgba(0,194,203,0.15)',
  borderRadius: 4, color: '#FFFFFF', fontSize: 13, fontFamily: "'Inter', sans-serif", outline: 'none',
}

const inStyle: React.CSSProperties = { ...baseInput }
const taStyle: React.CSSProperties = { ...baseInput, resize: 'vertical' }

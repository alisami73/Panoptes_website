'use client'

import React, { useState, useCallback } from 'react'
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

  const current = slideList[selectedIndex]
  const config = current?.config

  const selectedBlock = config?.blocks.find(b => b.id === selectedBlockId)

  function updateConfig(updates: Partial<SlideConfig>) {
    setSlideList(list =>
      list.map((s, i) =>
        i === selectedIndex ? { ...s, config: { ...s.config, ...updates } } : s
      )
    )
    setSavedOk(false)
  }

  function updateBlock(blockId: string, updates: Partial<Block>) {
    setSlideList(list =>
      list.map((s, i) =>
        i === selectedIndex
          ? {
              ...s,
              config: {
                ...s.config,
                blocks: s.config.blocks.map(b =>
                  b.id === blockId ? { ...b, ...updates } : b
                ),
              },
            }
          : s
      )
    )
    setSavedOk(false)
  }

  function updateBlockContent(blockId: string, contentKey: string, value: unknown) {
    setSlideList(list =>
      list.map((s, i) =>
        i === selectedIndex
          ? {
              ...s,
              config: {
                ...s.config,
                blocks: s.config.blocks.map(b =>
                  b.id === blockId
                    ? { ...b, content: { ...b.content, [contentKey]: value } }
                    : b
                ),
              },
            }
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

  if (!config) return null

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Slide list sidebar */}
      <div
        style={{
          width: 200,
          background: '#07101c',
          borderRight: '1px solid rgba(0,194,203,0.1)',
          overflowY: 'auto',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: '16px 12px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.25em',
            color: 'rgba(232,237,242,0.35)',
            textTransform: 'uppercase',
            borderBottom: '1px solid rgba(0,194,203,0.08)',
          }}
        >
          SLIDES (17)
        </div>
        {slideList.map((slide, i) => (
          <div
            key={slide.id}
            onClick={() => { setSelectedIndex(i); setSelectedBlockId(null) }}
            className={`slide-thumbnail ${i === selectedIndex ? 'active' : ''}`}
            style={{ margin: 8, borderRadius: 4, overflow: 'hidden' }}
          >
            <div style={{ position: 'relative', height: 72, overflow: 'hidden', background: slide.config.theme.background }}>
              <SlideRenderer slideConfig={slide.config} scale={0.1} isAnimated={false} />
            </div>
            <div
              style={{
                padding: '4px 6px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                letterSpacing: '0.12em',
                color: i === selectedIndex ? '#00C2CB' : 'rgba(232,237,242,0.35)',
                background: i === selectedIndex ? 'rgba(0,194,203,0.08)' : 'transparent',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {String(slide.config.slideIndex).padStart(2, '0')} · {slide.config.label?.replace(/^\d+ /, '')}
            </div>
          </div>
        ))}
      </div>

      {/* Live preview */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: '#05090f',
          overflow: 'hidden',
        }}
      >
        {/* Preview header */}
        <div
          style={{
            padding: '12px 24px',
            borderBottom: '1px solid rgba(0,194,203,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.2em', color: 'rgba(232,237,242,0.5)', textTransform: 'uppercase' }}>
            {config.label} · {config.layout}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {savedOk && (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#00C2CB' }}>✓ Sauvegardé</span>
            )}
            <button
              onClick={saveSlide}
              disabled={saving}
              style={{
                background: saving ? 'rgba(0,194,203,0.3)' : '#00C2CB',
                color: '#0D1B2A',
                border: 'none',
                borderRadius: 4,
                padding: '6px 20px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.15em',
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'SAVING...' : 'SAUVEGARDER'}
            </button>
          </div>
        </div>

        {/* Preview area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'relative',
              boxShadow: '0 0 60px rgba(0,0,0,0.5)',
              border: '1px solid rgba(0,194,203,0.15)',
              borderRadius: 4,
            }}
          >
            <SlideRenderer slideConfig={config} scale={0.45} isAnimated={false} />
          </div>
        </div>
      </div>

      {/* Properties panel */}
      <div
        style={{
          width: 320,
          background: '#0a1422',
          borderLeft: '1px solid rgba(0,194,203,0.1)',
          overflowY: 'auto',
          flexShrink: 0,
        }}
      >
        <div style={{ padding: 16, borderBottom: '1px solid rgba(0,194,203,0.1)' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.25em', color: 'rgba(232,237,242,0.35)', textTransform: 'uppercase', marginBottom: 16 }}>
            PARAMÈTRES SLIDE
          </div>

          {/* Theme colors */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.2em', color: 'rgba(232,237,242,0.4)', marginBottom: 8, textTransform: 'uppercase' }}>
              Couleurs
            </div>
            {[
              { key: 'background', label: 'Background' },
              { key: 'textColor', label: 'Texte' },
              { key: 'accentColor', label: 'Accent' },
            ].map(({ key, label }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'rgba(232,237,242,0.65)' }}>{label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'rgba(232,237,242,0.4)' }}>
                    {(config.theme as any)[key]}
                  </span>
                  <input
                    type="color"
                    value={(config.theme as any)[key]}
                    onChange={e => updateConfig({ theme: { ...config.theme, [key]: e.target.value } })}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Title */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Titre</label>
            <textarea
              value={config.title}
              onChange={e => updateConfig({ title: e.target.value })}
              rows={3}
              style={textareaStyle}
            />
          </div>

          {/* Subtitle */}
          {config.subtitle !== undefined && (
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Sous-titre</label>
              <textarea
                value={config.subtitle}
                onChange={e => updateConfig({ subtitle: e.target.value })}
                rows={3}
                style={textareaStyle}
              />
            </div>
          )}
        </div>

        {/* Blocks list */}
        {config.blocks.length > 0 && (
          <div style={{ padding: 16, borderBottom: '1px solid rgba(0,194,203,0.1)' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.25em', color: 'rgba(232,237,242,0.35)', textTransform: 'uppercase', marginBottom: 12 }}>
              BLOCS ({config.blocks.length})
            </div>
            {config.blocks.map(block => (
              <div
                key={block.id}
                onClick={() => setSelectedBlockId(selectedBlockId === block.id ? null : block.id)}
                style={{
                  padding: '8px 12px',
                  marginBottom: 4,
                  borderRadius: 4,
                  border: `1px solid ${selectedBlockId === block.id ? 'rgba(0,194,203,0.5)' : 'rgba(0,194,203,0.1)'}`,
                  background: selectedBlockId === block.id ? 'rgba(0,194,203,0.08)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
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
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.25em', color: '#00C2CB', textTransform: 'uppercase', marginBottom: 12 }}>
              BLOC · {selectedBlock.type}
            </div>

            {/* Generic content editor */}
            {Object.entries(selectedBlock.content).map(([key, value]) => {
              if (typeof value === 'string') {
                return (
                  <div key={key} style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>{key}</label>
                    {value.length > 60 ? (
                      <textarea
                        value={value}
                        onChange={e => updateBlockContent(selectedBlock.id, key, e.target.value)}
                        rows={3}
                        style={textareaStyle}
                      />
                    ) : (
                      <input
                        type="text"
                        value={value}
                        onChange={e => updateBlockContent(selectedBlock.id, key, e.target.value)}
                        style={inputStyle}
                      />
                    )}
                  </div>
                )
              }
              if (typeof value === 'number') {
                return (
                  <div key={key} style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>{key}</label>
                    <input
                      type="number"
                      value={value}
                      onChange={e => updateBlockContent(selectedBlock.id, key, Number(e.target.value))}
                      style={inputStyle}
                    />
                  </div>
                )
              }
              if (Array.isArray(value) && value.every(v => typeof v === 'string')) {
                return (
                  <div key={key} style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>{key}</label>
                    <textarea
                      value={(value as string[]).join('\n')}
                      onChange={e => updateBlockContent(selectedBlock.id, key, e.target.value.split('\n'))}
                      rows={Math.min(value.length + 1, 8)}
                      style={textareaStyle}
                    />
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

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 10,
  letterSpacing: '0.2em',
  color: 'rgba(232,237,242,0.4)',
  textTransform: 'uppercase',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  background: 'rgba(0,194,203,0.06)',
  border: '1px solid rgba(0,194,203,0.15)',
  borderRadius: 4,
  color: '#FFFFFF',
  fontSize: 13,
  fontFamily: "'Inter', sans-serif",
  outline: 'none',
}

const textareaStyle: React.CSSProperties = {
  ...{
    width: '100%',
    padding: '8px 10px',
    background: 'rgba(0,194,203,0.06)',
    border: '1px solid rgba(0,194,203,0.15)',
    borderRadius: 4,
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    resize: 'vertical' as const,
  },
}

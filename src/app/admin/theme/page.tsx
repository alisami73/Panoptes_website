'use client'

import React, { useState, useEffect } from 'react'

interface Theme {
  id: string
  background: string
  accent: string
  textColor: string
  secondary: string
}

export default function AdminThemePage() {
  const [theme, setTheme] = useState<Theme>({ id: 'default', background: '#0D1B2A', accent: '#00C2CB', textColor: '#FFFFFF', secondary: '#E8EDF2' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)

  useEffect(() => {
    fetch('/api/admin/theme').then(r => r.json()).then(d => { if (d) setTheme(d); setLoading(false) })
  }, [])

  async function save() {
    setSaving(true)
    await fetch('/api/admin/theme', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(theme),
    })
    setSaving(false)
    setSavedOk(true)
    setTimeout(() => setSavedOk(false), 2000)
  }

  const colors = [
    { key: 'background', label: 'Background', desc: 'Couleur de fond principale' },
    { key: 'accent', label: 'Accent', desc: 'Couleur cyan — highlights, titres' },
    { key: 'textColor', label: 'Texte', desc: 'Couleur de texte principale' },
    { key: 'secondary', label: 'Secondaire', desc: 'Texte secondaire / gris clair' },
  ]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(0,194,203,0.1)', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.25em', color: '#00C2CB', textTransform: 'uppercase', marginBottom: 4 }}>
            Configuration
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 28, color: '#FFFFFF', margin: 0 }}>
            Thème global
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {savedOk && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#00C2CB' }}>✓ Sauvegardé</span>}
          <button
            onClick={save}
            disabled={saving}
            style={{
              background: saving ? 'rgba(0,194,203,0.4)' : '#00C2CB',
              color: '#0D1B2A',
              fontWeight: 700,
              padding: '10px 24px',
              borderRadius: 6,
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 14,
            }}
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 32, color: 'rgba(232,237,242,0.4)', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>Chargement...</div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, maxWidth: 800 }}>
            {colors.map(({ key, label, desc }) => (
              <div
                key={key}
                style={{
                  background: 'rgba(0,194,203,0.04)',
                  border: '1px solid rgba(0,194,203,0.12)',
                  borderRadius: 8,
                  padding: 24,
                }}
              >
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 18, color: '#FFFFFF', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, color: 'rgba(232,237,242,0.55)', marginBottom: 20 }}>{desc}</div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <input
                    type="color"
                    value={(theme as any)[key]}
                    onChange={e => setTheme({ ...theme, [key]: e.target.value })}
                    style={{ width: 64, height: 64, borderRadius: 8, border: '2px solid rgba(0,194,203,0.3)', background: 'transparent', cursor: 'pointer' }}
                  />
                  <div>
                    <div
                      style={{
                        width: 160,
                        height: 40,
                        borderRadius: 6,
                        background: (theme as any)[key],
                        border: '1px solid rgba(255,255,255,0.1)',
                        marginBottom: 8,
                      }}
                    />
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: '#00C2CB' }}>
                      {(theme as any)[key]}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Preview strip */}
          <div style={{ marginTop: 40, maxWidth: 800 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.25em', color: 'rgba(232,237,242,0.35)', textTransform: 'uppercase', marginBottom: 16 }}>
              APERÇU
            </div>
            <div
              style={{
                background: theme.background,
                border: '1px solid rgba(0,194,203,0.2)',
                borderRadius: 8,
                padding: 32,
              }}
            >
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.3em', color: theme.accent, textTransform: 'uppercase', marginBottom: 12 }}>
                PANOPTES · REAL-TIME HEALTH INTELLIGENCE
              </div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 48, color: theme.textColor, marginBottom: 16 }}>
                The first nervous system<br />for public health.
              </div>
              <div style={{ fontSize: 18, color: theme.secondary, opacity: 0.8, lineHeight: 1.5 }}>
                PANOPTES transforms 14,000+ pharmacy transactions into real-time epidemiological intelligence.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useEffect, useMemo, useState } from 'react'

interface ConsentVersionRecord {
  version: string
  text: string
  textHash: string
  originalFileHash: string
  sourceFileName: string
  publishedAt: string
  publishedBy: string | null
}

interface AdminConsentState {
  draftText: string
  draftHash: string
  hasUnpublishedChanges: boolean
  updatedAt: string
  updatedBy: string | null
  currentVersion: ConsentVersionRecord
  versions: ConsentVersionRecord[]
}

function normalizeConsentText(text: string) {
  return String(text || '').replace(/\r\n/g, '\n').trim()
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export default function AdminConsentsPage() {
  const [state, setState] = useState<AdminConsentState | null>(null)
  const [draftText, setDraftText] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<ConsentVersionRecord | null>(null)
  const [liveDraftHash, setLiveDraftHash] = useState('')

  async function load() {
    setLoading(true)
    setFeedback(null)

    const response = await fetch('/api/admin/consents', { cache: 'no-store' })
    if (!response.ok) {
      setLoading(false)
      setFeedback('Impossible de charger le registre des consentements.')
      return
    }

    const nextState = await response.json() as AdminConsentState
    setState(nextState)
    setDraftText(nextState.draftText)
    setSelectedVersion(nextState.currentVersion)
    setLoading(false)
  }

  useEffect(() => {
    load().catch(() => {
      setLoading(false)
      setFeedback('Impossible de charger le registre des consentements.')
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    const normalized = normalizeConsentText(draftText)

    if (!normalized) {
      setLiveDraftHash('')
      return
    }

    async function computeHash() {
      const payload = new TextEncoder().encode(normalized)
      const digest = await window.crypto.subtle.digest('SHA-256', payload)
      const hash = Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('')
      if (!cancelled) setLiveDraftHash(hash)
    }

    computeHash().catch(() => {
      if (!cancelled) setLiveDraftHash('')
    })

    return () => {
      cancelled = true
    }
  }, [draftText])

  const versions = useMemo(() => {
    return state ? [...state.versions].sort((a, b) => Number(b.version.slice(1)) - Number(a.version.slice(1))) : []
  }, [state])

  const hasLiveUnpublishedChanges = state
    ? Boolean(liveDraftHash) &&
      (liveDraftHash !== state.currentVersion.textHash ||
        normalizeConsentText(draftText) !== normalizeConsentText(state.currentVersion.text))
    : false

  async function saveDraft() {
    setSaving(true)
    setFeedback(null)

    const response = await fetch('/api/admin/consents', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: draftText }),
    })

    const payload = await response.json()
    setSaving(false)

    if (!response.ok) {
      setFeedback(payload.error || 'La sauvegarde du brouillon a échoué.')
      return
    }

    setState(payload.state)
    setDraftText(payload.state.draftText)
    setFeedback('Brouillon sauvegardé.')
  }

  async function publishDraft() {
    setPublishing(true)
    setFeedback(null)

    const response = await fetch('/api/admin/consents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: draftText }),
    })

    const payload = await response.json()
    setPublishing(false)

    if (!response.ok) {
      setFeedback(payload.error || 'La publication a échoué.')
      return
    }

    setState(payload.state)
    setDraftText(payload.state.draftText)
    setSelectedVersion(payload.state.currentVersion)
    setFeedback(payload.createdVersion ? `Nouvelle version publiée: ${payload.state.currentVersion.version}.` : 'Aucun changement de hash: version courante conservée.')
  }

  if (loading) {
    return (
      <div style={{ padding: 32, color: 'rgba(232,237,242,0.45)', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
        Chargement du registre des consentements...
      </div>
    )
  }

  if (!state) {
    return (
      <div style={{ padding: 32, color: '#ff8f96', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
        {feedback || 'Le registre des consentements est indisponible.'}
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(0,194,203,0.1)', flexShrink: 0 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.25em', color: '#00C2CB', textTransform: 'uppercase', marginBottom: 4 }}>
          Compliance
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 28, color: '#FFFFFF', margin: 0 }}>
              Consentements / Terms of Use
            </h1>
            <p style={{ margin: '10px 0 0', color: 'rgba(232,237,242,0.58)', maxWidth: 720, lineHeight: 1.6 }}>
              Gère le texte de consentement affiché publiquement, son versioning, et le hash SHA-256 du snapshot canonique
              publié dans Panoptes.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {feedback && (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: feedback.includes('échoué') ? '#ff8f96' : '#00C2CB' }}>
                {feedback}
              </span>
            )}
            <button
              onClick={saveDraft}
              disabled={saving || publishing}
              style={{
                background: 'rgba(0,194,203,0.1)',
                color: '#00C2CB',
                border: '1px solid rgba(0,194,203,0.22)',
                fontWeight: 600,
                padding: '10px 18px',
                borderRadius: 8,
                cursor: saving || publishing ? 'not-allowed' : 'pointer',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 14,
              }}
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder le brouillon'}
            </button>
            <button
              onClick={publishDraft}
              disabled={saving || publishing}
              style={{
                background: publishing ? 'rgba(0,194,203,0.4)' : '#00C2CB',
                color: '#0D1B2A',
                fontWeight: 700,
                padding: '10px 18px',
                borderRadius: 8,
                border: 'none',
                cursor: saving || publishing ? 'not-allowed' : 'pointer',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 14,
              }}
            >
              {publishing ? 'Publication...' : 'Publier une nouvelle version'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
            { label: 'Version courante', value: state.currentVersion.version, sub: formatDate(state.currentVersion.publishedAt) },
            { label: 'Hash publié', value: state.currentVersion.textHash.slice(0, 16) + '…', sub: state.currentVersion.sourceFileName },
            { label: 'Brouillon', value: hasLiveUnpublishedChanges ? 'À publier' : 'Synchronisé', sub: formatDate(state.updatedAt) },
            { label: 'Historique', value: String(state.versions.length), sub: 'versions archivées' },
          ].map(card => (
            <div
              key={card.label}
              style={{
                background: 'rgba(0,194,203,0.04)',
                border: '1px solid rgba(0,194,203,0.12)',
                borderRadius: 12,
                padding: 18,
              }}
            >
              <div style={{ fontSize: 11, color: 'rgba(232,237,242,0.48)', textTransform: 'uppercase', letterSpacing: '0.16em', fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
                {card.label}
              </div>
              <div style={{ color: '#FFFFFF', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 22, wordBreak: 'break-word' }}>
                {card.value}
              </div>
              <div style={{ marginTop: 6, color: 'rgba(232,237,242,0.42)', fontSize: 12 }}>{card.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24, alignItems: 'start' }}>
          <div
            style={{
              background: 'rgba(0,194,203,0.04)',
              border: '1px solid rgba(0,194,203,0.12)',
              borderRadius: 12,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline', marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 20, color: '#FFFFFF' }}>
                  Texte de consentement
                </div>
                <div style={{ fontSize: 13, color: 'rgba(232,237,242,0.52)', marginTop: 4 }}>
                  Le hash est calculé sur le snapshot exact publié. Le fichier canonique est nommé automatiquement en
                  `panoptes-consent-vX.txt`.
                </div>
              </div>

              <button
                onClick={() => setDraftText(state.currentVersion.text)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(232,237,242,0.14)',
                  background: 'transparent',
                  color: 'rgba(232,237,242,0.65)',
                  cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                }}
              >
                Recharger la version publiée
              </button>
            </div>

            <textarea
              value={draftText}
              onChange={event => setDraftText(event.target.value)}
              style={{
                width: '100%',
                minHeight: 320,
                padding: 18,
                resize: 'vertical',
                borderRadius: 10,
                border: '1px solid rgba(0,194,203,0.18)',
                background: 'rgba(255,255,255,0.02)',
                color: '#FFFFFF',
                fontSize: 15,
                lineHeight: 1.7,
                fontFamily: "'Inter', sans-serif",
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
              <MetaCard label="Hash brouillon" value={liveDraftHash || state.draftHash} />
              <MetaCard label="Hash publié" value={state.currentVersion.originalFileHash} />
            </div>
          </div>

          <div style={{ display: 'grid', gap: 24 }}>
            <div
              style={{
                background: 'rgba(0,194,203,0.04)',
                border: '1px solid rgba(0,194,203,0.12)',
                borderRadius: 12,
                padding: 24,
              }}
            >
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 20, color: '#FFFFFF', marginBottom: 12 }}>
                Aperçu publié
              </div>
              <div style={{ marginBottom: 12, color: '#00C2CB', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                {state.currentVersion.version} · {state.currentVersion.sourceFileName}
              </div>
              <div
                style={{
                  whiteSpace: 'pre-line',
                  color: 'rgba(232,237,242,0.82)',
                  lineHeight: 1.75,
                  fontSize: 14,
                  maxHeight: 320,
                  overflowY: 'auto',
                  padding: 16,
                  borderRadius: 10,
                  border: '1px solid rgba(0,194,203,0.12)',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                {state.currentVersion.text}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(0,194,203,0.04)',
                border: '1px solid rgba(0,194,203,0.12)',
                borderRadius: 12,
                padding: 24,
              }}
            >
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 20, color: '#FFFFFF', marginBottom: 12 }}>
                Historique des versions
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {versions.map(version => (
                  <div
                    key={version.version}
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      border: '1px solid rgba(0,194,203,0.1)',
                      background: selectedVersion?.version === version.version ? 'rgba(0,194,203,0.08)' : 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ color: '#FFFFFF', fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>
                          {version.version}
                        </div>
                        <div style={{ marginTop: 4, color: 'rgba(232,237,242,0.44)', fontSize: 12 }}>
                          {formatDate(version.publishedAt)} · {version.sourceFileName}
                        </div>
                        <div style={{ marginTop: 8, color: '#00C2CB', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, wordBreak: 'break-all' }}>
                          {version.originalFileHash}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setSelectedVersion(version)}
                          style={ghostButtonStyle}
                        >
                          Voir
                        </button>
                        <button
                          onClick={() => setDraftText(version.text)}
                          style={ghostButtonStyle}
                        >
                          Charger
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {selectedVersion && (
          <div
            style={{
              marginTop: 24,
              background: 'rgba(0,194,203,0.04)',
              border: '1px solid rgba(0,194,203,0.12)',
              borderRadius: 12,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline', marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 20, color: '#FFFFFF' }}>
                  Snapshot {selectedVersion.version}
                </div>
                <div style={{ marginTop: 4, color: 'rgba(232,237,242,0.44)', fontSize: 12 }}>
                  {selectedVersion.sourceFileName} · publié {formatDate(selectedVersion.publishedAt)}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: 16,
                borderRadius: 10,
                border: '1px solid rgba(0,194,203,0.12)',
                background: 'rgba(255,255,255,0.02)',
                color: 'rgba(232,237,242,0.82)',
                lineHeight: 1.75,
                whiteSpace: 'pre-line',
              }}
            >
              {selectedVersion.text}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 10,
        border: '1px solid rgba(0,194,203,0.12)',
        background: 'rgba(255,255,255,0.02)',
      }}
    >
      <div style={{ color: 'rgba(232,237,242,0.42)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ color: '#00C2CB', fontSize: 12, fontFamily: "'JetBrains Mono', monospace", wordBreak: 'break-all' }}>
        {value}
      </div>
    </div>
  )
}

const ghostButtonStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid rgba(232,237,242,0.14)',
  background: 'transparent',
  color: 'rgba(232,237,242,0.7)',
  cursor: 'pointer',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
}

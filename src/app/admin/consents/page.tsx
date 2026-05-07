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

interface ConsentAcceptanceRecord {
  id: string
  visitorId: string
  version: string
  textHash: string
  originalFileHash: string
  sourceFileName: string
  acceptedAt: string
  pathname: string | null
  ipHash: string | null
  userAgent: string | null
}

interface ConsentAcceptanceSummary {
  totalRecords: number
  uniqueVisitors: number
  currentVersionAccepted: number
  latestAcceptedAt: string | null
}

interface ConsentAdminPayload {
  state: AdminConsentState
  acceptanceSummary: ConsentAcceptanceSummary
  recentAcceptances: ConsentAcceptanceRecord[]
}

function normalizeConsentText(text: string) {
  return String(text || '').replace(/\r\n/g, '\n').trim()
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function shortHash(value: string) {
  return value ? `${value.slice(0, 16)}…` : '—'
}

export default function AdminConsentsPage() {
  const [payload, setPayload] = useState<ConsentAdminPayload | null>(null)
  const [draftText, setDraftText] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [rollingBackVersion, setRollingBackVersion] = useState<string | null>(null)
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

    const nextPayload = await response.json() as ConsentAdminPayload
    setPayload(nextPayload)
    setDraftText(nextPayload.state.draftText)
    setSelectedVersion(nextPayload.state.currentVersion)
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

  const state = payload?.state || null

  const versions = useMemo(() => {
    return state
      ? [...state.versions].sort((a, b) => Number(b.version.slice(1)) - Number(a.version.slice(1)))
      : []
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

    const body = await response.json()
    setSaving(false)

    if (!response.ok) {
      setFeedback(body.error || 'La sauvegarde du brouillon a échoué.')
      return
    }

    await load()
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

    const body = await response.json()
    setPublishing(false)

    if (!response.ok) {
      setFeedback(body.error || 'La publication a échoué.')
      return
    }

    await load()
    setFeedback(body.createdVersion ? `Nouvelle version publiée: ${body.state.currentVersion.version}.` : 'Version courante inchangée: même hash publié.')
  }

  async function rollback(version: string) {
    setRollingBackVersion(version)
    setFeedback(null)

    const response = await fetch('/api/admin/consents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'rollback', version }),
    })

    const body = await response.json()
    setRollingBackVersion(null)

    if (!response.ok) {
      setFeedback(body.error || 'Le rollback a échoué.')
      return
    }

    await load()
    setFeedback(`Rollback effectué depuis ${version}. Nouvelle version publiée: ${body.state.currentVersion.version}.`)
  }

  if (loading) {
    return (
      <div style={{ padding: 32, color: 'rgba(232,237,242,0.45)', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
        Chargement du registre des consentements...
      </div>
    )
  }

  if (!payload || !state) {
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
            <p style={{ margin: '10px 0 0', color: 'rgba(232,237,242,0.58)', maxWidth: 760, lineHeight: 1.6 }}>
              Édite le texte, publie des versions hashées, relance une version antérieure par rollback, et consulte les
              acceptations enregistrées côté serveur.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {feedback && (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: feedback.includes('échoué') ? '#ff8f96' : '#00C2CB' }}>
                {feedback}
              </span>
            )}
            <button onClick={saveDraft} disabled={saving || publishing || Boolean(rollingBackVersion)} style={secondaryActionButton(saving || publishing || Boolean(rollingBackVersion))}>
              {saving ? 'Sauvegarde...' : 'Sauvegarder le brouillon'}
            </button>
            <button onClick={publishDraft} disabled={saving || publishing || Boolean(rollingBackVersion)} style={primaryActionButton(saving || publishing || Boolean(rollingBackVersion))}>
              {publishing ? 'Publication...' : 'Publier une nouvelle version'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Version courante', value: state.currentVersion.version, sub: formatDate(state.currentVersion.publishedAt) },
            { label: 'Hash publié', value: shortHash(state.currentVersion.textHash), sub: state.currentVersion.sourceFileName },
            { label: 'Brouillon', value: hasLiveUnpublishedChanges ? 'À publier' : 'Synchronisé', sub: formatDate(state.updatedAt) },
            { label: 'Acceptations', value: String(payload.acceptanceSummary.currentVersionAccepted), sub: 'version courante' },
            { label: 'Visiteurs suivis', value: String(payload.acceptanceSummary.uniqueVisitors), sub: `${payload.acceptanceSummary.totalRecords} enregistrements` },
          ].map(card => (
            <div key={card.label} style={summaryCardStyle}>
              <div style={summaryLabelStyle}>{card.label}</div>
              <div style={summaryValueStyle}>{card.value}</div>
              <div style={summarySubStyle}>{card.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'start' }}>
          <div style={panelStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline', marginBottom: 12 }}>
              <div>
                <div style={panelTitleStyle}>Texte de consentement</div>
                <div style={panelSubStyle}>
                  Le hash du brouillon est recalculé en direct. Le hash publié et l’`originalFileHash` suivent le snapshot
                  exact accepté par les visiteurs.
                </div>
              </div>

              <button
                onClick={() => setDraftText(state.currentVersion.text)}
                style={ghostButtonStyle}
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
              <MetaCard label="Original file hash publié" value={state.currentVersion.originalFileHash} />
            </div>
          </div>

          <div style={{ display: 'grid', gap: 24 }}>
            <div style={panelStyle}>
              <div style={panelTitleStyle}>Aperçu publié</div>
              <div style={{ marginBottom: 12, color: '#00C2CB', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                {state.currentVersion.version} · {state.currentVersion.sourceFileName}
              </div>
              <div style={snapshotBoxStyle}>
                {state.currentVersion.text}
              </div>
            </div>

            <div style={panelStyle}>
              <div style={panelTitleStyle}>Historique des versions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {versions.map(version => (
                  <div key={version.version} style={{ ...versionCardStyle, background: selectedVersion?.version === version.version ? 'rgba(0,194,203,0.08)' : 'rgba(255,255,255,0.02)' }}>
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
                        <button onClick={() => setSelectedVersion(version)} style={ghostButtonStyle}>Voir</button>
                        <button onClick={() => setDraftText(version.text)} style={ghostButtonStyle}>Charger</button>
                        <button
                          onClick={() => rollback(version.version)}
                          disabled={rollingBackVersion === version.version || version.version === state.currentVersion.version}
                          style={ghostButtonStyle}
                        >
                          {rollingBackVersion === version.version ? 'Rollback...' : 'Rollback'}
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
          <div style={{ ...panelStyle, marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline', marginBottom: 12 }}>
              <div>
                <div style={panelTitleStyle}>Snapshot {selectedVersion.version}</div>
                <div style={panelSubStyle}>
                  {selectedVersion.sourceFileName} · publié {formatDate(selectedVersion.publishedAt)}
                </div>
              </div>
            </div>
            <div style={snapshotBoxStyle}>{selectedVersion.text}</div>
          </div>
        )}

        <div style={{ ...panelStyle, marginTop: 24 }}>
          <div style={panelTitleStyle}>Acceptations enregistrées côté serveur</div>
          <div style={panelSubStyle}>
            Les clics d’acceptation sont persistés serveur avec la version, le hash publié, un identifiant visiteur et la
            route d’origine.
          </div>

          {payload.recentAcceptances.length === 0 ? (
            <div style={{ marginTop: 18, color: 'rgba(232,237,242,0.45)', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
              Aucune acceptation enregistrée pour le moment.
            </div>
          ) : (
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {payload.recentAcceptances.map(record => (
                <div key={record.id} style={versionCardStyle}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.7fr 1fr 1.1fr', gap: 14 }}>
                    <div>
                      <div style={rowLabelStyle}>Visitor</div>
                      <div style={monoValueStyle}>{record.visitorId}</div>
                    </div>
                    <div>
                      <div style={rowLabelStyle}>Version</div>
                      <div style={{ color: '#FFFFFF', fontWeight: 600 }}>{record.version}</div>
                    </div>
                    <div>
                      <div style={rowLabelStyle}>Accepted at</div>
                      <div style={{ color: 'rgba(232,237,242,0.78)' }}>{formatDate(record.acceptedAt)}</div>
                    </div>
                    <div>
                      <div style={rowLabelStyle}>Path</div>
                      <div style={{ color: 'rgba(232,237,242,0.78)', wordBreak: 'break-word' }}>{record.pathname || '—'}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <div style={rowLabelStyle}>Original file hash</div>
                      <div style={monoValueStyle}>{record.originalFileHash}</div>
                    </div>
                    <div>
                      <div style={rowLabelStyle}>User agent</div>
                      <div style={{ color: 'rgba(232,237,242,0.58)', fontSize: 12, lineHeight: 1.5 }}>{record.userAgent || '—'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={metaCardStyle}>
      <div style={summaryLabelStyle}>{label}</div>
      <div style={monoValueStyle}>{value}</div>
    </div>
  )
}

function primaryActionButton(disabled: boolean): React.CSSProperties {
  return {
    background: disabled ? 'rgba(0,194,203,0.4)' : '#00C2CB',
    color: '#0D1B2A',
    fontWeight: 700,
    padding: '10px 18px',
    borderRadius: 8,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 14,
  }
}

function secondaryActionButton(disabled: boolean): React.CSSProperties {
  return {
    background: 'rgba(0,194,203,0.1)',
    color: '#00C2CB',
    border: '1px solid rgba(0,194,203,0.22)',
    fontWeight: 600,
    padding: '10px 18px',
    borderRadius: 8,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 14,
  }
}

const panelStyle: React.CSSProperties = {
  background: 'rgba(0,194,203,0.04)',
  border: '1px solid rgba(0,194,203,0.12)',
  borderRadius: 12,
  padding: 24,
}

const panelTitleStyle: React.CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 600,
  fontSize: 20,
  color: '#FFFFFF',
}

const panelSubStyle: React.CSSProperties = {
  marginTop: 6,
  color: 'rgba(232,237,242,0.52)',
  fontSize: 13,
  lineHeight: 1.6,
}

const summaryCardStyle: React.CSSProperties = {
  background: 'rgba(0,194,203,0.04)',
  border: '1px solid rgba(0,194,203,0.12)',
  borderRadius: 12,
  padding: 18,
}

const summaryLabelStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'rgba(232,237,242,0.48)',
  textTransform: 'uppercase',
  letterSpacing: '0.16em',
  fontFamily: "'JetBrains Mono', monospace",
  marginBottom: 6,
}

const summaryValueStyle: React.CSSProperties = {
  color: '#FFFFFF',
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 600,
  fontSize: 22,
  wordBreak: 'break-word',
}

const summarySubStyle: React.CSSProperties = {
  marginTop: 6,
  color: 'rgba(232,237,242,0.42)',
  fontSize: 12,
}

const metaCardStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 10,
  border: '1px solid rgba(0,194,203,0.12)',
  background: 'rgba(255,255,255,0.02)',
}

const snapshotBoxStyle: React.CSSProperties = {
  marginTop: 12,
  padding: 16,
  borderRadius: 10,
  border: '1px solid rgba(0,194,203,0.12)',
  background: 'rgba(255,255,255,0.02)',
  color: 'rgba(232,237,242,0.82)',
  lineHeight: 1.75,
  whiteSpace: 'pre-line',
  maxHeight: 320,
  overflowY: 'auto',
}

const versionCardStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 10,
  border: '1px solid rgba(0,194,203,0.1)',
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

const rowLabelStyle: React.CSSProperties = {
  color: 'rgba(232,237,242,0.42)',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
  fontFamily: "'JetBrains Mono', monospace",
  marginBottom: 6,
}

const monoValueStyle: React.CSSProperties = {
  color: '#00C2CB',
  fontSize: 11,
  fontFamily: "'JetBrains Mono', monospace",
  wordBreak: 'break-all',
}

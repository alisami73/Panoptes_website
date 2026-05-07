'use client'

import React, { useState, useEffect } from 'react'

interface Token {
  id: string
  email: string
  note: string | null
  token: string
  createdAt: string
  expiresAt: string
  revokedAt: string | null
  lastUsedAt: string | null
}

export default function AdminAccessPage() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newNote, setNewNote] = useState('')
  const [creating, setCreating] = useState(false)
  const APP_URL = typeof window !== 'undefined' ? window.location.origin : ''

  async function load() {
    const res = await fetch('/api/admin/tokens')
    if (res.ok) setTokens(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function createToken() {
    setCreating(true)
    const res = await fetch('/api/admin/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail, note: newNote }),
    })
    if (res.ok) {
      setShowModal(false)
      setNewEmail('')
      setNewNote('')
      await load()
    }
    setCreating(false)
  }

  async function tokenAction(id: string, action: string) {
    await fetch(`/api/admin/tokens/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    await load()
  }

  function getStatus(t: Token) {
    if (t.revokedAt) return { label: 'Révoqué', color: '#ff5060' }
    if (new Date(t.expiresAt) < new Date()) return { label: 'Expiré', color: '#ff9456' }
    return { label: 'Actif', color: '#00C2CB' }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(0,194,203,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.25em', color: '#00C2CB', textTransform: 'uppercase', marginBottom: 4 }}>
            Gestion des Accès
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 28, color: '#FFFFFF', margin: 0 }}>
            Tokens d&apos;accès
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: '#00C2CB',
            color: '#0D1B2A',
            fontWeight: 700,
            padding: '10px 24px',
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 14,
          }}
        >
          + Générer un accès
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
        {loading ? (
          <div style={{ color: 'rgba(232,237,242,0.4)', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>Chargement...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Email', 'Note', 'Créé le', 'Expire le', 'Dernier accès', 'Statut', 'Actions'].map(h => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderBottom: '1px solid rgba(0,194,203,0.12)',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      letterSpacing: '0.2em',
                      color: 'rgba(232,237,242,0.4)',
                      textTransform: 'uppercase',
                      fontWeight: 500,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tokens.map(t => {
                const status = getStatus(t)
                const link = `${APP_URL}/deck?token=${t.token}`
                return (
                  <tr key={t.id} style={{ borderBottom: '1px solid rgba(0,194,203,0.06)' }}>
                    <td style={tdStyle}>{t.email}</td>
                    <td style={{ ...tdStyle, color: 'rgba(232,237,242,0.5)' }}>{t.note || '—'}</td>
                    <td style={{ ...tdStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{new Date(t.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td style={{ ...tdStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{new Date(t.expiresAt).toLocaleDateString('fr-FR')}</td>
                    <td style={{ ...tdStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{t.lastUsedAt ? new Date(t.lastUsedAt).toLocaleDateString('fr-FR') : '—'}</td>
                    <td style={tdStyle}>
                      <span style={{ padding: '3px 10px', borderRadius: 12, background: `${status.color}20`, border: `1px solid ${status.color}40`, color: status.color, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                        {status.label}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <ActionBtn onClick={() => navigator.clipboard.writeText(link)} title="Copier le lien">📋</ActionBtn>
                        <ActionBtn onClick={() => tokenAction(t.id, 'resend')} title="Renvoyer l'email">✉</ActionBtn>
                        <ActionBtn onClick={() => tokenAction(t.id, 'extend')} title="Prolonger 30j">+30j</ActionBtn>
                        {!t.revokedAt && (
                          <ActionBtn onClick={() => tokenAction(t.id, 'revoke')} title="Révoquer" danger>✕</ActionBtn>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div
            style={{
              background: '#0a1422',
              border: '1px solid rgba(0,194,203,0.2)',
              borderRadius: 12,
              padding: 40,
              width: 480,
            }}
          >
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 24, color: '#FFFFFF', margin: '0 0 24px' }}>
              Générer un accès
            </h2>
            <div style={{ marginBottom: 16 }}>
              <label style={modalLabelStyle}>Email destinataire *</label>
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                style={modalInputStyle}
                placeholder="investor@fund.com"
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={modalLabelStyle}>Note (optionnel)</label>
              <input
                type="text"
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                style={modalInputStyle}
                placeholder="Ex: Meeting Sequoia 2026-05-10"
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={createToken}
                disabled={!newEmail || creating}
                style={{
                  flex: 1,
                  background: (!newEmail || creating) ? 'rgba(0,194,203,0.4)' : '#00C2CB',
                  color: '#0D1B2A',
                  fontWeight: 700,
                  padding: '12px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: (!newEmail || creating) ? 'not-allowed' : 'pointer',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 14,
                }}
              >
                {creating ? 'Génération...' : 'Générer & Envoyer'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  border: '1px solid rgba(232,237,242,0.2)',
                  borderRadius: 6,
                  color: 'rgba(232,237,242,0.6)',
                  cursor: 'pointer',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 14,
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const tdStyle: React.CSSProperties = {
  padding: '14px 12px',
  color: '#E8EDF2',
  fontSize: 14,
  verticalAlign: 'middle',
}

const modalLabelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 10,
  letterSpacing: '0.2em',
  color: 'rgba(232,237,242,0.45)',
  textTransform: 'uppercase',
  marginBottom: 8,
}

const modalInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  background: 'rgba(0,194,203,0.06)',
  border: '1px solid rgba(0,194,203,0.2)',
  borderRadius: 6,
  color: '#FFFFFF',
  fontSize: 14,
  outline: 'none',
  fontFamily: "'Inter', sans-serif",
}

function ActionBtn({ onClick, title, children, danger }: { onClick: () => void; title: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: danger ? 'rgba(255,80,96,0.1)' : 'rgba(0,194,203,0.08)',
        border: `1px solid ${danger ? 'rgba(255,80,96,0.2)' : 'rgba(0,194,203,0.15)'}`,
        color: danger ? '#ff5060' : '#00C2CB',
        padding: '4px 10px',
        borderRadius: 4,
        cursor: 'pointer',
        fontSize: 12,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {children}
    </button>
  )
}

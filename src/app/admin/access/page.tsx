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

type ModalStep = 'form' | 'link'

export default function AdminAccessPage() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalStep, setModalStep] = useState<ModalStep>('form')
  const [newEmail, setNewEmail] = useState('')
  const [newNote, setNewNote] = useState('')
  const [sendEmail, setSendEmail] = useState(false)
  const [creating, setCreating] = useState(false)
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)
  const APP_URL = typeof window !== 'undefined' ? window.location.origin : ''

  async function load() {
    const res = await fetch('/api/admin/tokens')
    if (res.ok) setTokens(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openModal() {
    setNewEmail('')
    setNewNote('')
    setSendEmail(false)
    setModalStep('form')
    setGeneratedLink('')
    setCopied(false)
    setShowModal(true)
  }

  async function createToken() {
    setCreating(true)
    const res = await fetch('/api/admin/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail, note: newNote, sendEmail }),
    })
    if (res.ok) {
      const data = await res.json()
      const link = `${APP_URL}/deck?token=${data.token}`
      setGeneratedLink(link)
      setModalStep('link')
      await load()
    }
    setCreating(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
    if (t.revokedAt) return { label: 'Revoked', color: '#ff5060' }
    if (new Date(t.expiresAt) < new Date()) return { label: 'Expired', color: '#ff9456' }
    return { label: 'Active', color: '#00C2CB' }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(0,194,203,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.25em', color: '#00C2CB', textTransform: 'uppercase', marginBottom: 4 }}>
            Access Management
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 28, color: '#FFFFFF', margin: 0 }}>
            Access Tokens
          </h1>
        </div>
        <button
          onClick={openModal}
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
          + Generate Access Link
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
        {loading ? (
          <div style={{ color: 'rgba(232,237,242,0.4)', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>Loading...</div>
        ) : tokens.length === 0 ? (
          <div style={{ color: 'rgba(232,237,242,0.4)', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>No tokens yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Email', 'Note', 'Created', 'Expires', 'Last Used', 'Status', 'Actions'].map(h => (
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
                    <td style={{ ...tdStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{new Date(t.createdAt).toLocaleDateString('en-GB')}</td>
                    <td style={{ ...tdStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{new Date(t.expiresAt).toLocaleDateString('en-GB')}</td>
                    <td style={{ ...tdStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{t.lastUsedAt ? new Date(t.lastUsedAt).toLocaleDateString('en-GB') : '—'}</td>
                    <td style={tdStyle}>
                      <span style={{ padding: '3px 10px', borderRadius: 12, background: `${status.color}20`, border: `1px solid ${status.color}40`, color: status.color, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                        {status.label}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <ActionBtn onClick={() => navigator.clipboard.writeText(link)} title="Copy link">📋</ActionBtn>
                        <ActionBtn onClick={() => tokenAction(t.id, 'resend')} title="Resend email">✉</ActionBtn>
                        <ActionBtn onClick={() => tokenAction(t.id, 'extend')} title="Extend 30 days">+30d</ActionBtn>
                        {!t.revokedAt && (
                          <ActionBtn onClick={() => tokenAction(t.id, 'revoke')} title="Revoke" danger>✕</ActionBtn>
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
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div style={{ background: '#0a1422', border: '1px solid rgba(0,194,203,0.2)', borderRadius: 12, padding: 40, width: 500 }}>

            {modalStep === 'form' ? (
              <>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 24, color: '#FFFFFF', margin: '0 0 8px' }}>
                  Generate Access Link
                </h2>
                <p style={{ color: 'rgba(232,237,242,0.45)', fontSize: 13, margin: '0 0 28px', fontFamily: "'Inter', sans-serif" }}>
                  Creates a 30-day access link you can share directly.
                </p>

                <div style={{ marginBottom: 16 }}>
                  <label style={modalLabelStyle}>Recipient email *</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    style={{ ...modalInputStyle, boxSizing: 'border-box' }}
                    placeholder="investor@fund.com"
                    autoFocus
                  />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={modalLabelStyle}>Note (optional)</label>
                  <input
                    type="text"
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    style={{ ...modalInputStyle, boxSizing: 'border-box' }}
                    placeholder="e.g. Sequoia meeting 2026-05-10"
                  />
                </div>

                {/* Email toggle */}
                <div
                  onClick={() => setSendEmail(v => !v)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: `1px solid ${sendEmail ? 'rgba(0,194,203,0.4)' : 'rgba(232,237,242,0.1)'}`,
                    background: sendEmail ? 'rgba(0,194,203,0.06)' : 'transparent',
                    cursor: 'pointer',
                    marginBottom: 28,
                    userSelect: 'none',
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    border: `2px solid ${sendEmail ? '#00C2CB' : 'rgba(232,237,242,0.3)'}`,
                    background: sendEmail ? '#00C2CB' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>
                    {sendEmail && <span style={{ color: '#0D1B2A', fontSize: 12, fontWeight: 700 }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, color: '#E8EDF2', fontFamily: "'Inter', sans-serif" }}>Also send by email</div>
                    <div style={{ fontSize: 12, color: 'rgba(232,237,242,0.4)', fontFamily: "'Inter', sans-serif", marginTop: 2 }}>Sends the link automatically to the recipient</div>
                  </div>
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
                    {creating ? 'Generating...' : 'Generate Link'}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    style={{ padding: '12px 24px', background: 'transparent', border: '1px solid rgba(232,237,242,0.2)', borderRadius: 6, color: 'rgba(232,237,242,0.6)', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontSize: 14 }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔗</div>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 22, color: '#FFFFFF', margin: '0 0 6px' }}>
                    Link Ready
                  </h2>
                  <p style={{ color: 'rgba(232,237,242,0.45)', fontSize: 13, margin: 0, fontFamily: "'Inter', sans-serif" }}>
                    Valid 30 days · {newEmail}{sendEmail ? ' · Email sent' : ''}
                  </p>
                </div>

                {/* Link display */}
                <div style={{
                  background: 'rgba(0,194,203,0.06)',
                  border: '1px solid rgba(0,194,203,0.2)',
                  borderRadius: 8,
                  padding: '14px 16px',
                  marginBottom: 16,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: '#00C2CB',
                  wordBreak: 'break-all',
                  lineHeight: 1.6,
                }}>
                  {generatedLink}
                </div>

                <button
                  onClick={copyLink}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: copied ? 'rgba(0,194,203,0.2)' : '#00C2CB',
                    color: copied ? '#00C2CB' : '#0D1B2A',
                    border: copied ? '1px solid rgba(0,194,203,0.4)' : 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    marginBottom: 12,
                    transition: 'all 0.2s',
                  }}
                >
                  {copied ? '✓ Copied!' : '📋 Copy Link'}
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid rgba(232,237,242,0.15)', borderRadius: 6, color: 'rgba(232,237,242,0.5)', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontSize: 14 }}
                >
                  Close
                </button>
              </>
            )}
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

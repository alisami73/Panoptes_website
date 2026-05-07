'use client'

import React, { useState, useEffect } from 'react'

interface Request {
  id: string
  name: string
  organization: string
  email: string
  message: string | null
  createdAt: string
  status: string
  accessToken: { token: string } | null
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: '#ff9456' },
  sent: { label: 'Accès envoyé', color: '#00C2CB' },
  rejected: { label: 'Refusé', color: '#ff5060' },
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingId, setSendingId] = useState<string | null>(null)

  async function load() {
    const res = await fetch('/api/admin/requests')
    if (res.ok) setRequests(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function sendAccess(req: Request) {
    setSendingId(req.id)
    await fetch('/api/admin/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: req.email, note: `${req.name} — ${req.organization}`, requestId: req.id }),
    })
    await load()
    setSendingId(null)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(0,194,203,0.1)', flexShrink: 0 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.25em', color: '#00C2CB', textTransform: 'uppercase', marginBottom: 4 }}>
          Demandes d&apos;accès
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 28, color: '#FFFFFF', margin: 0 }}>
          {requests.filter(r => r.status === 'pending').length} en attente
        </h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
        {loading ? (
          <div style={{ color: 'rgba(232,237,242,0.4)', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>Chargement...</div>
        ) : requests.length === 0 ? (
          <div style={{ color: 'rgba(232,237,242,0.3)', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>Aucune demande pour le moment.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {requests.map(req => {
              const statusInfo = STATUS_LABELS[req.status] || STATUS_LABELS.pending
              return (
                <div
                  key={req.id}
                  style={{
                    background: 'rgba(0,194,203,0.04)',
                    border: '1px solid rgba(0,194,203,0.12)',
                    borderRadius: 8,
                    padding: 24,
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 24,
                    alignItems: 'start',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 18, color: '#FFFFFF' }}>{req.name}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#00C2CB' }}>{req.organization}</span>
                      <span style={{ padding: '2px 10px', borderRadius: 12, background: `${statusInfo.color}20`, border: `1px solid ${statusInfo.color}40`, color: statusInfo.color, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#00C2CB', marginBottom: req.message ? 12 : 0 }}>
                      {req.email}
                    </div>
                    {req.message && (
                      <div style={{ fontSize: 14, color: 'rgba(232,237,242,0.65)', lineHeight: 1.5, fontStyle: 'italic' }}>
                        &ldquo;{req.message}&rdquo;
                      </div>
                    )}
                    <div style={{ marginTop: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(232,237,242,0.3)', letterSpacing: '0.15em' }}>
                      {new Date(req.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div>
                    {req.status === 'pending' && (
                      <button
                        onClick={() => sendAccess(req)}
                        disabled={sendingId === req.id}
                        style={{
                          background: sendingId === req.id ? 'rgba(0,194,203,0.4)' : '#00C2CB',
                          color: '#0D1B2A',
                          fontWeight: 700,
                          padding: '10px 20px',
                          borderRadius: 6,
                          border: 'none',
                          cursor: sendingId === req.id ? 'not-allowed' : 'pointer',
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontSize: 13,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {sendingId === req.id ? 'Envoi...' : '→ Envoyer un accès'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

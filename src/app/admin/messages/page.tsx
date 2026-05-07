'use client'

import React, { useState, useEffect } from 'react'

interface Message {
  id: string
  name: string
  email: string
  message: string
  createdAt: string
  read: boolean
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const res = await fetch('/api/admin/messages')
    if (res.ok) setMessages(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function markRead(id: string, read: boolean) {
    await fetch(`/api/admin/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read }),
    })
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, read } : m))
  }

  const unread = messages.filter(m => !m.read).length

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(0,194,203,0.1)', flexShrink: 0 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.25em', color: '#00C2CB', textTransform: 'uppercase', marginBottom: 4 }}>
          Messages de contact
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 28, color: '#FFFFFF', margin: 0 }}>
          {unread > 0 ? `${unread} non lu${unread > 1 ? 's' : ''}` : 'Tous lus'}
        </h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
        {loading ? (
          <div style={{ color: 'rgba(232,237,242,0.4)', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>Chargement...</div>
        ) : messages.length === 0 ? (
          <div style={{ color: 'rgba(232,237,242,0.3)', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>Aucun message pour le moment.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  background: msg.read ? 'rgba(0,194,203,0.02)' : 'rgba(0,194,203,0.06)',
                  border: `1px solid ${msg.read ? 'rgba(0,194,203,0.08)' : 'rgba(0,194,203,0.2)'}`,
                  borderRadius: 8,
                  padding: 24,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                  <div>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 18, color: '#FFFFFF' }}>{msg.name}</span>
                    {!msg.read && (
                      <span style={{ marginLeft: 12, padding: '2px 8px', background: 'rgba(0,194,203,0.15)', border: '1px solid rgba(0,194,203,0.3)', borderRadius: 10, color: '#00C2CB', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
                        NOUVEAU
                      </span>
                    )}
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#00C2CB', marginTop: 4 }}>{msg.email}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a
                      href={`mailto:${msg.email}`}
                      style={{
                        padding: '6px 16px',
                        background: '#00C2CB',
                        color: '#0D1B2A',
                        fontWeight: 700,
                        borderRadius: 4,
                        textDecoration: 'none',
                        fontSize: 12,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      ✉ Répondre
                    </a>
                    <button
                      onClick={() => markRead(msg.id, !msg.read)}
                      style={{
                        padding: '6px 12px',
                        background: 'transparent',
                        border: '1px solid rgba(232,237,242,0.15)',
                        borderRadius: 4,
                        color: 'rgba(232,237,242,0.5)',
                        cursor: 'pointer',
                        fontSize: 11,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {msg.read ? 'Non lu' : 'Lu'}
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: 14, color: 'rgba(232,237,242,0.75)', lineHeight: 1.6 }}>{msg.message}</div>

                <div style={{ marginTop: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(232,237,242,0.3)', letterSpacing: '0.15em' }}>
                  {new Date(msg.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

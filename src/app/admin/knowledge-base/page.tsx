'use client'

import React, { useState } from 'react'

const KB_URL = process.env.NEXT_PUBLIC_KB_DASHBOARD_URL || '/api/admin/kb/'

export default function AdminKnowledgeBasePage() {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        padding: '20px 32px',
        borderBottom: '1px solid rgba(0,194,203,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 22,
            fontWeight: 700,
            color: '#FFFFFF',
            margin: 0,
          }}>
            🧠 Knowledge Base
          </h1>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.15em',
            color: '#00C2CB',
            margin: '4px 0 0',
          }}>
            ARGUS-PANOPTES · INDEXATION THÉRAPEUTIQUE
          </p>
        </div>

        <a
          href={KB_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: '1px solid rgba(0,194,203,0.3)',
            color: '#00C2CB',
            textDecoration: 'none',
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.1em',
          }}
        >
          OUVRIR ↗
        </a>
      </div>

      {/* Iframe container */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {/* Loading state */}
        {!loaded && !error && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0D1B2A',
            zIndex: 1,
          }}>
            <div style={{
              width: 40,
              height: 40,
              border: '3px solid rgba(0,194,203,0.2)',
              borderTop: '3px solid #00C2CB',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: 16,
            }} />
            <p style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              color: 'rgba(0,194,203,0.7)',
              letterSpacing: '0.15em',
            }}>
              CONNEXION AU DASHBOARD…
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0D1B2A',
            padding: 32,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 24 }}>🔌</div>
            <h2 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 22,
              fontWeight: 700,
              color: '#FFFFFF',
              margin: '0 0 12px',
            }}>
              Dashboard hors ligne
            </h2>
            <p style={{
              color: 'rgba(232,237,242,0.5)',
              fontSize: 14,
              maxWidth: 400,
              lineHeight: 1.6,
              margin: '0 0 24px',
            }}>
              Le serveur Knowledge Base n&apos;est pas accessible à l&apos;adresse{' '}
              <code style={{ color: '#00C2CB' }}>{KB_URL}</code>
            </p>
            <div style={{
              background: 'rgba(0,194,203,0.06)',
              border: '1px solid rgba(0,194,203,0.2)',
              borderRadius: 8,
              padding: '16px 24px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              color: '#00C2CB',
              textAlign: 'left',
            }}>
              <div style={{ marginBottom: 4, color: 'rgba(232,237,242,0.4)', fontSize: 10, letterSpacing: '0.1em' }}>CONFIGURATION CLOUD</div>
              <div>Route protégée par session admin</div>
              <div>/api/admin/kb/</div>
            </div>
          </div>
        )}

        {/* The iframe */}
        <iframe
          src={KB_URL}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: error ? 'none' : 'block',
          }}
          onLoad={() => setLoaded(true)}
          onError={() => { setError(true); setLoaded(true) }}
          title="Knowledge Base Dashboard"
          allow="same-origin"
        />
      </div>
    </div>
  )
}

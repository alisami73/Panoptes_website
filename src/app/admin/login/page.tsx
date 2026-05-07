'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.ok) {
      router.push('/admin')
    } else {
      setError('Identifiants invalides')
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0D1B2A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundImage: `
          linear-gradient(180deg, rgba(13,27,42,0.95) 0%, rgba(7,16,28,1) 100%),
          url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 86.6'><path d='M50 0 L100 28.87 L100 86.6 L50 115.47 L0 86.6 L0 28.87 Z M50 5.77 L5 31.74 L5 83.73 L50 109.7 L95 83.73 L95 31.74 Z' fill='none' stroke='%2300C2CB' stroke-width='0.4' opacity='0.18'/></svg>")
        `,
        backgroundSize: 'cover, 60px 51.96px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          width: 400,
          background: 'rgba(10,20,34,0.9)',
          border: '1px solid rgba(0,194,203,0.2)',
          borderRadius: 12,
          padding: 48,
        }}
      >
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: '0.04em',
              color: '#FFFFFF',
            }}
          >
            PANOPTES
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: '0.3em',
              color: '#00C2CB',
              marginTop: 4,
            }}
          >
            ADMIN
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.2em', color: 'rgba(232,237,242,0.5)', textTransform: 'uppercase', marginBottom: 8 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: '100%',
                boxSizing: 'border-box' as const,
                padding: '12px 16px',
                background: 'rgba(0,194,203,0.06)',
                border: '1px solid rgba(0,194,203,0.2)',
                borderRadius: 6,
                color: '#FFFFFF',
                fontSize: 15,
                outline: 'none',
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.2em', color: 'rgba(232,237,242,0.5)', textTransform: 'uppercase', marginBottom: 8 }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                boxSizing: 'border-box' as const,
                padding: '12px 16px',
                background: 'rgba(0,194,203,0.06)',
                border: '1px solid rgba(0,194,203,0.2)',
                borderRadius: 6,
                color: '#FFFFFF',
                fontSize: 15,
                outline: 'none',
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>

          {error && (
            <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(255,80,96,0.1)', border: '1px solid rgba(255,80,96,0.3)', borderRadius: 6, color: '#ff5060', fontSize: 14 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? 'rgba(0,194,203,0.4)' : '#00C2CB',
              color: '#0D1B2A',
              fontWeight: 700,
              border: 'none',
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 15,
              letterSpacing: '0.05em',
            }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface PublicConsentState {
  version: string
  text: string
  textHash: string
  originalFileHash: string
  sourceFileName: string
  publishedAt: string | null
  publishedBy: string | null
  acknowledgedCurrentVersion: boolean
}

export default function SiteConsentManager() {
  const pathname = usePathname()
  const [policy, setPolicy] = useState<PublicConsentState | null>(null)
  const [visible, setVisible] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const shouldHide = useMemo(() => {
    if (!pathname) return false
    return pathname.startsWith('/admin') || pathname === '/cgu' || pathname === '/deck/access-denied'
  }, [pathname])

  useEffect(() => {
    if (shouldHide) {
      setVisible(false)
      return
    }

    let cancelled = false

    async function loadConsent() {
      const response = await fetch('/api/consent/current', { cache: 'no-store' })
      if (!response.ok) return

      const nextPolicy = await response.json() as PublicConsentState
      if (cancelled) return

      setPolicy(nextPolicy)
      setVisible(Boolean(nextPolicy.text) && !nextPolicy.acknowledgedCurrentVersion)
    }

    loadConsent().catch(() => {
      if (!cancelled) setVisible(false)
    })

    return () => {
      cancelled = true
    }
  }, [shouldHide, pathname])

  useEffect(() => {
    if (!visible) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [visible])

  async function acceptConsent() {
    if (!policy || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/consent/ack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pathname }),
      })

      const payload = await response.json()
      if (!response.ok) {
        setError(payload.error || 'Unable to record consent.')
        setSubmitting(false)
        return
      }

      setPolicy(payload.policy)
      setVisible(false)
      setSubmitting(false)
    } catch {
      setError('Unable to record consent.')
      setSubmitting(false)
    }
  }

  if (shouldHide || !policy || !visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3000,
        background: 'rgba(3, 10, 18, 0.84)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          width: 'min(760px, 100%)',
          maxHeight: '88vh',
          overflow: 'hidden',
          borderRadius: 24,
          border: '1px solid rgba(0,194,203,0.24)',
          background: 'linear-gradient(180deg, rgba(13,27,42,0.98) 0%, rgba(8,17,30,0.98) 100%)',
          boxShadow: '0 36px 120px rgba(0,0,0,0.45)',
        }}
      >
        <div style={{ padding: '24px 24px 18px', borderBottom: '1px solid rgba(0,194,203,0.12)' }}>
          <div
            style={{
              marginBottom: 10,
              color: '#00C2CB',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Access Restricted · {policy.version}
          </div>

          <h2
            style={{
              margin: 0,
              color: '#FFFFFF',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(1.6rem, 4vw, 2.3rem)',
              lineHeight: 1.08,
            }}
          >
            Accept the confidentiality and usage terms to continue.
          </h2>
        </div>

        <div style={{ padding: '18px 24px 10px' }}>
          <div
            style={{
              maxHeight: '42vh',
              overflowY: 'auto',
              padding: '0 4px 0 0',
              color: 'rgba(232,237,242,0.88)',
              fontSize: 15,
              lineHeight: 1.8,
              whiteSpace: 'pre-line',
            }}
          >
            {policy.text}
          </div>

          <div
            style={{
              marginTop: 16,
              padding: '14px 16px',
              borderRadius: 12,
              background: 'rgba(0,194,203,0.04)',
              border: '1px solid rgba(0,194,203,0.14)',
              color: 'rgba(232,237,242,0.55)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              lineHeight: 1.7,
            }}
          >
            <div>Source file: {policy.sourceFileName}</div>
            <div>Original file hash: {policy.originalFileHash}</div>
          </div>

          {error && (
            <div style={{ marginTop: 14, color: '#ff8f96', fontSize: 13 }}>
              {error}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            padding: '0 24px 24px',
          }}
        >
          <button
            onClick={acceptConsent}
            disabled={submitting}
            style={{
              background: submitting ? 'rgba(0,194,203,0.4)' : '#00C2CB',
              color: '#0D1B2A',
              fontWeight: 700,
              padding: '13px 18px',
              borderRadius: 999,
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 15,
            }}
          >
            {submitting ? 'Recording...' : 'Continue and Accept'}
          </button>

          <Link
            href="/cgu"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '13px 18px',
              borderRadius: 999,
              border: '1px solid rgba(0,194,203,0.26)',
              color: '#00C2CB',
              textDecoration: 'none',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Open Full Terms
          </Link>
        </div>
      </div>
    </div>
  )
}

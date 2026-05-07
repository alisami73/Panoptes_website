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
}

const STORAGE_KEY = 'panoptes-consent-ack'

function hasAcceptedCurrentVersion(policy: PublicConsentState) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false

    const parsed = JSON.parse(raw) as { version?: string; textHash?: string }
    return parsed.version === policy.version && parsed.textHash === policy.textHash
  } catch {
    return false
  }
}

export default function SiteConsentManager() {
  const pathname = usePathname()
  const [policy, setPolicy] = useState<PublicConsentState | null>(null)
  const [visible, setVisible] = useState(false)

  const shouldHide = useMemo(() => {
    if (!pathname) return false
    return pathname.startsWith('/admin')
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
      setVisible(Boolean(nextPolicy.text) && !hasAcceptedCurrentVersion(nextPolicy))
    }

    loadConsent().catch(() => {
      if (!cancelled) setVisible(false)
    })

    return () => {
      cancelled = true
    }
  }, [shouldHide, pathname])

  function acceptConsent() {
    if (!policy) return

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: policy.version,
        textHash: policy.textHash,
        acceptedAt: new Date().toISOString(),
      }),
    )

    setVisible(false)
  }

  if (shouldHide || !policy || !visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        width: 'min(560px, calc(100vw - 32px))',
        zIndex: 2000,
        borderRadius: 18,
        border: '1px solid rgba(0,194,203,0.24)',
        background: 'rgba(6,16,29,0.94)',
        boxShadow: '0 26px 80px rgba(0,0,0,0.38)',
        backdropFilter: 'blur(18px)',
      }}
    >
      <div style={{ padding: '18px 18px 14px' }}>
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
          Confidential Access · {policy.version}
        </div>

        <div
          style={{
            maxHeight: '42vh',
            overflowY: 'auto',
            paddingRight: 4,
            color: 'rgba(232,237,242,0.88)',
            fontSize: 14,
            lineHeight: 1.75,
            whiteSpace: 'pre-line',
          }}
        >
          {policy.text}
        </div>

        <div
          style={{
            marginTop: 14,
            color: 'rgba(232,237,242,0.48)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Source file: {policy.sourceFileName}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          padding: '0 18px 18px',
        }}
      >
        <button
          onClick={acceptConsent}
          style={{
            background: '#00C2CB',
            color: '#0D1B2A',
            fontWeight: 700,
            padding: '12px 18px',
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 14,
          }}
        >
          Continue
        </button>

        <Link
          href="/cgu"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 18px',
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
          Read Full Terms
        </Link>
      </div>
    </div>
  )
}

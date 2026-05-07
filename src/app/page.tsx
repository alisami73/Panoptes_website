'use client'

import React, { useState } from 'react'

export default function HomePage() {
  const [accessForm, setAccessForm] = useState({ name: '', organization: '', email: '', message: '' })
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [accessStatus, setAccessStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function submitAccessRequest(e: React.FormEvent) {
    e.preventDefault()
    setAccessStatus('sending')
    try {
      const res = await fetch('/api/access-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accessForm),
      })
      if (!res.ok) throw new Error()
      setAccessStatus('sent')
      setAccessForm({ name: '', organization: '', email: '', message: '' })
    } catch {
      setAccessStatus('error')
    }
  }

  async function submitContact(e: React.FormEvent) {
    e.preventDefault()
    setContactStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      })
      if (!res.ok) throw new Error()
      setContactStatus('sent')
      setContactForm({ name: '', email: '', message: '' })
    } catch {
      setContactStatus('error')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D1B2A', color: '#FFFFFF' }}>
      {/* Hex background */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `
            linear-gradient(180deg, rgba(13,27,42,0.95) 0%, rgba(7,16,28,1) 100%),
            url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 86.6'><path d='M50 0 L100 28.87 L100 86.6 L50 115.47 L0 86.6 L0 28.87 Z M50 5.77 L5 31.74 L5 83.73 L50 109.7 L95 83.73 L95 31.74 Z' fill='none' stroke='%2300C2CB' stroke-width='0.4' opacity='0.18'/></svg>")
          `,
          backgroundSize: 'cover, 60px 51.96px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Glow */}
      <div
        style={{
          position: 'fixed',
          width: 800,
          height: 800,
          borderRadius: '50%',
          filter: 'blur(120px)',
          opacity: 0.2,
          top: -200,
          right: -200,
          background: 'radial-gradient(circle, #00C2CB 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Nav */}
        <nav
          style={{
            padding: '24px 64px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(0,194,203,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <svg width={32} height={32} viewBox="0 0 88 88">
              <defs>
                <radialGradient id="iris" cx="42%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#a8e6ff" />
                  <stop offset="40%" stopColor="#00C2CB" />
                  <stop offset="100%" stopColor="#0a2754" />
                </radialGradient>
              </defs>
              <ellipse cx="44" cy="44" rx="40" ry="22" fill="none" stroke="#00C2CB" strokeWidth="2.5" transform="rotate(-12 44 44)" />
              <circle cx="44" cy="44" r="14" fill="url(#iris)" />
              <circle cx="44" cy="44" r="6" fill="#0D1B2A" />
              <circle cx="40" cy="40" r="2" fill="#fff" opacity={0.9} />
            </svg>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: '0.04em' }}>PANOPTES</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.25em', color: '#00C2CB' }}>BLINK PHARMA</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a
              href="/map"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 16px',
                border: '1px solid rgba(0,194,203,0.3)',
                borderRadius: 999,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.15em',
                color: '#00C2CB',
                textDecoration: 'none',
                textTransform: 'uppercase',
                background: 'rgba(0,194,203,0.06)',
              }}
            >
              Epi Map →
            </a>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 16px',
                border: '1px solid rgba(0,194,203,0.3)',
                borderRadius: 999,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.25em',
                color: '#00C2CB',
                textTransform: 'uppercase',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#00C2CB',
                  boxShadow: '0 0 10px #00C2CB',
                  display: 'inline-block',
                }}
                className="pulse-dot"
              />
              LIVE
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ padding: '120px 64px 80px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: '0.3em', color: '#00C2CB', textTransform: 'uppercase', marginBottom: 24 }}>
            Real-Time Health Intelligence
          </div>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 88,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
              margin: '0 0 32px',
              maxWidth: 900,
            }}
          >
            The first nervous system for public health.
          </h1>
          <p
            style={{
              fontSize: 22,
              lineHeight: 1.5,
              color: '#E8EDF2',
              opacity: 0.8,
              maxWidth: 680,
              margin: '0 0 56px',
            }}
          >
            PANOPTES transforms 14,000+ pharmacy transactions into real-time epidemiological intelligence —
            detecting outbreaks 9 days before conventional surveillance.
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a
              href="#access"
              style={{
                display: 'inline-block',
                background: '#00C2CB',
                color: '#0D1B2A',
                fontWeight: 700,
                padding: '16px 40px',
                borderRadius: 6,
                textDecoration: 'none',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 16,
                letterSpacing: '0.05em',
              }}
            >
              Request Access
            </a>
            <a
              href="#contact"
              style={{
                display: 'inline-block',
                border: '1px solid rgba(0,194,203,0.3)',
                color: '#00C2CB',
                fontWeight: 600,
                padding: '16px 40px',
                borderRadius: 6,
                textDecoration: 'none',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 16,
                letterSpacing: '0.05em',
              }}
            >
              Contact Us
            </a>
          </div>

          {/* Stats strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 0,
              border: '1px solid rgba(0,194,203,0.18)',
              borderRadius: 8,
              overflow: 'hidden',
              marginTop: 80,
            }}
          >
            {[
              { value: '+300', label: 'Live Pharmacies' },
              { value: '3M+', label: 'Transactions / month' },
              { value: '−9 days', label: 'Detection lead time' },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  padding: '40px 48px',
                  borderRight: i < 2 ? '1px solid rgba(0,194,203,0.18)' : 'none',
                  background: 'rgba(0,194,203,0.04)',
                }}
              >
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: 56,
                    letterSpacing: '-0.02em',
                    color: '#FFFFFF',
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    letterSpacing: '0.2em',
                    color: 'rgba(232,237,242,0.55)',
                    textTransform: 'uppercase',
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Access Request Form */}
        <section id="access" style={{ padding: '80px 64px', maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.3em', color: '#00C2CB', textTransform: 'uppercase', marginBottom: 16 }}>
            01 · Investor Access
          </div>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: 48,
              letterSpacing: '-0.01em',
              color: '#FFFFFF',
              margin: '0 0 12px',
            }}
          >
            Request Deck Access
          </h2>
          <p style={{ color: 'rgba(232,237,242,0.65)', fontSize: 16, margin: '0 0 40px', lineHeight: 1.6 }}>
            The PANOPTES interactive pitch deck is available on request for qualified investors.
          </p>

          {accessStatus === 'sent' ? (
            <div
              style={{
                padding: '32px',
                background: 'rgba(0,194,203,0.08)',
                border: '1px solid rgba(0,194,203,0.3)',
                borderRadius: 8,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 600, color: '#00C2CB', marginBottom: 8 }}>Request Sent ✓</div>
              <p style={{ color: 'rgba(232,237,242,0.7)', margin: 0 }}>You will receive an access link within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={submitAccessRequest}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <FormInput
                  label="Full Name"
                  value={accessForm.name}
                  onChange={v => setAccessForm({ ...accessForm, name: v })}
                  required
                />
                <FormInput
                  label="Organisation"
                  value={accessForm.organization}
                  onChange={v => setAccessForm({ ...accessForm, organization: v })}
                  required
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <FormInput
                  label="Professional Email"
                  type="email"
                  value={accessForm.email}
                  onChange={v => setAccessForm({ ...accessForm, email: v })}
                  required
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <FormTextarea
                  label="Message (optional)"
                  value={accessForm.message}
                  onChange={v => setAccessForm({ ...accessForm, message: v })}
                />
              </div>
              <SubmitButton
                label={accessStatus === 'sending' ? 'Sending...' : 'Request Access'}
                disabled={accessStatus === 'sending'}
              />
              {accessStatus === 'error' && (
                <p style={{ color: '#ff5060', marginTop: 12, fontSize: 14 }}>An error occurred. Please try again.</p>
              )}
            </form>
          )}
        </section>

        {/* Contact Form */}
        <section id="contact" style={{ padding: '80px 64px', maxWidth: 800, margin: '0 auto', borderTop: '1px solid rgba(0,194,203,0.1)' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.3em', color: '#00C2CB', textTransform: 'uppercase', marginBottom: 16 }}>
            02 · Contact
          </div>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: 48,
              letterSpacing: '-0.01em',
              color: '#FFFFFF',
              margin: '0 0 12px',
            }}
          >
            Contact Us
          </h2>
          <p style={{ color: 'rgba(232,237,242,0.65)', fontSize: 16, margin: '0 0 40px', lineHeight: 1.6 }}>
            Questions, partnerships, press — we respond within 48 hours.
          </p>

          {contactStatus === 'sent' ? (
            <div
              style={{
                padding: '32px',
                background: 'rgba(0,194,203,0.08)',
                border: '1px solid rgba(0,194,203,0.3)',
                borderRadius: 8,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 600, color: '#00C2CB', marginBottom: 8 }}>Message Sent ✓</div>
              <p style={{ color: 'rgba(232,237,242,0.7)', margin: 0 }}>We will get back to you within 48 hours.</p>
            </div>
          ) : (
            <form onSubmit={submitContact}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <FormInput
                  label="Name"
                  value={contactForm.name}
                  onChange={v => setContactForm({ ...contactForm, name: v })}
                  required
                />
                <FormInput
                  label="Email"
                  type="email"
                  value={contactForm.email}
                  onChange={v => setContactForm({ ...contactForm, email: v })}
                  required
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <FormTextarea
                  label="Message"
                  value={contactForm.message}
                  onChange={v => setContactForm({ ...contactForm, message: v })}
                  required
                />
              </div>
              <SubmitButton
                label={contactStatus === 'sending' ? 'Sending...' : 'Send'}
                disabled={contactStatus === 'sending'}
              />
              {contactStatus === 'error' && (
                <p style={{ color: '#ff5060', marginTop: 12, fontSize: 14 }}>An error occurred. Please try again.</p>
              )}
            </form>
          )}
        </section>

        {/* Footer */}
        <footer
          style={{
            padding: '40px 64px',
            borderTop: '1px solid rgba(0,194,203,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.2em',
            color: 'rgba(232,237,242,0.35)',
            textTransform: 'uppercase',
          }}
        >
          <div>© 2026 Blink Pharma — PANOPTES</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <a
              href="/cgu"
              style={{
                color: 'rgba(232,237,242,0.55)',
                textDecoration: 'none',
              }}
            >
              CGU
            </a>
            <div>ali.sami@blinkpharmacie.com</div>
          </div>
        </footer>
      </div>
    </div>
  )
}

function FormInput({ label, value, onChange, type = 'text', required = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean
}) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          letterSpacing: '0.2em',
          color: 'rgba(232,237,242,0.55)',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '14px 16px',
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
  )
}

function FormTextarea({ label, value, onChange, required = false }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean
}) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          letterSpacing: '0.2em',
          color: 'rgba(232,237,242,0.55)',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        rows={4}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '14px 16px',
          background: 'rgba(0,194,203,0.06)',
          border: '1px solid rgba(0,194,203,0.2)',
          borderRadius: 6,
          color: '#FFFFFF',
          fontSize: 15,
          outline: 'none',
          fontFamily: "'Inter', sans-serif",
          resize: 'vertical',
        }}
      />
    </div>
  )
}

function SubmitButton({ label, disabled }: { label: string; disabled: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      style={{
        background: disabled ? 'rgba(0,194,203,0.4)' : '#00C2CB',
        color: '#0D1B2A',
        fontWeight: 700,
        padding: '16px 40px',
        borderRadius: 6,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 15,
        letterSpacing: '0.05em',
        transition: 'background 0.15s',
      }}
    >
      {label}
    </button>
  )
}

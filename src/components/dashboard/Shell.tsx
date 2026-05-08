'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SYSTEM_STATS } from '@/data/dashboard-mock'

const NAV_LINKS = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: '/map',
    label: 'Map',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
]

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D1B2A' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '220px',
          minWidth: '220px',
          background: 'rgba(0,194,203,0.04)',
          borderRight: '1px solid rgba(0,194,203,0.14)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(0,194,203,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            {/* Logo mark */}
            <div
              style={{
                width: '32px',
                height: '32px',
                background: 'rgba(0,194,203,0.15)',
                border: '1px solid rgba(0,194,203,0.4)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="3.5" stroke="#00C2CB" strokeWidth="1.5" />
                <circle cx="9" cy="9" r="7" stroke="#00C2CB" strokeWidth="1" strokeOpacity="0.5" />
                <line x1="9" y1="2" x2="9" y2="0" stroke="#00C2CB" strokeWidth="1.5" />
                <line x1="9" y1="18" x2="9" y2="16" stroke="#00C2CB" strokeWidth="1.5" />
                <line x1="2" y1="9" x2="0" y2="9" stroke="#00C2CB" strokeWidth="1.5" />
                <line x1="18" y1="9" x2="16" y2="9" stroke="#00C2CB" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <div
                className="grotesk"
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#00C2CB',
                  letterSpacing: '0.08em',
                  lineHeight: 1,
                }}
              >
                PANOPTES
              </div>
              <div
                className="mono"
                style={{
                  fontSize: '9px',
                  color: 'rgba(232,237,242,0.4)',
                  letterSpacing: '0.12em',
                  marginTop: '2px',
                }}
              >
                Blink Pharmacie
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
            <span
              className="mono"
              style={{
                fontSize: '9px',
                letterSpacing: '0.1em',
                color: '#0D1B2A',
                background: '#00C2CB',
                padding: '2px 6px',
                borderRadius: '3px',
                fontWeight: 600,
              }}
            >
              DEMO
            </span>
            <span
              className="mono"
              style={{ fontSize: '9px', color: 'rgba(232,237,242,0.4)', letterSpacing: '0.08em' }}
            >
              v0.1.0
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          <div
            className="mono"
            style={{
              fontSize: '9px',
              letterSpacing: '0.12em',
              color: 'rgba(232,237,242,0.35)',
              padding: '0 8px',
              marginBottom: '8px',
            }}
          >
            NAVIGATION
          </div>
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  marginBottom: '2px',
                  textDecoration: 'none',
                  color: isActive ? '#00C2CB' : 'rgba(232,237,242,0.65)',
                  background: isActive ? 'rgba(0,194,203,0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(0,194,203,0.2)' : '1px solid transparent',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ opacity: isActive ? 1 : 0.6 }}>{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom stats */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(0,194,203,0.1)',
          }}
        >
          <div
            className="mono"
            style={{
              fontSize: '9px',
              letterSpacing: '0.12em',
              color: 'rgba(232,237,242,0.35)',
              marginBottom: '10px',
            }}
          >
            LIVE STATUS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="mono" style={{ fontSize: '10px', color: 'rgba(232,237,242,0.5)' }}>
                Pharmacies
              </span>
              <span className="mono" style={{ fontSize: '11px', color: '#00C2CB', fontWeight: 600 }}>
                {SYSTEM_STATS.pharmaciesLive.toLocaleString()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="mono" style={{ fontSize: '10px', color: 'rgba(232,237,242,0.5)' }}>
                Uptime
              </span>
              <span className="mono" style={{ fontSize: '11px', color: '#3B6D11', fontWeight: 600 }}>
                {SYSTEM_STATS.uptimePercent}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="mono" style={{ fontSize: '10px', color: 'rgba(232,237,242,0.5)' }}>
                Latency
              </span>
              <span className="mono" style={{ fontSize: '11px', color: 'rgba(232,237,242,0.7)', fontWeight: 600 }}>
                {SYSTEM_STATS.latencyMs}ms
              </span>
            </div>
          </div>
          <div
            style={{
              marginTop: '14px',
              padding: '8px 10px',
              background: 'rgba(59,109,17,0.12)',
              border: '1px solid rgba(59,109,17,0.3)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#3B6D11',
              }}
              className="beacon-pulse"
            />
            <span className="mono" style={{ fontSize: '10px', color: '#3B6D11', letterSpacing: '0.08em' }}>
              BEACON ACTIVE
            </span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          marginLeft: '220px',
          flex: 1,
          minHeight: '100vh',
          overflow: 'auto',
        }}
      >
        {children}
      </main>
    </div>
  )
}

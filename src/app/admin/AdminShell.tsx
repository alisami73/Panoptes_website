'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const NAV_ITEMS = [
  { href: '/admin', label: 'Slides', icon: '⊡' },
  { href: '/admin/theme', label: 'Thème', icon: '◑' },
  { href: '/admin/access', label: 'Accès', icon: '🔑' },
  { href: '/admin/requests', label: 'Demandes', icon: '📬' },
  { href: '/admin/messages', label: 'Messages', icon: '✉' },
  { href: '/admin/map', label: 'Carte épidémio', icon: '🗺' },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0D1B2A', color: '#FFFFFF', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <div
        className="admin-sidebar"
        style={{
          width: 240,
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 0',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div style={{ padding: '0 24px 32px', borderBottom: '1px solid rgba(0,194,203,0.12)' }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: '0.04em', color: '#FFFFFF' }}>
            PANOPTES
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.25em', color: '#00C2CB', marginTop: 2 }}>
            ADMIN · BLINK PHARMA
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '16px 0', flex: 1 }}>
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 24px',
                  color: isActive ? '#00C2CB' : 'rgba(232,237,242,0.6)',
                  background: isActive ? 'rgba(0,194,203,0.08)' : 'transparent',
                  borderLeft: isActive ? '2px solid #00C2CB' : '2px solid transparent',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(0,194,203,0.12)' }}>
          <a
            href="/"
            target="_blank"
            style={{
              display: 'block',
              padding: '8px 16px',
              borderRadius: 6,
              border: '1px solid rgba(0,194,203,0.2)',
              color: '#00C2CB',
              textDecoration: 'none',
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.15em',
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            VOIR LE SITE →
          </a>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            style={{
              width: '100%',
              padding: '8px',
              background: 'none',
              border: 'none',
              color: 'rgba(232,237,242,0.4)',
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.15em',
            }}
          >
            DÉCONNEXION
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  )
}

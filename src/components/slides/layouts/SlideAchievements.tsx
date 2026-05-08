'use client'

import React from 'react'
import type { SlideConfig } from '@/types/slide'

function BlinkEye({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 56 56" fill="none" style={{ width: 28, height: 28 }}>
      <path d="M28 6 C42 6 50 16 50 28 C50 38 44 46 36 48 L28 54 L28 48 C18 48 6 40 6 28 C6 16 14 6 28 6 Z" fill="white" />
      <circle cx="22" cy="27" r="3" fill={color} />
      <circle cx="34" cy="27" r="3" fill={color} />
    </svg>
  )
}

function ProductChip({ bg, eyeColor, name }: { bg: string; eyeColor: string; name: React.ReactNode }) {
  return (
    <div style={{
      position: 'absolute', top: 18, left: 18,
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 16px 10px 10px',
      background: 'rgba(7,16,28,0.75)',
      border: '1px solid rgba(0,194,203,0.3)',
      borderRadius: 999,
    }}>
      <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 11, background: bg, flexShrink: 0 }}>
        <BlinkEye color={eyeColor} />
      </div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 17, letterSpacing: '-0.01em', color: '#fff', whiteSpace: 'nowrap' }}>
        {name}
      </div>
    </div>
  )
}

const ACCENT = '#00C2CB'
const LINE = 'rgba(0,194,203,0.18)'
const CARD_BG = 'linear-gradient(180deg, rgba(0,194,203,0.06), rgba(7,16,28,0.85))'

function UpperCard({ product, year, title, meta }: { product?: React.ReactNode; year: string; title: string; meta: string }) {
  return (
    <div style={{ position: 'relative', background: CARD_BG, border: `1px solid ${LINE}`, borderRadius: 12, padding: product ? '78px 22px 18px' : '18px 22px', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: 2, background: ACCENT, opacity: 0.6, borderRadius: '12px 12px 0 0' }} />
      {product}
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: '0.3em', color: ACCENT, textTransform: 'uppercase' }}>{year}</div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: 20, lineHeight: 1.2, color: '#fff', letterSpacing: '-0.01em' }}>{title}</div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: 1.4, color: 'rgba(232,237,242,0.65)' }}>{meta}</div>
      {/* connector to axis */}
      <div style={{ position: 'absolute', left: '50%', bottom: -18, width: 1, height: 18, background: 'linear-gradient(180deg, rgba(0,194,203,0.6), #00C2CB)', boxShadow: '0 0 6px rgba(0,194,203,0.5)' }} />
    </div>
  )
}

function LowerCard({ year, title, meta }: { year: string; title: string; meta: string }) {
  return (
    <div style={{ position: 'relative', background: CARD_BG, border: `1px solid ${LINE}`, borderRadius: 12, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 6, marginTop: 18 }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: 2, background: ACCENT, opacity: 0.6, borderRadius: '12px 12px 0 0' }} />
      {/* connector from axis */}
      <div style={{ position: 'absolute', left: '50%', top: -18, width: 1, height: 18, background: 'linear-gradient(180deg, #00C2CB, rgba(0,194,203,0))', boxShadow: '0 0 6px rgba(0,194,203,0.5)' }} />
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: '0.3em', color: ACCENT, textTransform: 'uppercase' }}>{year}</div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: 20, lineHeight: 1.2, color: '#fff', letterSpacing: '-0.01em' }}>{title}</div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: 1.4, color: 'rgba(232,237,242,0.65)' }}>{meta}</div>
    </div>
  )
}

function AxisTick({ anim }: { anim: boolean }) {
  return (
    <div style={{ position: 'relative', width: 14, height: 14, borderRadius: '50%', background: ACCENT, boxShadow: `0 0 0 4px rgba(0,194,203,0.18), 0 0 18px ${ACCENT}`, flexShrink: 0 }}>
      {anim && (
        <div style={{ position: 'absolute', inset: -10, borderRadius: '50%', border: '1px solid rgba(0,194,203,0.4)', animation: 'ach-ring 3s ease-out infinite' }} />
      )}
    </div>
  )
}

export default function SlideAchievements({ config, isPrint, isAnimated }: { config: SlideConfig; isPrint?: boolean; isAnimated?: boolean }) {
  const anim = isAnimated !== false && !isPrint
  const titleParts = config.title ? config.title.split(' & ') : null
  const subtitle = config.subtitle || 'Six years building the operating system for Moroccan pharmacies — from a single-app pilot in 2019 to a four-product portfolio powering thousands of nodes today.'

  return (
    <>
      {anim && (
        <style>{`
          @keyframes ach-pulse { 0%,100%{opacity:.4;transform:scale(.85)} 50%{opacity:1;transform:scale(1.15)} }
          @keyframes ach-ring  { 0%{transform:scale(.6);opacity:1} 100%{transform:scale(2.4);opacity:0} }
        `}</style>
      )}

      <div style={{ position: 'absolute', inset: 0, zIndex: 2, overflow: 'hidden' }}>

        {/* Background radials */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% -10%, rgba(0,194,203,0.10), transparent 50%), radial-gradient(ellipse at -10% 110%, rgba(0,194,203,0.06), transparent 50%)', pointerEvents: 'none' }} />

        {/* Header */}
        <div style={{ position: 'absolute', top: 100, left: 80, right: 80, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 4 }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: '0.35em', color: ACCENT, textTransform: 'uppercase', marginBottom: 18 }}>
              Section 06 · Company timeline
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 68, lineHeight: 1.0, letterSpacing: '-0.025em', color: '#fff', margin: '0 0 14px', whiteSpace: 'nowrap' }}>
              {titleParts && titleParts.length > 1
                ? <>{titleParts[0]} <span style={{ color: ACCENT }}>& {titleParts.slice(1).join(' & ')}</span></>
                : titleParts
                  ? titleParts[0]
                  : <>Achievements <span style={{ color: ACCENT }}>&amp; Traction</span></>
              }
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: 19, lineHeight: 1.45, color: 'rgba(232,237,242,0.7)', maxWidth: 760, margin: 0 }}>
              {subtitle}
            </p>
          </div>

          {/* Blink logo mark */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 90, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #4a8aff, #2563eb)', borderRadius: 22, boxShadow: '0 0 0 1px rgba(0,194,203,0.3), 0 0 40px rgba(74,138,255,0.3)' }}>
              <svg viewBox="0 0 56 56" fill="none" style={{ width: 56, height: 56 }}>
                <path d="M28 6 C42 6 50 16 50 28 C50 38 44 46 36 48 L28 54 L28 48 C18 48 6 40 6 28 C6 16 14 6 28 6 Z" fill="rgba(255,255,255,0.95)" />
                <circle cx="22" cy="27" r="3" fill="#2563eb" />
                <circle cx="34" cy="27" r="3" fill="#2563eb" />
              </svg>
            </div>
            <div style={{ marginTop: 8, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 20, textAlign: 'center', color: '#6ea0ff', letterSpacing: '-0.01em' }}>
              blink<span style={{ fontWeight: 400 }}>pharma</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ position: 'absolute', top: 300, left: 80, right: 80, bottom: 110, display: 'grid', gridTemplateRows: '1fr 70px 1fr', alignItems: 'stretch' }}>

          {/* Upper row */}
          <div style={{ gridRow: 1, display: 'grid', gridTemplateColumns: '110px repeat(4, 1fr)', gap: 28, alignItems: 'end' }}>
            {/* Origin — spans visually */}
            <div style={{ position: 'relative', background: CARD_BG, border: `1px solid ${LINE}`, borderRadius: 12, padding: '22px 18px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gridRow: '1 / 4', alignSelf: 'stretch' }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 36, color: ACCENT, letterSpacing: '-0.02em', marginBottom: 8 }}>2019</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.25em', color: 'rgba(232,237,242,0.55)', textTransform: 'uppercase', lineHeight: 1.4 }}>Start-up<br />created</div>
            </div>

            <UpperCard
              product={<ProductChip bg="linear-gradient(180deg,#4a8aff,#2563eb)" eyeColor="#2563eb" name={<><span style={{ color: '#6ea0ff' }}>blink</span> <span style={{ fontWeight: 400, opacity: 0.85 }}>pharmacie</span></>} />}
              year="2020" title="Launched first app iteration" meta="Pilot deployment with early-adopter pharmacies in Casablanca."
            />
            <UpperCard
              product={<ProductChip bg="linear-gradient(180deg,#4ade80,#16a34a)" eyeColor="#16a34a" name={<><span style={{ color: '#86efac' }}>blink</span> <span style={{ fontWeight: 400, opacity: 0.85 }}>premium</span></>} />}
              year="2023" title="Launched Pharmacy ERP" meta="Inventory, billing, and operations stack for full pharmacies."
            />
            <UpperCard
              product={<ProductChip bg="linear-gradient(180deg,#4a8aff,#2563eb)" eyeColor="#2563eb" name={<><span style={{ fontWeight: 400, opacity: 0.85 }}>Med</span><span style={{ color: '#6ea0ff' }}>Index</span></>} />}
              year="2024" title="Knowledge drug database" meta="Therapeutic + drug knowledge graph, structured for AI retrieval."
            />
            <UpperCard
              product={<ProductChip bg="linear-gradient(180deg,#a78bfa,#4c1d95)" eyeColor="#4c1d95" name={<><span style={{ color: '#c4b5fd' }}>blink</span> <span style={{ fontWeight: 400, opacity: 0.85 }}>ai</span></>} />}
              year="2025" title="Launched 2nd iteration of AI Companion" meta="Live in pharmacies, surfacing real-time clinical guidance."
            />
          </div>

          {/* Axis */}
          <div style={{ gridRow: 2, position: 'relative', display: 'flex', alignItems: 'center' }}>
            {/* Line */}
            <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 2, transform: 'translateY(-50%)', background: `linear-gradient(90deg, rgba(0,194,203,0) 0%, rgba(0,194,203,0.6) 8%, ${ACCENT} 50%, rgba(0,194,203,0.6) 92%, rgba(0,194,203,0) 100%)`, boxShadow: '0 0 18px rgba(0,194,203,0.4)' }} />
            {/* Arrow */}
            <div style={{ position: 'absolute', right: -2, top: '50%', transform: 'translateY(-50%)', width: 0, height: 0, borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderLeft: `14px solid ${ACCENT}`, filter: `drop-shadow(0 0 6px ${ACCENT})` }} />
            {/* 4 ticks at 12.5%, 37.5%, 62.5%, 87.5% of the track (after the 110px origin column) */}
            {[0.5, 1.5, 2.5, 3.5].map((n, i) => (
              <div key={i} style={{ position: 'absolute', left: `calc(110px + 28px + (100% - 110px - 28px) * ${n}/4)`, top: '50%', transform: 'translate(-50%, -50%)' }}>
                <AxisTick anim={anim} />
              </div>
            ))}
          </div>

          {/* Lower row */}
          <div style={{ gridRow: 3, display: 'grid', gridTemplateColumns: '110px repeat(4, 1fr)', gap: 28, alignItems: 'start' }}>
            <div /> {/* spacer for origin column */}
            <LowerCard year="2022 · Seed"    title="Raised $700K"    meta="Azur Innovation Fund" />
            <LowerCard year="2023 · Bridge"  title="Raised $300K"    meta="Azur Innovation Fund" />
            <LowerCard year="2024 · Revenue" title="Generated $110K+" meta="First commercial year, ARR trending up." />
            <LowerCard year="2025 · Revenue" title="Generated $170K+" meta="First B2G contracts." />
          </div>

        </div>

        {/* Bottom chrome */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 56px', height: 64, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.25em', color: 'rgba(232,237,242,0.45)', textTransform: 'uppercase', borderTop: `1px solid ${LINE}` }}>
          <div>4 PRODUCTS · 1.0M+ USD RAISED · $280K+ REVENUE · 6 YRS</div>
          <div>RABAT · CASABLANCA · 2019 → 2026</div>
        </div>

      </div>
    </>
  )
}

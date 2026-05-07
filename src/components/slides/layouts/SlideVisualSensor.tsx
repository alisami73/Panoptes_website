'use client'

import React, { useState, useEffect } from 'react'
import type { SlideConfig } from '@/types/slide'

const PharmacySoftware = ({ t, x, y, w, h }: { t: number; x: number; y: number; w: number; h: number }) => {
  const rows = [
    { time: '14:02', sku: 'AMOXICILLIN 500mg', qty: 2, hint: 'antibiotic', flag: false },
    { time: '14:01', sku: 'PARACETAMOL 1g', qty: 1, hint: 'analgesic', flag: false },
    { time: '13:58', sku: 'OSELTAMIVIR 75mg', qty: 1, hint: 'antiviral', flag: true },
    { time: '13:54', sku: 'DEXTROMETHORPHAN syrup', qty: 1, hint: 'cough OTC', flag: true },
    { time: '13:51', sku: 'AZITHROMYCIN 500mg', qty: 1, hint: 'antibiotic', flag: false },
    { time: '13:47', sku: 'IBUPROFEN 400mg', qty: 3, hint: 'NSAID', flag: false },
    { time: '13:43', sku: 'PSEUDOEPHEDRINE', qty: 1, hint: 'decongestant', flag: true },
    { time: '13:39', sku: 'AMBROXOL syrup', qty: 2, hint: 'expectorant', flag: false },
    { time: '13:35', sku: 'CETIRIZINE 10mg', qty: 1, hint: 'antihistamine', flag: false },
  ]
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} rx="6" fill="rgba(14,22,42,0.92)" stroke="rgba(120,180,230,0.22)" strokeWidth="1" />
      <rect width={w} height="28" rx="6" fill="rgba(8,14,30,0.95)" />
      <rect y="22" width={w} height="6" fill="rgba(8,14,30,0.95)" />
      <g transform="translate(10 14)">
        <circle cx="0" cy="0" r="4" fill="#ff6058" />
        <circle cx="14" cy="0" r="4" fill="#ffbd2d" />
        <circle cx="28" cy="0" r="4" fill="#27c93f" />
      </g>
      <text x={w / 2} y="18" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="10"
        letterSpacing="0.2em" fill="rgba(180,210,240,0.7)">PharmaPro v8.4 — Officine de Casablanca · POS</text>
      <g transform="translate(0 28)">
        <rect width={w} height="32" fill="rgba(20,32,60,0.6)" />
        {['VENTES', 'STOCK', 'ORDONNANCES', 'CLIENTS', 'CAISSE'].map((tab, i) => (
          <g key={tab} transform={`translate(${20 + i * 95} 0)`}>
            <rect width="85" height="32" fill={i === 0 ? 'rgba(0,220,255,0.08)' : 'transparent'} />
            {i === 0 && <line x1="0" y1="31" x2="85" y2="31" stroke="rgba(0,220,255,0.7)" strokeWidth="2" />}
            <text x="42.5" y="20" textAnchor="middle" fontFamily="'Inter', sans-serif" fontSize="10"
              fontWeight={i === 0 ? '600' : '400'}
              letterSpacing="0.1em" fill={i === 0 ? 'rgba(0,220,255,0.95)' : 'rgba(180,210,240,0.55)'}>{tab}</text>
          </g>
        ))}
      </g>
      <g transform="translate(0 70)">
        <rect width={w} height="26" fill="rgba(120,180,230,0.04)" />
        <text x="20" y="17" fontFamily="'JetBrains Mono', monospace" fontSize="9" letterSpacing="0.18em" fill="rgba(150,200,240,0.55)">HEURE</text>
        <text x="90" y="17" fontFamily="'JetBrains Mono', monospace" fontSize="9" letterSpacing="0.18em" fill="rgba(150,200,240,0.55)">ARTICLE</text>
        <text x={w - 90} y="17" fontFamily="'JetBrains Mono', monospace" fontSize="9" letterSpacing="0.18em" fill="rgba(150,200,240,0.55)">QTÉ</text>
        <text x={w - 30} y="17" fontFamily="'JetBrains Mono', monospace" fontSize="9" letterSpacing="0.18em" fill="rgba(150,200,240,0.55)" textAnchor="end">CAT</text>
      </g>
      <g transform="translate(0 96)">
        {rows.map((r, i) => {
          const fresh = i === 0
          const pulse = fresh ? 0.5 + 0.5 * Math.sin(t * 4) : 0
          return (
            <g key={i} transform={`translate(0 ${i * 36})`}>
              <rect width={w} height="36" fill={i % 2 ? 'rgba(120,180,230,0.025)' : 'transparent'} />
              {fresh && <rect width={w} height="36" fill="rgba(0,220,255,0.06)" opacity={0.4 + pulse * 0.5} />}
              {r.flag && <rect x="0" width="3" height="36" fill="rgba(0,220,255,0.85)" />}
              <text x="20" y="22" fontFamily="'JetBrains Mono', monospace" fontSize="10" fill="rgba(180,210,240,0.7)">{r.time}</text>
              <text x="90" y="22" fontFamily="'Inter', sans-serif" fontSize="11" fill="rgba(220,235,250,0.92)" fontWeight="500">{r.sku}</text>
              <text x={w - 90} y="22" fontFamily="'JetBrains Mono', monospace" fontSize="10" fill="rgba(180,210,240,0.7)">×{r.qty}</text>
              <text x={w - 30} y="22" fontFamily="'JetBrains Mono', monospace" fontSize="9" letterSpacing="0.1em" textAnchor="end"
                fill={r.flag ? 'rgba(0,220,255,0.85)' : 'rgba(150,200,240,0.5)'}>{r.hint.toUpperCase().slice(0, 6)}</text>
              {r.flag && (
                <g transform={`translate(${w - 16} 18)`} opacity="0.85">
                  <circle r="6" fill="rgba(0,220,255,0.15)" stroke="rgba(0,220,255,0.6)" strokeWidth="1" />
                  <path d="M -2.2 0 L -0.5 1.7 L 2.5 -1.6" stroke="rgba(0,220,255,0.95)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                </g>
              )}
            </g>
          )
        })}
      </g>
      <g transform={`translate(0 ${h - 24})`}>
        <rect width={w} height="24" fill="rgba(8,14,30,0.95)" />
        <circle cx="14" cy="12" r="3" fill="#27c93f">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
        <text x="26" y="16" fontFamily="'JetBrains Mono', monospace" fontSize="9" letterSpacing="0.15em" fill="rgba(180,210,240,0.6)">ONLINE · CNSS connecté</text>
        <text x={w - 14} y="16" textAnchor="end" fontFamily="'JetBrains Mono', monospace" fontSize="9" letterSpacing="0.15em" fill="rgba(0,220,255,0.7)">+ PANOPTES extension active</text>
      </g>
    </g>
  )
}

const ExtensionWidget = ({ t, x, y, w, h }: { t: number; x: number; y: number; w: number; h: number }) => {
  const inferences = [
    { code: 'J11', label: 'Influenza-like', conf: 0.84 },
    { code: 'J20', label: 'Acute bronchitis', conf: 0.62 },
    { code: 'B34', label: 'Viral · unspecified', conf: 0.41 },
  ]
  const pulse = 0.5 + 0.5 * Math.sin(t * 2)
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={w / 2} cy={h / 2} rx={w / 1.6} ry={h / 1.7} fill="url(#v2-node-glow)" opacity="0.6" />
      <rect width={w} height={h} rx="14" fill="rgba(8,16,38,0.85)"
        stroke="rgba(0,220,255,0.55)" strokeWidth="1.2" filter="url(#v2-glow)" />
      <rect width={w} height={h} rx="14" fill="url(#v2-glass)" />
      <g transform="translate(-12 80)">
        <path d="M 0 0 L 12 0 L 12 60 L 0 60 Q 6 30 0 0 Z" fill="rgba(0,220,255,0.18)" stroke="rgba(0,220,255,0.5)" strokeWidth="1" />
      </g>
      <g transform={`translate(${w} 80)`}>
        <path d="M 12 0 L 0 0 L 0 60 L 12 60 Q 6 30 12 0 Z" fill="rgba(0,220,255,0.18)" stroke="rgba(0,220,255,0.5)" strokeWidth="1" />
      </g>
      <g transform="translate(18 24)">
        <circle cx="10" cy="10" r="9" fill="none" stroke="rgba(0,220,255,0.85)" strokeWidth="1.3" />
        <circle cx="10" cy="10" r="4" fill="rgba(0,220,255,0.7)" />
        <circle cx="10" cy="10" r="1.5" fill="#0a1430" />
        <text x="28" y="9" fontFamily="'Inter', sans-serif" fontWeight="600" fontSize="13"
          letterSpacing="0.04em" fill="rgba(220,240,255,0.97)">PANOPTES</text>
        <text x="28" y="22" fontFamily="'JetBrains Mono', monospace" fontSize="8"
          letterSpacing="0.18em" fill="rgba(0,220,255,0.75)">AI EXTENSION · v1.2</text>
      </g>
      <g transform={`translate(${w - 70} 24)`}>
        <circle cx="0" cy="6" r="3.5" fill="#00dcff" opacity={0.4 + pulse * 0.6} filter="url(#v2-glow)" />
        <text x="9" y="9" fontFamily="'JetBrains Mono', monospace" fontSize="9" letterSpacing="0.18em" fill="rgba(0,220,255,0.95)">LIVE</text>
      </g>
      <line x1="18" y1="60" x2={w - 18} y2="60" stroke="rgba(0,220,255,0.2)" strokeWidth="0.6" />
      <g transform="translate(18 78)">
        <rect width="120" height="20" rx="3" fill="rgba(0,220,255,0.08)" stroke="rgba(0,220,255,0.4)" strokeWidth="0.6" strokeDasharray="3 2" />
        <text x="8" y="14" fontFamily="'JetBrains Mono', monospace" fontSize="9" letterSpacing="0.18em" fill="rgba(0,220,255,0.85)">ANONYMIZED · k=15</text>
      </g>
      <g transform="translate(18 116)">
        <text x="0" y="0" fontFamily="'JetBrains Mono', monospace" fontSize="9" letterSpacing="0.2em"
          fill="rgba(150,200,240,0.55)">INFERENCE · DISEASE PROBABILITY</text>
        {inferences.map((inf, i) => (
          <g key={inf.code} transform={`translate(0 ${18 + i * 32})`}>
            <text x="0" y="11" fontFamily="'JetBrains Mono', monospace" fontSize="10" fill="rgba(0,220,255,0.85)">{inf.code}</text>
            <text x="36" y="11" fontFamily="'Inter', sans-serif" fontSize="11" fill="rgba(220,235,250,0.93)">{inf.label}</text>
            <rect x="0" y="18" width={w - 36} height="4" rx="2" fill="rgba(120,180,230,0.1)" />
            <rect x="0" y="18" width={(w - 36) * inf.conf} height="4" rx="2" fill="rgba(0,220,255,0.7)" filter="url(#v2-glow)" />
            <text x={w - 36} y="14" textAnchor="end" fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="rgba(150,200,240,0.65)">
              {(inf.conf * 100).toFixed(0)}%
            </text>
          </g>
        ))}
      </g>
      <g transform={`translate(18 ${h - 130})`}>
        <text x="0" y="0" fontFamily="'JetBrains Mono', monospace" fontSize="9" letterSpacing="0.2em"
          fill="rgba(150,200,240,0.55)">OUTBOUND SIGNAL · 60s</text>
        <g transform="translate(0 8)">
          {Array.from({ length: 28 }, (_, i) => {
            const v = 0.25 + 0.75 * Math.abs(Math.sin(i * 0.45 + t * 1.2))
            const isLast = i >= 26
            return (
              <rect key={i} x={i * 9} y={50 - v * 50} width="6" height={v * 50}
                fill={isLast ? 'rgba(0,220,255,0.95)' : `rgba(0,220,255,${0.25 + v * 0.4})`}
                filter={isLast ? 'url(#v2-glow)' : undefined} />
            )
          })}
        </g>
      </g>
      <g transform={`translate(18 ${h - 36})`}>
        <text x="0" y="0" fontFamily="'JetBrains Mono', monospace" fontSize="8" letterSpacing="0.18em"
          fill="rgba(150,200,240,0.55)">INTEROPERABLE · NON-INTRUSIVE</text>
        <text x="0" y="14" fontFamily="'JetBrains Mono', monospace" fontSize="8" letterSpacing="0.18em"
          fill="rgba(0,220,255,0.75)">PHARMAPRO · WINPHARMA · SAGE-RX</text>
      </g>
    </g>
  )
}

const SignalStream = ({ t, x1, y1, x2, y2 }: { t: number; x1: number; y1: number; x2: number; y2: number }) => {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,220,255,0.25)" strokeWidth="1" strokeDasharray="3 4" />
      {Array.from({ length: 8 }, (_, i) => {
        const phase = ((t * 0.6 + i / 8) % 1)
        const px = x1 + (x2 - x1) * phase
        const op = phase < 0.1 ? phase / 0.1 : phase > 0.9 ? (1 - phase) / 0.1 : 1
        return (
          <g key={i}>
            <circle cx={px} cy={y1} r="3" fill="#00dcff" opacity={op * 0.95} filter="url(#v2-glow)" />
            <circle cx={px} cy={y1} r="1.2" fill="#fff" opacity={op} />
          </g>
        )
      })}
    </g>
  )
}

const NationalEngine = ({ t, x, y, w, h }: { t: number; x: number; y: number; w: number; h: number }) => {
  const cities = [
    { id: 'Casablanca', cx: 230, cy: 290, intensity: 0.95, alert: true, size: 'l' },
    { id: 'Rabat', cx: 270, cy: 230, intensity: 0.78, alert: true, size: 'm' },
    { id: 'Tangier', cx: 280, cy: 130, intensity: 0.55, alert: false, size: 'm' },
    { id: 'Fès', cx: 360, cy: 235, intensity: 0.62, alert: false, size: 'm' },
    { id: 'Meknès', cx: 335, cy: 245, intensity: 0.47, alert: false, size: 's' },
    { id: 'Oujda', cx: 470, cy: 200, intensity: 0.38, alert: false, size: 's' },
    { id: 'Marrakech', cx: 270, cy: 380, intensity: 0.71, alert: false, size: 'm' },
    { id: 'Agadir', cx: 200, cy: 440, intensity: 0.44, alert: false, size: 's' },
    { id: 'Laâyoune', cx: 100, cy: 510, intensity: 0.21, alert: false, size: 's' },
    { id: 'Tétouan', cx: 305, cy: 110, intensity: 0.41, alert: false, size: 's' },
    { id: 'Kenitra', cx: 250, cy: 215, intensity: 0.58, alert: false, size: 's' },
    { id: 'Béni Mellal', cx: 305, cy: 320, intensity: 0.49, alert: false, size: 's' },
  ]
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} rx="10" fill="rgba(8,14,32,0.7)" stroke="rgba(0,220,255,0.22)" strokeWidth="1" />
      <rect width={w} height={h} rx="10" fill="url(#v2-glass)" />
      <g transform="translate(20 28)">
        <text fontFamily="'Inter', sans-serif" fontWeight="600" fontSize="13"
          letterSpacing="0.06em" fill="rgba(220,240,255,0.95)">NATIONAL EPIDEMIOLOGY ENGINE</text>
        <text y="18" fontFamily="'JetBrains Mono', monospace" fontSize="9"
          letterSpacing="0.2em" fill="rgba(0,220,255,0.75)">PREDICTIVE · 7-DAY HORIZON</text>
      </g>
      <g transform={`translate(${w - 20} 28)`} textAnchor="end">
        <text fontFamily="'JetBrains Mono', monospace" fontSize="10" letterSpacing="0.2em"
          fill="rgba(150,200,240,0.6)">UPDATED · {(t % 5).toFixed(1)}s</text>
      </g>
      <g transform="translate(60 70)">
        <path d="M 290 50 Q 360 60 430 80 Q 500 100 540 150 Q 540 220 500 240 Q 480 250 470 250 Q 430 245 380 250 Q 350 270 320 290 Q 290 320 260 350 Q 230 400 200 440 Q 160 490 100 520 Q 60 540 30 540 Q 20 510 30 470 Q 50 410 90 360 Q 130 310 170 270 Q 200 220 220 180 Q 240 130 260 90 Q 275 60 290 50 Z"
          fill="rgba(0,150,220,0.05)" stroke="rgba(0,220,255,0.35)" strokeWidth="1" filter="url(#v2-glow)" />
        {cities.filter(c => c.intensity > 0.5).map((c, i) => {
          const r = 30 + c.intensity * 60 + Math.sin(t * 1.5 + i) * 4
          return (
            <circle key={c.id + 'heat'} cx={c.cx} cy={c.cy} r={r}
              fill={c.alert ? 'url(#v2-heat-warm)' : 'url(#v2-heat)'}
              opacity={0.4 + 0.3 * Math.sin(t * 1.2 + i)} />
          )
        })}
        {cities.map((a, i) =>
          cities.slice(i + 1).filter(b => Math.hypot(b.cx - a.cx, b.cy - a.cy) < 140).map((b) => (
            <line key={a.id + b.id} x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy}
              stroke="rgba(0,220,255,0.13)" strokeWidth="0.6" />
          ))
        )}
        {cities.map((c, i) => {
          const baseR = c.size === 'l' ? 6 : c.size === 'm' ? 4 : 3
          const pulse = 0.5 + 0.5 * Math.sin(t * 1.8 + i * 0.7)
          return (
            <g key={c.id}>
              {c.alert && (
                <circle cx={c.cx} cy={c.cy} r={baseR + 8 + pulse * 6}
                  fill="none" stroke="rgba(255,140,80,0.5)" strokeWidth="1" opacity={1 - pulse * 0.6} />
              )}
              <circle cx={c.cx} cy={c.cy} r={baseR + 3} fill={c.alert ? 'rgba(255,140,80,0.25)' : 'rgba(0,220,255,0.2)'} />
              <circle cx={c.cx} cy={c.cy} r={baseR} fill={c.alert ? '#ff8c50' : '#00dcff'} filter="url(#v2-glow)" />
              <circle cx={c.cx} cy={c.cy} r={baseR - 1.5} fill="#fff" opacity="0.8" />
              {c.size !== 's' && (
                <text x={c.cx + baseR + 6} y={c.cy + 3}
                  fontFamily="'JetBrains Mono', monospace" fontSize="9" letterSpacing="0.12em"
                  fill={c.alert ? 'rgba(255,180,140,0.95)' : 'rgba(180,220,255,0.75)'}>{c.id.toUpperCase()}</text>
              )}
            </g>
          )
        })}
        {cities.filter(c => c.alert).map((c, i) => (
          <g key={'pred-' + c.id} opacity="0.7">
            <line x1={c.cx} y1={c.cy} x2={c.cx + 30 + Math.sin(t + i) * 4} y2={c.cy + 25}
              stroke="rgba(255,140,80,0.6)" strokeWidth="1" strokeDasharray="2 3" />
            <text x={c.cx + 35} y={c.cy + 32} fontFamily="'JetBrains Mono', monospace" fontSize="8"
              letterSpacing="0.18em" fill="rgba(255,180,140,0.8)">+24h: ↑37%</text>
          </g>
        ))}
      </g>
      <g transform={`translate(20 ${h - 110})`}>
        <rect width={w - 40} height="90" rx="6" fill="rgba(255,140,80,0.06)"
          stroke="rgba(255,140,80,0.35)" strokeWidth="0.8" />
        <g transform="translate(14 22)">
          <circle cx="0" cy="0" r="5" fill="rgba(255,140,80,0.95)" filter="url(#v2-glow)">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <text x="14" y="4" fontFamily="'Inter', sans-serif" fontSize="13" fontWeight="600"
            letterSpacing="0.06em" fill="rgba(255,200,170,0.97)">PREDICTIVE ALERT · CASABLANCA-RABAT AXIS</text>
        </g>
        <text x="14" y="48" fontFamily="'JetBrains Mono', monospace" fontSize="10" letterSpacing="0.1em"
          fill="rgba(220,235,250,0.85)">ILI cluster · prob 0.84 · est. peak D+4 · 9.1 days ahead of conventional surveillance</text>
        <text x="14" y="68" fontFamily="'JetBrains Mono', monospace" fontSize="9" letterSpacing="0.18em"
          fill="rgba(180,220,255,0.55)">DRIVERS: oseltamivir ↑247% · pseudoephedrine ↑183% · cough syrup ↑164%</text>
        <text x={w - 54} y="48" fontFamily="'JetBrains Mono', monospace" fontSize="22" fontWeight="700"
          fill="rgba(255,180,140,0.95)" textAnchor="end">−9.1d</text>
        <text x={w - 54} y="62" fontFamily="'JetBrains Mono', monospace" fontSize="8" letterSpacing="0.2em"
          fill="rgba(255,180,140,0.7)" textAnchor="end">LEAD TIME</text>
      </g>
    </g>
  )
}

const SignalCategories = ({ t }: { t: number }) => {
  const cats = [
    { label: 'ANTIBIOTICS', k: 'J01', delta: '+14%', hot: false },
    { label: 'ANTIVIRALS', k: 'J05', delta: '+247%', hot: true },
    { label: 'COUGH MEDS', k: 'R05', delta: '+164%', hot: true },
    { label: 'OTC ANALGESICS', k: 'N02', delta: '+22%', hot: false },
    { label: 'DECONGESTANTS', k: 'R01', delta: '+183%', hot: true },
    { label: 'ANTIHISTAMINES', k: 'R06', delta: '+9%', hot: false },
    { label: 'ORAL REHYDRATION', k: 'A07', delta: '+41%', hot: false },
  ]
  const x0 = 120, y0 = 850, w = 1680
  const colW = w / cats.length
  return (
    <g transform={`translate(${x0} ${y0})`}>
      <text x="0" y="-12" fontFamily="'JetBrains Mono', monospace" fontSize="9" letterSpacing="0.25em"
        fill="rgba(150,200,240,0.55)">LIVE SIGNAL CATEGORIES — ALL PHARMACIES, LAST 60 MINUTES</text>
      <line x1="0" y1="0" x2={w} y2="0" stroke="rgba(0,220,255,0.2)" strokeWidth="0.6" />
      {cats.map((c, i) => {
        const x = i * colW
        return (
          <g key={c.k} transform={`translate(${x} 0)`}>
            <text x="0" y="20" fontFamily="'Inter', sans-serif" fontSize="11" fontWeight="600"
              letterSpacing="0.08em" fill={c.hot ? 'rgba(255,180,140,0.95)' : 'rgba(220,235,250,0.9)'}>{c.label}</text>
            <text x="0" y="36" fontFamily="'JetBrains Mono', monospace" fontSize="9" letterSpacing="0.18em"
              fill="rgba(150,200,240,0.55)">ATC · {c.k}</text>
            <text x={colW - 24} y="28" textAnchor="end" fontFamily="'JetBrains Mono', monospace" fontSize="14" fontWeight="700"
              fill={c.hot ? 'rgba(255,180,140,0.95)' : 'rgba(0,220,255,0.85)'}>{c.delta}</text>
            <g transform="translate(0 44)">
              {Array.from({ length: 24 }, (_, k) => {
                const v = 0.2 + 0.8 * Math.abs(Math.sin(k * 0.4 + i + t * 0.8))
                return (
                  <rect key={k} x={k * 6} y={16 - v * 14} width="3.5" height={v * 14}
                    fill={c.hot ? `rgba(255,140,80,${0.3 + v * 0.5})` : `rgba(0,220,255,${0.25 + v * 0.4})`} />
                )
              })}
            </g>
          </g>
        )
      })}
    </g>
  )
}

export default function SlideVisualSensor({ isPrint, isAnimated }: { config: SlideConfig; isPrint?: boolean; isAnimated?: boolean }) {
  const [t, setT] = useState(0)

  useEffect(() => {
    if (isPrint || isAnimated === false) return
    let raf: number
    const start = performance.now()
    const loop = (now: number) => {
      setT((now - start) / 1000)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [isPrint, isAnimated])

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
      <svg viewBox="0 0 1920 1080" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="v2-bg" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0a1430" />
            <stop offset="55%" stopColor="#060c1f" />
            <stop offset="100%" stopColor="#020410" />
          </radialGradient>
          <pattern id="v2-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(80,150,220,0.05)" strokeWidth="1" />
          </pattern>
          <linearGradient id="v2-glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(150,210,255,0.13)" />
            <stop offset="100%" stopColor="rgba(20,40,90,0.04)" />
          </linearGradient>
          <radialGradient id="v2-node-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,220,255,0.7)" />
            <stop offset="60%" stopColor="rgba(0,220,255,0.12)" />
            <stop offset="100%" stopColor="rgba(0,220,255,0)" />
          </radialGradient>
          <radialGradient id="v2-heat" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,220,255,0.55)" />
            <stop offset="50%" stopColor="rgba(0,150,220,0.18)" />
            <stop offset="100%" stopColor="rgba(0,150,220,0)" />
          </radialGradient>
          <radialGradient id="v2-heat-warm" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,140,80,0.55)" />
            <stop offset="50%" stopColor="rgba(255,80,80,0.18)" />
            <stop offset="100%" stopColor="rgba(255,80,80,0)" />
          </radialGradient>
          <filter id="v2-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="v2-glow-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect width="1920" height="1080" fill="url(#v2-bg)" />
        <rect width="1920" height="1080" fill="url(#v2-grid)" />

        <g fontFamily="'JetBrains Mono', monospace" fill="rgba(150,200,240,0.55)" fontSize="11" letterSpacing="0.18em">
          <text x="60" y="60">PANOPTES // NATIONAL EPIDEMIOLOGICAL SENSOR GRID</text>
          <text x="60" y="80" fill="rgba(0,220,255,0.85)">STATE: LIVE · 14,238 PHARMACIES STREAMING</text>
          <text x="1860" y="60" textAnchor="end">SYNC · {(t % 60).toFixed(2)}s</text>
          <text x="1860" y="80" textAnchor="end" fill="rgba(0,220,255,0.85)">DETECTION LEAD: −9.1 DAYS</text>
        </g>

        <g fontFamily="'JetBrains Mono', monospace" fontSize="10" letterSpacing="0.3em" fill="rgba(150,200,240,0.5)">
          <text x="280" y="155">01 · EXISTING PHARMACY SOFTWARE</text>
          <text x="800" y="155" fill="rgba(0,220,255,0.8)">02 · PANOPTES AI EXTENSION</text>
          <text x="1280" y="155">03 · NATIONAL EPIDEMIOLOGY ENGINE</text>
        </g>

        <PharmacySoftware t={t} x={120} y={190} w={520} h={620} />
        <ExtensionWidget t={t} x={720} y={300} w={300} h={420} />
        <SignalStream t={t} x1={640} y1={500} x2={720} y2={500} />
        <SignalStream t={t} x1={1020} y1={500} x2={1180} y2={500} />
        <NationalEngine t={t} x={1180} y={190} w={680} h={620} />
        <SignalCategories t={t} />

        <g fontFamily="'Space Grotesk', sans-serif">
          <text x="960" y="1010" textAnchor="middle" fill="rgba(220,235,250,0.95)" fontSize="36" letterSpacing="-0.01em">
            Every pharmacy becomes a real-time health sensor.
          </text>
          <text x="960" y="1048" textAnchor="middle" fill="rgba(0,220,255,0.85)" fontSize="20" fontStyle="italic" letterSpacing="0.02em">
            The system augments existing pharmacy software — never replaces it.
          </text>
        </g>
      </svg>
    </div>
  )
}

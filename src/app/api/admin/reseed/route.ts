import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// New slide order: Argus at 1, Cover shifted to 2, all others +1
const SLIDES = [
  {
    slideIndex: 1,
    configJson: {
      slideIndex: 1, title: '', subtitle: '',
      label: '01 Visual: Argus Panoptes',
      layout: 'visual-argus',
      theme: { background: '#02040d', textColor: '#FFFFFF', accentColor: '#00C2CB' },
      blocks: [],
    },
  },
  {
    slideIndex: 2,
    configJson: {
      slideIndex: 2,
      title: 'The first nervous system for public health.',
      subtitle: '',
      label: '02 Cover',
      layout: 'cover',
      theme: { background: '#0D1B2A', textColor: '#FFFFFF', accentColor: '#00C2CB' },
      blocks: [
        { id: 'brand-wordmark', type: 'text', content: { value: 'PANOPTES' }, style: { fontSize: '7xl', fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'grotesk' } },
        { id: 'brand-tagline', type: 'text', content: { value: 'Real-Time Health Intelligence' }, style: { fontSize: 'sm', fontWeight: 'normal', color: '#00C2CB', fontFamily: 'mono', letterSpacing: '0.3em' } },
        { id: 'cover-title', type: 'text', content: { value: 'The first nervous system\nfor public health.' }, style: { fontSize: '7xl', fontWeight: 'semibold', color: '#FFFFFF', fontFamily: 'grotesk' } },
        { id: 'cover-pillars', type: 'text', content: { value: 'EARLY DETECTION  ·  REAL-TIME MONITORING  ·  PREDICTIVE INTELLIGENCE' }, style: { fontSize: 'base', fontWeight: 'normal', color: '#00C2CB', fontFamily: 'mono', letterSpacing: '0.4em' } },
        { id: 'cover-footer-left', type: 'text', content: { value: 'EVERY PHARMACY · A REAL-TIME HEALTH SENSOR' }, style: { fontSize: 'xs', fontWeight: 'normal', color: 'rgba(232,237,242,0.32)', fontFamily: 'mono', letterSpacing: '0.2em' } },
        { id: 'cover-footer-right', type: 'text', content: { value: 'INVESTOR DECK · 2026' }, style: { fontSize: 'xs', fontWeight: 'normal', color: 'rgba(232,237,242,0.32)', fontFamily: 'mono', letterSpacing: '0.2em' } },
      ],
    },
  },
  // Slides 3-18: shifted +1 from original indices
  // These only update slideIndex + label — all other content stays unchanged via update
]

const SHIFTED_UPDATES: { oldIndex: number; newIndex: number; newLabel: string }[] = [
  { oldIndex: 2, newIndex: 3,  newLabel: '03 The Problem' },
  { oldIndex: 3, newIndex: 4,  newLabel: '04 Visual: Fragmented' },
  { oldIndex: 4, newIndex: 5,  newLabel: '05 The Solution' },
  { oldIndex: 5, newIndex: 6,  newLabel: '06 Transforming Sales' },
  { oldIndex: 6, newIndex: 7,  newLabel: '07 Visual: Sensor Network' },
  { oldIndex: 7, newIndex: 8,  newLabel: '08 Surrogate Endpoint' },
  { oldIndex: 8, newIndex: 9,  newLabel: '09 Filtering Single' },
  { oldIndex: 9, newIndex: 10, newLabel: '10 Filtering Multiple' },
  { oldIndex: 10, newIndex: 11, newLabel: '11 Data Infrastructure' },
  { oldIndex: 11, newIndex: 12, newLabel: '12 Traction' },
  { oldIndex: 12, newIndex: 13, newLabel: '13 Strategic Advantage' },
  { oldIndex: 13, newIndex: 14, newLabel: '14 Revenue Growth' },
  { oldIndex: 14, newIndex: 15, newLabel: '15 Margin Model' },
  { oldIndex: 15, newIndex: 16, newLabel: '16 Investment' },
  { oldIndex: 16, newIndex: 17, newLabel: '17 Team' },
  { oldIndex: 17, newIndex: 18, newLabel: '18 Closing' },
]

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const log: string[] = []

    // Step 1: check if already migrated (Argus already at index 1)
    const existing1 = await prisma.slideConfig.findUnique({ where: { slideIndex: 1 } })
    const alreadyMigrated = (existing1?.configJson as any)?.layout === 'visual-argus'
    if (alreadyMigrated) {
      return NextResponse.json({ ok: true, message: 'Already migrated — Argus is already at slide 1.' })
    }

    // Step 2: shift slides 17→18, 16→17, ..., 2→3 in reverse to avoid unique constraint conflicts
    for (const { oldIndex, newIndex, newLabel } of [...SHIFTED_UPDATES].reverse()) {
      const record = await prisma.slideConfig.findUnique({ where: { slideIndex: oldIndex } })
      if (!record) { log.push(`  skip ${oldIndex} (not found)`); continue }

      const cfg = record.configJson as any
      cfg.slideIndex = newIndex
      cfg.label = newLabel

      // Check if target already exists (might conflict)
      const targetExists = await prisma.slideConfig.findUnique({ where: { slideIndex: newIndex } })
      if (targetExists) {
        await prisma.slideConfig.update({ where: { slideIndex: newIndex }, data: { configJson: cfg } })
        log.push(`  updated ${newIndex}: ${newLabel}`)
      } else {
        await prisma.slideConfig.create({ data: { slideIndex: newIndex, configJson: cfg } })
        log.push(`  created ${newIndex}: ${newLabel}`)
      }
    }

    // Step 3: overwrite slide 1 with Argus content
    await prisma.slideConfig.upsert({
      where: { slideIndex: 1 },
      update: { configJson: SLIDES[0].configJson as object },
      create: { slideIndex: 1, configJson: SLIDES[0].configJson as object },
    })
    log.push('  ✓ slide 1: Argus Panoptes (opener)')

    // Step 4: ensure Cover at 2 has correct content
    await prisma.slideConfig.update({
      where: { slideIndex: 2 },
      data: { configJson: SLIDES[1].configJson as object },
    })
    log.push('  ✓ slide 2: Cover')

    return NextResponse.json({ ok: true, log })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

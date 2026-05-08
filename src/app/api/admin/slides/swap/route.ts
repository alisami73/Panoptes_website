import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { idA, idB } = await req.json()
  if (!idA || !idB) return NextResponse.json({ error: 'Missing ids' }, { status: 400 })

  const [slideA, slideB] = await Promise.all([
    prisma.slideConfig.findUnique({ where: { id: idA } }),
    prisma.slideConfig.findUnique({ where: { id: idB } }),
  ])
  if (!slideA || !slideB) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const idxA = slideA.slideIndex
  const idxB = slideB.slideIndex
  const cfgA = slideA.configJson as Record<string, unknown>
  const cfgB = slideB.configJson as Record<string, unknown>

  // 3-step swap to avoid unique-index collision (PostgreSQL checks per statement by default)
  await prisma.slideConfig.update({ where: { id: idA }, data: { slideIndex: -idxA } })
  await prisma.slideConfig.update({
    where: { id: idB },
    data: { slideIndex: idxA, configJson: { ...cfgB, slideIndex: idxA } },
  })
  await prisma.slideConfig.update({
    where: { id: idA },
    data: { slideIndex: idxB, configJson: { ...cfgA, slideIndex: idxB } },
  })

  return NextResponse.json({ ok: true })
}

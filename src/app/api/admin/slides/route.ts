import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CONSENT_STORAGE_SLIDE_INDEX } from '@/lib/site-consent'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const slides = await prisma.slideConfig.findMany({
    where: {
      slideIndex: { lt: CONSENT_STORAGE_SLIDE_INDEX },
    },
    orderBy: { slideIndex: 'asc' },
  })
  return NextResponse.json(slides)
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const theme = await prisma.globalTheme.findFirst()
  return NextResponse.json(theme)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { background, accent, textColor, secondary } = await req.json()

  const existing = await prisma.globalTheme.findFirst()

  const theme = existing
    ? await prisma.globalTheme.update({
        where: { id: existing.id },
        data: { background, accent, textColor, secondary },
      })
    : await prisma.globalTheme.create({
        data: { id: 'default', background, accent, textColor, secondary },
      })

  return NextResponse.json(theme)
}

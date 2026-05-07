import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { configJson } = await req.json()
  if (!configJson) return NextResponse.json({ error: 'Missing configJson' }, { status: 400 })

  const slide = await prisma.slideConfig.update({
    where: { id: params.id },
    data: { configJson },
  })

  return NextResponse.json(slide)
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const slide = await prisma.slideConfig.findUnique({ where: { id: params.id } })
  if (!slide) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(slide)
}

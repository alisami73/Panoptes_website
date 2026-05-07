import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { tokenExpiryDate } from '@/lib/token'
import { sendAccessEmail } from '@/lib/email'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action } = await req.json()

  if (action === 'revoke') {
    const token = await prisma.accessToken.update({
      where: { id: params.id },
      data: { revokedAt: new Date() },
    })
    return NextResponse.json(token)
  }

  if (action === 'extend') {
    const current = await prisma.accessToken.findUnique({ where: { id: params.id } })
    if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const newExpiry = tokenExpiryDate(30)
    const token = await prisma.accessToken.update({
      where: { id: params.id },
      data: { expiresAt: newExpiry, revokedAt: null },
    })
    return NextResponse.json(token)
  }

  if (action === 'resend') {
    const current = await prisma.accessToken.findUnique({ where: { id: params.id } })
    if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await sendAccessEmail(current.email, current.token, current.expiresAt)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateToken, tokenExpiryDate } from '@/lib/token'
import { sendAccessEmail } from '@/lib/email'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tokens = await prisma.accessToken.findMany({
    orderBy: { createdAt: 'desc' },
    include: { accessRequest: true },
  })

  return NextResponse.json(tokens)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, note, requestId } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const token = generateToken()
  const expiresAt = tokenExpiryDate(30)

  const accessToken = await prisma.accessToken.create({
    data: { token, email, note, expiresAt },
  })

  // Link to access request if provided
  if (requestId) {
    await prisma.accessRequest.update({
      where: { id: requestId },
      data: {
        status: 'sent',
        accessTokenId: accessToken.id,
      },
    })
  }

  await sendAccessEmail(email, token, expiresAt)

  return NextResponse.json(accessToken)
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendAccessRequestNotification } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { name, organization, email, message } = await req.json()

    if (!name || !organization || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const request = await prisma.accessRequest.create({
      data: { name, organization, email, message: message || null },
    })

    await sendAccessRequestNotification({ name, organization, email, message })

    return NextResponse.json({ success: true, id: request.id })
  } catch (error) {
    console.error('Access request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

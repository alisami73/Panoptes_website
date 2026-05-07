import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAdminConsentState, publishConsentDraft, saveConsentDraft } from '@/lib/site-consent'

function getAdminIdentity(session: any) {
  return session?.user?.email || session?.user?.name || 'Admin'
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const state = await getAdminConsentState()
  return NextResponse.json(state)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { text } = await req.json()

  try {
    const state = await saveConsentDraft(text, getAdminIdentity(session))
    return NextResponse.json({ ok: true, state })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save consent draft.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { text } = await req.json()

  try {
    const result = await publishConsentDraft(text, getAdminIdentity(session))
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to publish consent.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

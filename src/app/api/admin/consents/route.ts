import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getConsentAdminPayload, publishConsentDraft, rollbackConsentVersion, saveConsentDraft } from '@/lib/site-consent'

function getAdminIdentity(session: any) {
  return session?.user?.email || session?.user?.name || 'Admin'
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = await getConsentAdminPayload()
  return NextResponse.json(payload)
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

  const { text, action, version } = await req.json()

  try {
    const result = action === 'rollback'
      ? await rollbackConsentVersion(version, getAdminIdentity(session))
      : await publishConsentDraft(text, getAdminIdentity(session))
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to process consent publication.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

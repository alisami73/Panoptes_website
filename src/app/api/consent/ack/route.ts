import { NextRequest, NextResponse } from 'next/server'
import {
  CONSENT_COOKIE_NAME,
  CONSENT_VISITOR_COOKIE_NAME,
  createVisitorId,
  encodeConsentAckCookie,
  getPublicConsentState,
  recordConsentAcceptance,
} from '@/lib/site-consent'

function getClientIp(req: NextRequest) {
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || null

  return req.headers.get('x-real-ip')
}

export async function POST(req: NextRequest) {
  const { pathname } = await req.json().catch(() => ({ pathname: null }))
  const visitorId = req.cookies.get(CONSENT_VISITOR_COOKIE_NAME)?.value || createVisitorId()

  try {
    const policy = await getPublicConsentState()
    const result = await recordConsentAcceptance({
      visitorId,
      pathname: pathname ? String(pathname) : null,
      ipAddress: getClientIp(req),
      userAgent: req.headers.get('user-agent'),
    })

    const response = NextResponse.json({
      ok: true,
      policy: {
        ...policy,
        acknowledgedCurrentVersion: true,
      },
      record: result.record,
    })

    response.cookies.set(CONSENT_VISITOR_COOKIE_NAME, visitorId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    })

    response.cookies.set(CONSENT_COOKIE_NAME, encodeConsentAckCookie(result.cookiePayload), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    })

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to record consent acceptance.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

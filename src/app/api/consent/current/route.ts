import { NextResponse } from 'next/server'
import { DEFAULT_SITE_CONSENT_TEXT, getPublicConsentState, hashConsentText } from '@/lib/site-consent'

export async function GET() {
  try {
    const consent = await getPublicConsentState()
    return NextResponse.json(consent)
  } catch {
    return NextResponse.json(
      {
        version: 'v1',
        text: DEFAULT_SITE_CONSENT_TEXT,
        textHash: hashConsentText(DEFAULT_SITE_CONSENT_TEXT),
        originalFileHash: hashConsentText(DEFAULT_SITE_CONSENT_TEXT),
        sourceFileName: 'panoptes-consent-v1.txt',
        publishedAt: '2026-05-07T00:00:00.000Z',
        publishedBy: null,
      },
      { status: 200 },
    )
  }
}

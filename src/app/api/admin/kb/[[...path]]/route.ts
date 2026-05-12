import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DEFAULT_KB_UPSTREAM = 'http://veillesanitaire-kb.francecentral.azurecontainer.io:8010'

type RouteContext = {
  params: {
    path?: string[]
  }
}

function getKbUpstreamBase() {
  return (process.env.KB_DASHBOARD_UPSTREAM || DEFAULT_KB_UPSTREAM).replace(/\/$/, '')
}

function buildTargetUrl(req: NextRequest, pathSegments: string[] = []) {
  const path = '/' + pathSegments.map(segment => encodeURIComponent(segment)).join('/')
  const target = new URL(path, `${getKbUpstreamBase()}/`)
  target.search = new URL(req.url).search
  return target
}

function buildUpstreamHeaders(req: NextRequest) {
  const headers = new Headers(req.headers)
  headers.delete('host')
  headers.delete('connection')

  const kbPassword = process.env.KB_DASHBOARD_PASSWORD?.trim()
  if (kbPassword) {
    const token = Buffer.from(`admin:${kbPassword}`, 'utf8').toString('base64')
    headers.set('authorization', `Basic ${token}`)
  } else {
    headers.delete('authorization')
  }

  return headers
}

async function proxyToKnowledgeBase(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const target = buildTargetUrl(req, context.params.path)

  const init: RequestInit & { duplex?: 'half' } = {
    method: req.method,
    headers: buildUpstreamHeaders(req),
    cache: 'no-store',
    redirect: 'manual',
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = req.body
    init.duplex = 'half'
  }

  const upstreamResponse = await fetch(target, init)
  const responseHeaders = new Headers(upstreamResponse.headers)
  responseHeaders.delete('content-encoding')
  responseHeaders.delete('content-length')
  responseHeaders.delete('x-frame-options')

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  })
}

export async function GET(req: NextRequest, context: RouteContext) {
  return proxyToKnowledgeBase(req, context)
}

export async function POST(req: NextRequest, context: RouteContext) {
  return proxyToKnowledgeBase(req, context)
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return proxyToKnowledgeBase(req, context)
}

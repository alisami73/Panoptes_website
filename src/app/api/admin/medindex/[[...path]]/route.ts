import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

type RouteContext = { params: { path?: string[] } }

function getUpstreamBase() {
  return (process.env.MEDINDEX_API_URL || '').replace(/\/$/, '')
}

async function proxy(req: NextRequest, context: RouteContext) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const upstream = getUpstreamBase()
  if (!upstream) {
    return NextResponse.json({ error: 'MEDINDEX_API_URL not configured' }, { status: 503 })
  }

  const segments = context.params.path ?? []
  const targetPath = '/api/medindex/' + segments.map(encodeURIComponent).join('/')
  const target = new URL(targetPath, upstream + '/')
  target.search = new URL(req.url).search

  const headers = new Headers(req.headers)
  headers.delete('host')
  headers.delete('connection')
  headers.set('Accept', 'application/json')

  const init: RequestInit & { duplex?: 'half' } = {
    method: req.method,
    headers,
    cache: 'no-store',
    redirect: 'manual',
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = req.body
    init.duplex = 'half'
  }

  const upstream_res = await fetch(target, init)
  const resHeaders = new Headers(upstream_res.headers)
  resHeaders.delete('content-encoding')
  resHeaders.delete('content-length')

  return new Response(upstream_res.body, {
    status: upstream_res.status,
    statusText: upstream_res.statusText,
    headers: resHeaders,
  })
}

export async function GET(req: NextRequest, ctx: RouteContext) { return proxy(req, ctx) }
export async function POST(req: NextRequest, ctx: RouteContext) { return proxy(req, ctx) }
export async function PUT(req: NextRequest, ctx: RouteContext) { return proxy(req, ctx) }
export async function DELETE(req: NextRequest, ctx: RouteContext) { return proxy(req, ctx) }

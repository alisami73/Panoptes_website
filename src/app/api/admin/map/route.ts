import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DEFAULT_DISEASES } from '@/data/epi-map-data'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const records = await prisma.epiMapData.findMany({ orderBy: { diseaseId: 'asc' } })
    if (records.length === 0) return NextResponse.json({ diseases: DEFAULT_DISEASES })
    const diseases = records.filter(r => r.period === 'today').map(r => ({
      id: r.diseaseId,
      name: r.disease,
      regions: r.data,
      alerts: r.alerts,
      stats: r.stats,
    }))
    return NextResponse.json({ diseases })
  } catch {
    return NextResponse.json({ diseases: DEFAULT_DISEASES })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { diseaseId, disease, period, data, alerts, stats } = body

  if (!diseaseId || !disease || !data) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const record = await prisma.epiMapData.upsert({
    where: { diseaseId_period: { diseaseId, period: period ?? 'today' } },
    update: { disease, data, alerts: alerts ?? [], stats: stats ?? { alert: 0, up: 0, stable: 0 } },
    create: { diseaseId, disease, period: period ?? 'today', data, alerts: alerts ?? [], stats: stats ?? { alert: 0, up: 0, stable: 0 } },
  })

  return NextResponse.json({ record })
}

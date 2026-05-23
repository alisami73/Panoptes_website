import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getPool, initSchema } from '@/lib/medindex-db'

export const dynamic = 'force-dynamic'

type Ctx = { params: { path?: string[] } }

async function auth(req: NextRequest) {
  return getToken({ req, secret: process.env.NEXTAUTH_SECRET })
}

async function handle(req: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const token = await auth(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await initSchema()
  const db = getPool()
  const segments = ctx.params.path ?? []
  const [seg0, seg1, seg2, seg3] = segments
  const method = req.method

  // GET /dashboard
  if (!seg0 || seg0 === 'dashboard') {
    const [total, pending, queue, links] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM medindex_medicaments`),
      db.query(`SELECT COUNT(*) FROM medindex_medicaments WHERE extraction_state != 'success'`),
      db.query(`SELECT COUNT(*) FROM medindex_review_queue WHERE status = 'pending'`),
      db.query(`SELECT method, COUNT(*) as n FROM medindex_concept_links GROUP BY method`),
    ])
    const scores = await db.query(`
      SELECT
        COUNT(*) FILTER (WHERE score_composite >= 90) as green,
        COUNT(*) FILTER (WHERE score_composite >= 80 AND score_composite < 90) as blue,
        COUNT(*) FILTER (WHERE score_composite >= 60 AND score_composite < 80) as orange,
        COUNT(*) FILTER (WHERE score_composite < 60 AND score_composite IS NOT NULL) as red
      FROM medindex_medicaments
    `)
    const states = await db.query(`SELECT validation_state, COUNT(*) as n FROM medindex_medicaments GROUP BY validation_state`)
    const extraction = await db.query(`SELECT extraction_state, COUNT(*) as n FROM medindex_medicaments GROUP BY extraction_state`)
    const top = await db.query(`SELECT id, name, COALESCE(score_composite,0) as score, COALESCE(validation_state,'pending') as state FROM medindex_medicaments WHERE score_composite IS NOT NULL ORDER BY score_composite ASC LIMIT 10`)

    return NextResponse.json({
      total_dosages: Number(total.rows[0].count),
      untransformed: Number(pending.rows[0].count),
      pending_review: Number(queue.rows[0].count),
      cost_total: 0,
      links_by_method: Object.fromEntries(links.rows.map((r: any) => [r.method, Number(r.n)])),
      score_bands: { green: Number(scores.rows[0].green), blue: Number(scores.rows[0].blue), orange: Number(scores.rows[0].orange), red: Number(scores.rows[0].red) },
      fhir_by_validation: Object.fromEntries(states.rows.map((r: any) => [r.validation_state ?? 'non défini', Number(r.n)])),
      extraction_stats: Object.fromEntries(extraction.rows.map((r: any) => [r.extraction_state ?? 'pending', Number(r.n)])),
      top_problems: top.rows.map((r: any) => ({ id: String(r.id), name: r.name, score: Number(r.score), state: r.state })),
    })
  }

  // /medicaments
  if (seg0 === 'medicaments') {

    // GET /medicaments
    if (!seg1 && method === 'GET') {
      const url = new URL(req.url)
      const page = Number(url.searchParams.get('page') ?? 1)
      const perPage = Number(url.searchParams.get('perPage') ?? 20)
      const search = url.searchParams.get('search') ?? ''
      const offset = (page - 1) * perPage

      const where = search ? `WHERE name ILIKE $3 OR dci ILIKE $3` : ''
      const params: any[] = [perPage, offset]
      if (search) params.push(`%${search}%`)

      const [rows, count] = await Promise.all([
        db.query(`SELECT id, name, score_composite as quality_score_composite, score_extraction as quality_score_extraction, score_terminology as quality_score_terminology, score_projection as quality_score_projection, validation_state, extraction_state FROM medindex_medicaments ${where} ORDER BY id DESC LIMIT $1 OFFSET $2`, params),
        db.query(`SELECT COUNT(*) FROM medindex_medicaments ${where}`, search ? [`%${search}%`] : []),
      ])
      const total = Number(count.rows[0].count)
      return NextResponse.json({
        data: rows.rows.map((r: any) => ({ ...r, id: String(r.id) })),
        meta: { current_page: page, last_page: Math.ceil(total / perPage) || 1, total, per_page: perPage, untransformed_count: 0 },
      })
    }

    if (seg1) {
      const mid = seg1

      // POST /medicaments/:id/action
      if (seg2 === 'action' && method === 'POST') {
        const body = await req.json()
        await db.query(`UPDATE medindex_medicaments SET validation_state=$1, updated_at=NOW() WHERE id=$2`, [body.action, mid])
        return NextResponse.json({ ok: true })
      }

      // GET /medicaments/:id
      if (!seg2 && method === 'GET') {
        const [med, links] = await Promise.all([
          db.query(`SELECT * FROM medindex_medicaments WHERE id=$1`, [mid]),
          db.query(`SELECT * FROM medindex_concept_links WHERE medicament_id=$1`, [mid]),
        ])
        if (!med.rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        const m = med.rows[0]
        return NextResponse.json({
          id: String(m.id), name: m.name,
          fhir: m.fhir_json,
          dosage: { dci: m.dci, dosage: m.dosage, forme: m.forme, atc_code: m.atc_code },
          extraction: m.extraction_json,
          links: { all: links.rows.map((l: any) => ({ ...l, id: String(l.id) })) },
          cuds: [],
          scores: { composite: m.score_composite, extraction: m.score_extraction, terminology: m.score_terminology, projection: m.score_projection },
        })
      }

      // /links
      if (seg2 === 'links') {
        if (!seg3 && method === 'POST') {
          const body = await req.json()
          await db.query(`INSERT INTO medindex_concept_links (medicament_id,source_text,code,system,label_fr,label_en,rel_type) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [mid, body.source_text, body.code, body.system, body.label_fr, body.label_en, body.rel_type])
          return NextResponse.json({ ok: true })
        }
        if (seg3 && method === 'DELETE') {
          await db.query(`DELETE FROM medindex_concept_links WHERE id=$1 AND medicament_id=$2`, [seg3, mid])
          return NextResponse.json({ ok: true })
        }
        if (seg3 && method === 'PUT' && segments[4] === 'confidence') {
          const body = await req.json()
          await db.query(`UPDATE medindex_concept_links SET confidence=$1 WHERE id=$2 AND medicament_id=$3`, [body.confidence, seg3, mid])
          return NextResponse.json({ ok: true })
        }
      }

      // /extraction/:field
      if (seg2 === 'extraction' && seg3 && method === 'PUT') {
        const body = await req.json()
        await db.query(`UPDATE medindex_medicaments SET extraction_json = COALESCE(extraction_json,'{}')::jsonb || jsonb_build_object($1::text,$2::text), updated_at=NOW() WHERE id=$3`,
          [seg3, body.value, mid])
        return NextResponse.json({ ok: true })
      }
    }
  }

  // /review-queue
  if (seg0 === 'review-queue') {
    if (!seg1 && method === 'GET') {
      const url = new URL(req.url)
      const status = url.searchParams.get('status') ?? 'pending'
      const page = Number(url.searchParams.get('page') ?? 1)
      const perPage = 20
      const offset = (page - 1) * perPage
      const rows = await db.query(
        `SELECT q.*, m.name as medicament_name FROM medindex_review_queue q LEFT JOIN medindex_medicaments m ON m.id=q.medicament_id WHERE q.status=$1 ORDER BY q.created_at DESC LIMIT $2 OFFSET $3`,
        [status, perPage, offset]
      )
      const count = await db.query(`SELECT COUNT(*) FROM medindex_review_queue WHERE status=$1`, [status])
      const total = Number(count.rows[0].count)
      return NextResponse.json({
        data: rows.rows.map((r: any) => ({ ...r, id: String(r.id), molecule_dosage: { name: r.medicament_name } })),
        meta: { current_page: page, last_page: Math.ceil(total / perPage) || 1, total, per_page: perPage },
      })
    }

    if (!seg1 && method === 'POST') {
      const body = await req.json()
      await db.query(`INSERT INTO medindex_review_queue (medicament_id,source_text,relationship_type,candidates) VALUES ($1,$2,$3,$4)`,
        [body.medicament_id ?? null, body.source_text, body.relationship_type, JSON.stringify([])])
      return NextResponse.json({ ok: true })
    }

    if (seg1 && seg2 === 'action' && method === 'POST') {
      const body = await req.json()
      await db.query(`UPDATE medindex_review_queue SET status=$1, review_notes=$2, reviewed_at=NOW(), reviewed_by_email=$3 WHERE id=$4`,
        [body.action === 'approve' ? 'approved' : body.action === 'reject' ? 'rejected' : body.action, body.notes ?? null, (token as any).email ?? null, seg1])
      return NextResponse.json({ ok: true })
    }

    if (seg1 && seg2 === 'reopen' && method === 'POST') {
      await db.query(`UPDATE medindex_review_queue SET status='pending', reviewed_at=NULL WHERE id=$1`, [seg1])
      return NextResponse.json({ ok: true })
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function GET(req: NextRequest, ctx: Ctx) { return handle(req, ctx) }
export async function POST(req: NextRequest, ctx: Ctx) { return handle(req, ctx) }
export async function PUT(req: NextRequest, ctx: Ctx) { return handle(req, ctx) }
export async function DELETE(req: NextRequest, ctx: Ctx) { return handle(req, ctx) }

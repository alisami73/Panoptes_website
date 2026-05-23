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

  try {
    await initSchema()
  } catch (e: any) {
    return NextResponse.json({ error: 'DB init failed', detail: e.message }, { status: 500 })
  }

  const db = getPool()
  const segments = ctx.params.path ?? []
  const [seg0, seg1, seg2, seg3] = segments
  const method = req.method

  // ── GET /dashboard ──────────────────────────────────────────────────────────
  if (!seg0 || seg0 === 'dashboard') {
    const [total, untransformed, queue, costRow, links, scores, states, extraction, top] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM molecule_dosages WHERE deleted_at IS NULL`),
      db.query(`
        SELECT COUNT(*) FROM molecule_dosages md WHERE deleted_at IS NULL
        AND NOT EXISTS (SELECT 1 FROM fhir_medication_knowledge fk WHERE fk.molecule_dosage_id = md.id)
      `),
      db.query(`SELECT COUNT(*) FROM terminology_review_queue WHERE status = 'pending'`),
      db.query(`SELECT COALESCE(SUM(cost_usd), 0) as total FROM medication_clinical_extractions`),
      db.query(`SELECT mapping_method, COUNT(*) as n FROM medication_concept_links GROUP BY mapping_method`),
      db.query(`
        SELECT
          COUNT(*) FILTER (WHERE quality_score_composite >= 90) as green,
          COUNT(*) FILTER (WHERE quality_score_composite >= 80 AND quality_score_composite < 90) as blue,
          COUNT(*) FILTER (WHERE quality_score_composite >= 60 AND quality_score_composite < 80) as orange,
          COUNT(*) FILTER (WHERE quality_score_composite < 60 AND quality_score_composite IS NOT NULL) as red
        FROM fhir_medication_knowledge
      `),
      db.query(`SELECT validation_state, COUNT(*) as n FROM fhir_medication_knowledge GROUP BY validation_state`),
      db.query(`SELECT extraction_state, COUNT(*) as n FROM medication_clinical_extractions GROUP BY extraction_state`),
      db.query(`
        SELECT fk.molecule_dosage_id as id, md.name, fk.quality_score_composite as score, fk.validation_state as state
        FROM fhir_medication_knowledge fk
        JOIN molecule_dosages md ON md.id = fk.molecule_dosage_id
        WHERE fk.quality_score_composite IS NOT NULL
        ORDER BY fk.quality_score_composite ASC LIMIT 10
      `),
    ])

    return NextResponse.json({
      total_dosages: Number(total.rows[0].count),
      untransformed: Number(untransformed.rows[0].count),
      pending_review: Number(queue.rows[0].count),
      cost_total: Number(costRow.rows[0].total),
      links_by_method: Object.fromEntries(links.rows.map((r: any) => [r.mapping_method, Number(r.n)])),
      score_bands: {
        green: Number(scores.rows[0]?.green ?? 0),
        blue: Number(scores.rows[0]?.blue ?? 0),
        orange: Number(scores.rows[0]?.orange ?? 0),
        red: Number(scores.rows[0]?.red ?? 0),
      },
      fhir_by_validation: Object.fromEntries(states.rows.map((r: any) => [r.validation_state ?? 'pending', Number(r.n)])),
      extraction_stats: Object.fromEntries(extraction.rows.map((r: any) => [r.extraction_state ?? 'pending', Number(r.n)])),
      top_problems: top.rows.map((r: any) => ({ id: r.id, name: r.name, score: Number(r.score), state: r.state ?? 'pending' })),
    })
  }

  // ── /medicaments ─────────────────────────────────────────────────────────────
  if (seg0 === 'medicaments') {

    // GET /medicaments (list)
    if (!seg1 && method === 'GET') {
      const url = new URL(req.url)
      const page = Number(url.searchParams.get('page') ?? 1)
      const perPage = Number(url.searchParams.get('perPage') ?? 50)
      const search = url.searchParams.get('search') ?? ''
      const filterBand = url.searchParams.get('filterBand') ?? ''
      const filterState = url.searchParams.get('filterState') ?? ''
      const filterExtraction = url.searchParams.get('filterExtraction') ?? ''
      const sortBy = url.searchParams.get('sortBy') ?? 'quality_score_composite'
      const sortDir = url.searchParams.get('sortDir') === 'desc' ? 'DESC NULLS LAST' : 'ASC NULLS LAST'
      const offset = (page - 1) * perPage

      const conds: string[] = ['md.deleted_at IS NULL']
      const params: any[] = []
      let idx = 1

      if (search) { conds.push(`md.name ILIKE $${idx++}`); params.push(`%${search}%`) }
      if (filterState === 'untransformed') conds.push(`fk.id IS NULL`)
      else if (filterState) { conds.push(`fk.validation_state = $${idx++}`); params.push(filterState) }
      if (filterBand === 'green') conds.push(`fk.quality_score_composite >= 90`)
      else if (filterBand === 'blue') conds.push(`fk.quality_score_composite >= 80 AND fk.quality_score_composite < 90`)
      else if (filterBand === 'orange') conds.push(`fk.quality_score_composite >= 60 AND fk.quality_score_composite < 80`)
      else if (filterBand === 'red') conds.push(`fk.quality_score_composite < 60`)
      if (filterExtraction) { conds.push(`mce.extraction_state = $${idx++}`); params.push(filterExtraction) }

      const where = `WHERE ${conds.join(' AND ')}`
      const sortCol = sortBy === 'quality_score_composite' ? 'fk.quality_score_composite' : 'md.name'
      const limitIdx = idx++; params.push(perPage)
      const offsetIdx = idx++; params.push(offset)

      const [rows, countRow] = await Promise.all([
        db.query(`
          SELECT md.id, md.name,
            fk.quality_score_composite,
            fk.quality_score_extraction,
            fk.quality_score_terminology,
            fk.quality_score_projection,
            fk.validation_state,
            mce.extraction_state
          FROM molecule_dosages md
          LEFT JOIN fhir_medication_knowledge fk ON fk.molecule_dosage_id = md.id
          LEFT JOIN LATERAL (
            SELECT extraction_state FROM medication_clinical_extractions
            WHERE molecule_dosage_id = md.id ORDER BY created_at DESC LIMIT 1
          ) mce ON true
          ${where}
          ORDER BY ${sortCol} ${sortDir}
          LIMIT $${limitIdx} OFFSET $${offsetIdx}
        `, params),
        db.query(`
          SELECT COUNT(*) FROM molecule_dosages md
          LEFT JOIN fhir_medication_knowledge fk ON fk.molecule_dosage_id = md.id
          LEFT JOIN LATERAL (
            SELECT extraction_state FROM medication_clinical_extractions
            WHERE molecule_dosage_id = md.id ORDER BY created_at DESC LIMIT 1
          ) mce ON true
          ${where}
        `, params.slice(0, -2)),
      ])

      const untransformedCount = await db.query(`
        SELECT COUNT(*) FROM molecule_dosages md WHERE deleted_at IS NULL
        AND NOT EXISTS (SELECT 1 FROM fhir_medication_knowledge fk WHERE fk.molecule_dosage_id = md.id)
      `)

      const total = Number(countRow.rows[0].count)
      return NextResponse.json({
        data: rows.rows.map((r: any) => ({ ...r, id: r.id })),
        meta: {
          current_page: page,
          last_page: Math.ceil(total / perPage) || 1,
          total,
          per_page: perPage,
          untransformed_count: Number(untransformedCount.rows[0].count),
        },
      })
    }

    if (seg1) {
      const mid = seg1

      // POST /medicaments/:id/action
      if (seg2 === 'action' && method === 'POST') {
        const body = await req.json()
        await db.query(
          `UPDATE fhir_medication_knowledge SET validation_state=$1, updated_at=NOW() WHERE molecule_dosage_id=$2`,
          [body.action, mid]
        )
        return NextResponse.json({ ok: true })
      }

      // GET /medicaments/:id
      if (!seg2 && method === 'GET') {
        const [md, fhir, extraction, links, cuds] = await Promise.all([
          db.query(`SELECT * FROM molecule_dosages WHERE id=$1`, [mid]),
          db.query(`SELECT * FROM fhir_medication_knowledge WHERE molecule_dosage_id=$1`, [mid]),
          db.query(`
            SELECT * FROM medication_clinical_extractions
            WHERE molecule_dosage_id=$1 ORDER BY created_at DESC LIMIT 1
          `, [mid]),
          db.query(`
            SELECT mcl.*, cc.label_fr as concept_label_fr, cc.label_en as concept_label_en,
              cc.primary_code as concept_primary_code, cc.primary_system as concept_primary_system,
              cc.primary_display as concept_primary_display
            FROM medication_concept_links mcl
            LEFT JOIN clinical_concepts cc ON cc.id = mcl.clinical_concept_id
            WHERE mcl.molecule_dosage_id=$1
            ORDER BY mcl.relationship_type, mcl.created_at DESC
          `, [mid]),
          db.query(`
            SELECT * FROM fhir_clinical_use_definitions WHERE medication_knowledge_id=$1
          `, [mid]),
        ])

        if (!md.rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        const m = md.rows[0]
        const f = fhir.rows[0] ?? null
        const e = extraction.rows[0] ?? null

        // Group links by relationship_type
        const groupedLinks: Record<string, any[]> = {}
        for (const l of links.rows) {
          const key = l.relationship_type ?? 'other'
          if (!groupedLinks[key]) groupedLinks[key] = []
          groupedLinks[key].push({
            id: String(l.id),
            source_text: l.source_text,
            confidence: l.confidence ? Number(l.confidence) : null,
            mapping_method: l.mapping_method,
            validated_by_human: l.validated_by_human,
            clinical_concept: l.clinical_concept_id ? {
              id: l.clinical_concept_id,
              label_fr: l.concept_label_fr,
              label_en: l.concept_label_en,
              primary_code: l.concept_primary_code,
              primary_system: l.concept_primary_system,
              primary_display: l.concept_primary_display,
            } : null,
          })
        }

        return NextResponse.json({
          id: m.id,
          name: m.name,
          fhir: f,
          dosage: { name: m.name, link: m.link },
          extraction: e,
          links: groupedLinks,
          cuds: cuds.rows,
          scores: f ? {
            composite: f.quality_score_composite,
            extraction: f.quality_score_extraction,
            terminology: f.quality_score_terminology,
            projection: f.quality_score_projection,
          } : null,
        })
      }

      // /links
      if (seg2 === 'links') {
        // POST /medicaments/:id/links
        if (!seg3 && method === 'POST') {
          const body = await req.json()
          // Find or create clinical_concept
          const existing = await db.query(
            `SELECT id FROM clinical_concepts WHERE primary_system=$1 AND primary_code=$2`,
            [body.system, body.code]
          )
          let conceptId: string
          if (existing.rows.length) {
            conceptId = existing.rows[0].id
          } else {
            const ins = await db.query(`
              INSERT INTO clinical_concepts (id, concept_type, label_fr, label_en, primary_system, primary_code, primary_display, mapping_method, terminology_version)
              VALUES (gen_random_uuid(), 'unknown', $1, $2, $3, $4, $5, 'manual', 'manual')
              RETURNING id
            `, [body.label_fr ?? body.code, body.label_en ?? null, body.system, body.code, body.label_fr ?? body.code])
            conceptId = ins.rows[0].id
          }
          await db.query(`
            INSERT INTO medication_concept_links (molecule_dosage_id, clinical_concept_id, relationship_type, source_text, mapping_method)
            VALUES ($1, $2, $3, $4, 'manual')
            ON CONFLICT DO NOTHING
          `, [mid, conceptId, body.rel_type, body.source_text ?? null])
          return NextResponse.json({ ok: true })
        }

        // DELETE /medicaments/:id/links/:lid
        if (seg3 && method === 'DELETE') {
          await db.query(`DELETE FROM medication_concept_links WHERE id=$1 AND molecule_dosage_id=$2`, [seg3, mid])
          return NextResponse.json({ ok: true })
        }

        // PUT /medicaments/:id/links/:lid/confidence
        if (seg3 && method === 'PUT' && segments[4] === 'confidence') {
          const body = await req.json()
          await db.query(`UPDATE medication_concept_links SET confidence=$1 WHERE id=$2 AND molecule_dosage_id=$3`, [body.confidence, seg3, mid])
          return NextResponse.json({ ok: true })
        }
      }

      // PUT /medicaments/:id/extraction/:field
      if (seg2 === 'extraction' && seg3 && method === 'PUT') {
        const body = await req.json()
        await db.query(`
          UPDATE medication_clinical_extractions
          SET extracted_data = COALESCE(extracted_data,'{}')::jsonb || jsonb_build_object($1::text, $2::text),
              updated_at = NOW()
          WHERE id = (
            SELECT id FROM medication_clinical_extractions
            WHERE molecule_dosage_id=$3 ORDER BY created_at DESC LIMIT 1
          )
        `, [seg3, body.value, mid])
        return NextResponse.json({ ok: true })
      }
    }
  }

  // ── /review-queue ─────────────────────────────────────────────────────────
  if (seg0 === 'review-queue') {

    // POST /review-queue/candidate (manual candidate)
    if (seg1 === 'candidate' && method === 'POST') {
      const body = await req.json()
      await db.query(`
        UPDATE terminology_review_queue
        SET candidates = COALESCE(candidates,'[]')::jsonb || $1::jsonb
        WHERE id=$2
      `, [JSON.stringify([{ code: body.code, system: body.system, label_fr: body.label_fr, label_en: body.label_en, score: body.score ?? 1.0 }]), body.queue_item_id])
      return NextResponse.json({ ok: true })
    }

    // GET /review-queue
    if (!seg1 && method === 'GET') {
      const url = new URL(req.url)
      const status = url.searchParams.get('status') ?? 'pending'
      const page = Number(url.searchParams.get('page') ?? 1)
      const perPage = 30
      const offset = (page - 1) * perPage

      const statusCond = status === 'all' ? '' : `WHERE q.status=$1`
      const params: any[] = status === 'all' ? [perPage, offset] : [status, perPage, offset]
      const limitIdx = status === 'all' ? 1 : 2
      const offsetIdx = status === 'all' ? 2 : 3

      const [rows, countRow] = await Promise.all([
        db.query(`
          SELECT q.*, md.name as molecule_dosage_name
          FROM terminology_review_queue q
          LEFT JOIN molecule_dosages md ON md.id = q.molecule_dosage_id
          ${statusCond}
          ORDER BY q.created_at DESC
          LIMIT $${limitIdx} OFFSET $${offsetIdx}
        `, params),
        db.query(
          `SELECT COUNT(*) FROM terminology_review_queue q ${statusCond}`,
          status === 'all' ? [] : [status]
        ),
      ])

      const total = Number(countRow.rows[0].count)
      return NextResponse.json({
        data: rows.rows.map((r: any) => ({
          ...r,
          id: r.id,
          molecule_dosage: r.molecule_dosage_name ? { name: r.molecule_dosage_name } : null,
        })),
        meta: { current_page: page, last_page: Math.ceil(total / perPage) || 1, total, per_page: perPage },
      })
    }

    if (seg1) {
      // POST /review-queue/:id/action
      if (seg2 === 'action' && method === 'POST') {
        const body = await req.json()
        const newStatus = body.action === 'approved' ? 'approved' : body.action === 'rejected' ? 'rejected' : body.action
        await db.query(`
          UPDATE terminology_review_queue
          SET status=$1, review_notes=$2, reviewed_at=NOW(), reviewed_by_email=$3
          WHERE id=$4
        `, [newStatus, body.notes ?? null, (token as any).email ?? null, seg1])
        return NextResponse.json({ ok: true })
      }

      // POST /review-queue/:id/reopen
      if (seg2 === 'reopen' && method === 'POST') {
        await db.query(`UPDATE terminology_review_queue SET status='pending', reviewed_at=NULL WHERE id=$1`, [seg1])
        return NextResponse.json({ ok: true })
      }
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

async function safe(req: NextRequest, ctx: Ctx) {
  try { return await handle(req, ctx) }
  catch (e: any) { return NextResponse.json({ error: e.message, stack: e.stack?.split('\n').slice(0, 3) }, { status: 500 }) }
}

export async function GET(req: NextRequest, ctx: Ctx) { return safe(req, ctx) }
export async function POST(req: NextRequest, ctx: Ctx) { return safe(req, ctx) }
export async function PUT(req: NextRequest, ctx: Ctx) { return safe(req, ctx) }
export async function DELETE(req: NextRequest, ctx: Ctx) { return safe(req, ctx) }

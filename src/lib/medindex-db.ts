import { Pool } from 'pg'

let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_MEDINDEX_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
    })
  }
  return pool
}

export async function initSchema(): Promise<void> {
  const db = getPool()
  await db.query(`
    CREATE TABLE IF NOT EXISTS medindex_medicaments (
      id            BIGSERIAL PRIMARY KEY,
      name          TEXT NOT NULL,
      dci           TEXT,
      dosage        TEXT,
      forme         TEXT,
      atc_code      TEXT,
      validation_state  TEXT DEFAULT 'pending',
      extraction_state  TEXT DEFAULT 'pending',
      score_composite   NUMERIC(5,2),
      score_extraction  NUMERIC(5,2),
      score_terminology NUMERIC(5,2),
      score_projection  NUMERIC(5,2),
      fhir_json     JSONB,
      extraction_json JSONB,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS medindex_concept_links (
      id            BIGSERIAL PRIMARY KEY,
      medicament_id BIGINT REFERENCES medindex_medicaments(id) ON DELETE CASCADE,
      source_text   TEXT,
      code          TEXT,
      system        TEXT,
      label_fr      TEXT,
      label_en      TEXT,
      rel_type      TEXT,
      confidence    NUMERIC(4,3) DEFAULT 1.0,
      method        TEXT DEFAULT 'manual',
      created_at    TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS medindex_review_queue (
      id            BIGSERIAL PRIMARY KEY,
      medicament_id BIGINT REFERENCES medindex_medicaments(id) ON DELETE CASCADE,
      source_text   TEXT,
      relationship_type TEXT,
      status        TEXT DEFAULT 'pending',
      candidates    JSONB DEFAULT '[]',
      review_notes  TEXT,
      reviewed_at   TIMESTAMPTZ,
      reviewed_by_email TEXT,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    );
  `)
}

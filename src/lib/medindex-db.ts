import { Pool } from 'pg'

let pool: Pool | null = null
let schemaInitialized = false

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
  if (schemaInitialized) return
  const db = getPool()
  await db.query(`
    CREATE TABLE IF NOT EXISTS molecule_dosages (
      id         CHAR(36) PRIMARY KEY,
      name       TEXT NOT NULL,
      link       TEXT,
      source_id  TEXT,
      is_copy    BOOLEAN DEFAULT false,
      deleted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS medication_clinical_extractions (
      id                       CHAR(36) PRIMARY KEY,
      molecule_dosage_id       CHAR(36) NOT NULL,
      html_source_hash         TEXT,
      extracted_data           JSONB,
      raw_llm_response         JSONB,
      model_deployment         TEXT,
      model_api_version        TEXT,
      prompt_version           TEXT,
      prompt_hash              TEXT,
      prompt_tokens            INTEGER,
      completion_tokens        INTEGER,
      cost_usd                 NUMERIC(10,6),
      clinical_quality_score   JSONB,
      deterministic_validation JSONB,
      extraction_state         TEXT DEFAULT 'success',
      created_at               TIMESTAMPTZ DEFAULT NOW(),
      updated_at               TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS fhir_medication_knowledge (
      id                        CHAR(36) PRIMARY KEY,
      molecule_dosage_id        CHAR(36) NOT NULL,
      clinical_extraction_id    CHAR(36),
      status                    TEXT DEFAULT 'active',
      resource                  JSONB,
      fhir_version              TEXT DEFAULT 'R5',
      projection_version        TEXT,
      projection_metadata       JSONB,
      projected_at              TIMESTAMPTZ,
      validation_state          TEXT DEFAULT 'pending',
      quality_score_composite   NUMERIC(5,2),
      quality_score_extraction  NUMERIC(5,2),
      quality_score_terminology NUMERIC(5,2),
      quality_score_projection  NUMERIC(5,2),
      quality_scored_at         TIMESTAMPTZ,
      created_at                TIMESTAMPTZ DEFAULT NOW(),
      updated_at                TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS fhir_clinical_use_definitions (
      id                      CHAR(36) PRIMARY KEY,
      medication_knowledge_id CHAR(36) NOT NULL,
      type                    TEXT,
      category                TEXT,
      source_table            TEXT,
      source_id               CHAR(36),
      resource                JSONB,
      fhir_version            TEXT DEFAULT 'R5',
      created_at              TIMESTAMPTZ DEFAULT NOW(),
      updated_at              TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS clinical_concepts (
      id                  CHAR(36) PRIMARY KEY,
      concept_type        TEXT,
      source_table        TEXT,
      label_fr            TEXT,
      label_en            TEXT,
      synonyms            JSONB,
      primary_system      TEXT,
      primary_code        TEXT,
      primary_display     TEXT,
      codings             JSONB,
      mapping_confidence  NUMERIC(5,4),
      mapping_method      TEXT,
      terminology_version TEXT,
      validated_by_human  BOOLEAN DEFAULT false,
      validated_by_email  TEXT,
      validated_at        TIMESTAMPTZ,
      created_at          TIMESTAMPTZ DEFAULT NOW(),
      updated_at          TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE clinical_concepts ADD COLUMN IF NOT EXISTS source_table TEXT;

    CREATE TABLE IF NOT EXISTS medication_concept_links (
      id                 BIGSERIAL PRIMARY KEY,
      molecule_dosage_id CHAR(36) NOT NULL,
      clinical_concept_id CHAR(36) NOT NULL,
      relationship_type  TEXT,
      source_table       TEXT,
      source_id          TEXT,
      source_text        TEXT,
      confidence         NUMERIC(5,4),
      mapping_method     TEXT DEFAULT 'manual',
      validated_by_human BOOLEAN DEFAULT false,
      created_at         TIMESTAMPTZ DEFAULT NOW(),
      updated_at         TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS terminology_review_queue (
      id                  CHAR(36) PRIMARY KEY,
      molecule_dosage_id  CHAR(36) NOT NULL,
      relationship_type   TEXT,
      source_text         TEXT,
      candidates          JSONB DEFAULT '[]',
      status              TEXT DEFAULT 'pending',
      selected_concept_id CHAR(36),
      reviewed_by_email   TEXT,
      reviewed_at         TIMESTAMPTZ,
      review_notes        TEXT,
      created_at          TIMESTAMPTZ DEFAULT NOW(),
      updated_at          TIMESTAMPTZ DEFAULT NOW()
    );
  `)
  schemaInitialized = true
}

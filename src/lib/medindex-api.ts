const BASE = '/api/admin/medindex'

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  })
  if (!res.ok) {
    let detail = ''
    try { const b = await res.json(); detail = b?.error ?? '' } catch { /* ignore */ }
    throw new Error(`MedIndex API ${path} → ${res.status}${detail ? `: ${detail}` : ''}`)
  }
  return res.json()
}

export const medindex = {
  dashboard: () => req<DashboardData>('/dashboard'),

  list: (params: ListParams) =>
    req<ListResponse>('/medicaments?' + new URLSearchParams(params as any).toString()),

  get: (id: string) => req<MedicamentDetail>(`/medicaments/${id}`),

  action: (id: string, action: string, notes?: string) =>
    req(`/medicaments/${id}/action`, { method: 'POST', body: JSON.stringify({ action, notes }) }),

  deleteLink: (mid: string, lid: string) =>
    req(`/medicaments/${mid}/links/${lid}`, { method: 'DELETE' }),

  updateLinkConfidence: (mid: string, lid: string, confidence: number) =>
    req(`/medicaments/${mid}/links/${lid}/confidence`, { method: 'PUT', body: JSON.stringify({ confidence }) }),

  createLink: (mid: string, data: CreateLinkData) =>
    req(`/medicaments/${mid}/links`, { method: 'POST', body: JSON.stringify(data) }),

  updateConceptLabel: (mid: string, conceptId: string, label_fr?: string, label_en?: string) =>
    req(`/medicaments/${mid}/concepts/${conceptId}/label`, { method: 'PUT', body: JSON.stringify({ label_fr, label_en }) }),

  updateExtractionField: (mid: string, field: string, value: string) =>
    req(`/medicaments/${mid}/extraction/${field}`, { method: 'PUT', body: JSON.stringify({ value }) }),

  reviewQueue: (status = 'pending', page = 1) =>
    req<QueueResponse>(`/review-queue?status=${status}&page=${page}`),

  reviewQueueAction: (id: string, action: string, notes?: string, candidate_index?: number) =>
    req(`/review-queue/${id}/action`, { method: 'POST', body: JSON.stringify({ action, notes, candidate_index }) }),

  reopenQueueItem: (id: string) =>
    req(`/review-queue/${id}/reopen`, { method: 'POST' }),

  saveManualCandidate: (data: ManualCandidateData) =>
    req('/review-queue/candidate', { method: 'POST', body: JSON.stringify(data) }),

  concepts: (params: ConceptsParams) =>
    req<ConceptsResponse>('/concepts?' + new URLSearchParams(params as any).toString()),

  approveConcept: (id: string) =>
    req(`/concepts/${id}/approve`, { method: 'POST' }),

  flagConcept: (id: string) =>
    req(`/concepts/${id}/flag`, { method: 'POST' }),

  updateConcept: (id: string, data: Partial<ClinicalConcept>) =>
    req(`/concepts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  snomedLookup: (term: string) =>
    req<{ results: SnomedResult[] }>(`/concepts/snomed-lookup?term=${encodeURIComponent(term)}`),

  conceptsLookup: (terminology: string, term: string, fr?: string) =>
    req<{ results: LookupResult[] }>(`/concepts/lookup?terminology=${encodeURIComponent(terminology)}&term=${encodeURIComponent(term)}${fr ? `&fr=${encodeURIComponent(fr)}` : ''}`),
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface DashboardData {
  total_dosages: number
  untransformed: number
  extraction_stats: Record<string, number>
  cost_total: number
  links_by_method: Record<string, number>
  pending_review: number
  fhir_by_validation: Record<string, number>
  score_bands: Record<string, number>
  top_problems: Array<{ id: string; name: string; score: number; state: string }>
}

export interface ListParams {
  search?: string
  filterBand?: string
  filterState?: string
  filterAtc?: string
  filterExtraction?: string
  sortBy?: string
  sortDir?: string
  perPage?: number
  page?: number
}

export interface MedicamentRow {
  id: string
  name: string
  quality_score_composite: number | null
  quality_score_extraction: number | null
  quality_score_terminology: number | null
  quality_score_projection: number | null
  validation_state: string | null
  extraction_state: string | null
}

export interface ListResponse {
  data: MedicamentRow[]
  meta: { current_page: number; last_page: number; total: number; per_page: number; untransformed_count: number }
}

export interface MedicamentDetail {
  id: string
  name: string
  fhir: Record<string, any> | null
  extraction: Record<string, any> | null
  links: Record<string, any[]>
  cuds: any[]
  scores: {
    composite: number | null
    extraction: number | null
    terminology: number | null
    projection: number | null
    breakdown: {
      extraction: { llm_confidence: any; validator_score: any; critical_issues: number }
      terminology: { auto_links: number; total_links: number; avg_confidence: string | null; flagged_links: number }
      projection: { structural_score: any; avg_codings_per_concept: any; cud_types_present: number }
    }
  } | null
  source: {
    principles: Array<{ molecule_name: string; dosage: string; unit: string }>
    indications: string[]
    contra_indications: string[]
    precautions: string[]
    warnings: string[]
    pregnancy_risks: Array<{ months: string; value: string }>
    reproductive_healths: string[]
    posologie: string | null
  }
}

export interface QueueItem {
  id: string
  molecule_dosage_id: string
  source_text: string
  relationship_type: string
  status: string
  candidates: any[]
  review_notes: string | null
  reviewed_at: string | null
  reviewed_by_email: string | null
  molecule_dosage?: { name: string }
}

export interface QueueResponse {
  data: QueueItem[]
  meta: { current_page: number; last_page: number; total: number; per_page: number }
}

export interface CreateLinkData {
  source_text: string
  code: string
  system: string
  label_fr?: string
  label_en?: string
  rel_type: string
}

export interface ManualCandidateData {
  queue_item_id: string
  code: string
  system: string
  label_fr?: string
  label_en?: string
  score?: number
}

export interface ClinicalConcept {
  id: string
  concept_type: string | null
  source_table: string | null
  label_fr: string | null
  label_en: string | null
  primary_system: string | null
  primary_code: string | null
  primary_display: string | null
  mapping_confidence: number | null
  mapping_method: string | null
  terminology_version: string | null
  validated_by_human: boolean
  validated_by_email: string | null
  validated_at: string | null
}

export interface ConceptsParams {
  page?: number
  perPage?: number
  search?: string
  source_table?: string
  concept_type?: string
  validated?: string
  min_confidence?: number
  max_confidence?: number
}

export interface ConceptsResponse {
  data: ClinicalConcept[]
  meta: { current_page: number; last_page: number; total: number; per_page: number }
  tables: Record<string, number>
  types: Record<string, number>
  stats: { total: number; validated: number; unmapped: number; flagged: number }
}

export interface SnomedResult {
  code: string
  display: string
  system: string
}

export interface LookupResult {
  code: string
  display: string
  system: string
  confidence: number | null
  reasoning: string | null
}

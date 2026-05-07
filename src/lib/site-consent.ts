import { createHash, randomUUID } from 'crypto'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export const CONSENT_STORAGE_SLIDE_INDEX = 9999
export const CONSENT_LEDGER_STORAGE_SLIDE_INDEX = 10000
export const CONSENT_COOKIE_NAME = 'panoptes_consent_ack'
export const CONSENT_VISITOR_COOKIE_NAME = 'panoptes_consent_visitor'

const DEFAULT_PUBLISHED_AT = '2026-05-07T00:00:00.000Z'
const MAX_CONSENT_LOG_RECORDS = 5000

export const DEFAULT_SITE_CONSENT_TEXT = [
  'By accessing this platform, you acknowledge that the information presented is confidential, proprietary, and protected by the intellectual property rights of Blink Pharma.',
  '',
  'Any unauthorized reproduction, distribution, extraction, screenshotting, AI training usage, reverse engineering, benchmarking, or competitive use is strictly prohibited without prior written authorization.',
  '',
  'The materials presented may contain forward-looking statements subject to change without notice and do not constitute contractual commitments or guarantees of performance.',
  '',
  'By continuing your navigation, you agree to comply with the applicable confidentiality obligations and terms of use.',
].join('\n')

export interface ConsentVersionRecord {
  version: string
  text: string
  textHash: string
  originalFileHash: string
  sourceFileName: string
  publishedAt: string
  publishedBy: string | null
}

export interface StoredConsentConfig {
  kind: 'panoptes-site-consent'
  draftText: string
  updatedAt: string
  updatedBy: string | null
  currentVersion: ConsentVersionRecord
  versions: ConsentVersionRecord[]
}

export interface AdminConsentState extends StoredConsentConfig {
  draftHash: string
  hasUnpublishedChanges: boolean
}

export interface ConsentAcceptanceRecord {
  id: string
  visitorId: string
  version: string
  textHash: string
  originalFileHash: string
  sourceFileName: string
  acceptedAt: string
  pathname: string | null
  ipHash: string | null
  userAgent: string | null
}

interface StoredConsentLedger {
  kind: 'panoptes-consent-ledger'
  records: ConsentAcceptanceRecord[]
}

export interface ConsentAcceptanceSummary {
  totalRecords: number
  uniqueVisitors: number
  currentVersionAccepted: number
  latestAcceptedAt: string | null
}

export interface ConsentAdminPayload {
  state: AdminConsentState
  acceptanceSummary: ConsentAcceptanceSummary
  recentAcceptances: ConsentAcceptanceRecord[]
}

export interface PublicConsentState {
  version: string
  text: string
  textHash: string
  originalFileHash: string
  sourceFileName: string
  publishedAt: string | null
  publishedBy: string | null
}

export interface PublicConsentApiState extends PublicConsentState {
  acknowledgedCurrentVersion: boolean
}

export interface ConsentAckCookiePayload {
  visitorId: string
  version: string
  textHash: string
  acceptedAt: string
}

function nowIso() {
  return new Date().toISOString()
}

export function normalizeConsentText(text: string) {
  return String(text || '').replace(/\r\n/g, '\n').trim()
}

export function hashConsentText(text: string) {
  return createHash('sha256').update(normalizeConsentText(text), 'utf8').digest('hex')
}

function hashString(value: string) {
  return createHash('sha256').update(String(value), 'utf8').digest('hex')
}

function versionNumber(version: string) {
  const match = /^v(\d+)$/i.exec(String(version || '').trim())
  return match ? Number(match[1]) : 0
}

function nextVersionLabel(versions: ConsentVersionRecord[]) {
  return `v${versions.reduce((max, item) => Math.max(max, versionNumber(item.version)), 0) + 1}`
}

function buildConsentVersion(version: string, text: string, publishedAt: string, publishedBy: string | null): ConsentVersionRecord {
  const normalizedText = normalizeConsentText(text)
  const textHash = hashConsentText(normalizedText)

  return {
    version,
    text: normalizedText,
    textHash,
    originalFileHash: textHash,
    sourceFileName: `panoptes-consent-${version}.txt`,
    publishedAt,
    publishedBy,
  }
}

function buildDefaultConsentConfig(): StoredConsentConfig {
  const initial = buildConsentVersion('v1', DEFAULT_SITE_CONSENT_TEXT, DEFAULT_PUBLISHED_AT, null)
  return {
    kind: 'panoptes-site-consent',
    draftText: initial.text,
    updatedAt: initial.publishedAt,
    updatedBy: null,
    currentVersion: initial,
    versions: [initial],
  }
}

function buildDefaultLedger(): StoredConsentLedger {
  return { kind: 'panoptes-consent-ledger', records: [] }
}

function normalizeVersionRecord(value: unknown, fallbackVersion: string): ConsentVersionRecord | null {
  if (!value || typeof value !== 'object') return null
  const source = value as Partial<ConsentVersionRecord>
  const text = normalizeConsentText(source.text || '')
  if (!text) return null
  const version = /^v\d+$/i.test(String(source.version || '').trim()) ? String(source.version).trim().toLowerCase() : fallbackVersion
  const textHash = source.textHash || hashConsentText(text)

  return {
    version,
    text,
    textHash,
    originalFileHash: source.originalFileHash || textHash,
    sourceFileName: source.sourceFileName || `panoptes-consent-${version}.txt`,
    publishedAt: source.publishedAt ? String(source.publishedAt) : nowIso(),
    publishedBy: source.publishedBy || null,
  }
}

function normalizeAcceptanceRecord(value: unknown): ConsentAcceptanceRecord | null {
  if (!value || typeof value !== 'object') return null
  const source = value as Partial<ConsentAcceptanceRecord>
  if (!source.visitorId || !source.version || !source.textHash || !source.acceptedAt) return null

  return {
    id: source.id || randomUUID(),
    visitorId: String(source.visitorId),
    version: String(source.version),
    textHash: String(source.textHash),
    originalFileHash: String(source.originalFileHash || source.textHash),
    sourceFileName: String(source.sourceFileName || `panoptes-consent-${source.version}.txt`),
    acceptedAt: String(source.acceptedAt),
    pathname: source.pathname ? String(source.pathname) : null,
    ipHash: source.ipHash ? String(source.ipHash) : null,
    userAgent: source.userAgent ? String(source.userAgent) : null,
  }
}

function sanitizeConsentConfig(rawConfig: unknown): StoredConsentConfig {
  const fallback = buildDefaultConsentConfig()
  if (!rawConfig || typeof rawConfig !== 'object') return fallback
  const source = rawConfig as Partial<StoredConsentConfig>
  const versions = (Array.isArray(source.versions) ? source.versions : [])
    .map((item, index) => normalizeVersionRecord(item, `v${index + 1}`))
    .filter((item): item is ConsentVersionRecord => Boolean(item))
    .sort((a, b) => versionNumber(a.version) - versionNumber(b.version))
  const normalizedVersions = versions.length ? versions : fallback.versions
  const currentVersion =
    normalizeVersionRecord(source.currentVersion, normalizedVersions[normalizedVersions.length - 1].version) ||
    normalizedVersions[normalizedVersions.length - 1]

  return {
    kind: 'panoptes-site-consent',
    draftText: normalizeConsentText(source.draftText || currentVersion.text),
    updatedAt: source.updatedAt ? String(source.updatedAt) : currentVersion.publishedAt,
    updatedBy: source.updatedBy || null,
    currentVersion,
    versions: normalizedVersions.some(item => item.version === currentVersion.version)
      ? normalizedVersions
      : [...normalizedVersions, currentVersion].sort((a, b) => versionNumber(a.version) - versionNumber(b.version)),
  }
}

function sanitizeLedger(rawLedger: unknown): StoredConsentLedger {
  if (!rawLedger || typeof rawLedger !== 'object') return buildDefaultLedger()
  const source = rawLedger as Partial<StoredConsentLedger>
  const records = (Array.isArray(source.records) ? source.records : [])
    .map(item => normalizeAcceptanceRecord(item))
    .filter((item): item is ConsentAcceptanceRecord => Boolean(item))
    .sort((a, b) => new Date(b.acceptedAt).getTime() - new Date(a.acceptedAt).getTime())
    .slice(0, MAX_CONSENT_LOG_RECORDS)
  return { kind: 'panoptes-consent-ledger', records }
}

async function readStoredConsentConfig() {
  const record = await prisma.slideConfig.findUnique({ where: { slideIndex: CONSENT_STORAGE_SLIDE_INDEX } })
  return record ? sanitizeConsentConfig(record.configJson) : buildDefaultConsentConfig()
}

async function writeStoredConsentConfig(config: StoredConsentConfig) {
  const normalizedConfig = sanitizeConsentConfig(config)
  const jsonConfig = normalizedConfig as unknown as Prisma.InputJsonValue
  await prisma.slideConfig.upsert({
    where: { slideIndex: CONSENT_STORAGE_SLIDE_INDEX },
    update: { configJson: jsonConfig },
    create: { slideIndex: CONSENT_STORAGE_SLIDE_INDEX, configJson: jsonConfig },
  })
  return normalizedConfig
}

async function readStoredLedger() {
  const record = await prisma.slideConfig.findUnique({ where: { slideIndex: CONSENT_LEDGER_STORAGE_SLIDE_INDEX } })
  return record ? sanitizeLedger(record.configJson) : buildDefaultLedger()
}

async function writeStoredLedger(ledger: StoredConsentLedger) {
  const normalizedLedger = sanitizeLedger(ledger)
  const jsonLedger = normalizedLedger as unknown as Prisma.InputJsonValue
  await prisma.slideConfig.upsert({
    where: { slideIndex: CONSENT_LEDGER_STORAGE_SLIDE_INDEX },
    update: { configJson: jsonLedger },
    create: { slideIndex: CONSENT_LEDGER_STORAGE_SLIDE_INDEX, configJson: jsonLedger },
  })
  return normalizedLedger
}

export function createVisitorId() {
  return randomUUID()
}

export function encodeConsentAckCookie(payload: ConsentAckCookiePayload) {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
}

export function decodeConsentAckCookie(value: string | undefined | null): ConsentAckCookiePayload | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as Partial<ConsentAckCookiePayload>
    if (!parsed.visitorId || !parsed.version || !parsed.textHash || !parsed.acceptedAt) return null
    return {
      visitorId: String(parsed.visitorId),
      version: String(parsed.version),
      textHash: String(parsed.textHash),
      acceptedAt: String(parsed.acceptedAt),
    }
  } catch {
    return null
  }
}

export function isConsentCookieCurrent(cookieValue: string | undefined | null, currentVersion: Pick<ConsentVersionRecord, 'version' | 'textHash'>) {
  const payload = decodeConsentAckCookie(cookieValue)
  return Boolean(payload && payload.version === currentVersion.version && payload.textHash === currentVersion.textHash)
}

export async function getAdminConsentState(): Promise<AdminConsentState> {
  const config = await readStoredConsentConfig()
  const draftHash = hashConsentText(config.draftText)
  return {
    ...config,
    draftHash,
    hasUnpublishedChanges: draftHash !== config.currentVersion.textHash || normalizeConsentText(config.draftText) !== normalizeConsentText(config.currentVersion.text),
  }
}

export async function saveConsentDraft(text: string, updatedBy: string | null) {
  const config = await readStoredConsentConfig()
  const draftText = normalizeConsentText(text)
  if (!draftText) throw new Error('Consent text cannot be empty.')
  await writeStoredConsentConfig({ ...config, draftText, updatedAt: nowIso(), updatedBy })
  return getAdminConsentState()
}

export async function publishConsentDraft(text: string, publishedBy: string | null) {
  const config = await readStoredConsentConfig()
  const normalizedText = normalizeConsentText(text)
  if (!normalizedText) throw new Error('Consent text cannot be empty.')

  if (hashConsentText(normalizedText) === config.currentVersion.textHash && normalizedText === config.currentVersion.text) {
    await writeStoredConsentConfig({ ...config, draftText: normalizedText, updatedAt: nowIso(), updatedBy: publishedBy })
    return { createdVersion: false, state: await getAdminConsentState() }
  }

  const publishedAt = nowIso()
  const currentVersion = buildConsentVersion(nextVersionLabel(config.versions), normalizedText, publishedAt, publishedBy)
  await writeStoredConsentConfig({
    kind: 'panoptes-site-consent',
    draftText: normalizedText,
    updatedAt: publishedAt,
    updatedBy: publishedBy,
    currentVersion,
    versions: [...config.versions, currentVersion].sort((a, b) => versionNumber(a.version) - versionNumber(b.version)),
  })

  return { createdVersion: true, state: await getAdminConsentState() }
}

export async function rollbackConsentVersion(version: string, publishedBy: string | null) {
  const config = await readStoredConsentConfig()
  const target = config.versions.find(item => item.version === String(version).trim().toLowerCase())
  if (!target) throw new Error('Consent version not found.')
  return publishConsentDraft(target.text, publishedBy)
}

export async function getPublicConsentState(): Promise<PublicConsentState> {
  const config = await readStoredConsentConfig()
  return {
    version: config.currentVersion.version,
    text: config.currentVersion.text,
    textHash: config.currentVersion.textHash,
    originalFileHash: config.currentVersion.originalFileHash,
    sourceFileName: config.currentVersion.sourceFileName,
    publishedAt: config.currentVersion.publishedAt,
    publishedBy: config.currentVersion.publishedBy,
  }
}

export async function recordConsentAcceptance(input: {
  visitorId: string
  pathname?: string | null
  ipAddress?: string | null
  userAgent?: string | null
}) {
  const policy = await getPublicConsentState()
  const visitorId = String(input.visitorId || '').trim()
  if (!visitorId) throw new Error('Missing visitor id.')

  const ledger = await readStoredLedger()
  const existing = ledger.records.find(item => item.visitorId === visitorId && item.version === policy.version && item.textHash === policy.textHash)
  if (existing) {
    return {
      record: existing,
      cookiePayload: { visitorId, version: existing.version, textHash: existing.textHash, acceptedAt: existing.acceptedAt } satisfies ConsentAckCookiePayload,
    }
  }

  const record: ConsentAcceptanceRecord = {
    id: randomUUID(),
    visitorId,
    version: policy.version,
    textHash: policy.textHash,
    originalFileHash: policy.originalFileHash,
    sourceFileName: policy.sourceFileName,
    acceptedAt: nowIso(),
    pathname: input.pathname ? String(input.pathname) : null,
    ipHash: input.ipAddress ? hashString(input.ipAddress) : null,
    userAgent: input.userAgent ? String(input.userAgent).slice(0, 500) : null,
  }

  await writeStoredLedger({ kind: 'panoptes-consent-ledger', records: [record, ...ledger.records] })

  return {
    record,
    cookiePayload: { visitorId, version: record.version, textHash: record.textHash, acceptedAt: record.acceptedAt } satisfies ConsentAckCookiePayload,
  }
}

export async function getConsentAdminPayload(): Promise<ConsentAdminPayload> {
  const [state, ledger] = await Promise.all([getAdminConsentState(), readStoredLedger()])
  const uniqueVisitors = new Set(ledger.records.map(item => item.visitorId)).size
  const currentVersionAccepted = ledger.records.filter(item => item.version === state.currentVersion.version && item.textHash === state.currentVersion.textHash).length
  return {
    state,
    acceptanceSummary: {
      totalRecords: ledger.records.length,
      uniqueVisitors,
      currentVersionAccepted,
      latestAcceptedAt: ledger.records[0]?.acceptedAt || null,
    },
    recentAcceptances: ledger.records.slice(0, 50),
  }
}

export function isPublicSlideIndex(slideIndex: number) {
  return slideIndex < CONSENT_STORAGE_SLIDE_INDEX
}

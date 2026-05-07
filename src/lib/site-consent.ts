import { createHash } from 'crypto'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export const CONSENT_STORAGE_SLIDE_INDEX = 9999
const DEFAULT_PUBLISHED_AT = '2026-05-07T00:00:00.000Z'

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

function nowIso() {
  return new Date().toISOString()
}

export function normalizeConsentText(text: string) {
  return String(text || '').replace(/\r\n/g, '\n').trim()
}

export function hashConsentText(text: string) {
  return createHash('sha256').update(normalizeConsentText(text), 'utf8').digest('hex')
}

function versionNumber(version: string) {
  const match = /^v(\d+)$/i.exec(String(version || '').trim())
  return match ? Number(match[1]) : 0
}

function nextVersionLabel(versions: ConsentVersionRecord[]) {
  const maxVersion = versions.reduce((max, version) => Math.max(max, versionNumber(version.version)), 0)
  return `v${maxVersion + 1}`
}

function buildConsentVersion(
  version: string,
  text: string,
  publishedAt: string,
  publishedBy: string | null,
): ConsentVersionRecord {
  const normalizedText = normalizeConsentText(text)
  const hash = hashConsentText(normalizedText)

  return {
    version,
    text: normalizedText,
    textHash: hash,
    originalFileHash: hash,
    sourceFileName: `panoptes-consent-${version}.txt`,
    publishedAt,
    publishedBy,
  }
}

function buildDefaultConsentConfig(): StoredConsentConfig {
  const initialVersion = buildConsentVersion('v1', DEFAULT_SITE_CONSENT_TEXT, DEFAULT_PUBLISHED_AT, null)

  return {
    kind: 'panoptes-site-consent',
    draftText: initialVersion.text,
    updatedAt: initialVersion.publishedAt,
    updatedBy: null,
    currentVersion: initialVersion,
    versions: [initialVersion],
  }
}

function normalizeVersionRecord(value: unknown, fallbackVersion: string): ConsentVersionRecord | null {
  if (!value || typeof value !== 'object') return null

  const source = value as Partial<ConsentVersionRecord>
  const text = normalizeConsentText(source.text || '')
  if (!text) return null

  const version = /^v\d+$/i.test(String(source.version || '').trim())
    ? String(source.version).trim().toLowerCase()
    : fallbackVersion

  const publishedAt = source.publishedAt ? String(source.publishedAt) : nowIso()
  const textHash = source.textHash || hashConsentText(text)
  const originalFileHash = source.originalFileHash || textHash

  return {
    version,
    text,
    textHash,
    originalFileHash,
    sourceFileName: source.sourceFileName || `panoptes-consent-${version}.txt`,
    publishedAt,
    publishedBy: source.publishedBy || null,
  }
}

function sortVersionsAscending(versions: ConsentVersionRecord[]) {
  return [...versions].sort((a, b) => versionNumber(a.version) - versionNumber(b.version))
}

function sanitizeConsentConfig(rawConfig: unknown): StoredConsentConfig {
  const fallback = buildDefaultConsentConfig()
  if (!rawConfig || typeof rawConfig !== 'object') return fallback

  const source = rawConfig as Partial<StoredConsentConfig>
  const rawVersions = Array.isArray(source.versions) ? source.versions : []
  const versions = rawVersions
    .map((version, index) => normalizeVersionRecord(version, `v${index + 1}`))
    .filter((version): version is ConsentVersionRecord => Boolean(version))

  const normalizedVersions = versions.length > 0 ? sortVersionsAscending(versions) : fallback.versions
  const currentVersion =
    normalizeVersionRecord(source.currentVersion, normalizedVersions[normalizedVersions.length - 1].version) ||
    normalizedVersions[normalizedVersions.length - 1]

  const versionsWithCurrent = normalizedVersions.some(version => version.version === currentVersion.version)
    ? normalizedVersions
    : sortVersionsAscending([...normalizedVersions, currentVersion])

  const draftText = normalizeConsentText(source.draftText || currentVersion.text || fallback.draftText)

  return {
    kind: 'panoptes-site-consent',
    draftText,
    updatedAt: source.updatedAt ? String(source.updatedAt) : currentVersion.publishedAt,
    updatedBy: source.updatedBy || null,
    currentVersion,
    versions: versionsWithCurrent,
  }
}

async function readStoredConsentConfig() {
  const record = await prisma.slideConfig.findUnique({
    where: { slideIndex: CONSENT_STORAGE_SLIDE_INDEX },
  })

  return record ? sanitizeConsentConfig(record.configJson) : buildDefaultConsentConfig()
}

async function writeStoredConsentConfig(config: StoredConsentConfig) {
  const normalizedConfig = sanitizeConsentConfig(config)
  const jsonConfig = normalizedConfig as unknown as Prisma.InputJsonValue

  await prisma.slideConfig.upsert({
    where: { slideIndex: CONSENT_STORAGE_SLIDE_INDEX },
    update: { configJson: jsonConfig },
    create: {
      slideIndex: CONSENT_STORAGE_SLIDE_INDEX,
      configJson: jsonConfig,
    },
  })

  return normalizedConfig
}

export async function getAdminConsentState(): Promise<AdminConsentState> {
  const config = await readStoredConsentConfig()
  const draftHash = hashConsentText(config.draftText)

  return {
    ...config,
    draftHash,
    hasUnpublishedChanges:
      draftHash !== config.currentVersion.textHash ||
      normalizeConsentText(config.draftText) !== normalizeConsentText(config.currentVersion.text),
  }
}

export async function saveConsentDraft(text: string, updatedBy: string | null) {
  const config = await readStoredConsentConfig()
  const normalizedText = normalizeConsentText(text)

  if (!normalizedText) {
    throw new Error('Consent text cannot be empty.')
  }

  const nextConfig: StoredConsentConfig = {
    ...config,
    draftText: normalizedText,
    updatedAt: nowIso(),
    updatedBy,
  }

  await writeStoredConsentConfig(nextConfig)
  return getAdminConsentState()
}

export async function publishConsentDraft(text: string, publishedBy: string | null) {
  const config = await readStoredConsentConfig()
  const normalizedText = normalizeConsentText(text)

  if (!normalizedText) {
    throw new Error('Consent text cannot be empty.')
  }

  const nextHash = hashConsentText(normalizedText)

  if (nextHash === config.currentVersion.textHash && normalizedText === config.currentVersion.text) {
    const unchangedConfig: StoredConsentConfig = {
      ...config,
      draftText: normalizedText,
      updatedAt: nowIso(),
      updatedBy: publishedBy,
    }
    await writeStoredConsentConfig(unchangedConfig)

    return {
      createdVersion: false,
      state: await getAdminConsentState(),
    }
  }

  const versionLabel = nextVersionLabel(config.versions)
  const publishedAt = nowIso()
  const newVersion = buildConsentVersion(versionLabel, normalizedText, publishedAt, publishedBy)
  const nextConfig: StoredConsentConfig = {
    kind: 'panoptes-site-consent',
    draftText: normalizedText,
    updatedAt: publishedAt,
    updatedBy: publishedBy,
    currentVersion: newVersion,
    versions: sortVersionsAscending([...config.versions, newVersion]),
  }

  await writeStoredConsentConfig(nextConfig)

  return {
    createdVersion: true,
    state: await getAdminConsentState(),
  }
}

export async function getPublicConsentState() {
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

export function isPublicSlideIndex(slideIndex: number) {
  return slideIndex < CONSENT_STORAGE_SLIDE_INDEX
}

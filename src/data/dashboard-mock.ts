export const REGIONS = [
  { id: 'tta', name: 'Tanger-Tétouan-Al Hoceïma', pharmacies: 1240, population: 3556000 },
  { id: 'ori', name: 'Oriental', pharmacies: 890, population: 2314000 },
  { id: 'fes', name: 'Fès-Meknès', pharmacies: 1580, population: 4236000 },
  { id: 'rsk', name: 'Rabat-Salé-Kénitra', pharmacies: 2100, population: 4580000 },
  { id: 'bmk', name: 'Béni Mellal-Khénifra', pharmacies: 760, population: 2520000 },
  { id: 'cas', name: 'Casablanca-Settat', pharmacies: 3200, population: 7054000 },
  { id: 'mar', name: 'Marrakech-Safi', pharmacies: 1420, population: 4520000 },
  { id: 'dra', name: 'Drâa-Tafilalet', pharmacies: 380, population: 1635000 },
  { id: 'sus', name: 'Souss-Massa', pharmacies: 840, population: 2776000 },
  { id: 'gon', name: 'Guelmim-Oued Noun', pharmacies: 180, population: 433000 },
  { id: 'lse', name: 'Laâyoune-Sakia El Hamra', pharmacies: 120, population: 367000 },
  { id: 'doe', name: 'Dakhla-Oued Ed Dahab', pharmacies: 68, population: 142000 },
]

export const DISEASES = [
  { id: 'ili', code: 'J11', name: 'Influenza-like illness', color: '#E24B4A' },
  { id: 'gas', code: 'A09', name: 'Acute gastroenteritis', color: '#EF9F27' },
  { id: 'rsv', code: 'J21', name: 'RSV / Bronchiolitis', color: '#00C2CB' },
  { id: 'rhi', code: 'J30', name: 'Allergic rhinitis', color: '#9B59B6' },
  { id: 'str', code: 'J02', name: 'Streptococcal pharyngitis', color: '#3498DB' },
]

export const ACTIVE_ALERTS = [
  {
    id: 'ali-001',
    disease: 'Influenza-like illness',
    diseaseCode: 'J11',
    region: 'Casablanca-Settat',
    regionId: 'cas',
    severity: 'critical' as const,
    zscore: 3.8,
    lead: -9,
    confidence: 0.89,
    pharmaciesTriggered: 247,
    detectedAt: '2026-05-07T06:12:00Z',
    drugs: ['Ephedrine', 'Antitussive', 'Paracetamol'],
    trend: [20, 23, 30, 38, 51, 69, 91, 96, 110, 128],
  },
  {
    id: 'ali-002',
    disease: 'Acute gastroenteritis',
    diseaseCode: 'A09',
    region: 'Rabat-Salé-Kénitra',
    regionId: 'rsk',
    severity: 'warning' as const,
    zscore: 2.7,
    lead: -5,
    confidence: 0.78,
    pharmaciesTriggered: 89,
    detectedAt: '2026-05-07T08:44:00Z',
    drugs: ['ORS', 'Loperamide', 'Metronidazole'],
    trend: [14, 12, 16, 18, 22, 28, 35, 38, 42, 47],
  },
  {
    id: 'ali-003',
    disease: 'RSV / Bronchiolitis',
    diseaseCode: 'J21',
    region: 'Fès-Meknès',
    regionId: 'fes',
    severity: 'warning' as const,
    zscore: 2.4,
    lead: -6,
    confidence: 0.74,
    pharmaciesTriggered: 63,
    detectedAt: '2026-05-07T09:30:00Z',
    drugs: ['Salbutamol', 'Ipratropium', 'Budesonide'],
    trend: [8, 9, 10, 11, 14, 18, 24, 27, 30, 33],
  },
  {
    id: 'ali-004',
    disease: 'Allergic rhinitis',
    diseaseCode: 'J30',
    region: 'Marrakech-Safi',
    regionId: 'mar',
    severity: 'watch' as const,
    zscore: 1.9,
    lead: -4,
    confidence: 0.68,
    pharmaciesTriggered: 41,
    detectedAt: '2026-05-07T11:15:00Z',
    drugs: ['Loratadine', 'Cetirizine', 'Fluticasone'],
    trend: [30, 32, 34, 36, 38, 42, 48, 52, 55, 58],
  },
  {
    id: 'ali-005',
    disease: 'Streptococcal pharyngitis',
    diseaseCode: 'J02',
    region: 'Tanger-Tétouan-Al Hoceïma',
    regionId: 'tta',
    severity: 'watch' as const,
    zscore: 1.7,
    lead: -7,
    confidence: 0.72,
    pharmaciesTriggered: 28,
    detectedAt: '2026-05-07T13:00:00Z',
    drugs: ['Amoxicillin', 'Azithromycin', 'Ibuprofen'],
    trend: [5, 6, 6, 7, 8, 10, 12, 14, 15, 16],
  },
]

// Signal intensity per region per disease (0-100)
export const SIGNAL_MAP: Record<string, Record<string, number>> = {
  ili: { tta: 45, ori: 38, fes: 62, rsk: 71, bmk: 29, cas: 88, mar: 55, dra: 18, sus: 34, gon: 12, lse: 8, doe: 5 },
  gas: { tta: 28, ori: 31, fes: 44, rsk: 78, bmk: 22, cas: 52, mar: 38, dra: 14, sus: 28, gon: 9, lse: 6, doe: 4 },
  rsv: { tta: 22, ori: 18, fes: 71, rsk: 45, bmk: 33, cas: 38, mar: 28, dra: 11, sus: 19, gon: 7, lse: 5, doe: 3 },
  rhi: { tta: 38, ori: 42, fes: 35, rsk: 48, bmk: 55, cas: 44, mar: 82, dra: 38, sus: 62, gon: 28, lse: 18, doe: 12 },
  str: { tta: 65, ori: 28, fes: 41, rsk: 38, bmk: 18, cas: 45, mar: 32, dra: 12, sus: 22, gon: 8, lse: 5, doe: 3 },
}

export const SYSTEM_STATS = {
  pharmaciesLive: 278,
  transactionsToday: 3_420_000,
  alertsActive: 5,
  diseasesTracked: 240,
  uptimePercent: 99.97,
  latencyMs: 3.2,
  lastUpdateAt: new Date().toISOString(),
}

// 12 weeks of weekly data for scenario detail
export function getScenarioTimeSeries(alertId: string) {
  const alert = ACTIVE_ALERTS.find((a) => a.id === alertId)
  if (!alert) return null
  const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12']
  const proxy = [...alert.trend, Math.round(alert.trend[9] * 1.15), Math.round(alert.trend[9] * 1.32)]
  // Confirmed cases lag by |lead| weeks
  const lag = Math.abs(alert.lead)
  const confirmed = proxy.map((v, i) =>
    i < lag ? null : Math.round(proxy[i - lag] * 0.4 + (i % 3) * 2)
  )
  return { weeks, proxy, confirmed }
}

export type Alert = (typeof ACTIVE_ALERTS)[number]
export type Region = (typeof REGIONS)[number]
export type Disease = (typeof DISEASES)[number]

import { prisma } from '@/lib/prisma'
import MoroccoEpiMap from '@/components/map/MoroccoEpiMap'
import { DEFAULT_DISEASES, DiseaseConfig } from '@/data/epi-map-data'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'PANOPTES — Surveillance épidémiologique Maroc',
  description: 'Carte interactive de surveillance épidémiologique des 12 régions du Maroc.',
}

export default async function MapPage() {
  let diseases: DiseaseConfig[] = DEFAULT_DISEASES

  try {
    const dbRecords = await prisma.epiMapData.findMany({
      where: { isActive: true, period: 'today' },
      orderBy: { createdAt: 'asc' },
    })
    if (dbRecords.length > 0) {
      diseases = dbRecords.map(r => ({
        id: r.diseaseId,
        name: r.disease,
        regions: r.data as DiseaseConfig['regions'],
        alerts: r.alerts as DiseaseConfig['alerts'],
        stats: r.stats as DiseaseConfig['stats'],
      }))
    }
  } catch {
    // DB not ready — use static defaults
  }

  return <MoroccoEpiMap diseases={diseases} initialDiseaseId="grippe" />
}

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { isTokenValid } from '@/lib/token'
import DeckViewer from './DeckViewer'
import type { SlideConfig } from '@/types/slide'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: { token?: string }
}

export default async function DeckPage({ searchParams }: PageProps) {
  const token = searchParams.token

  if (!token) redirect('/deck/access-denied')

  const accessToken = await prisma.accessToken.findUnique({
    where: { token },
  })

  if (!accessToken || !isTokenValid(accessToken)) {
    redirect('/deck/access-denied')
  }

  // Update lastUsedAt
  await prisma.accessToken.update({
    where: { id: accessToken.id },
    data: { lastUsedAt: new Date() },
  })

  const slides = await prisma.slideConfig.findMany({
    orderBy: { slideIndex: 'asc' },
  })

  const slideConfigs = slides.map(s => s.configJson as unknown as SlideConfig)

  return <DeckViewer slides={slideConfigs} token={token} />
}

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CONSENT_STORAGE_SLIDE_INDEX } from '@/lib/site-consent'
import { isTokenValid } from '@/lib/token'
import SlideRenderer from '@/components/slides/SlideRenderer'
import type { SlideConfig } from '@/types/slide'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: { token?: string }
}

export default async function DeckPrintPage({ searchParams }: PageProps) {
  const token = searchParams.token
  if (!token) redirect('/deck/access-denied')

  const accessToken = await prisma.accessToken.findUnique({ where: { token } })
  if (!accessToken || !isTokenValid(accessToken)) redirect('/deck/access-denied')

  const slides = await prisma.slideConfig.findMany({
    where: {
      slideIndex: { lt: CONSENT_STORAGE_SLIDE_INDEX },
    },
    orderBy: { slideIndex: 'asc' },
  })
  const slideConfigs = slides.map(s => s.configJson as unknown as SlideConfig)

  return (
    <html>
      <head>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #000; }
          .slide-page { width: 1920px; height: 1080px; overflow: hidden; page-break-after: always; break-after: page; }
          @page { size: 297mm 210mm; margin: 0; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #000; }
            .slide-page { page-break-after: always; break-after: page; }
          }
        `}</style>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: 'window.addEventListener("load", function(){ setTimeout(function(){ window.print(); }, 1500); });' }} />
      </head>
      <body>
        {slideConfigs.map((slide, i) => (
          <div key={i} className="slide-page">
            <SlideRenderer slideConfig={slide} scale={1} isPrint isAnimated={false} />
          </div>
        ))}
      </body>
    </html>
  )
}

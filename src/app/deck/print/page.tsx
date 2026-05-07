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

  // 297mm page at 96 CSS dpi = 1122.52px. Scale 1920px wide slide to fill exactly.
  const PRINT_SCALE = 1122 / 1920

  return (
    <html>
      <head>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #000; }
          @page { size: 297mm 210mm; margin: 0; }
          .slide-page {
            width: 297mm;
            height: 210mm;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000;
            page-break-after: always;
            break-after: page;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
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
            <SlideRenderer slideConfig={slide} scale={PRINT_SCALE} isPrint isAnimated={false} />
          </div>
        ))}
      </body>
    </html>
  )
}

import { prisma } from '@/lib/prisma'
import SlideEditorClient from './SlideEditorClient'
import type { SlideConfig } from '@/types/slide'

export const dynamic = 'force-dynamic'

export default async function AdminSlidesPage() {
  let slideConfigs: { id: string; config: SlideConfig }[] = []
  let dbError = false

  try {
    const slides = await prisma.slideConfig.findMany({
      orderBy: { slideIndex: 'asc' },
    })
    slideConfigs = slides.map(s => ({
      id: s.id,
      config: s.configJson as unknown as SlideConfig,
    }))
  } catch {
    dbError = true
  }

  if (dbError || slideConfigs.length === 0) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 64,
        color: '#FFFFFF',
        fontFamily: "'Inter', sans-serif",
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 24 }}>🗄️</div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, margin: '0 0 16px' }}>
          {dbError ? 'Base de données non connectée' : 'Aucune slide trouvée'}
        </h2>
        <p style={{ color: 'rgba(232,237,242,0.6)', fontSize: 16, maxWidth: 520, lineHeight: 1.6, margin: '0 0 32px' }}>
          {dbError
            ? 'Configurez DATABASE_URL dans .env, lancez PostgreSQL, puis exécutez les commandes ci-dessous.'
            : 'La base de données est connectée mais vide. Exécutez le seed pour charger les 17 slides.'}
        </p>
        <div style={{ background: 'rgba(0,194,203,0.08)', border: '1px solid rgba(0,194,203,0.2)', borderRadius: 8, padding: '16px 24px', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#00C2CB', textAlign: 'left' }}>
          <div>npx prisma db push</div>
          <div>npm run db:seed</div>
        </div>
      </div>
    )
  }

  return <SlideEditorClient slides={slideConfigs} />
}

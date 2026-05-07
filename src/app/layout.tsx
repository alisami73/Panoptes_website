import type { Metadata } from 'next'
import './globals.css'
import Providers from './Providers'
import SiteConsentManager from '@/components/consent/SiteConsentManager'

export const metadata: Metadata = {
  title: 'PANOPTES — Real-Time Health Intelligence',
  description: 'The first nervous system for public health. Blink Pharma pitch deck.',
  robots: 'noindex, nofollow',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, background: '#0D1B2A', color: '#FFFFFF' }}>
        <Providers>
          {children}
          <SiteConsentManager />
        </Providers>
      </body>
    </html>
  )
}

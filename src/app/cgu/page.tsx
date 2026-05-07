import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublicConsentState } from '@/lib/site-consent'

const interpretationItems = [
  'a guarantee of performance;',
  'a binding commercial commitment;',
  'a contractual obligation;',
  'a regulatory approval;',
  'a certification;',
  'a medical, pharmaceutical, legal, or financial recommendation;',
  'or a guarantee of future product availability or functionality.',
]

const proprietaryItems = [
  'software architectures;',
  'AI systems;',
  'algorithms;',
  'prompts;',
  'workflows;',
  'APIs;',
  'databases;',
  'taxonomies;',
  'medical classifications;',
  'decision-support systems;',
  'interoperability frameworks;',
  'visual designs;',
  'user interfaces;',
  'concepts;',
  'know-how;',
  'business methods;',
  'source code;',
  'technical documentation;',
  'specifications;',
  'graphics;',
  'layouts;',
  'trademarks;',
  'trade names;',
  'product names;',
  'logos;',
  'audio/video materials;',
  'datasets;',
  'methodologies;',
  'integration models;',
  'predictive systems;',
  'multi-agent systems;',
  'analytics models;',
  'deployment strategies;',
]

const prohibitedItems = [
  'reproduction;',
  'extraction;',
  'screenshotting;',
  'scraping;',
  'copying;',
  'downloading;',
  'redistribution;',
  'republication;',
  'AI training usage;',
  'benchmarking;',
  'reverse engineering;',
  'decompilation;',
  'adaptation;',
  'commercial exploitation;',
  'replication of workflows or interfaces;',
  'or derivative use,',
]

const protectedItems = [
  'trade secrets;',
  'confidential information;',
  'protected databases;',
  'proprietary methodologies;',
  'copyrighted works;',
  'patentable innovations;',
  'protected software components;',
  'or commercially sensitive information.',
]

const ndaTerms = [
  {
    title: '1. Confidentiality Obligation',
    body: 'All information disclosed by Blink Pharma, whether oral, visual, written, electronic, technical, operational, commercial, or strategic, shall be treated as strictly confidential.',
  },
  {
    title: '2. Permitted Purpose',
    body: 'The information may only be used for internal evaluation, partnership discussions, investment review, procurement assessment, or direct business discussions with Blink Pharma.',
  },
  {
    title: '3. Non-Disclosure',
    body: 'The visitor shall not reproduce, distribute, disclose, transmit, publish, share, capture, store, display, circulate, or expose any part of the information to any third party without prior written authorization from Blink Pharma.',
  },
  {
    title: '4. Non-Compete / Non-Reuse Restriction',
    body: 'The visitor agrees not to use any information obtained through this platform to develop competing products or services, replicate workflows or interfaces, train competing AI systems, reproduce concepts or methodologies, bypass technical mechanisms, conduct unauthorized competitive benchmarking, or perform reverse engineering activities.',
  },
  {
    title: '5. Data Protection',
    body: 'The visitor acknowledges that certain information may relate to regulated healthcare, pharmaceutical, technical, operational, or commercially sensitive environments subject to legal and contractual obligations.',
  },
  {
    title: '6. Duration',
    body: 'These confidentiality obligations shall remain in effect for a minimum period of five (5) years following the last access to the materials, unless a longer protection period applies under applicable law or separate agreement.',
  },
  {
    title: '7. No Implied License',
    body: 'Nothing contained herein shall be interpreted as granting any implied license, ownership transfer, or intellectual property rights.',
  },
  {
    title: '8. Governing Law',
    body: 'These terms shall be governed by and construed in accordance with the laws of the Kingdom of Morocco. Any dispute shall fall under the exclusive jurisdiction of the competent courts of Casablanca, unless otherwise agreed in writing.',
  },
]

export const metadata: Metadata = {
  title: 'PANOPTES - CGU / Terms of Access',
  description: 'Forward-looking statement, intellectual property notice, and confidentiality terms for Blink Pharma materials.',
  robots: 'noindex, nofollow',
}

export const dynamic = 'force-dynamic'

export default async function CguPage() {
  let managedConsent: Awaited<ReturnType<typeof getPublicConsentState>> | null = null

  try {
    managedConsent = await getPublicConsentState()
  } catch {
    managedConsent = null
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflowX: 'hidden',
        background: '#0D1B2A',
        color: '#FFFFFF',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          backgroundImage: `
            linear-gradient(180deg, rgba(13,27,42,0.96) 0%, rgba(7,16,28,1) 100%),
            url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 86.6'><path d='M50 0 L100 28.87 L100 86.6 L50 115.47 L0 86.6 L0 28.87 Z M50 5.77 L5 31.74 L5 83.73 L50 109.7 L95 83.73 L95 31.74 Z' fill='none' stroke='%2300C2CB' stroke-width='0.4' opacity='0.15'/></svg>")
          `,
          backgroundSize: 'cover, 60px 51.96px',
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '-16rem',
          right: '-12rem',
          width: 'min(72vw, 760px)',
          height: 'min(72vw, 760px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,194,203,0.26) 0%, rgba(0,194,203,0) 72%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <nav
          style={{
            padding: '24px clamp(20px, 5vw, 64px)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(0,194,203,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <svg width={32} height={32} viewBox="0 0 88 88" aria-hidden="true">
              <defs>
                <radialGradient id="iris-cgu" cx="42%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#a8e6ff" />
                  <stop offset="40%" stopColor="#00C2CB" />
                  <stop offset="100%" stopColor="#0a2754" />
                </radialGradient>
              </defs>
              <ellipse cx="44" cy="44" rx="40" ry="22" fill="none" stroke="#00C2CB" strokeWidth="2.5" transform="rotate(-12 44 44)" />
              <circle cx="44" cy="44" r="14" fill="url(#iris-cgu)" />
              <circle cx="44" cy="44" r="6" fill="#0D1B2A" />
              <circle cx="40" cy="40" r="2" fill="#fff" opacity={0.9} />
            </svg>

            <div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: 20,
                  letterSpacing: '0.04em',
                }}
              >
                PANOPTES
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  letterSpacing: '0.25em',
                  color: '#00C2CB',
                }}
              >
                BLINK PHARMA
              </div>
            </div>
          </div>

          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 999,
              border: '1px solid rgba(0,194,203,0.3)',
              background: 'rgba(0,194,203,0.06)',
              color: '#00C2CB',
              textDecoration: 'none',
              textTransform: 'uppercase',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.18em',
            }}
          >
            Back to home
          </Link>
        </nav>

        <article style={{ maxWidth: 1040, margin: '0 auto', padding: 'clamp(40px, 7vw, 88px) clamp(20px, 5vw, 64px) 96px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 999,
              border: '1px solid rgba(0,194,203,0.22)',
              background: 'rgba(0,194,203,0.06)',
              color: '#00C2CB',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
            }}
          >
            Legal / confidential
          </div>

          <h1
            style={{
              margin: '24px 0 16px',
              maxWidth: 820,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(2.6rem, 7vw, 4.5rem)',
              lineHeight: 1.02,
              letterSpacing: '-0.04em',
            }}
          >
            Forward-Looking Statement
          </h1>

          <p
            style={{
              margin: '0 0 18px',
              maxWidth: 820,
              color: 'rgba(232,237,242,0.78)',
              fontSize: 'clamp(1rem, 2.2vw, 1.18rem)',
              lineHeight: 1.75,
            }}
          >
            This page presents the legal notice, proprietary rights statement, and confidentiality terms applicable to PANOPTES and related
            Blink Pharma materials.
          </p>

          <div
            style={{
              marginTop: 28,
              padding: '20px 24px',
              borderRadius: 12,
              border: '1px solid rgba(0,194,203,0.18)',
              background: 'rgba(0,194,203,0.05)',
              color: 'rgba(232,237,242,0.78)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            © Blink Pharma — All Rights Reserved.
          </div>

          {managedConsent && (
            <LegalSection title="Navigation Consent Notice">
              <SectionHeading>Published Consent Snapshot</SectionHeading>
              <LegalParagraph>
                This is the current visitor consent text managed from the PANOPTES admin interface.
              </LegalParagraph>
              <div
                style={{
                  padding: '18px 20px',
                  borderRadius: 12,
                  border: '1px solid rgba(0,194,203,0.12)',
                  background: 'rgba(0,194,203,0.03)',
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    marginBottom: 10,
                    color: '#00C2CB',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                  }}
                >
                  {managedConsent.version} · {managedConsent.sourceFileName}
                </div>
                <div
                  style={{
                    color: 'rgba(232,237,242,0.84)',
                    whiteSpace: 'pre-line',
                    lineHeight: 1.8,
                    fontSize: 15,
                  }}
                >
                  {managedConsent.text}
                </div>
              </div>
              <LegalParagraph>
                Snapshot hash: <span style={{ color: '#00C2CB', fontFamily: "'JetBrains Mono', monospace", wordBreak: 'break-all' }}>{managedConsent.originalFileHash}</span>
              </LegalParagraph>
            </LegalSection>
          )}

          <LegalSection title="Forward-Looking Statement">
            <LegalParagraph>
              This website, presentation, demonstration, and all related materials may contain forward-looking statements regarding the
              activities, products, services, strategies, technological developments, artificial intelligence capabilities, deployment roadmaps,
              interoperability, market opportunities, expected performance, operational objectives, partnerships, integrations, regulatory
              initiatives, financial projections, and future plans of Blink Pharma.
            </LegalParagraph>
            <LegalParagraph>
              These statements are based on information, assumptions, estimates, expectations, and projections available as of the date of
              consultation. By their nature, forward-looking statements involve risks, uncertainties, technological changes, regulatory
              developments, market conditions, third-party dependencies, implementation challenges, and other factors that may cause actual
              results, performance, or achievements to differ materially from those expressed or implied.
            </LegalParagraph>
            <LegalParagraph>Nothing contained in this website or associated materials shall be interpreted as:</LegalParagraph>
            <ListBlock items={interpretationItems} />
            <LegalParagraph>
              Any demonstrations, prototypes, mockups, AI-generated content, workflows, visualizations, predictive models, dashboards,
              interfaces, simulations, or technical examples are provided solely for illustrative and informational purposes and may evolve, be
              modified, or be discontinued without prior notice.
            </LegalParagraph>
            <LegalParagraph>
              Blink Pharma reserves the right to modify, suspend, replace, limit, or discontinue any product, service, feature, integration,
              architecture, or information presented at any time without obligation or liability.
            </LegalParagraph>
            <LegalParagraph>Any reliance on the information contained herein is solely at the reader&apos;s own risk.</LegalParagraph>
          </LegalSection>

          <LegalSection title="Intellectual Property Protection Notice">
            <SectionHeading>Intellectual Property and Proprietary Rights</SectionHeading>
            <LegalParagraph>
              All content accessible through this website, platform, demonstration, or presentation, including without limitation:
            </LegalParagraph>
            <ListBlock items={proprietaryItems} columns={2} />
            <LegalParagraph>
              are and shall remain the exclusive property of Blink Pharma and/or its licensors, partners, suppliers, or affiliates.
            </LegalParagraph>
            <LegalParagraph>
              No intellectual property rights, licenses, ownership rights, reproduction rights, exploitation rights, reverse-engineering rights,
              or commercial usage rights are granted by the mere consultation of these materials.
            </LegalParagraph>
            <LegalParagraph>Any unauthorized:</LegalParagraph>
            <ListBlock items={prohibitedItems} columns={2} />
            <LegalParagraph>
              whether partial or complete, is strictly prohibited without the prior written consent of Blink Pharma.
            </LegalParagraph>
            <LegalParagraph>Certain elements presented may constitute:</LegalParagraph>
            <ListBlock items={protectedItems} columns={2} />
            <LegalParagraph>
              Blink Pharma reserves all rights and may pursue any civil, commercial, contractual, administrative, or criminal remedies available
              under applicable law.
            </LegalParagraph>
          </LegalSection>

          <LegalSection title="Confidentiality & NDA Terms of Access">
            <SectionHeading>Mandatory Confidentiality Agreement Prior to Access</SectionHeading>
            <LegalParagraph>
              By accessing, browsing, reviewing, or interacting with this website, demonstration, platform, or related materials, the visitor
              expressly acknowledges and agrees that all information disclosed is confidential, proprietary, commercially sensitive, and
              protected.
            </LegalParagraph>
            <LegalParagraph>The visitor agrees to the following terms:</LegalParagraph>

            <div
              style={{
                display: 'grid',
                gap: 14,
                marginTop: 24,
              }}
            >
              {ndaTerms.map(term => (
                <div
                  key={term.title}
                  style={{
                    padding: '18px 20px',
                    borderRadius: 12,
                    border: '1px solid rgba(0,194,203,0.16)',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 8px',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)',
                      color: '#FFFFFF',
                    }}
                  >
                    {term.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      color: 'rgba(232,237,242,0.76)',
                      lineHeight: 1.75,
                      fontSize: 16,
                    }}
                  >
                    {term.body}
                  </p>
                </div>
              ))}
            </div>
          </LegalSection>
        </article>
      </div>
    </main>
  )
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 72 }}>
      <div
        style={{
          marginBottom: 16,
          color: '#00C2CB',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </div>

      <div
        style={{
          padding: 'clamp(20px, 4vw, 30px)',
          borderRadius: 18,
          border: '1px solid rgba(0,194,203,0.16)',
          background: 'rgba(255,255,255,0.02)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.14)',
        }}
      >
        {children}
      </div>
    </section>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        margin: '0 0 18px',
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 600,
        fontSize: 'clamp(1.5rem, 4vw, 1.95rem)',
        lineHeight: 1.2,
      }}
    >
      {children}
    </h2>
  )
}

function LegalParagraph({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: '0 0 16px',
        color: 'rgba(232,237,242,0.76)',
        fontSize: 16,
        lineHeight: 1.8,
      }}
    >
      {children}
    </p>
  )
}

function ListBlock({ items, columns = 1 }: { items: string[]; columns?: 1 | 2 }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: columns === 2 ? 'repeat(auto-fit, minmax(220px, 1fr))' : '1fr',
        gap: 10,
        margin: '0 0 20px',
      }}
    >
      {items.map(item => (
        <div
          key={item}
          style={{
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid rgba(0,194,203,0.12)',
            background: 'rgba(0,194,203,0.03)',
            color: 'rgba(232,237,242,0.82)',
            lineHeight: 1.7,
          }}
        >
          {item}
        </div>
      ))}
    </div>
  )
}

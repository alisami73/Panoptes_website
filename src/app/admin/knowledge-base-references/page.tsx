'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface PdfInfo {
  nom: string
  taille_mb: number
  extrait: boolean
  chunke: boolean
  indexe: boolean
  statut_file: string
  n_pages: number
  n_chunks: number
}

interface StatsResponse {
  pdfs: PdfInfo[]
  totaux: {
    n_pdfs: number
    n_pages: number
    n_chunks: number
    vecteurs_azure: number
  }
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: 10,
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 600,
      letterSpacing: '0.08em',
      background: ok ? 'rgba(0,194,203,0.12)' : 'rgba(255,255,255,0.04)',
      color: ok ? '#00C2CB' : 'rgba(232,237,242,0.25)',
      border: `1px solid ${ok ? 'rgba(0,194,203,0.3)' : 'rgba(255,255,255,0.08)'}`,
    }}>
      <span style={{ fontSize: 8 }}>{ok ? '●' : '○'}</span>
      {label}
    </span>
  )
}

export default function KnowledgeBaseReferencesPage() {
  const [pdfs, setPdfs] = useState<PdfInfo[]>([])
  const [totaux, setTotaux] = useState<StatsResponse['totaux'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'indexe' | 'pending'>('all')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch('/api/admin/kb/api/stats', { cache: 'no-store' })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data: StatsResponse = await r.json()
      setPdfs(data.pdfs || [])
      setTotaux(data.totaux)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Service KB hors ligne')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  const pdfViewerUrl = selected
    ? `/api/admin/kb/api/pdf/${encodeURIComponent(selected)}`
    : null

  const azurePath = (nom: string) =>
    `/app/data/pdfs_therapeutique/${nom}`

  const filtered = pdfs.filter(p => {
    if (filter === 'indexe') return p.indexe
    if (filter === 'pending') return !p.indexe
    return true
  })

  const countByStatus = {
    indexe: pdfs.filter(p => p.indexe).length,
    pending: pdfs.filter(p => !p.indexe).length,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <div style={{
        padding: '18px 28px',
        borderBottom: '1px solid rgba(0,194,203,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        gap: 16,
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 20,
            fontWeight: 700,
            color: '#FFFFFF',
            margin: 0,
          }}>
            📄 Références thérapeutiques
          </h1>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.2em',
            color: '#00C2CB',
            margin: '3px 0 0',
          }}>
            ARGUS-PANOPTES · KNOWLEDGE BASE · PIPELINE A
          </p>
        </div>

        {/* Stats summary */}
        {totaux && (
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            {[
              { label: 'PDFs', value: totaux.n_pdfs },
              { label: 'Pages', value: totaux.n_pages },
              { label: 'Chunks', value: totaux.n_chunks.toLocaleString('fr') },
              { label: 'Vecteurs Azure', value: totaux.vecteurs_azure.toLocaleString('fr'), accent: true },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: s.accent ? '#00C2CB' : '#FFFFFF',
                }}>{s.value}</div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  color: 'rgba(232,237,242,0.4)',
                  letterSpacing: '0.1em',
                }}>{s.label.toUpperCase()}</div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh */}
        <button
          onClick={fetchStats}
          disabled={loading}
          style={{
            padding: '8px 14px',
            borderRadius: 6,
            border: '1px solid rgba(0,194,203,0.25)',
            background: 'transparent',
            color: '#00C2CB',
            cursor: loading ? 'default' : 'pointer',
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace',",
            opacity: loading ? 0.5 : 1,
            letterSpacing: '0.1em',
          }}
        >
          {loading ? '…' : '↻ ACTUALISER'}
        </button>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left panel — PDF list ── */}
        <div style={{
          width: 440,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(0,194,203,0.10)',
          overflow: 'hidden',
        }}>

          {/* Filter tabs */}
          <div style={{
            display: 'flex',
            padding: '10px 16px',
            gap: 6,
            borderBottom: '1px solid rgba(0,194,203,0.08)',
            flexShrink: 0,
          }}>
            {([
              { key: 'all', label: `Tous (${pdfs.length})` },
              { key: 'indexe', label: `Indexés (${countByStatus.indexe})` },
              { key: 'pending', label: `En attente (${countByStatus.pending})` },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 4,
                  border: 'none',
                  background: filter === tab.key ? 'rgba(0,194,203,0.15)' : 'transparent',
                  color: filter === tab.key ? '#00C2CB' : 'rgba(232,237,242,0.4)',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: filter === tab.key ? 600 : 400,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {error && (
              <div style={{
                padding: 24,
                textAlign: 'center',
                color: 'rgba(232,237,242,0.4)',
                fontSize: 13,
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🔌</div>
                <div style={{ fontWeight: 600, color: '#FFFFFF', marginBottom: 4 }}>Dashboard KB hors ligne</div>
                <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>{error}</div>
              </div>
            )}

            {!error && loading && (
              <div style={{ padding: 32, textAlign: 'center', color: 'rgba(0,194,203,0.6)', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                CHARGEMENT…
              </div>
            )}

            {!error && !loading && filtered.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', color: 'rgba(232,237,242,0.3)', fontSize: 13 }}>
                Aucun PDF trouvé.
              </div>
            )}

            {!error && filtered.map((pdf, i) => {
              const isSelected = selected === pdf.nom
              return (
                <div
                  key={pdf.nom}
                  onClick={() => {
                    setSelected(pdf.nom)
                    setPdfLoading(true)
                  }}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(0,194,203,0.06)',
                    cursor: 'pointer',
                    background: isSelected
                      ? 'rgba(0,194,203,0.08)'
                      : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                    borderLeft: isSelected ? '2px solid #00C2CB' : '2px solid transparent',
                    transition: 'background 0.1s',
                  }}
                >
                  {/* Row 1: name + size */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>
                      {pdf.indexe ? '📗' : pdf.chunke ? '📙' : pdf.extrait ? '📒' : '📕'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 12,
                        fontWeight: 600,
                        color: isSelected ? '#00C2CB' : '#FFFFFF',
                        wordBreak: 'break-word',
                        lineHeight: 1.3,
                      }}>
                        {pdf.nom}
                      </div>
                      <div style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                        color: 'rgba(232,237,242,0.3)',
                        marginTop: 2,
                        wordBreak: 'break-all',
                      }}>
                        {azurePath(pdf.nom)}
                      </div>
                    </div>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      color: 'rgba(232,237,242,0.35)',
                      flexShrink: 0,
                      marginTop: 2,
                    }}>
                      {pdf.taille_mb} MB
                    </span>
                  </div>

                  {/* Row 2: status badges + metrics */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', paddingLeft: 22 }}>
                    <Badge ok={pdf.extrait} label="EXTRAIT" />
                    <Badge ok={pdf.chunke} label="CHUNK" />
                    <Badge ok={pdf.indexe} label="INDEXÉ" />
                    {pdf.n_pages > 0 && (
                      <span style={{
                        marginLeft: 4,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                        color: 'rgba(232,237,242,0.25)',
                      }}>
                        {pdf.n_pages}p · {pdf.n_chunks} chunks
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Right panel — PDF viewer ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

          {/* Viewer toolbar */}
          {selected && (
            <div style={{
              padding: '8px 20px',
              borderBottom: '1px solid rgba(0,194,203,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexShrink: 0,
              background: 'rgba(0,194,203,0.03)',
            }}>
              <span style={{ fontSize: 14 }}>📄</span>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: '#FFFFFF',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {selected}
              </span>
              <a
                href={pdfViewerUrl ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '4px 10px',
                  borderRadius: 4,
                  border: '1px solid rgba(0,194,203,0.25)',
                  color: '#00C2CB',
                  textDecoration: 'none',
                  fontSize: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '0.1em',
                  flexShrink: 0,
                }}
              >
                OUVRIR ↗
              </a>
              <button
                onClick={() => { setSelected(null); setPdfLoading(false) }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(232,237,242,0.35)',
                  cursor: 'pointer',
                  fontSize: 16,
                  padding: '0 4px',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Empty state */}
          {!selected && (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(232,237,242,0.2)',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 6,
              }}>
                Sélectionnez un document
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.1em',
              }}>
                Cliquez sur un PDF dans la liste pour le consulter
              </div>
            </div>
          )}

          {/* PDF spinner */}
          {selected && pdfLoading && (
            <div style={{
              position: 'absolute',
              inset: 0,
              top: 41,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0D1B2A',
              zIndex: 2,
              pointerEvents: 'none',
            }}>
              <div style={{
                width: 32,
                height: 32,
                border: '3px solid rgba(0,194,203,0.15)',
                borderTop: '3px solid #00C2CB',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {/* iframe viewer */}
          {selected && pdfViewerUrl && (
            <iframe
              ref={iframeRef}
              key={pdfViewerUrl}
              src={pdfViewerUrl}
              style={{
                flex: 1,
                width: '100%',
                border: 'none',
                display: 'block',
                minHeight: 0,
              }}
              onLoad={() => setPdfLoading(false)}
              title={`Lecture : ${selected}`}
            />
          )}
        </div>
      </div>
    </div>
  )
}

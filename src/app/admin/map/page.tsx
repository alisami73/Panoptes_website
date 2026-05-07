'use client'

import React, { useEffect, useState } from 'react'
import { DiseaseConfig, LEVEL_COLORS, LEVEL_LABELS, REGIONS, DEFAULT_DISEASES, Level } from '@/data/epi-map-data'

export default function AdminMapPage() {
  const [diseases, setDiseases] = useState<DiseaseConfig[]>(DEFAULT_DISEASES)
  const [activeDiseaseIdx, setActiveDiseaseIdx] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/map').then(r => r.json()).then(data => {
      if (data.diseases?.length) setDiseases(data.diseases)
    })
  }, [])

  const activeDisease = diseases[activeDiseaseIdx]

  function updateRegion(regionId: string, field: string, value: string | number) {
    setDiseases(prev => prev.map((d, i) => {
      if (i !== activeDiseaseIdx) return d
      return {
        ...d,
        regions: d.regions.map(r => r.regionId === regionId ? { ...r, [field]: field === 'level' || field === 'cases' ? Number(value) : field === 'evolutionPct' ? parseFloat(String(value)) : value } : r),
      }
    }))
  }

  function updateStats(field: string, value: number) {
    setDiseases(prev => prev.map((d, i) => i === activeDiseaseIdx ? { ...d, stats: { ...d.stats, [field]: value } } : d))
  }

  async function saveDisease() {
    setSaving(true)
    try {
      await fetch('/api/admin/map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diseaseId: activeDisease.id,
          disease: activeDisease.name,
          period: 'today',
          data: activeDisease.regions,
          alerts: activeDisease.alerts,
          stats: activeDisease.stats,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  if (!activeDisease) return <div style={{ padding: 40, color: '#fff' }}>Chargement...</div>

  return (
    <div style={{ padding: '32px 40px', minHeight: '100vh', background: '#0D1B2A', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: 24, fontWeight: 700 }}>Carte épidémiologique — Éditeur</h1>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: 14 }}>Modifier les données par maladie × région</p>
        </div>
        <button
          onClick={saveDisease}
          disabled={saving}
          style={{ padding: '10px 24px', borderRadius: 8, background: saved ? '#639922' : '#00C2CB', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
        >
          {saving ? 'Sauvegarde...' : saved ? '✓ Sauvegardé' : 'Sauvegarder'}
        </button>
      </div>

      {/* Disease tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {diseases.map((d, i) => (
          <button
            key={d.id}
            onClick={() => setActiveDiseaseIdx(i)}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 14,
              background: i === activeDiseaseIdx ? '#00C2CB' : 'rgba(255,255,255,0.05)',
              color: i === activeDiseaseIdx ? '#000' : '#fff',
              border: 'none', cursor: 'pointer', fontWeight: i === activeDiseaseIdx ? 600 : 400,
            }}
          >{d.name}</button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {['alert', 'up', 'stable'].map(field => (
          <div key={field} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 16, flex: 1 }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
              {field === 'alert' ? 'Alertes' : field === 'up' ? 'En hausse' : 'Stables'}
            </div>
            <input
              type="number"
              value={activeDisease.stats[field as keyof typeof activeDisease.stats]}
              onChange={e => updateStats(field, parseInt(e.target.value) || 0)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, padding: '6px 10px', color: '#fff', fontSize: 18, fontWeight: 700 }}
            />
          </div>
        ))}
      </div>

      {/* Region table */}
      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              {['Région', 'Niveau', 'Cas', 'Évolution %', 'Prévision', 'Action'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#888' }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {REGIONS.map(region => {
              const rd = activeDisease.regions.find(r => r.regionId === region.id)
              if (!rd) return null
              const level = rd.level as Level
              return (
                <tr key={region.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 600 }}>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: LEVEL_COLORS[level], marginRight: 8 }} />
                    {region.name}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <select
                      value={rd.level}
                      onChange={e => updateRegion(region.id, 'level', e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, padding: '4px 8px', color: '#fff', fontSize: 12 }}
                    >
                      {[1,2,3,4,5].map(l => <option key={l} value={l}>{l} — {LEVEL_LABELS[l as Level]}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <input type="number" value={rd.cases} onChange={e => updateRegion(region.id, 'cases', e.target.value)}
                      style={{ width: 80, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, padding: '4px 8px', color: '#fff', fontSize: 12 }} />
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <input type="number" step="0.1" value={rd.evolutionPct} onChange={e => updateRegion(region.id, 'evolutionPct', e.target.value)}
                      style={{ width: 70, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, padding: '4px 8px', color: '#fff', fontSize: 12 }} />
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <input type="text" value={rd.forecast} onChange={e => updateRegion(region.id, 'forecast', e.target.value)}
                      style={{ width: 160, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, padding: '4px 8px', color: '#fff', fontSize: 12 }} />
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <input type="text" value={rd.action} onChange={e => updateRegion(region.id, 'action', e.target.value)}
                      style={{ width: 200, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, padding: '4px 8px', color: '#fff', fontSize: 12 }} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CONSENT_STORAGE_SLIDE_INDEX } from '@/lib/site-consent'

const SLIDES = [
  {
    slideIndex: 1,
    configJson: {
      slideIndex: 1, title: '', subtitle: '',
      label: '01 Visual: Argus Panoptes',
      layout: 'visual-argus',
      theme: { background: '#02040d', textColor: '#FFFFFF', accentColor: '#00C2CB' },
      blocks: [],
    },
  },
  {
    slideIndex: 2,
    configJson: {
      slideIndex: 2,
      title: 'The first nervous system for public health.',
      subtitle: '',
      label: '02 Cover',
      layout: 'cover',
      theme: { background: '#0D1B2A', textColor: '#FFFFFF', accentColor: '#00C2CB' },
      blocks: [
        { id: 'brand-wordmark', type: 'text', content: { value: 'PANOPTES' }, style: { fontSize: '7xl', fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'grotesk' } },
        { id: 'brand-tagline', type: 'text', content: { value: 'Real-Time Health Intelligence' }, style: { fontSize: 'sm', fontWeight: 'normal', color: '#00C2CB', fontFamily: 'mono', letterSpacing: '0.3em' } },
        { id: 'cover-title', type: 'text', content: { value: 'The first nervous system\nfor public health.' }, style: { fontSize: '7xl', fontWeight: 'semibold', color: '#FFFFFF', fontFamily: 'grotesk' } },
        { id: 'cover-pillars', type: 'text', content: { value: 'EARLY DETECTION  ·  REAL-TIME MONITORING  ·  PREDICTIVE INTELLIGENCE' }, style: { fontSize: 'base', fontWeight: 'normal', color: '#00C2CB', fontFamily: 'mono', letterSpacing: '0.4em' } },
        { id: 'cover-footer-left', type: 'text', content: { value: 'EVERY PHARMACY · A REAL-TIME HEALTH SENSOR' }, style: { fontSize: 'xs', fontWeight: 'normal', color: 'rgba(232,237,242,0.32)', fontFamily: 'mono', letterSpacing: '0.2em' } },
        { id: 'cover-footer-right', type: 'text', content: { value: 'INVESTOR DECK · 2026' }, style: { fontSize: 'xs', fontWeight: 'normal', color: 'rgba(232,237,242,0.32)', fontFamily: 'mono', letterSpacing: '0.2em' } },
      ],
    },
  },
  {
    slideIndex: 3,
    configJson: {
      slideIndex: 3, title: 'Achievements & Traction',
      subtitle: 'Six years building the operating system for Moroccan pharmacies — from a single-app pilot in 2019 to a four-product portfolio powering thousands of nodes today.',
      label: '03 Achievements & Traction', layout: 'achievements',
      theme: { background: '#07101c', textColor: '#FFFFFF', accentColor: '#00C2CB' },
      blocks: [],
    },
  },
  {
    slideIndex: 4,
    configJson: {
      slideIndex: 4, title: 'Healthcare detects diseases too late.',
      subtitle: 'Critical signals already exist in pharmacies, hospitals, labs, and insurers — but they remain fragmented, siloed, and reported with 13+ days of delay.',
      label: '04 The Problem', layout: 'problem', eyebrow: '01 · The Problem',
      theme: { background: '#0D1B2A', textColor: '#FFFFFF', accentColor: '#00C2CB' },
      blocks: [
        { id: 'prob-1', type: 'card', content: { num: '01', icon: 'fragmented-data', title: 'Fragmented data', body: 'Pharmacies, hospitals, labs and insurers each hold a piece of the puzzle — none can see the whole picture.' }, style: { color: '#00C2CB' } },
        { id: 'prob-2', type: 'card', content: { num: '02', icon: 'clock', title: '13+ days of latency', body: 'By the time conventional surveillance flags an outbreak, the wave is already cresting in ICUs and pharmacies.' }, style: { color: '#00C2CB' } },
        { id: 'prob-3', type: 'card', content: { num: '03', icon: 'chart-up', title: 'Reactive, not predictive', body: 'Public health agencies count cases after the fact, with no infrastructure to forecast spread or intervene early.' }, style: { color: '#00C2CB' } },
        { id: 'prob-4', type: 'card', content: { num: '04', icon: 'star', title: 'Untapped pharmacy signal', body: '14k+ pharmacies see early symptomatic behavior every day — antibiotics, antivirals, OTC — and that signal is wasted.' }, style: { color: '#00C2CB' } },
      ],
      footer: { left: 'STATE — TODAY', right: 'MEAN DETECTION DELAY · 13.4 DAYS' },
    },
  },
  {
    slideIndex: 5,
    configJson: {
      slideIndex: 5, title: 'Fragmented Health Data', subtitle: '',
      label: '05 Visual: Fragmented', layout: 'visual-fragmented',
      theme: { background: '#0D1B2A', textColor: '#FFFFFF', accentColor: '#00C2CB' },
      blocks: [],
    },
  },
  {
    slideIndex: 6,
    configJson: {
      slideIndex: 6, title: 'A three-layer intelligence stack.',
      subtitle: 'Beacon captures the live signal at the point of sale. Two knowledge bases turn raw transactions into clinically meaningful, geo-aware health intelligence.',
      label: '06 The Solution', layout: 'solution', eyebrow: '02 · The Solution',
      theme: { background: '#0D1B2A', textColor: '#FFFFFF', accentColor: '#00C2CB' },
      blocks: [
        { id: 'sol-beacon', type: 'solution-col', content: { num: '01 · CAPTURE', icon: 'beacon', title: 'Beacon', role: 'Live capture layer', desc: 'A non-intrusive AI extension that augments existing pharmacy software. Anonymized, k-anonymous, and interoperable with PharmaPro, WinPharma, and Sage-Rx.', features: ['· Plug-and-play widget', '· Real-time, sub-second', '· 14,238 nodes streaming'] }, style: {} },
        { id: 'sol-drugkb', type: 'solution-col', content: { num: '02 · ENRICH', icon: 'database', title: 'Drug KB', role: 'Pharmaceutical graph', desc: 'A continuously updated knowledge base of every drug, ATC code, dosage, and substitution path — the linguistic backbone that turns SKU strings into structured medical concepts.', features: ['· 8,400+ drug entities', '· ATC + ICD-10 indexed', '· Auto-substitution graph'] }, style: {} },
        { id: 'sol-therapkb', type: 'solution-col', content: { num: '03 · INFER', icon: 'brain', title: 'Therapeutic KB', role: 'Clinical inference engine', desc: 'Maps drug patterns to disease probabilities. Ephedrine + paracetamol + cough syrup at scale becomes a quantified ILI signal, weeks before conventional surveillance.', features: ['· 240+ disease prototypes', '· 7-day predictive horizon', '· Geo-stratified inference'] }, style: {} },
      ],
    },
  },
  {
    slideIndex: 7,
    configJson: {
      slideIndex: 7, title: 'Transforming pharmacy sales\ninto health intelligence.',
      subtitle: 'Every transaction is a faint signal. At scale, across 14k+ pharmacies, those signals become a real-time map of population health.',
      label: '07 Transforming Sales', layout: 'flow', eyebrow: '03 · How it works',
      theme: { background: '#0D1B2A', textColor: '#FFFFFF', accentColor: '#00C2CB' },
      blocks: [
        { id: 'flow-pharmacy', type: 'flow-stage', content: { num: 'SOURCE', icon: 'pos', title: 'Pharmacy', desc: 'A sale is recorded in existing POS software' }, style: {} },
        { id: 'flow-signal', type: 'flow-stage', content: { num: 'SIGNAL', icon: 'beacon-pulse', title: 'Anonymized signal', desc: 'Beacon emits a structured, k=15 anonymized event' }, style: { highlight: true } },
        { id: 'flow-dashboard', type: 'flow-stage', content: { num: 'INTELLIGENCE', icon: 'dashboard', title: 'Dashboard', desc: 'Public health agencies, hospitals & ministries see live signals' }, style: {} },
      ],
      footer: { left: 'POS-AGNOSTIC · k=15 ANONYMIZED · GDPR + LAW 09-08 COMPLIANT', right: 'DETECTION LEAD · −9.1 DAYS' },
    },
  },
  {
    slideIndex: 8,
    configJson: {
      slideIndex: 8, title: 'Sensor Network', subtitle: '',
      label: '08 Visual: Sensor Network', layout: 'visual-sensor',
      theme: { background: '#0D1B2A', textColor: '#FFFFFF', accentColor: '#00C2CB' },
      blocks: [],
    },
  },
  {
    slideIndex: 9,
    configJson: {
      slideIndex: 9, title: 'Drug sales as a surrogate\nclinical endpoint.',
      subtitle: 'When ephedrine and antitussive sales spike together across a region, the curve precedes confirmed influenza cases by 7–11 days.',
      label: '09 Surrogate Endpoint', layout: 'chart-full', eyebrow: '04 · Methodology',
      theme: { background: '#0D1B2A', textColor: '#FFFFFF', accentColor: '#00C2CB' },
      blocks: [
        { id: 'chart-surrogate', type: 'chart', content: { chartType: 'line', chartTitle: 'EPHEDRINE / ANTITUSSIVE SALES vs CONFIRMED INFLUENZA — REGION CASABLANCA', chartSubtitle: 'WINDOW · 12 WEEKS', labels: ['W1','W2','W3','W4','W5','W6','W7','W8','W9','W10','W11','W12','W13'], datasets: [ { label: 'Ephedrine + antitussive sales', data: [20,23,30,38,51,69,91,96,78,59,45,33,24], color: '#00C2CB', fill: true, dashed: false }, { label: 'Confirmed influenza cases (lab)', data: [4,5,6,8,11,18,34,52,68,64,51,38,26], color: '#ff9456', fill: false, dashed: true } ], showLegend: true, showGrid: true, axisLabels: { x: 'Week', y: 'Index (normalized)' }, annotation: { text: '−9 DAYS LEAD', x: 8, color: '#00C2CB' } }, style: {} },
      ],
      footer: { left: 'SOURCE · Beacon network + Ministry of Health bulletin', right: 'PEARSON r · 0.87 · LEAD −9d' },
    },
  },
  {
    slideIndex: 10,
    configJson: {
      slideIndex: 10, title: 'From a single SKU\nto a clinical signal.',
      subtitle: 'Each transaction passes through a deterministic, auditable five-stage pipeline before it contributes to any inference.',
      label: '10 Filtering Single', layout: 'pipeline', eyebrow: '05 · AI pipeline · single-item',
      theme: { background: '#0D1B2A', textColor: '#FFFFFF', accentColor: '#00C2CB' },
      blocks: [
        { id: 'pipe-1', type: 'pipeline-step', content: { num: '01', name: 'Ingest', detail: 'Raw POS event', desc: 'SKU string, quantity, ATC hint, timestamp, cell-level geography.' }, style: {} },
        { id: 'pipe-2', type: 'pipeline-step', content: { num: '02', name: 'Resolve', detail: 'Drug KB lookup', desc: 'Map free-text SKU to canonical molecule, ATC code, dosage form.' }, style: {} },
        { id: 'pipe-3', type: 'pipeline-step', content: { num: '03', name: 'Anonymize', detail: 'k=15 · privacy guard', desc: 'Drop sub-cohort cells; aggregate to k≥15 before any export.' }, style: {} },
        { id: 'pipe-4', type: 'pipeline-step', content: { num: '04', name: 'Detrend', detail: 'Seasonal baseline', desc: 'Strip seasonality, weekday cycles and known promotional spikes.' }, style: {} },
        { id: 'pipe-5', type: 'pipeline-step', content: { num: '05', name: 'Score', detail: 'z-score + alert', desc: 'Compute regional z-score; threshold-trigger only when |z| > 2.5.' }, style: {} },
      ],
      metrics: [
        { label: 'INGEST RATE', value: '3.4M', unit: '/ day' },
        { label: 'END-TO-END LATENCY', value: '< 4', unit: 'seconds' },
        { label: 'FALSE-POSITIVE RATE', value: '2.1', unit: '%' },
      ],
    },
  },
  {
    slideIndex: 11,
    configJson: {
      slideIndex: 11, title: 'Co-occurrence is where\ndiagnosis lives.',
      subtitle: 'Single-drug spikes are noisy. Multi-item baskets — antibiotic + cough syrup + decongestant — produce statistically robust disease fingerprints.',
      label: '11 Filtering Multiple', layout: 'stats-chart', eyebrow: '06 · AI pipeline · multi-item',
      theme: { background: '#0D1B2A', textColor: '#FFFFFF', accentColor: '#00C2CB' },
      blocks: [
        { id: 'stats-table', type: 'stats-table', content: { headers: ['Disease prototype', 'Slope (β)', 'Pearson r', 'R²', 'Lead'], rows: [ ['Influenza-like illness (J11)', '0.83', '0.89', '0.79', '−9d'], ['Acute bronchitis (J20)', '0.71', '0.82', '0.67', '−6d'], ['Acute gastroenteritis (A09)', '0.66', '0.78', '0.61', '−5d'], ['Allergic rhinitis (J30)', '0.58', '0.74', '0.55', '−4d'], ['Streptococcal pharyngitis (J02)', '0.62', '0.76', '0.58', '−7d'] ], highlightCol: 2 }, style: {} },
        { id: 'fingerprint-chart', type: 'chart', content: { chartType: 'bar', chartTitle: 'PROTOTYPE FINGERPRINT · ILI (J11)', labels: ['ANTIB','ANTIV','COUGH','DCG','NSAID','ANTIH'], datasets: [ { label: 'Drug contribution weight', data: [45,68,85,75,52,28], color: 'rgba(0,194,203,0.65)' } ], trendLine: true, showLegend: false, showGrid: true, axisLabels: { x: '', y: '' } }, style: {} },
      ],
      validationNote: 'Validated against Ministry of Health weekly bulletins, 2024 retrospective. n = 14,238 pharmacies · 18 months',
    },
  },
  {
    slideIndex: 12,
    configJson: {
      slideIndex: 12, title: 'A three-tier data backbone.',
      subtitle: 'From raw indexing to premium analytics to a third-party data marketplace — three monetizable layers, one substrate.',
      label: '12 Data Infrastructure', layout: 'stack', eyebrow: '07 · Data infrastructure',
      theme: { background: '#0D1B2A', textColor: '#FFFFFF', accentColor: '#00C2CB' },
      blocks: [
        { id: 'stack-1', type: 'stack-block', content: { num: '01', tier: 'tier-1', tag: 'FOUNDATION · OPEN', name: 'MedIndex', desc: 'The canonical pharmaceutical index — drugs, ATC, ICD-10, substitutions. Free, public, the literacy layer of the platform.', meta1: '8.4k drugs', meta2: 'FREE TIER' }, style: {} },
        { id: 'stack-2', type: 'stack-block', content: { num: '02', tier: 'tier-2', tag: 'PREMIUM · SAAS', name: 'Blink Premium', desc: 'Real-time epidemiological dashboards, predictive alerts, and territory-level intelligence sold to ministries, payers, and large pharma.', meta1: '$1.4M ARR', meta2: 'CORE PRODUCT' }, style: {} },
        { id: 'stack-3', type: 'stack-block', content: { num: '03', tier: 'tier-3', tag: 'MARKETPLACE · API', name: 'Marketplace', desc: 'Programmatic access to anonymized signal feeds for third parties — hedge funds, CRO partners, academic research, ad-tech in regulated frames.', meta1: '12 partners', meta2: 'EARLY STAGE' }, style: {} },
      ],
    },
  },
  {
    slideIndex: 13,
    configJson: {
      slideIndex: 13, title: 'Already live, already measured.',
      subtitle: 'Eighteen months of operation. Real pharmacies. Real signal. Real customers.',
      label: '13 Traction', layout: 'kpi', eyebrow: '08 · Traction',
      theme: { background: '#0D1B2A', textColor: '#FFFFFF', accentColor: '#00C2CB' },
      blocks: [
        { id: 'kpi-pharmacies', type: 'kpi', content: { value: '300', label: 'Pharmacies live on Beacon', prefix: '+', suffix: '' }, style: { color: '#FFFFFF', accentColor: '#00C2CB' } },
        { id: 'kpi-transactions', type: 'kpi', content: { value: '3M', label: 'Transactions captured / month', prefix: '', suffix: '+' }, style: { color: '#FFFFFF', accentColor: '#00C2CB' } },
        { id: 'kpi-doctors', type: 'kpi', content: { value: '400', label: 'Physicians using dashboards', prefix: '', suffix: '' }, style: { color: '#FFFFFF', accentColor: '#00C2CB' } },
        { id: 'kpi-hospitals', type: 'kpi', content: { value: 'Multi', label: 'Hospital systems piloting', prefix: '', suffix: '', tags: ['CHU CASA', 'CHU RABAT', 'CHU FÈS'] }, style: { color: '#FFFFFF', accentColor: '#00C2CB' } },
      ],
    },
  },
  {
    slideIndex: 14,
    configJson: {
      slideIndex: 14, title: 'A self-reinforcing\ndata flywheel.',
      subtitle: 'Each new pharmacy enriches the model; each model improvement attracts the next pharmacy. The loop compounds — and is structurally hard to replicate.',
      label: '14 Strategic Advantage', layout: 'flywheel', eyebrow: '09 · Strategic moat',
      theme: { background: '#0D1B2A', textColor: '#FFFFFF', accentColor: '#00C2CB' },
      blocks: [
        { id: 'flywheel-nodes', type: 'flywheel', content: { nodes: [ { num: '01', label: 'PHARMACIES', pos: 'top' }, { num: '02', label: 'DATA', pos: 'right' }, { num: '03', label: 'INTELLIGENCE', pos: 'bottom' }, { num: '04', label: 'VALUE', pos: 'left' } ], edges: ['→ richer', '→ smarter', '→ higher', '→ more'], center: { title: 'PANOPTES', subtitle: 'FLYWHEEL' } }, style: {} },
        { id: 'pillar-1', type: 'pillar', content: { num: 'PILLAR 01', name: 'Network density', desc: 'More pharmacies → finer geographic resolution → defensible coverage moat.' }, style: {} },
        { id: 'pillar-2', type: 'pillar', content: { num: 'PILLAR 02', name: 'Data depth', desc: 'More transactions → richer prototypes → higher-confidence inference.' }, style: {} },
        { id: 'pillar-3', type: 'pillar', content: { num: 'PILLAR 03', name: 'Model accuracy', desc: 'Smarter intelligence → tighter alerts → trust from health authorities.' }, style: {} },
        { id: 'pillar-4', type: 'pillar', content: { num: 'PILLAR 04', name: 'Customer lock-in', desc: 'Higher value → routine workflow integration → high renewal & expansion.' }, style: {} },
      ],
    },
  },
  {
    slideIndex: 15,
    configJson: {
      slideIndex: 15, title: '14× revenue in 3 years.',
      subtitle: 'Driven by Beacon network expansion across MENA, Premium upsell into ministries, and the Marketplace coming online in year 3.',
      label: '15 Revenue Growth', layout: 'chart-full', eyebrow: '10 · Financials · revenue',
      theme: { background: '#0D1B2A', textColor: '#FFFFFF', accentColor: '#00C2CB' },
      blocks: [
        { id: 'chart-revenue', type: 'chart', content: { chartType: 'bar', stacked: true, chartTitle: 'NET REVENUE · USD · BY PRODUCT LINE', chartSubtitle: 'FY 2026 → FY 2028', labels: ['Q1·26','Q2·26','Q3·26','Q4·26','Q1·27','Q2·27','Q3·27','Q4·27','Q1·28','Q2·28','Q3·28','Q4·28'], datasets: [ { label: 'Beacon (network)', data: [375,525,750,1000,1250,1625,2000,2375,2750,3063,3313,3500], color: 'rgba(0,194,203,0.85)' }, { label: 'Premium (SaaS)', data: [125,225,300,375,500,625,750,875,1000,1000,1000,1000], color: 'rgba(0,194,203,0.55)' }, { label: 'Marketplace', data: [62,100,150,200,250,325,400,450,500,500,313,312], color: 'rgba(0,194,203,0.3)' } ], showLegend: true, showGrid: true, yearSeparators: ['FY 2026', 'FY 2027', 'FY 2028'], annotations: [ { label: 'FY28 RUN-RATE', value: '$7.8M' }, { label: '3-YEAR CAGR', value: '~140%' }, { label: 'REVENUE MULTIPLE', value: '14×' } ], axisLabels: { x: '', y: 'USD (thousands)' } }, style: {} },
      ],
    },
  },
  {
    slideIndex: 16,
    configJson: {
      slideIndex: 16, title: 'High-margin, leverage-rich.',
      subtitle: 'Software economics with a regulated-data moat. Gross margin expands from 70% to 76% as the network amortizes infrastructure cost.',
      label: '16 Margin Model', layout: 'two-charts', eyebrow: '11 · Financials · economics',
      theme: { background: '#0D1B2A', textColor: '#FFFFFF', accentColor: '#00C2CB' },
      blocks: [
        { id: 'chart-gm', type: 'chart', content: { chartType: 'line', chartTitle: 'GROSS MARGIN · % OF REVENUE', labels: ['Q1·26','Q3·26','Q1·27','Q3·27','Q1·28','Q4·28'], datasets: [ { label: 'Gross Margin %', data: [70,71.5,72.5,73.8,75.2,76], color: '#00C2CB', fill: true } ], yMin: 65, yMax: 80, showLegend: false, showGrid: true, annotations: [{ label: '70%', pos: 'start' }, { label: '76%', pos: 'end' }], axisLabels: { x: '', y: '%' } }, style: {} },
        { id: 'chart-opex', type: 'chart', content: { chartType: 'bar', chartTitle: 'OPEX vs REVENUE — OPERATING LEVERAGE', labels: ['FY25','FY26','FY27','FY28'], datasets: [ { label: 'Revenue', data: [562,2213,5625,7875], color: '#00C2CB' }, { label: 'OPEX', data: [786,2756,4500,6000], color: 'rgba(232,237,242,0.18)' } ], showLegend: true, showGrid: true, annotation: { label: '↑ REVENUE OUTPACES OPEX', atIndex: 2 }, axisLabels: { x: '', y: 'USD (thousands)' } }, style: {} },
      ],
      metrics: [
        { label: 'GROSS MARGIN', value: '70% → 76%' },
        { label: 'PAYBACK', value: '11 months' },
        { label: 'NET RETENTION', value: '128%' },
      ],
    },
  },
  {
    slideIndex: 17,
    configJson: {
      slideIndex: 17, title: '$0.5M SAFE — to scale\nthe nervous system.',
      subtitle: 'A first-money round to fund Beacon network expansion across MENA, deepen the Therapeutic KB, and ship the Marketplace MVP.',
      label: '17 Investment', layout: 'investment', eyebrow: '12 · The ask',
      theme: { background: '#0D1B2A', textColor: '#FFFFFF', accentColor: '#00C2CB' },
      blocks: [
        { id: 'deal-terms', type: 'deal-terms', content: { terms: [ { term: 'Round size', value: '$0.5', unit: 'M' }, { term: 'Instrument', value: 'SAFE · post-money' }, { term: 'Discount', value: '20', unit: '%' }, { term: 'Valuation cap', value: '$8', unit: 'M' }, { term: 'Valuation floor', value: '$5', unit: 'M' }, { term: 'Use of proceeds', value: '18 months runway' } ] }, style: {} },
        { id: 'donut-allocation', type: 'chart', content: { chartType: 'doughnut', chartTitle: 'ALLOCATION', centerLabel: '$500K', labels: ['R&D · Engineering', 'GTM · Network', 'Ops · Legal'], datasets: [ { label: 'Allocation', data: [60,25,15], colors: ['#00C2CB','rgba(0,194,203,0.55)','rgba(232,237,242,0.35)'] } ], showLegend: true, showGrid: false, axisLabels: { x: '', y: '' } }, style: {} },
      ],
    },
  },
  {
    slideIndex: 18,
    configJson: {
      slideIndex: 18, title: 'A clinician and an engineer.',
      subtitle: 'Twenty years of combined experience in pharmaceutical operations, public health, and large-scale data engineering — purpose-built for this problem.',
      label: '18 Team', layout: 'team', eyebrow: '13 · Team',
      theme: { background: '#0D1B2A', textColor: '#FFFFFF', accentColor: '#00C2CB' },
      blocks: [
        { id: 'team-ali', type: 'image-placeholder', content: { initials: 'AS', name: 'Dr. Ali Sami', role: 'Co-founder · CEO', bio: 'Pharmacist by training, public-health by obsession. Ten years operating pharmacies in Casablanca and advising the Ministry of Health on epidemiological reporting.', badges: ['PHARM.D', 'PUBLIC HEALTH', 'REGULATORY', 'GTM'], shape: 'rect' }, style: {} },
        { id: 'team-mo', type: 'image-placeholder', content: { initials: 'MA', name: 'Mohamed Aalabou', role: 'Co-founder · CTO', bio: 'ML engineer and data architect. Previously built real-time pipelines at scale; specialized in privacy-preserving aggregation and time-series anomaly detection.', badges: ['ML / NLP', 'DATA INFRA', 'PRIVACY', 'AWS'], shape: 'rect' }, style: {} },
      ],
    },
  },
  {
    slideIndex: 19,
    configJson: {
      slideIndex: 19, title: 'Always Watching. Always Learning. Always Protecting health.',
      subtitle: '', label: '19 Closing', layout: 'closing',
      theme: { background: '#0D1B2A', textColor: '#FFFFFF', accentColor: '#00C2CB' },
      blocks: [
        { id: 'closing-words', type: 'text', content: { lines: [ { text: 'Always ', accent: 'Watching', punctuation: '.' }, { text: 'Always ', accent: 'Learning', punctuation: '.' }, { text: 'Always ', accent: 'Protecting', suffix: ' health.' } ] }, style: { fontSize: '8xl', fontWeight: 'semibold', fontFamily: 'grotesk' } },
        { id: 'closing-tag', type: 'text', content: { value: 'PANOPTES · REAL-TIME HEALTH INTELLIGENCE · 2026' }, style: { fontSize: 'sm', fontWeight: 'normal', color: 'rgba(232,237,242,0.55)', fontFamily: 'mono', letterSpacing: '0.4em' } },
      ],
    },
  },
]

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Delete all deck slides (keep consent slides at index 9999+)
    await prisma.slideConfig.deleteMany({
      where: { slideIndex: { lt: CONSENT_STORAGE_SLIDE_INDEX } },
    })

    // Recreate all 18 slides cleanly
    for (const slide of SLIDES) {
      await prisma.slideConfig.create({
        data: { slideIndex: slide.slideIndex, configJson: slide.configJson as object },
      })
    }

    return NextResponse.json({ ok: true, message: `Reset complete — ${SLIDES.length} slides recreated. (19 total)` })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

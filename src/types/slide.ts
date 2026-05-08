export interface SlideTheme {
  background: string
  textColor: string
  accentColor: string
}

export interface BlockStyle {
  fontSize?: string
  fontWeight?: string
  color?: string
  fontFamily?: string
  letterSpacing?: string
  accentColor?: string
  highlight?: boolean
}

export type BlockType =
  | 'text'
  | 'kpi'
  | 'chart'
  | 'list'
  | 'card'
  | 'image-placeholder'
  | 'solution-col'
  | 'flow-stage'
  | 'pipeline-step'
  | 'stack-block'
  | 'stats-table'
  | 'deal-terms'
  | 'flywheel'
  | 'pillar'

export interface ChartDataset {
  label: string
  data: number[]
  color?: string
  colors?: string[]
  fill?: boolean
  dashed?: boolean
}

export interface Block {
  id: string
  type: BlockType
  content: Record<string, unknown>
  style: BlockStyle
}

export type SlideLayout =
  | 'cover'
  | 'problem'
  | 'visual-fragmented'
  | 'solution'
  | 'flow'
  | 'visual-sensor'
  | 'chart-full'
  | 'pipeline'
  | 'stats-chart'
  | 'stack'
  | 'kpi'
  | 'flywheel'
  | 'two-charts'
  | 'investment'
  | 'team'
  | 'closing'
  | 'visual-argus'
  | 'achievements'

export interface SlideConfig {
  slideIndex: number
  title: string
  subtitle?: string
  label: string
  layout: SlideLayout
  eyebrow?: string
  theme: SlideTheme
  blocks: Block[]
  footer?: { left: string; right: string }
  metrics?: Array<{ label: string; value: string; unit?: string }>
  validationNote?: string
  hidden?: boolean
}

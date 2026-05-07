export type Level = 1 | 2 | 3 | 4 | 5

export const LEVEL_LABELS: Record<Level, string> = {
  1: 'Faible',
  2: 'Stable',
  3: 'En hausse',
  4: 'Incidence élevée',
  5: 'Alerte épidémique',
}

export const LEVEL_COLORS: Record<Level, string> = {
  1: '#3B6D11',
  2: '#639922',
  3: '#BA7517',
  4: '#EF9F27',
  5: '#E24B4A',
}

export const LEVEL_HOVER_COLORS: Record<Level, string> = {
  1: '#4a8a16',
  2: '#7ab82a',
  3: '#d4891c',
  4: '#f5b030',
  5: '#e96260',
}

export type RegionData = {
  regionId: string
  regionName: string
  level: Level
  cases: number
  evolutionPct: number
  forecast: string
  action: string
  historique: number[]
}

export type AlertConfig = {
  type: string
  color: string
  regions: string
  action: string
}

export type DiseaseConfig = {
  id: string
  name: string
  regions: RegionData[]
  alerts: AlertConfig[]
  stats: { alert: number; up: number; stable: number }
}

export type Period = 'today' | 'j-1' | 's-1' | 's-2' | 'm-1' | 'a-1'

export const PERIODS: { id: Period; label: string }[] = [
  { id: 'today', label: "Aujourd'hui" },
  { id: 'j-1', label: 'J-1' },
  { id: 's-1', label: 'S-1' },
  { id: 's-2', label: 'S-2' },
  { id: 'm-1', label: 'M-1' },
  { id: 'a-1', label: 'A-1' },
]

export const REGIONS = [
  { id: 'tanger-tetouan', name: 'Tanger-Tétouan-Al Hoceïma' },
  { id: 'oriental', name: 'Oriental' },
  { id: 'fes-meknes', name: 'Fès-Meknès' },
  { id: 'rabat-sale', name: 'Rabat-Salé-Kénitra' },
  { id: 'beni-mellal', name: 'Béni Mellal-Khénifra' },
  { id: 'casablanca-settat', name: 'Casablanca-Settat' },
  { id: 'marrakech-safi', name: 'Marrakech-Safi' },
  { id: 'draa-tafilalet', name: 'Drâa-Tafilalet' },
  { id: 'souss-massa', name: 'Souss-Massa' },
  { id: 'guelmim', name: 'Guelmim-Oued Noun' },
  { id: 'laayoune', name: 'Laâyoune-Sakia El Hamra' },
  { id: 'dakhla', name: 'Dakhla-Oued Ed Dahab' },
]

export const DEFAULT_DISEASES: DiseaseConfig[] = [
  {
    id: 'grippe',
    name: 'Grippe',
    stats: { alert: 0, up: 1, stable: 6 },
    alerts: [],
    regions: [
      { regionId: 'tanger-tetouan', regionName: 'Tanger-Tétouan-Al Hoceïma', level: 4, cases: 2847, evolutionPct: 12.3, forecast: 'Hausse probable S+1', action: 'Renforcer la vaccination', historique: [1800,2100,2300,2500,2650,2750,2847] },
      { regionId: 'oriental', regionName: 'Oriental', level: 3, cases: 1923, evolutionPct: 8.1, forecast: 'Stabilisation attendue', action: 'Surveillance renforcée', historique: [1200,1400,1600,1750,1850,1890,1923] },
      { regionId: 'fes-meknes', regionName: 'Fès-Meknès', level: 3, cases: 2156, evolutionPct: 5.4, forecast: 'Plateau probable', action: 'Campagne de sensibilisation', historique: [1600,1750,1900,2000,2080,2130,2156] },
      { regionId: 'rabat-sale', regionName: 'Rabat-Salé-Kénitra', level: 4, cases: 3102, evolutionPct: 15.2, forecast: 'Hausse probable S+1', action: 'Alerte préventive', historique: [1900,2100,2400,2600,2800,2950,3102] },
      { regionId: 'beni-mellal', regionName: 'Béni Mellal-Khénifra', level: 2, cases: 845, evolutionPct: -2.1, forecast: 'Stabilité', action: 'Aucune action requise', historique: [920,900,880,870,860,852,845] },
      { regionId: 'casablanca-settat', regionName: 'Casablanca-Settat', level: 4, cases: 5234, evolutionPct: 18.7, forecast: 'Forte hausse', action: 'Plan de réponse activé', historique: [3200,3600,4000,4400,4700,4980,5234] },
      { regionId: 'marrakech-safi', regionName: 'Marrakech-Safi', level: 3, cases: 1678, evolutionPct: 6.2, forecast: 'Hausse modérée', action: 'Renforcer la surveillance', historique: [1200,1300,1420,1520,1600,1645,1678] },
      { regionId: 'draa-tafilalet', regionName: 'Drâa-Tafilalet', level: 2, cases: 432, evolutionPct: 1.5, forecast: 'Stable', action: 'Aucune action requise', historique: [400,410,420,425,428,430,432] },
      { regionId: 'souss-massa', regionName: 'Souss-Massa', level: 1, cases: 287, evolutionPct: -5.3, forecast: 'Baisse continue', action: 'Aucune action requise', historique: [380,360,340,325,310,295,287] },
      { regionId: 'guelmim', regionName: 'Guelmim-Oued Noun', level: 2, cases: 156, evolutionPct: 0.8, forecast: 'Stable', action: 'Aucune action requise', historique: [148,150,152,154,155,155,156] },
      { regionId: 'laayoune', regionName: 'Laâyoune-Sakia El Hamra', level: 1, cases: 98, evolutionPct: -1.2, forecast: 'Stable', action: 'Aucune action requise', historique: [105,103,102,100,99,98,98] },
      { regionId: 'dakhla', regionName: 'Dakhla-Oued Ed Dahab', level: 1, cases: 42, evolutionPct: 0.0, forecast: 'Stable', action: 'Aucune action requise', historique: [42,42,42,42,42,42,42] },
    ],
  },
  {
    id: 'asthme',
    name: 'Asthme / Respiratoire',
    stats: { alert: 1, up: 3, stable: 8 },
    alerts: [{ type: 'Alerte pollution', color: '#E24B4A', regions: 'Casablanca-Settat', action: 'Activer le plan pollution' }],
    regions: [
      { regionId: 'tanger-tetouan', regionName: 'Tanger-Tétouan-Al Hoceïma', level: 3, cases: 1245, evolutionPct: 7.2, forecast: 'Hausse liée au froid', action: 'Renforts urgences', historique: [900,950,1020,1100,1170,1210,1245] },
      { regionId: 'oriental', regionName: 'Oriental', level: 2, cases: 678, evolutionPct: 2.1, forecast: 'Stable', action: 'Surveillance standard', historique: [640,650,658,665,670,675,678] },
      { regionId: 'fes-meknes', regionName: 'Fès-Meknès', level: 3, cases: 1102, evolutionPct: 9.8, forecast: 'Hausse hivernale', action: 'Renforcement équipes', historique: [780,850,920,980,1040,1075,1102] },
      { regionId: 'rabat-sale', regionName: 'Rabat-Salé-Kénitra', level: 4, cases: 2156, evolutionPct: 14.5, forecast: 'Forte hausse', action: 'Alerte pollution activée', historique: [1400,1600,1750,1900,2000,2090,2156] },
      { regionId: 'beni-mellal', regionName: 'Béni Mellal-Khénifra', level: 1, cases: 320, evolutionPct: -3.2, forecast: 'Baisse', action: 'RAS', historique: [380,365,352,340,332,325,320] },
      { regionId: 'casablanca-settat', regionName: 'Casablanca-Settat', level: 5, cases: 4521, evolutionPct: 22.1, forecast: 'Alerte pollution', action: 'Plan pollution activé', historique: [2800,3100,3500,3800,4100,4350,4521] },
      { regionId: 'marrakech-safi', regionName: 'Marrakech-Safi', level: 2, cases: 892, evolutionPct: 1.8, forecast: 'Stable', action: 'Surveillance standard', historique: [860,865,872,878,884,888,892] },
      { regionId: 'draa-tafilalet', regionName: 'Drâa-Tafilalet', level: 1, cases: 210, evolutionPct: 0.5, forecast: 'Stable', action: 'RAS', historique: [205,206,207,208,209,210,210] },
      { regionId: 'souss-massa', regionName: 'Souss-Massa', level: 2, cases: 456, evolutionPct: 3.2, forecast: 'Légère hausse', action: 'Surveillance renforcée', historique: [420,430,438,445,450,453,456] },
      { regionId: 'guelmim', regionName: 'Guelmim-Oued Noun', level: 1, cases: 98, evolutionPct: -1.0, forecast: 'Stable', action: 'RAS', historique: [102,101,100,100,99,98,98] },
      { regionId: 'laayoune', regionName: 'Laâyoune-Sakia El Hamra', level: 1, cases: 65, evolutionPct: 0.0, forecast: 'Stable', action: 'RAS', historique: [65,65,65,65,65,65,65] },
      { regionId: 'dakhla', regionName: 'Dakhla-Oued Ed Dahab', level: 1, cases: 28, evolutionPct: 0.0, forecast: 'Stable', action: 'RAS', historique: [28,28,28,28,28,28,28] },
    ],
  },
  {
    id: 'gastro',
    name: 'Gastro-entérite',
    stats: { alert: 0, up: 2, stable: 10 },
    alerts: [],
    regions: [
      { regionId: 'tanger-tetouan', regionName: 'Tanger-Tétouan-Al Hoceïma', level: 2, cases: 456, evolutionPct: 3.1, forecast: 'Stable', action: 'Sensibilisation hygiène', historique: [420,428,435,442,448,452,456] },
      { regionId: 'oriental', regionName: 'Oriental', level: 2, cases: 312, evolutionPct: 1.5, forecast: 'Stable', action: 'RAS', historique: [300,303,306,308,310,311,312] },
      { regionId: 'fes-meknes', regionName: 'Fès-Meknès', level: 3, cases: 789, evolutionPct: 11.2, forecast: 'Hausse saisonnière', action: 'Contrôles alimentaires', historique: [580,620,670,710,745,770,789] },
      { regionId: 'rabat-sale', regionName: 'Rabat-Salé-Kénitra', level: 2, cases: 634, evolutionPct: 2.8, forecast: 'Stable', action: 'Surveillance standard', historique: [600,608,615,622,628,631,634] },
      { regionId: 'beni-mellal', regionName: 'Béni Mellal-Khénifra', level: 1, cases: 198, evolutionPct: -4.1, forecast: 'Baisse', action: 'RAS', historique: [240,228,220,212,205,200,198] },
      { regionId: 'casablanca-settat', regionName: 'Casablanca-Settat', level: 3, cases: 1234, evolutionPct: 8.5, forecast: 'Hausse urbaine', action: 'Renforcement inspection', historique: [950,1000,1060,1110,1160,1200,1234] },
      { regionId: 'marrakech-safi', regionName: 'Marrakech-Safi', level: 2, cases: 521, evolutionPct: 2.0, forecast: 'Stable', action: 'RAS', historique: [500,504,508,512,516,519,521] },
      { regionId: 'draa-tafilalet', regionName: 'Drâa-Tafilalet', level: 1, cases: 145, evolutionPct: -2.0, forecast: 'Stable', action: 'RAS', historique: [155,152,150,148,147,146,145] },
      { regionId: 'souss-massa', regionName: 'Souss-Massa', level: 2, cases: 289, evolutionPct: 4.0, forecast: 'Légère hausse', action: 'Contrôle plages', historique: [265,270,276,281,284,287,289] },
      { regionId: 'guelmim', regionName: 'Guelmim-Oued Noun', level: 1, cases: 78, evolutionPct: 0.0, forecast: 'Stable', action: 'RAS', historique: [78,78,78,78,78,78,78] },
      { regionId: 'laayoune', regionName: 'Laâyoune-Sakia El Hamra', level: 1, cases: 45, evolutionPct: 0.0, forecast: 'Stable', action: 'RAS', historique: [45,45,45,45,45,45,45] },
      { regionId: 'dakhla', regionName: 'Dakhla-Oued Ed Dahab', level: 1, cases: 18, evolutionPct: 0.0, forecast: 'Stable', action: 'RAS', historique: [18,18,18,18,18,18,18] },
    ],
  },
  {
    id: 'sante-mentale',
    name: 'Santé mentale',
    stats: { alert: 0, up: 0, stable: 12 },
    alerts: [],
    regions: [
      { regionId: 'tanger-tetouan', regionName: 'Tanger-Tétouan-Al Hoceïma', level: 2, cases: 890, evolutionPct: 0.5, forecast: 'Stable', action: 'Soutien psychosocial', historique: [870,875,878,882,885,888,890] },
      { regionId: 'oriental', regionName: 'Oriental', level: 1, cases: 445, evolutionPct: -1.2, forecast: 'Stable', action: 'RAS', historique: [455,452,450,448,447,446,445] },
      { regionId: 'fes-meknes', regionName: 'Fès-Meknès', level: 2, cases: 1102, evolutionPct: 1.8, forecast: 'Stable', action: 'Programme de soutien', historique: [1065,1070,1078,1085,1092,1098,1102] },
      { regionId: 'rabat-sale', regionName: 'Rabat-Salé-Kénitra', level: 2, cases: 1456, evolutionPct: 2.1, forecast: 'Stable', action: 'Programme actif', historique: [1400,1410,1422,1433,1443,1450,1456] },
      { regionId: 'beni-mellal', regionName: 'Béni Mellal-Khénifra', level: 1, cases: 320, evolutionPct: -0.5, forecast: 'Stable', action: 'RAS', historique: [324,323,322,321,321,320,320] },
      { regionId: 'casablanca-settat', regionName: 'Casablanca-Settat', level: 2, cases: 2890, evolutionPct: 2.8, forecast: 'Légère hausse', action: 'Renforcement centres', historique: [2760,2780,2810,2834,2855,2874,2890] },
      { regionId: 'marrakech-safi', regionName: 'Marrakech-Safi', level: 2, cases: 987, evolutionPct: 1.0, forecast: 'Stable', action: 'Surveillance standard', historique: [970,974,978,981,984,986,987] },
      { regionId: 'draa-tafilalet', regionName: 'Drâa-Tafilalet', level: 1, cases: 289, evolutionPct: 0.0, forecast: 'Stable', action: 'RAS', historique: [289,289,289,289,289,289,289] },
      { regionId: 'souss-massa', regionName: 'Souss-Massa', level: 1, cases: 456, evolutionPct: 0.2, forecast: 'Stable', action: 'RAS', historique: [455,455,455,455,456,456,456] },
      { regionId: 'guelmim', regionName: 'Guelmim-Oued Noun', level: 1, cases: 120, evolutionPct: 0.0, forecast: 'Stable', action: 'RAS', historique: [120,120,120,120,120,120,120] },
      { regionId: 'laayoune', regionName: 'Laâyoune-Sakia El Hamra', level: 1, cases: 89, evolutionPct: 0.0, forecast: 'Stable', action: 'RAS', historique: [89,89,89,89,89,89,89] },
      { regionId: 'dakhla', regionName: 'Dakhla-Oued Ed Dahab', level: 1, cases: 34, evolutionPct: 0.0, forecast: 'Stable', action: 'RAS', historique: [34,34,34,34,34,34,34] },
    ],
  },
  {
    id: 'diabete',
    name: 'Diabète',
    stats: { alert: 0, up: 1, stable: 11 },
    alerts: [],
    regions: [
      { regionId: 'tanger-tetouan', regionName: 'Tanger-Tétouan-Al Hoceïma', level: 2, cases: 3245, evolutionPct: 2.1, forecast: 'Stable', action: 'Dépistage actif', historique: [3145,3165,3185,3205,3220,3234,3245] },
      { regionId: 'oriental', regionName: 'Oriental', level: 2, cases: 2102, evolutionPct: 1.8, forecast: 'Stable', action: 'Surveillance standard', historique: [2040,2054,2066,2077,2087,2095,2102] },
      { regionId: 'fes-meknes', regionName: 'Fès-Meknès', level: 2, cases: 4512, evolutionPct: 3.2, forecast: 'Légère hausse', action: 'Programme dépistage', historique: [4340,4365,4393,4420,4455,4485,4512] },
      { regionId: 'rabat-sale', regionName: 'Rabat-Salé-Kénitra', level: 3, cases: 5890, evolutionPct: 7.5, forecast: 'Hausse chronique', action: 'Campagne nutrition', historique: [5350,5450,5555,5640,5720,5810,5890] },
      { regionId: 'beni-mellal', regionName: 'Béni Mellal-Khénifra', level: 2, cases: 1890, evolutionPct: 1.2, forecast: 'Stable', action: 'RAS', historique: [1845,1855,1864,1872,1879,1885,1890] },
      { regionId: 'casablanca-settat', regionName: 'Casablanca-Settat', level: 2, cases: 9876, evolutionPct: 2.8, forecast: 'Hausse chronique', action: 'Centre référence actif', historique: [9520,9590,9670,9730,9790,9840,9876] },
      { regionId: 'marrakech-safi', regionName: 'Marrakech-Safi', level: 2, cases: 4102, evolutionPct: 2.0, forecast: 'Stable', action: 'Surveillance standard', historique: [3980,4010,4038,4062,4080,4092,4102] },
      { regionId: 'draa-tafilalet', regionName: 'Drâa-Tafilalet', level: 1, cases: 1245, evolutionPct: 0.8, forecast: 'Stable', action: 'RAS', historique: [1225,1230,1234,1238,1241,1243,1245] },
      { regionId: 'souss-massa', regionName: 'Souss-Massa', level: 2, cases: 2456, evolutionPct: 2.4, forecast: 'Stable', action: 'Dépistage en cours', historique: [2390,2406,2420,2434,2444,2451,2456] },
      { regionId: 'guelmim', regionName: 'Guelmim-Oued Noun', level: 1, cases: 456, evolutionPct: 0.4, forecast: 'Stable', action: 'RAS', historique: [450,451,452,453,454,455,456] },
      { regionId: 'laayoune', regionName: 'Laâyoune-Sakia El Hamra', level: 1, cases: 312, evolutionPct: 0.3, forecast: 'Stable', action: 'RAS', historique: [309,310,310,311,311,312,312] },
      { regionId: 'dakhla', regionName: 'Dakhla-Oued Ed Dahab', level: 1, cases: 145, evolutionPct: 0.0, forecast: 'Stable', action: 'RAS', historique: [145,145,145,145,145,145,145] },
    ],
  },
  {
    id: 'cvd',
    name: 'CVD',
    stats: { alert: 1, up: 2, stable: 9 },
    alerts: [{ type: 'Surmortalité cardiaque', color: '#E24B4A', regions: 'Grand Casablanca', action: 'Activation plan urgence' }],
    regions: [
      { regionId: 'tanger-tetouan', regionName: 'Tanger-Tétouan-Al Hoceïma', level: 3, cases: 892, evolutionPct: 8.2, forecast: 'Hausse hivernale', action: 'Renforcement cardiologie', historique: [720,750,790,820,852,874,892] },
      { regionId: 'oriental', regionName: 'Oriental', level: 2, cases: 512, evolutionPct: 2.0, forecast: 'Stable', action: 'Surveillance standard', historique: [490,496,502,506,509,511,512] },
      { regionId: 'fes-meknes', regionName: 'Fès-Meknès', level: 2, cases: 1102, evolutionPct: 3.5, forecast: 'Légère hausse', action: 'Vigilance renforcée', historique: [1030,1045,1058,1073,1085,1095,1102] },
      { regionId: 'rabat-sale', regionName: 'Rabat-Salé-Kénitra', level: 4, cases: 1890, evolutionPct: 13.8, forecast: 'Forte hausse', action: 'Plan urgence activé', historique: [1400,1510,1620,1710,1790,1850,1890] },
      { regionId: 'beni-mellal', regionName: 'Béni Mellal-Khénifra', level: 1, cases: 289, evolutionPct: -1.5, forecast: 'Stable', action: 'RAS', historique: [302,299,296,294,291,290,289] },
      { regionId: 'casablanca-settat', regionName: 'Casablanca-Settat', level: 5, cases: 3456, evolutionPct: 19.2, forecast: 'Alerte surmortalité', action: 'Activation protocole urgence', historique: [2400,2600,2800,3000,3150,3310,3456] },
      { regionId: 'marrakech-safi', regionName: 'Marrakech-Safi', level: 2, cases: 780, evolutionPct: 2.5, forecast: 'Stable', action: 'Surveillance standard', historique: [748,756,763,769,774,778,780] },
      { regionId: 'draa-tafilalet', regionName: 'Drâa-Tafilalet', level: 1, cases: 210, evolutionPct: 0.5, forecast: 'Stable', action: 'RAS', historique: [206,207,208,208,209,210,210] },
      { regionId: 'souss-massa', regionName: 'Souss-Massa', level: 2, cases: 445, evolutionPct: 4.0, forecast: 'Légère hausse', action: 'Surveillance renforcée', historique: [415,422,430,436,440,443,445] },
      { regionId: 'guelmim', regionName: 'Guelmim-Oued Noun', level: 1, cases: 98, evolutionPct: 0.0, forecast: 'Stable', action: 'RAS', historique: [98,98,98,98,98,98,98] },
      { regionId: 'laayoune', regionName: 'Laâyoune-Sakia El Hamra', level: 1, cases: 67, evolutionPct: 0.0, forecast: 'Stable', action: 'RAS', historique: [67,67,67,67,67,67,67] },
      { regionId: 'dakhla', regionName: 'Dakhla-Oued Ed Dahab', level: 1, cases: 28, evolutionPct: 0.0, forecast: 'Stable', action: 'RAS', historique: [28,28,28,28,28,28,28] },
    ],
  },
]

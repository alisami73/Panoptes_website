# CHAT ALI — PANOPTES

## [2026-05-07] — Implémentation complète du projet PANOPTES

### Résumé
Session de construction complète du projet PANOPTES (pitch deck interactif Blink Pharma).
L'application a été créée de zéro à partir des fichiers de design fournis dans `Visuals Panoptes.zip`.

Les fichiers de design ont été analysés (`design/Panoptes Pitch Deck.html`, `design/deck-styles.css`) pour extraire :
- Les 17 slides exactes (contenu, layout, couleurs)
- La palette : fond `#0D1B2A`, accent `#00C2CB`, texte `#FFFFFF`, secondaire `#E8EDF2`
- Les typographies : Space Grotesk, Inter, JetBrains Mono
- Tous les SVG custom (œil PANOPTES, flywheel, icônes)

### Décisions / Priorités

**Architecture créée :**
- **Next.js 14** App Router (standalone output pour Docker)
- **Prisma + PostgreSQL** — 5 modèles : SlideConfig, GlobalTheme, AccessToken, AccessRequest, ContactMessage
- **17 slides** seedées avec contenu fidèle au design HTML original
- **SlideRenderer** — composant central avec 16 layouts distincts
- **Viewer `/deck`** — snap scroll, navigation clavier/souris, miniatures, export PDF Puppeteer
- **Admin `/admin`** — éditeur de slides live, gestion accès/tokens, demandes, messages
- **Page d'accueil `/`** — hero, formulaire d'accès, formulaire contact
- **Docker multi-stage** + Nginx + Certbot ready

**Slides implémentées :**
1. Cover — layout `cover` (œil SVG, taglines)
2. The Problem — layout `problem` (4 cartes 4-colonnes)
3. Visual Fragmented — layout `visual-fragmented` (SVG réseau fragmenté)
4. The Solution — layout `solution` (3 colonnes Beacon/Drug KB/Therapeutic KB)
5. Transforming Sales — layout `flow` (3 étapes avec flèches animées)
6. Visual Sensor — layout `visual-sensor` (SVG réseau de capteurs)
7. Surrogate Endpoint — layout `chart-full` (line chart éphedrine vs grippe)
8. Filtering Single — layout `pipeline` (5 étapes pipeline)
9. Filtering Multiple — layout `stats-chart` (table stats + bar chart fingerprint)
10. Data Infrastructure — layout `stack` (3 tiers MedIndex/Premium/Marketplace)
11. Traction — layout `kpi` (4 KPIs avec count-up animation)
12. Strategic Advantage — layout `flywheel` (SVG flywheel + 4 piliers)
13. Revenue Growth — layout `chart-full` (bar chart stacked 12 trimestres)
14. Margin Model — layout `two-charts` (GM line + OPEX bar + 3 métriques)
15. Investment — layout `investment` (deal terms + donut chart 60/25/15)
16. Team — layout `team` (2 profils Dr. Ali Sami CEO + Mohamed Aalabou CTO)
17. Closing — layout `closing` (typographie monumentale 120px)

### À retenir pour la prochaine session

**STATUT : Build production réussi ✅**

1. **Dépendances installées** : `npm install --legacy-peer-deps` (conflit peer-dep nodemailer entre next-auth 4.x et nodemailer 6.x — sans impact fonctionnel)
2. **Fix appliqué** : `src/app/api/export-pdf/route.ts` — `page.waitForTimeout()` remplacé par `setTimeout()` (API Puppeteer 22.x), `Buffer.from(pdf)` pour compatibilité `NextResponse` BodyInit
3. **Build propre** : 0 erreur TypeScript, 21 pages statiques + 13 routes dynamiques compilées
4. **Configurer .env** : copier `.env.example` → `.env`, remplir DATABASE_URL, NEXTAUTH_SECRET, ADMIN_EMAIL/PASSWORD, SMTP
5. **Base de données** : `npx prisma db push && npx tsx prisma/seed.ts`
6. **Démarrer en dev** : `npm run dev` → http://localhost:3000
7. **Admin** : http://localhost:3000/admin/login

**Points d'attention :**
- `npm install` doit toujours utiliser `--legacy-peer-deps`
- L'export PDF nécessite Chromium installé (dans Docker : automatique via Dockerfile)
- Les tokens d'accès sont valides 30 jours par défaut

**Prochaines étapes possibles :**
- Configurer `.env` et lancer en dev local pour test UI
- Déploiement sur VPS (suivre README.md)
- Personnalisation des données du seed si nécessaire

---

## [2026-05-07] — Module Carte épidémiologique `/map`

### Résumé
Ajout du module carte interactive de surveillance épidémiologique des 12 régions du Maroc.

### Décisions / Architecture

**Stack carte :** SVG custom (polygones hardcodés, viewBox 460×760) + React state + Chart.js sparkline + html2canvas export PNG. Pas de D3 ni GeoJSON externe — polygones approximatifs embarqués dans le composant.

**Fichiers créés :**
- `src/data/epi-map-data.ts` — Types + données mock pour 6 maladies × 12 régions (Grippe, Asthme, Gastro, Santé mentale, Diabète, CVD)
- `src/components/map/MoroccoEpiMap.tsx` — Composant principal (SVG carte, tooltips, panneau détail, sélecteurs, KPIs, légende, alertes, export PNG)
- `src/app/map/page.tsx` — Page publique (Server Component, fallback statique si DB vide)
- `src/app/api/admin/map/route.ts` — GET + POST (upsert) admin
- `src/app/api/admin/map/[id]/route.ts` — PATCH + DELETE admin
- `src/app/admin/map/page.tsx` — Éditeur admin (table éditable par maladie × région)

**Modèle Prisma ajouté :** `EpiMapData` avec `@@unique([diseaseId, period])`

**Modifié :**
- `prisma/schema.prisma` — nouveau modèle EpiMapData
- `src/app/admin/AdminShell.tsx` — lien "Carte épidémio" ajouté
- `src/app/page.tsx` — lien "Carte épidémio →" ajouté dans la nav

**Palette carte :** 5 niveaux — Faible `#3B6D11` → Stable `#639922` → En hausse `#BA7517` → Incidence élevée `#EF9F27` → Alerte `#E24B4A`

### À retenir pour la prochaine session

**STATUT : Module /map opérationnel — 0 erreur TypeScript ✅**

1. La page `/map` est **publique** (aucun token requis) — vitrine décideurs
2. Admin éditeur : `/admin/map` — modifier données par maladie × région
3. Après `prisma db push`, le modèle `EpiMapData` sera créé. Données par défaut (statiques) fonctionnent sans DB.
4. **Attention : disque quasi-plein (99%, 211Mo libres)** — libérer de l'espace avant de lancer le dev server ou un build production.
5. `html2canvas` ajouté pour export PNG — import dynamique (`await import`) pour éviter les problèmes SSR.

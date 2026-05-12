# PANOPTES — Blink Pharma Pitch Deck

> Real-Time Health Intelligence Platform — Investor Deck interactif

## Stack

- **Next.js 14** (App Router, Server Components)
- **Tailwind CSS** + styles inline (design pixel-perfect)
- **Prisma** + **PostgreSQL 15**
- **NextAuth** (auth admin)
- **Framer Motion** (animations)
- **Chart.js** + react-chartjs-2
- **Puppeteer** (export PDF)
- **Nodemailer** (emails)

---

## Déploiement sur VPS Ubuntu

### 1. Prérequis

```bash
# Docker + Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Nginx
sudo apt install nginx -y

# Certbot
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Cloner et configurer

```bash
cd /opt
git clone <votre-repo> panoptes
cd panoptes

# Configurer les variables d'environnement
cp .env.example .env
nano .env
```

Remplir le `.env` :

```env
DATABASE_URL=postgresql://panoptes:MOT_DE_PASSE_DB@db:5432/panoptes
POSTGRES_PASSWORD=MOT_DE_PASSE_DB
NEXTAUTH_URL=https://panoptes.blinkpharmacie.ma
NEXTAUTH_SECRET=$(openssl rand -base64 32)
ADMIN_EMAIL=ali.sami@blinkpharmacie.com
ADMIN_PASSWORD=MOT_DE_PASSE_ADMIN_FORT
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@blinkpharmacie.ma
SMTP_PASS=MOT_DE_PASSE_SMTP
NEXT_PUBLIC_APP_URL=https://panoptes.blinkpharmacie.ma
NEXT_PUBLIC_KB_DASHBOARD_URL=/api/admin/kb/
KB_DASHBOARD_UPSTREAM=URL_PRIVEE_OU_TECHNIQUE_DU_DASHBOARD_KB
KB_DASHBOARD_PASSWORD=MOT_DE_PASSE_DU_DASHBOARD_KB
```

### 3. Lancer l'application

```bash
# Build et démarrage
docker compose up -d --build

# Vérifier les logs
docker compose logs -f app

# Migrations et seed
docker compose exec app npx prisma migrate deploy
docker compose exec app npx tsx prisma/seed.ts
```

### 4. Configuration Nginx

```bash
# Copier la config
sudo cp nginx.conf /etc/nginx/sites-available/panoptes
sudo ln -s /etc/nginx/sites-available/panoptes /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 5. SSL avec Certbot

```bash
sudo certbot --nginx -d panoptes.blinkpharmacie.ma
```

### 6. DNS

Ajouter chez votre registrar :

| Type | Nom      | Valeur        |
|------|----------|---------------|
| A    | panoptes | `IP_DU_VPS`  |

---

## URLs

| URL                                     | Description              |
|-----------------------------------------|--------------------------|
| `https://panoptes.blinkpharmacie.ma`    | Page d'accueil publique  |
| `https://panoptes.blinkpharmacie.ma/deck?token=XXX` | Viewer de slides |
| `https://panoptes.blinkpharmacie.ma/admin` | Interface admin      |
| `https://panoptes.blinkpharmacie.ma/admin/login` | Login admin      |
| `https://panoptes.blinkpharmacie.ma/admin/knowledge-base` | Admin Knowledge Base |
| `https://panoptes.blinkpharmacie.ma/api/admin/kb/` | Proxy KB protégé par session admin |

---

## Commandes utiles

```bash
# Redémarrer l'app
docker compose restart app

# Mettre à jour
git pull
docker compose up -d --build app

# Base de données — reseed
docker compose exec app npx tsx prisma/seed.ts

# Logs
docker compose logs -f --tail=100 app

# Backup PostgreSQL
docker compose exec db pg_dump -U panoptes panoptes > backup_$(date +%Y%m%d).sql

# Prisma Studio (dev uniquement)
docker compose exec app npx prisma studio
```

---

## Structure du projet

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Page d'accueil
│   ├── deck/               # Viewer de slides
│   ├── admin/              # Interface admin
│   └── api/                # API routes
├── components/
│   └── slides/
│       ├── SlideRenderer.tsx      # Composant central
│       └── layouts/               # 16 layouts de slides
├── lib/                    # Utilitaires (prisma, auth, email, token)
└── types/                  # Types TypeScript
prisma/
├── schema.prisma           # Schéma base de données
└── seed.ts                 # 17 slides de seed
```

---

## Slides (17 au total)

| #  | Label                | Layout          |
|----|----------------------|-----------------|
| 01 | Cover                | cover           |
| 02 | The Problem          | problem         |
| 03 | Visual: Fragmented   | visual-fragmented |
| 04 | The Solution         | solution        |
| 05 | Transforming Sales   | flow            |
| 06 | Visual: Sensor       | visual-sensor   |
| 07 | Surrogate Endpoint   | chart-full      |
| 08 | Filtering Single     | pipeline        |
| 09 | Filtering Multiple   | stats-chart     |
| 10 | Data Infrastructure  | stack           |
| 11 | Traction             | kpi             |
| 12 | Strategic Advantage  | flywheel        |
| 13 | Revenue Growth       | chart-full      |
| 14 | Margin Model         | two-charts      |
| 15 | Investment           | investment      |
| 16 | Team                 | team            |
| 17 | Closing              | closing         |

---

*PANOPTES © 2026 Blink Pharma*

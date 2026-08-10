# Salle de Sport — Site Web Dynamique

## Description du projet

Site web dynamique autonome pour une **salle de sport** comprenant :
- **Frontend public** (Next.js) : vitrine + marketplace (abonnements, inscription cours)
- **Backend API** (FastAPI/Python) : API REST avec PostgreSQL + Redis
- **Admin Dashboard** (Next.js) : gestion complète du contenu, planning, abonnements

Le site permet au grand public de découvrir les activités, consulter le planning, s'abonner, lire des articles/vidéos fitness et s'inscrire aux cours collectifs. L'administrateur gère tout le contenu dynamiquement (activités, planning, coachs, abonnements, articles, vidéos).

---

## Stack Technique

| Composant | Technologie | Version |
|-----------|------------|---------|
| Frontend | Next.js (App Router) | 14+ |
| Admin | Next.js (App Router) | 14+ |
| Backend API | Python FastAPI | 0.100+ |
| Base de données | PostgreSQL | 16 |
| Cache/Sessions | Redis | 7 |
| ORM | SQLAlchemy | 2.0+ |
| Migrations | Alembic | 1.13+ |
| CSS | Tailwind CSS | 3.4+ |
| Conteneurisation | Docker + Docker Compose | latest |
| Hébergement | Railway | — |

---

## Identité Visuelle & Design System

### Palette — Bleu nuit & Doré

Le site reprend les couleurs du logo ESLIE SPORT : fond **bleu nuit**, accent **doré**. Toutes les couleurs sont définies dans `frontend/app/globals.css` via `@theme`.

| Token CSS | Valeur hex | Usage |
|-----------|-----------|-------|
| `--color-primary` | `#FFD600` | Doré : CTA, accents, titres en emphase |
| `--color-primary-light` | `#FFE44D` | Variante claire du doré |
| `--color-secondary` | `#A8B2C1` | Texte secondaire (gris bleuté) |
| `--color-secondary-light` | `#C5CDD8` | Texte tertiaire lisible sur fond sombre |
| `--color-accent` | `#FFD600` | Étoiles, emphase |
| `--color-dark` | `#0F1724` | Background principal |
| `--color-dark-card` | `#1A2332` | Cards, sections alternées |
| `--color-dark-lighter` | `#1E293B` | Fond plus clair (placeholders, hover) |
| `--color-dark-border` | `#2D3A4A` | Bordures |
| `--color-dark-muted` | `#8896A8` | Texte discret — **contraste 5,2:1 sur `--color-dark-card`** |
| `--color-success` | `#22c55e` | Succès, validations, places disponibles |
| `--color-warning` | `#f59e0b` | Avertissements, places limitées |
| `--color-error` | `#ef4444` | Erreurs, complet |

### Classes utilitaires custom

| Classe | Dark mode | Light mode |
|--------|-----------|------------|
| `.gradient-primary` | `linear-gradient(135deg, #FFD600, #FFB800)` + `color: #0F1724` | identique (le doré reste doré dans les deux thèmes) |
| `.gradient-hero` | Overlay sombre avec transparence | Overlay clair avec transparence |
| `.hero-overlay` | `rgba(0,0,0, 0.6-0.8)` sur image hero | `rgba(255,255,255, 0.65-0.85)` sur image hero |
| `.hero-gradient` | Radial-gradient sombre (pages sans image) | Radial-gradient clair `#f5f5f5` |
| `.card-gradient` | Gradient sombre `#1a1a1a` | Gradient clair `#f0f0f0` |
| `.glass` | Fond `rgba(26,35,50,0.85)` + blur + bordure dorée à 8 % | Fond clair + blur |
| `.text-gradient` | Dégradé doré `#FFD600` vers gris bleuté `#A8B2C1` | idem |
| `.watermark` | Filigrane `logo.png` centré, opacité 0.03 | idem |

### Mode Clair / Sombre

Le site supporte un toggle clair/sombre via l'attribut `data-theme` sur `<html>`. Le thème par défaut est **sombre**.

**Mécanisme :**
- `ThemeToggle.tsx` : bouton soleil (dark) / lune (light) dans le header
- Anti-flash script dans `<head>` de `layout.tsx` lit `localStorage('theme')` avant le premier paint
- Toutes les surcharges light mode sont dans `globals.css` via `[data-theme="light"]`

**Surcharges CSS automatiques en light mode :**
- Variables CSS (`--color-dark`, `--color-primary`, etc.) inversées
- `.text-white` devient `color: #0a0a0a` (+ variantes `/80`, `/60`, `/40`, `/30`, `/20`)
- `.bg-white` devient `background: #111` (éléments décoratifs : dots, badges)
- `.border-l-white` devient `border-left-color: #111`
- `.bg-dark`, `.bg-dark-card`, `.bg-dark-lighter` deviennent `#f5f5f5`, `#fff`, `#f0f0f0`
- `.gradient-primary .text-black` devient `color: #fff` (boutons CTA)
- Le footer reste toujours en mode sombre (identité de marque)

**Image Hero :**
- Le hero principal utilise une image Unsplash (`images.unsplash.com`) via Next.js `Image` avec `fill` + `object-cover`
- L'overlay `.hero-overlay` s'adapte au thème (sombre ou clair semi-transparent)
- Config `next.config.ts` : `images.remotePatterns` autorise `images.unsplash.com`

### Règles pour les ajouts futurs

1. **Une seule couleur d'accent** : le doré `--color-primary`. Pas de rouge/bleu/orange hors couleurs fonctionnelles (`success`, `warning`, `error`)
2. **Boutons CTA** : utiliser `gradient-primary` avec `text-black` — le CSS force `color: #0F1724` dans les deux thèmes
3. **Backgrounds hero avec image** : utiliser `.hero-overlay` sur un `<div>` au-dessus de l'image
4. **Backgrounds hero sans image** : ajouter la classe `.hero-gradient` sur le `<div>` avec le `style={{background:...}}` inline
5. **Cards avec fond inline** : ajouter la classe `.card-gradient` sur le `<div>` avec le style inline
6. **Badges/dots** : `bg-white` avec opacités variables (`bg-white/60`, `bg-white/80`) — automatiquement inversé en light mode
7. **Hover states** : `hover:border-primary/30` ou `hover:border-primary/40` (subtil halo)
8. **Shadows** : `shadow-white/10` au lieu de `shadow-primary/30` sur les éléments actifs
9. **Ne jamais hardcoder** de couleurs inline sans ajouter une classe CSS pour le light mode override
10. **Contraste du texte sur fond sombre** : `text-dark-muted` (`#8896A8`) tombe à 5,2:1 sur `--color-dark-card` — acceptable pour du texte d'appoint, trop faible pour un élément cliquable. Pour un libellé interactif (filtres, onglets, liens), utiliser `text-secondary-light` (`#C5CDD8`, ~9,8:1). Voir les pilules de filtre de `app/articles/page.tsx`.

### Tarification — Grille tarifaire ESLIE SPORT

| Formule | Prix | Type |
|---------|------|------|
| Séance individuelle / collective | 3 000 FCFA | Paiement unique |
| Inscription mensuelle | 5 000 FCFA | Paiement unique |
| Mensualité | 30 000 FCFA | Mensuel récurrent |
| Kung-Fu Wushu — Inscription | 10 000 FCFA | Paiement unique |
| Kung-Fu Wushu — Mensuel | 10 000 FCFA | Mensuel récurrent |
| Kung-Fu Wushu — Tenue de sport | 20 000 FCFA | Paiement unique |

- Devise : **FCFA** (Franc CFA) — jamais EUR ou USD
- Format nombre : `30 000` (espace comme séparateur de milliers, format français)
- Contact : **+225 0545079850**
- Localisation : **Blaukauss, Abidjan, Côte d'Ivoire**

### Planning hebdomadaire réel

| Jour | Activité | Horaires | Coach |
|------|----------|----------|-------|
| Tous les jours | Musculation | 07h - 20h | Toussaint |
| Lundi | Séance collective | 20h30 - 22h | Léo |
| Mardi | Séance collective | 18h - 19h39 | David |
| Mercredi | Séance collective | 20h30 - 22h | Léo |
| Mercredi | Kung-Fu Wushu | 14h - 15h30 | — |
| Jeudi | Séance collective | 18h30 - 20h30 | Adonis |
| Vendredi | Séance collective | 20h30 - 22h | Léo |
| Samedi | Séance collective | 7h - 9h | David |
| Samedi | Kung-Fu Wushu | 10h - 11h30 | — |

### Coachs

| Nom | Spécialité | Jours |
|-----|-----------|-------|
| Toussaint | Musculation | Tous les jours |
| Léo | Séances collectives | Lundi, Mercredi, Vendredi |
| David | Séances collectives | Mardi, Samedi |
| Adonis | Séances collectives | Jeudi |

---

## Architecture des dossiers

```
salle-de-sport/
├── frontend/          # Next.js — Site public
│   ├── app/           # Pages : accueil, activités, planning, abonnements, coachs, blog, vidéos, contact
│   ├── components/    # Composants React réutilisables
│   ├── lib/           # API client, types, utilitaires
│   ├── public/        # Assets statiques
│   ├── styles/        # Tailwind config, CSS global
│   └── ...
├── admin/             # Next.js — Dashboard administration
│   ├── app/
│   │   ├── login/     # Page de connexion
│   │   ├── (admin)/   # Layout protégé avec Sidebar
│   │   │   ├── dashboard/        # Stats + graphiques tendances
│   │   │   ├── activites/        # CRUD activités
│   │   │   ├── planning/         # Éditeur drag & drop + vue liste
│   │   │   ├── abonnements/      # CRUD formules
│   │   │   ├── coachs/           # CRUD coachs
│   │   │   ├── articles/         # CRUD articles + RichEditor
│   │   │   ├── videos/           # CRUD vidéos
│   │   │   ├── transformations/  # CRUD avant/après
│   │   │   ├── equipements/      # CRUD équipements par zone
│   │   │   ├── avis/             # Modération avis
│   │   │   ├── contacts/         # Messages reçus
│   │   │   └── parametres/       # Paramètres salle
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/    # DataTable, Modal, Sidebar, StatCard, FileUpload, RichEditor, Chart
│   ├── lib/           # api.ts (apiFetch, login), auth.tsx (AuthProvider, token refresh), types.ts
│   └── ...
├── backend/           # FastAPI — API REST
│   ├── app/
│   │   ├── main.py
│   │   ├── api/v1/routes/    # auth, activities, schedule, enrollments, subscriptions, coaches, articles, videos, transformations, equipment, stats
│   │   ├── core/             # config, security, dependencies
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   └── services/         # Business logic
│   ├── alembic/
│   ├── tests/
│   └── ...
├── docker-compose.yml
├── .env.example
├── CLAUDE.md
└── README.md
```

---

## ÉTAPES DE RÉALISATION (A → Z)

### PHASE 1 — BACKEND API (FastAPI)

#### Étape 1.1 : Initialisation du projet Python
- Créer `backend/requirements.txt` : fastapi, uvicorn[standard], sqlalchemy, alembic, psycopg2-binary, python-jose[cryptography], passlib[bcrypt], python-multipart, redis, python-dotenv, pydantic[email], Pillow
- Créer `backend/app/main.py` : app FastAPI avec CORS, routers v1
- Créer `backend/app/core/config.py` : Settings (DATABASE_URL, REDIS_URL, SECRET_KEY, etc.)
- Créer `backend/app/core/security.py` : JWT tokens, password hashing
- Créer `backend/app/core/dependencies.py` : get_db, get_current_user, get_redis
- Créer `backend/Dockerfile`

#### Étape 1.2 : Modèles de données (SQLAlchemy)
Créer `backend/app/models/models.py` :
- **users** : id (UUID), email, password_hash, full_name, role (enum: admin/coach/member), subscription_id (FK nullable), qr_code (unique), is_active, created_at
- **activities** : id, name, slug, description, category (enum: force/cardio/flexibility/martial_arts/dance), level (enum: beginner/intermediate/advanced/all), duration_minutes, max_capacity, image_url, is_active, order
- **coaches** : id, name, photo_url, certifications (JSON), specialties (JSON), bio, is_active, order
- **schedule_slots** : id, activity_id (FK), coach_id (FK), day_of_week (0-6), start_time, end_time, is_recurring, specific_date (nullable), max_capacity_override (nullable), is_active
- **enrollments** : id, user_name, user_email, user_phone, slot_id (FK), specific_date, status (enum: enrolled/waitlisted/cancelled), enrolled_at
- **subscriptions** : id, name, price (Decimal), duration_months, features (JSON), is_active, order, created_at
- **articles** : id, title, slug, content (Text), excerpt, cover_image_url, status (enum: draft/published), published_at, author_id (FK), created_at
- **videos** : id, title, description, video_url, thumbnail_url, category, is_published, order, created_at
- **transformations** : id, member_name, before_image_url, after_image_url, testimonial, duration_text, is_featured, is_published, created_at
- **equipment** : id, name, description, zone (enum: musculation/cardio/stretching/functional/locker), image_url, quantity, is_active
- **reviews** : id, author_name, rating, comment, is_approved, created_at
- **contacts** : id, name, email, phone, subject, message, is_read, created_at
- **settings** : id, key, value

#### Étape 1.3 : Schémas Pydantic
- Schémas Create/Update/Response pour chaque modèle
- ScheduleView (planning hebdomadaire structuré par jour/heure)
- AvailableSlots (créneaux avec places restantes)
- DashboardStats (membres actifs, inscriptions, taux remplissage, revenus)

#### Étape 1.4 : Services (logique métier)
- `auth_service.py` : authenticate, create_user, generate_qr_code
- `activity_service.py` : CRUD activités
- `schedule_service.py` : CRUD planning, vue hebdomadaire, récurrence
- `enrollment_service.py` : inscription cours, vérification capacité, liste d'attente, annulation
- `subscription_service.py` : CRUD formules, souscription
- `coach_service.py` : CRUD coachs
- `article_service.py` : CRUD articles
- `video_service.py` : CRUD vidéos
- `transformation_service.py` : CRUD avant/après
- `equipment_service.py` : CRUD équipements par zone
- `review_service.py` : CRUD avis, modération
- `media_service.py` : upload fichiers
- `contact_service.py` : contacts + email SMTP
- `stats_service.py` : calculs dashboard (taux remplissage, revenus, tendances)

#### Étape 1.5 : Routes API
- `auth.py` : login, register, refresh, profile
- `activities.py` : CRUD activités (public GET, auth POST/PUT/DELETE)
- `schedule.py` : GET /schedule (planning semaine public), CRUD créneaux (auth)
- `enrollments.py` : POST /enroll (public), DELETE /cancel, GET /slot/{id}/enrollments (auth)
- `subscriptions.py` : GET /subscriptions (public), POST/PUT/DELETE (auth)
- `coaches.py` : GET (public), CRUD (auth)
- `articles.py` : GET (public/published), CRUD (auth)
- `videos.py` : GET (public), CRUD (auth)
- `transformations.py` : GET (public/featured), CRUD (auth)
- `equipment.py` : GET (public), CRUD (auth)
- `reviews.py` : GET approved (public), POST (public), modération (auth)
- `contact.py` : POST (public)
- `upload.py` : POST multipart (auth)
- `settings.py` : GET/PUT (auth)
- `stats.py` : GET dashboard stats (auth)

#### Étape 1.6 : Migrations & Seed
- Configurer Alembic
- Migration initiale
- `seed.py` : admin, activités exemples, formules abonnement, créneaux planning

#### Étape 1.7 : Tests
- Tests auth, activités, inscriptions, planning

---

### PHASE 2 — FRONTEND PUBLIC (Next.js)

#### Étape 2.1 : Initialisation
- Créer projet Next.js TypeScript + Tailwind + App Router
- Palette : tons énergiques (bleu foncé, rouge vif, gris acier — ambiance sportive)
- `lib/api.ts`, `lib/types.ts`

#### Étape 2.2 : Composants communs
- `Header.tsx` : navbar sportive, CTA "S'inscrire"
- `Footer.tsx` : infos, horaires, réseaux
- `Hero.tsx` : vidéo ou image hero dynamique
- `ActivityCard.tsx` : carte activité (image, nom, niveau, durée)
- `CoachCard.tsx` : carte coach (photo, spécialités, certifications)
- `ScheduleGrid.tsx` : planning interactif semaine (grille horaire filtrée par activité/coach)
- `SubscriptionCard.tsx` : carte abonnement (comparateur de formules)
- `TransformationSlider.tsx` : avant/après avec slider
- `EnrollmentForm.tsx` : formulaire inscription cours
- `BMICalculator.tsx` : calculateur IMC interactif (innovation)
- `CapacityBadge.tsx` : badge places restantes en temps réel (innovation)
- `ArticleCard.tsx`, `ReviewCard.tsx`, `ContactForm.tsx`, `Pagination.tsx`

#### Étape 2.3 : Pages
- `app/page.tsx` : Accueil — hero vidéo, chiffres clés animés, activités phares, témoignages, CTA
- `app/activites/page.tsx` : catalogue activités filtrable
- `app/activites/[slug]/page.tsx` : détail activité
- `app/planning/page.tsx` : planning interactif semaine + inscription directe
- `app/abonnements/page.tsx` : comparateur de formules
- `app/coachs/page.tsx` : grille des coachs
- `app/equipements/page.tsx` : visite virtuelle / zones
- `app/articles/page.tsx` : blog fitness
- `app/articles/[slug]/page.tsx` : article complet
- `app/videos/page.tsx` : vidéos d'entraînement
- `app/transformations/page.tsx` : avant/après
- `app/avis/page.tsx` : témoignages
- `app/contact/page.tsx` : contact + carte

#### Étape 2.4 : Responsive & Finitions
- Responsive mobile/tablette/desktop
- Animations dynamiques (compteurs, transitions)
- Loading/error/empty states
- SEO complet

---

### PHASE 3 — ADMIN DASHBOARD (Next.js)

#### Étape 3.1 : Initialisation
- Projet Next.js admin + auth JWT + middleware

#### Étape 3.2 : Composants admin
- `Sidebar.tsx` : Dashboard, Activités, Planning, Abonnements, Coachs, Membres, Articles, Vidéos, Transformations, Équipements, Avis, Paramètres
- `ScheduleEditor.tsx` : éditeur de planning drag & drop (innovation admin)
- `DataTable.tsx`, `Modal.tsx`, `FileUpload.tsx`, `RichEditor.tsx`, `StatCard.tsx`

#### Étape 3.3 : Pages admin
- `app/login/page.tsx`
- `app/dashboard/page.tsx` : membres actifs, inscriptions jour, taux remplissage cours, revenus, graphiques tendance
- `app/activites/page.tsx` : CRUD activités
- `app/planning/page.tsx` : éditeur planning visuel (drag & drop créneaux)
- `app/abonnements/page.tsx` : CRUD formules + promotions
- `app/coachs/page.tsx` : CRUD coachs + planning individuel
- `app/articles/page.tsx` + `/new` + `/[id]/edit` : gestion blog
- `app/videos/page.tsx` : CRUD vidéos
- `app/transformations/page.tsx` : CRUD avant/après + mise en avant
- `app/equipements/page.tsx` : CRUD équipements par zone
- `app/avis/page.tsx` : modération
- `app/contacts/page.tsx` : messages
- `app/parametres/page.tsx` : infos salle, horaires, réseaux

---

### PHASE 4 — DOCKER & DÉVELOPPEMENT LOCAL

#### Étape 4.1 : Docker Compose
```yaml
services:
  db: postgres:16-alpine (port 5432)
  redis: redis:7-alpine (port 6379)
  api: ./backend (port 8000)
  frontend: ./frontend (port 3000)
  admin: ./admin (port 3001)
```

#### Étape 4.2 : .env.example
```
POSTGRES_DB=salle_sport_db
POSTGRES_USER=sport_user
POSTGRES_PASSWORD=changeme
DATABASE_URL=postgresql://sport_user:changeme@db:5432/salle_sport_db
REDIS_URL=redis://redis:6379/0
SECRET_KEY=changeme
ADMIN_EMAIL=admin@sport.com
ADMIN_PASSWORD=changeme
```

#### Étape 4.3 : Validation locale complète

---

### PHASE 5 — DÉPLOIEMENT RAILWAY

- Procfile backend : `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Déployer PostgreSQL, Redis, API, Frontend, Admin sur Railway
- Configurer domaine personnalisé + Cloudflare DNS
- Migrations + seed en production
- Tests complets en production

---

## État d'avancement

### PHASE 1 — BACKEND API ✅

| Élément | Statut | Notes |
|---------|--------|-------|
| main.py + CORS | ✅ | CORS origins : localhost:3000, 3001, 3003 |
| Config (pydantic-settings) | ✅ | `.env` override, defaults dev |
| Security (JWT + bcrypt) | ✅ | Access 30min, Refresh 7j, HS256 |
| Modèles SQLAlchemy | ✅ | 13 tables (users, activities, coaches, schedule_slots, enrollments, subscriptions, articles, videos, transformations, equipment, reviews, contacts, settings) |
| Schemas Pydantic | ✅ | Create/Update/Response pour chaque modèle |
| Services métier | ✅ | auth, activity, schedule, enrollment, subscription, coach, article, video, transformation, equipment, review, media, contact, stats |
| Routes API v1 | ✅ | Toutes les routes documentées dans Phase 1 |
| Alembic migration initiale | ✅ | `091934929730_initial.py` |
| Seed script | ✅ | Admin + données exemples |
| Auth login | ✅ | `OAuth2PasswordRequestForm` (form-urlencoded, champ `username`) |
| Dockerfile | ✅ | |

### PHASE 2 — FRONTEND PUBLIC ✅

| Élément | Statut | Notes |
|---------|--------|-------|
| Header, Footer, Hero | ✅ | Navbar + ThemeToggle + CTA |
| Mode clair/sombre | ✅ | `data-theme` sur `<html>`, anti-flash script |
| Image hero Unsplash | ✅ | Next.js Image + overlay adaptatif |
| Logo | ✅ | `frontend/public/logo.png` |
| Favicon / icônes | ✅ | Généré depuis le logo (badge rogné, coins transparents) via les conventions de fichiers Next.js : `app/favicon.ico` (16/32/48/64), `app/icon.png` (512), `app/apple-icon.png` (180, fond bleu nuit). Identique côté `admin/app/`. Ne pas déclarer `metadata.icons` : les fichiers ont priorité. |

### PHASE 3 — ADMIN DASHBOARD ✅

| Élément | Statut | Notes |
|---------|--------|-------|
| Auth JWT + refresh auto | ✅ | Renouvellement 2min avant expiration |
| Login page | ✅ | Email + mot de passe, vérification rôle admin |
| Sidebar navigation | ✅ | 12 entrées (Dashboard → Paramètres) |
| Dashboard + graphiques | ✅ | 8 StatCards + 4 graphiques (LineChart, BarChart) |
| Activités CRUD | ✅ | DataTable + Modal + FileUpload |
| Planning drag & drop | ✅ | Grille 7j×15h, glisser-déposer, double-clic ajout, toggle grille/liste |
| Abonnements CRUD | ✅ | Prix FCFA, avantages multi-lignes |
| Coachs CRUD | ✅ | Photo FileUpload, certifications/spécialités multi-lignes |
| Articles CRUD | ✅ | RichEditor pour contenu, FileUpload pour couverture |
| Vidéos CRUD | ✅ | URL vidéo + miniature FileUpload |
| Transformations CRUD | ✅ | FileUpload avant/après, mise en avant |
| Équipements CRUD | ✅ | Par zone, FileUpload image |
| Avis modération | ✅ | Approuver/Supprimer, étoiles, badge statut |
| Contacts | ✅ | Lecture + marquer lu, indicateur non-lu |
| Paramètres | ✅ | 8 clés (nom salle, téléphone, email, adresse, horaires, réseaux sociaux) |
| Thème bi-chrome | ✅ | Contenu en clair via `.admin-content`, Sidebar et `/login` sombres |

### PHASE 4 — DOCKER ✅

| Élément | Statut | Notes |
|---------|--------|-------|
| docker-compose.yml | ✅ | db, redis, api, frontend, admin — ports hôte décalés (voir § Ports) |
| Dockerfiles | ✅ | Backend, Frontend, Admin (multi-stage, `output: standalone`, user non-root) |
| `.dockerignore` | ✅ | Frontend + Admin — évite de copier le `node_modules` Windows de l'hôte |
| Variables `NEXT_PUBLIC_*` | ✅ | Passées en `build.args` (voir ci-dessous) |

#### ⚠️ Variables `NEXT_PUBLIC_*` et Docker

Next.js **fige les `NEXT_PUBLIC_*` dans le bundle au moment du `npm run build`**,
pas au démarrage du conteneur. Les déclarer uniquement dans `environment:` de
`docker-compose.yml` **n'a aucun effet** sur le code exécuté par le navigateur.

Elles doivent donc passer par `build.args` → `ARG` → `ENV` **avant** le
`RUN npm run build` du Dockerfile. C'est en place pour `frontend` et `admin`.

`NEXT_PUBLIC_API_URL` doit valoir l'URL de l'API **telle que le navigateur la
voit** : `http://localhost:8010`. Ne pas y mettre `/api/v1` — le code l'ajoute
(`fetchApi` construit `${BASE}/api/v1${endpoint}`).

Conséquence pratique : **changer cette valeur impose un rebuild d'image**, un
simple redémarrage de conteneur ne suffit pas.

#### Recréer les conteneurs après un rebuild

`docker compose up -d` ne recrée pas un conteneur dont seule l'image a changé si
celui-ci tournait déjà. Après un `build`, forcer la recréation :

```bash
docker compose up -d --no-deps --force-recreate frontend admin
```

`--no-deps` évite de redémarrer `db`, `redis` et `api`.

### PHASE 5 — DÉPLOIEMENT ❌ (non commencé)

---

## Composants Admin — Référence

### Composants réutilisables (`admin/components/`)

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `DataTable` | `DataTable.tsx` | Table avec colonnes configurables, renderers custom, boutons Modifier/Supprimer |
| `Modal` | `Modal.tsx` | Modale plein écran, backdrop blur, scrollable, prop `wide` pour formulaires larges |
| `StatCard` | `StatCard.tsx` | Carte statistique avec icône emoji, label, valeur, couleur optionnelle |
| `FileUpload` | `FileUpload.tsx` | Upload drag & drop + preview image + URL manuelle, appel `POST /api/v1/upload/` |
| `RichEditor` | `RichEditor.tsx` | Éditeur WYSIWYG contentEditable, toolbar : gras, italique, souligné, listes, H2/H3, liens, suppression format |
| `Chart` | `Chart.tsx` | `BarChart` et `LineChart` en SVG pur, couleur/suffix configurables |
| `Sidebar` | `Sidebar.tsx` | Navigation latérale fixe, lien actif, bouton déconnexion |

### Classes CSS Admin (`admin/app/globals.css`)

| Classe | Usage |
|--------|-------|
| `.btn-primary` | Bouton principal (bg doré/jaune) |
| `.btn-secondary` | Bouton secondaire (fond sombre, bordure) |
| `.btn-danger` | Bouton suppression (rouge) |
| `.input-field` | Champ de formulaire (fond sombre, bordure, focus doré) |
| `.card` | Carte conteneur (fond sombre, bordure, coins arrondis) |
| `.table-header` | En-tête de colonne DataTable |
| `.table-cell` | Cellule DataTable |
| `.admin-content` | **Conteneur du contenu en thème clair** (voir ci-dessous) |

### Thème de l'admin — contenu clair, sidebar sombre

L'admin est **bi-chrome** : la Sidebar reste bleu nuit (identité de marque),
le contenu des pages est en **thème clair**.

La bascule tient en une classe `.admin-content` posée sur le `<main>` de
`app/(admin)/layout.tsx`. La Sidebar étant un **frère** du `<main>` et non un
descendant, elle n'est jamais atteinte par ces règles — pas de `:not()` ni
d'exception à maintenir. La page `/login` est hors du groupe `(admin)` : elle
reste entièrement sombre.

Les 12 pages continuent d'utiliser les classes du thème sombre
(`text-white`, `text-secondary`, `bg-dark-card`…) ; `globals.css` réinterprète
leur rendu à l'intérieur de `.admin-content`. **Aucune page n'a été modifiée**,
et ajouter une page ne demande aucun traitement particulier.

| Classe d'origine | Rendu dans `.admin-content` | Contraste sur blanc |
|------------------|-----------------------------|---------------------|
| `text-white` | `#0F1724` | 16,9:1 |
| `text-secondary` | `#475569` | 7,5:1 |
| `text-dark-muted` | `#64748B` | 4,8:1 |
| `text-primary` | `#8A6D0A` | 4,9:1 |
| `bg-dark-card` | `#FFFFFF` | — |
| `bg-dark-lighter` | `#F1F5F9` | — |
| `border-dark-border` | `#E2E8F0` | — |
| `bg-white` / `text-black` | inversés en `#0F1724` / `#FFFFFF` | — |

⚠️ **Le doré `#FFD600` ne fait que 1,4:1 sur blanc.** En texte sur fond clair,
utiliser `#8A6D0A`. Le doré reste inchangé en **fond** (`bg-primary` des boutons
CTA, où le texte `#0F1724` donne 11,2:1).

⚠️ **Piège Tailwind `@apply`.** `@apply` recopie *toutes* les règles qui ciblent
l'utilitaire, y compris les surcharges `.admin-content`, en substituant le
sélecteur. `.btn-danger { @apply … text-white }` génère donc aussi
`.admin-content .btn-danger { color: #0F1724 }` — du navy sur rouge (3,3:1).
D'où le rattrapage explicite en fin de `globals.css`. **Toute nouvelle classe
`@layer components` qui `@apply` un utilitaire surchargé demande la même
vigilance.**

⚠️ **Graphiques** : `Chart.tsx` dessine en SVG avec une couleur passée en prop.
La valeur par défaut est `#0F1724`. Ne jamais passer `#ffffff` — invisible sur
le fond clair. Palette utilisée par le dashboard : `#0F1724`, `#16A34A`,
`#64748B`, `#B8960A`.

### Authentification Admin

- **Login** : `POST /api/v1/auth/login` avec `OAuth2PasswordRequestForm` (form-urlencoded, `username` + `password`)
- **Token** : stocké dans `localStorage('admin_token')`, refresh dans `localStorage('admin_refresh_token')`
- **Refresh auto** : `scheduleRefresh()` programme un renouvellement 2 minutes avant l'expiration du token (décodage JWT côté client)
- **Vérification rôle** : `fetchProfile()` vérifie `role === 'admin'`, sinon déconnexion
- **URL API** : `NEXT_PUBLIC_API_URL` ou `http://localhost:8000`

### Planning — Fonctionnalités drag & drop

- **Vue grille** : 7 colonnes (jours) × 15 lignes (6h–20h), créneaux positionnés par heure
- **Glisser-déposer** : déplacer un créneau vers un autre jour/heure met à jour via `PUT /api/v1/schedule/{id}`
- **Double-clic** : ouvrir le formulaire de création pré-rempli avec le jour/heure cliqué
- **Vue liste** : affichage classique par jour avec boutons Modifier/Supprimer
- **Couleurs** : bordure gauche colorée selon la catégorie d'activité (force=blanc, cardio=gris, etc.)

---

## Conventions de Code

### Python (Backend)
- Formatage : Black, Linting : Ruff
- snake_case fonctions/variables, PascalCase classes

### TypeScript (Frontend/Admin)
- Prettier + ESLint
- camelCase variables, PascalCase composants/types

### Git
- Préfixes : feat:, fix:, chore:, docs:, refactor:, test:

---

## Ports

Plusieurs projets tournent en parallèle sur la même machine ; les ports hôte de
`docker-compose.yml` sont décalés pour éviter les collisions. **Le port 8000 est
occupé par un autre projet (`salon-coiffure`)** — ne jamais y pointer.

| Service | Port hôte (Docker) | Port interne | Dev local (hors Docker) |
|---------|--------------------|--------------|--------------------------|
| Frontend | 3000 | 3000 | 3000 |
| Admin | **3003** | 3001 | 3001 |
| API | **8010** | 8000 | 8000 |
| PostgreSQL | **5600** | 5432 | — |
| Redis | **6381** | 6379 | — |

Le CORS du backend autorise `localhost:3000`, `:3001` et `:3003`
(`backend/app/core/config.py`).

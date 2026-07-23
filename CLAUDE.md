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
│   ├── app/           # Pages admin (dashboard, CRUD, planning)
│   ├── components/    # Composants admin (tables, modals, éditeur planning)
│   ├── lib/           # API client admin, auth
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

## Ports par défaut
- Frontend : 3000
- Admin : 3001
- API : 8000
- PostgreSQL : 5432
- Redis : 6379

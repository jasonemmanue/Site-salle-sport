# Salle de Sport — Site Web Dynamique

> Site vitrine + marketplace (abonnements, inscription cours) pour une salle de sport.  
> Stack : Next.js • FastAPI • PostgreSQL • Redis • Docker • Railway

---

## Avancement du Projet

### Légende
- [ ] À faire
- [x] Terminé
- 🔄 En cours

---

## PHASE 1 — Backend API (FastAPI) ✅ TERMINÉ

### 1.1 Initialisation
- [x] `requirements.txt` (FastAPI 0.115, SQLAlchemy 2.0, Alembic, etc.)
- [x] `app/main.py` (FastAPI, CORS, routers, StaticFiles uploads)
- [x] `app/core/config.py` (Pydantic BaseSettings)
- [x] `app/core/security.py` (JWT access/refresh tokens, bcrypt)
- [x] `app/core/dependencies.py` (get_db, get_current_user, get_admin_user, get_redis)
- [x] `Dockerfile` (Python 3.12-slim)

### 1.2 Modèles de données (13 tables SQLAlchemy 2.0)
- [x] `users` (UUID, email, password_hash, role admin/coach/member, qr_code)
- [x] `activities` (name, slug, category, level, duration, max_capacity)
- [x] `coaches` (name, photo, certifications JSON, specialties JSON, bio)
- [x] `schedule_slots` (activity FK, coach FK, day_of_week, start/end_time, recurring)
- [x] `enrollments` (user_name/email/phone, slot FK, date, status enrolled/waitlisted/cancelled)
- [x] `subscriptions` (name, price, duration_months, features JSON)
- [x] `articles` (title, slug, content, excerpt, status draft/published, author FK)
- [x] `videos` (title, video_url, thumbnail, category)
- [x] `transformations` (member_name, before/after images, testimonial)
- [x] `equipment` (name, zone musculation/cardio/stretching/functional/locker)
- [x] `reviews` (author_name, rating, comment, is_approved)
- [x] `contacts` (name, email, phone, subject, message)
- [x] `settings` (key/value)

### 1.3 Schémas Pydantic v2
- [x] Schémas Create/Update/Response pour chaque modèle (ConfigDict from_attributes)
- [x] DashboardStats, PaginatedResponse[T], Token, LoginRequest

### 1.4 Services (16 fichiers, logique métier)
- [x] `auth_service.py` — authenticate, create_user, get_user_by_email/id
- [x] `activity_service.py` — CRUD + slugify + pagination
- [x] `schedule_service.py` — CRUD + planning hebdomadaire groupé + joinedload
- [x] `enrollment_service.py` — inscription, vérification capacité, liste d'attente, auto-promotion
- [x] `subscription_service.py` — CRUD formules
- [x] `coach_service.py` — CRUD coachs
- [x] `article_service.py` — CRUD + publication avec horodatage
- [x] `video_service.py` — CRUD vidéos
- [x] `transformation_service.py` — CRUD + filtre featured
- [x] `equipment_service.py` — CRUD par zone
- [x] `review_service.py` — CRUD + modération (approve/reject)
- [x] `media_service.py` — upload fichiers avec validation extension/taille
- [x] `contact_service.py` — CRUD messages
- [x] `stats_service.py` — dashboard (membres actifs, inscriptions, taux remplissage, revenus)
- [x] `settings_service.py` — CRUD paramètres clé/valeur

### 1.5 Routes API (15 routers)
- [x] `auth.py` — POST /login, /register, /refresh, GET /profile
- [x] `activities.py` — GET / (paginé, filtrable), GET /{slug}, POST/PUT/DELETE (admin)
- [x] `schedule.py` — GET / (planning), GET /weekly, POST/PUT/DELETE (admin)
- [x] `enrollments.py` — POST / (public), DELETE /{id}, GET /slot/{id} (admin), GET /slot/{id}/availability
- [x] `subscriptions.py` — GET / (public), POST/PUT/DELETE (admin)
- [x] `coaches.py` — GET / (public), POST/PUT/DELETE (admin)
- [x] `articles.py` — GET / (paginé), GET /{slug}, POST/PUT/DELETE (admin)
- [x] `videos.py` — GET / (public), POST/PUT/DELETE (admin)
- [x] `transformations.py` — GET / (public), POST/PUT/DELETE (admin)
- [x] `equipment.py` — GET / (public, filtrable par zone), POST/PUT/DELETE (admin)
- [x] `reviews.py` — GET / (approved), POST / (public), PUT /{id}/approve (admin), DELETE (admin)
- [x] `contact.py` — POST / (public), GET / (admin), PUT /{id}/read (admin)
- [x] `upload.py` — POST / multipart (admin)
- [x] `settings.py` — GET /, PUT / (admin)
- [x] `stats.py` — GET / dashboard (admin)

### 1.6 Migrations & Seed
- [x] Alembic configuré (alembic.ini, env.py, script.py.mako)
- [x] Dossier versions prêt (migration auto-générée au premier `docker compose up`)
- [x] `seed.py` — admin, 12 activités, 6 coachs, 3 abonnements, 37 créneaux, 17 équipements, 6 avis, 3 articles, 4 transformations, 4 vidéos, 4 paramètres

### 1.7 Tests
- [ ] Tests auth
- [ ] Tests activités
- [ ] Tests inscriptions/planning

---

## PHASE 2 — Frontend Public (Next.js) ✅ TERMINÉ

### 2.1 Initialisation
- [x] Projet Next.js 16 (TypeScript, Tailwind CSS v4, App Router)
- [x] Design dark premium (dégradés rouge/orange, accents bleu, glassmorphisme)
- [x] `lib/api.ts` — Client API complet (14 fonctions, fetch avec gestion d'erreurs)
- [x] `lib/types.ts` — 17 interfaces TypeScript alignées sur le backend

### 2.2 Composants (16 créés)
- [x] `Header.tsx` — Navbar sticky glass, menu mobile animé, CTA "S'inscrire"
- [x] `Footer.tsx` — 4 colonnes, newsletter, réseaux sociaux SVG, horaires
- [x] `Hero.tsx` — Plein écran, compteurs animés (500+ membres, 50+ cours...)
- [x] `ActivityCard.tsx` — Carte activité avec badge catégorie, niveau, durée
- [x] `CoachCard.tsx` — Photo, spécialités, certifications, hover overlay bio
- [x] `ScheduleGrid.tsx` — Planning interactif 7 jours, créneaux colorés par catégorie
- [x] `SubscriptionCard.tsx` — Carte abonnement avec badge "POPULAIRE"
- [x] `TransformationSlider.tsx` — Carrousel avant/après avec navigation
- [x] `EnrollmentForm.tsx` — Modal inscription cours avec validation
- [x] `BMICalculator.tsx` — Calculateur IMC avec jauge SVG animée
- [x] `CapacityBadge.tsx` — Badge places restantes (vert/orange/rouge/complet)
- [x] `ArticleCard.tsx` — Carte blog avec zoom image hover
- [x] `ReviewCard.tsx` — Avis avec étoiles SVG, glassmorphisme
- [x] `ContactForm.tsx` — Formulaire contact avec validation complète
- [x] `Pagination.tsx` — Navigation pages avec ellipsis
- [x] `SectionTitle.tsx` — Titre section avec ligne décorative

### 2.3 Pages (14 créées)
- [x] `app/page.tsx` — Accueil (9 sections)
- [x] `app/activites/page.tsx` — Catalogue filtrable (12 activités mock)
- [x] `app/activites/[slug]/page.tsx` — Détail activité
- [x] `app/planning/page.tsx` — Planning interactif complet
- [x] `app/abonnements/page.tsx` — 3 formules + comparateur + FAQ
- [x] `app/coachs/page.tsx` — 6 coachs
- [x] `app/equipements/page.tsx` — Équipements par zone (5 zones)
- [x] `app/articles/page.tsx` — Blog avec article vedette
- [x] `app/articles/[slug]/page.tsx` — Article détail
- [x] `app/videos/page.tsx` — 8 vidéos avec filtres
- [x] `app/transformations/page.tsx` — Slider + grille
- [x] `app/avis/page.tsx` — Note 4.8/5 + formulaire
- [x] `app/contact/page.tsx` — Formulaire + infos
- [x] `app/not-found.tsx` — Page 404 custom

### 2.4 Responsive & Finitions
- [x] Responsive mobile/tablette/desktop
- [x] Animations (compteurs, float, pulse-glow, fadeInUp)
- [x] Empty states
- [ ] SEO avancé (sitemap, Open Graph)
- [ ] Loading states skeleton
- [ ] Images réelles

---

## PHASE 3 — Admin Dashboard (Next.js)

- [ ] À faire (Phase suivante)

---

## PHASE 4 — Docker & Développement Local

- [x] `docker-compose.yml` (api, frontend, db, redis + healthchecks)
- [x] `.env.example`
- [ ] `docker compose up --build` validé
- [ ] Migrations + seed OK
- [ ] API : http://localhost:8000/docs
- [ ] Frontend : http://localhost:3000

---

## PHASE 5 — Déploiement Railway

- [ ] À faire

---

## Architecture Frontend ↔ Backend

### Variable d'environnement
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Endpoints API

| Fonction frontend | Méthode | Endpoint backend |
|---|---|---|
| `getActivities(category?, level?)` | GET | `/api/v1/activities` |
| `getActivity(slug)` | GET | `/api/v1/activities/{slug}` |
| `getCoaches()` | GET | `/api/v1/coaches` |
| `getSchedule(date?)` | GET | `/api/v1/schedule` |
| `getSubscriptions()` | GET | `/api/v1/subscriptions` |
| `enrollInClass(data)` | POST | `/api/v1/enrollments` |
| `getArticles(page?, status?)` | GET | `/api/v1/articles` |
| `getArticle(slug)` | GET | `/api/v1/articles/{slug}` |
| `getVideos()` | GET | `/api/v1/videos` |
| `getTransformations(featured?)` | GET | `/api/v1/transformations` |
| `getEquipment(zone?)` | GET | `/api/v1/equipment` |
| `getReviews()` | GET | `/api/v1/reviews` |
| `submitReview(data)` | POST | `/api/v1/reviews` |
| `submitContact(data)` | POST | `/api/v1/contact` |

### État actuel
- Frontend : données mock (indépendant du backend)
- Backend : API complète, prête pour Docker
- Connexion : remplacer mock → appels API dans chaque page quand le backend tourne

---

## Palette de couleurs

| Couleur | Hex | Usage |
|---|---|---|
| Primary (Rouge) | `#e11d48` | CTAs, accents |
| Secondary (Bleu) | `#3b82f6` | Highlights, badges |
| Accent (Orange) | `#f97316` | Dégradé avec primary |
| Dark | `#0a0a0a` | Background principal |
| Dark Card | `#1a1a2e` | Cards, sections |

---

## Commandes Docker (Développement Local)

```bash
# 1. Lancer tout le stack
docker compose up --build -d

# 2. Appliquer les migrations
docker compose exec api alembic revision --autogenerate -m "initial"
docker compose exec api alembic upgrade head

# 3. Seed des données
docker compose exec api python seed.py

# 4. Vérifier
# API : http://localhost:8000/docs (Swagger)
# API Health : http://localhost:8000/health
# Frontend : http://localhost:3000

# 5. Logs
docker compose logs -f api
docker compose logs -f frontend

# 6. Arrêter
docker compose down

# 7. Reset complet (supprime les données)
docker compose down -v
```

---

## Notes de Progression

| Date | Action | Détails |
|------|--------|---------|
| 2026-07-23 | Frontend complet | 14 pages, 16 composants, API client, types TS |
| 2026-07-23 | Fix hydration | ScheduleGrid : Math.random() → données déterministes |
| 2026-07-23 | Backend complet | 13 modèles, 16 services, 15 routes, schemas Pydantic, Alembic, seed, Docker |

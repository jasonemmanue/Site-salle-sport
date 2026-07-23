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

## PHASE 1 — Backend API (FastAPI)

### 1.1 Initialisation
- [ ] Créer `requirements.txt`
- [ ] Créer `app/main.py` (FastAPI, CORS, routers)
- [ ] Créer `app/core/config.py` (Settings)
- [ ] Créer `app/core/security.py` (JWT, hashing)
- [ ] Créer `app/core/dependencies.py`
- [ ] Créer `Dockerfile`

### 1.2 Modèles de données
- [ ] Table `users` (admin/coach/member)
- [ ] Table `activities`
- [ ] Table `coaches`
- [ ] Table `schedule_slots`
- [ ] Table `enrollments`
- [ ] Table `subscriptions`
- [ ] Table `articles`
- [ ] Table `videos`
- [ ] Table `transformations`
- [ ] Table `equipment`
- [ ] Table `reviews`
- [ ] Table `contacts`
- [ ] Table `settings`

### 1.3 Schémas Pydantic
- [ ] Schémas CRUD pour chaque modèle
- [ ] ScheduleView, AvailableSlots, DashboardStats

### 1.4 Services (logique métier)
- [ ] `auth_service.py`
- [ ] `activity_service.py`
- [ ] `schedule_service.py` (planning, récurrence)
- [ ] `enrollment_service.py` (inscription, capacité, liste d'attente)
- [ ] `subscription_service.py`
- [ ] `coach_service.py`
- [ ] `article_service.py`
- [ ] `video_service.py`
- [ ] `transformation_service.py`
- [ ] `equipment_service.py`
- [ ] `review_service.py`
- [ ] `media_service.py`
- [ ] `contact_service.py`
- [ ] `stats_service.py`

### 1.5 Routes API
- [ ] `auth.py` (login, register, refresh)
- [ ] `activities.py` (CRUD)
- [ ] `schedule.py` (planning semaine + CRUD créneaux)
- [ ] `enrollments.py` (inscription/annulation cours)
- [ ] `subscriptions.py` (formules)
- [ ] `coaches.py` (CRUD)
- [ ] `articles.py` (CRUD + publication)
- [ ] `videos.py` (CRUD)
- [ ] `transformations.py` (avant/après)
- [ ] `equipment.py` (CRUD par zone)
- [ ] `reviews.py` (CRUD + modération)
- [ ] `contact.py`
- [ ] `upload.py`
- [ ] `settings.py`
- [ ] `stats.py` (dashboard)

### 1.6 Migrations & Seed
- [ ] Configurer Alembic
- [ ] Migration initiale
- [ ] `seed.py` (admin, activités, formules, planning)

### 1.7 Tests
- [ ] Tests auth
- [ ] Tests activités
- [ ] Tests inscriptions/planning

---

## PHASE 2 — Frontend Public (Next.js)

### 2.1 Initialisation
- [ ] Projet Next.js (TypeScript, Tailwind, App Router)
- [ ] Palette sportive (bleu foncé, rouge, gris acier)
- [ ] `lib/api.ts` + `lib/types.ts`

### 2.2 Composants communs
- [ ] `Header.tsx` (navbar + CTA "S'inscrire")
- [ ] `Footer.tsx`
- [ ] `Hero.tsx` (vidéo hero)
- [ ] `ActivityCard.tsx`
- [ ] `CoachCard.tsx`
- [ ] `ScheduleGrid.tsx` (planning interactif semaine)
- [ ] `SubscriptionCard.tsx` (comparateur)
- [ ] `TransformationSlider.tsx` (avant/après)
- [ ] `EnrollmentForm.tsx`
- [ ] `BMICalculator.tsx` (calculateur IMC)
- [ ] `CapacityBadge.tsx` (places restantes)
- [ ] `ArticleCard.tsx`, `ReviewCard.tsx`
- [ ] `ContactForm.tsx`, `Pagination.tsx`

### 2.3 Pages
- [ ] `app/page.tsx` — Accueil (hero, chiffres animés, activités, CTA)
- [ ] `app/activites/page.tsx` — Catalogue filtrable
- [ ] `app/activites/[slug]/page.tsx` — Détail activité
- [ ] `app/planning/page.tsx` — Planning interactif
- [ ] `app/abonnements/page.tsx` — Comparateur formules
- [ ] `app/coachs/page.tsx` — Équipe coachs
- [ ] `app/equipements/page.tsx` — Zones / visite
- [ ] `app/articles/page.tsx` — Blog fitness
- [ ] `app/articles/[slug]/page.tsx` — Article
- [ ] `app/videos/page.tsx` — Vidéos entraînement
- [ ] `app/transformations/page.tsx` — Avant/après
- [ ] `app/avis/page.tsx` — Témoignages
- [ ] `app/contact/page.tsx` — Contact + carte

### 2.4 Responsive & Finitions
- [ ] Mobile (375px)
- [ ] Tablette (768px)
- [ ] Desktop (1280px)
- [ ] Animations / compteurs
- [ ] Loading / error / empty states
- [ ] SEO (metadata, sitemap, robots.txt)

---

## PHASE 3 — Admin Dashboard (Next.js)

### 3.1 Initialisation
- [ ] Projet Next.js admin
- [ ] Auth JWT + middleware
- [ ] `lib/api.ts`

### 3.2 Composants admin
- [ ] `Sidebar.tsx`
- [ ] `Topbar.tsx`
- [ ] `ScheduleEditor.tsx` (drag & drop)
- [ ] `DataTable.tsx`, `Modal.tsx`
- [ ] `FileUpload.tsx`, `RichEditor.tsx`, `StatCard.tsx`

### 3.3 Pages admin
- [ ] `app/login/page.tsx`
- [ ] `app/dashboard/page.tsx` (stats, graphiques)
- [ ] `app/activites/page.tsx` (CRUD)
- [ ] `app/planning/page.tsx` (éditeur visuel)
- [ ] `app/abonnements/page.tsx` (formules + promos)
- [ ] `app/coachs/page.tsx` (CRUD + planning)
- [ ] `app/articles/page.tsx` + `/new` + `/[id]/edit`
- [ ] `app/videos/page.tsx`
- [ ] `app/transformations/page.tsx` (modération)
- [ ] `app/equipements/page.tsx`
- [ ] `app/avis/page.tsx` (modération)
- [ ] `app/contacts/page.tsx`
- [ ] `app/parametres/page.tsx`

---

## PHASE 4 — Docker & Développement Local

- [ ] `docker-compose.yml` (api, frontend, admin, db, redis)
- [ ] `.env.example`
- [ ] `docker compose up --build` fonctionne
- [ ] Migrations + seed OK
- [ ] API : http://localhost:8000/docs
- [ ] Frontend : http://localhost:3000
- [ ] Admin : http://localhost:3001

---

## PHASE 5 — Déploiement Railway

- [ ] Procfile / railway.toml backend
- [ ] Déployer PostgreSQL + Redis
- [ ] Déployer Backend API
- [ ] Déployer Frontend + Admin
- [ ] Variables d'environnement production
- [ ] Domaine personnalisé + Cloudflare
- [ ] Migrations + seed production
- [ ] Test complet production

---

## Notes de Progression

| Date | Action | Détails |
|------|--------|---------|
| — | Projet initialisé | Structure de dossiers créée |

---

## Commandes Utiles

```bash
docker compose up --build
docker compose exec api alembic upgrade head
docker compose exec api alembic revision --autogenerate -m "description"
docker compose exec api python seed.py
docker compose logs -f api
docker compose exec api pytest -v
```

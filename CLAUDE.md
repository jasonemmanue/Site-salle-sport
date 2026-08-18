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

### Logo et icônes

Le logo est le badge rond ESLIE SPORT. Le fichier d'origine
(`scripts/logo-source.png`) est aplati sur un **fond blanc opaque** : posé sur le
bleu nuit du site, ce fond dessinait un cadre clair autour du cercle — visible
dans l'en-tête, le pied de page et l'onglet du navigateur.

`scripts/generer-logo.py` isole le disque et produit tous les formats :

```bash
docker run --rm -v "$PWD:/work" salle-de-sport-api:latest \
    python /work/scripts/generer-logo.py
```

(Pillow vient de l'image de l'API ; aucun outil à installer sur le poste.)

| Fichier | Taille | Fond |
|---------|--------|------|
| `frontend/public/logo.png` | 1024 | transparent |
| `admin/public/logo.png` | 256 | transparent |
| `app/icon.png` | 512 | transparent |
| `app/apple-icon.png` | 180 | bleu nuit `#0F1724` |
| `app/favicon.ico` | 16/32/48/64 | transparent |

**Ne pas retoucher ces fichiers à la main** : relancer le script, qui écrit les
huit d'un coup pour les deux sites.

⚠️ **Le badge d'origine est une ellipse**, 1163 × 1201 — 3 % plus haute que
large. Le script la redresse au carré avant d'appliquer le masque circulaire,
sinon `rounded-full` et les icônes carrées tombent à côté. L'œil ne perçoit pas
la correction.

⚠️ **`apple-icon.png` est le seul à garder un fond.** iOS ignore la transparence
et compose sur du noir : un PNG détouré cerclerait le badge de noir sur l'écran
d'accueil. Le bleu nuit retenu est celui du site, donc le carré ne se voit pas.

⚠️ **Le back-office sert ses images sans optimisation.** `admin/next.config.mjs`
pose `images.unoptimized` : Next 14 en mode `standalone` exige `sharp` pour
optimiser, et il n'est pas installé. D'où le fichier de 256 px côté admin —
livrer les 1024 px ferait télécharger 1,2 Mo pour une vignette de barre latérale.
Le site public, lui, est en Next 16 et optimise normalement.

#### ⚠️ Le logo se référence par import statique, jamais par `/logo.png`

```tsx
import logo from '@/public/logo.png';
<Image src={logo} alt="Eslie Sport" />
```

Remplacer le fichier sans changer son chemin ne suffit pas : l'URL servie par
l'optimiseur (`/_next/image?url=%2Flogo.png&w=640&q=75`) reste identique et
porte un `Cache-Control: public, max-age=14400`. Pendant quatre heures, un
visiteur qui avait déjà chargé cette URL continue de voir **l'ancienne image**.
C'est exactement ce qui s'est produit au passage au logo détouré : le serveur
envoyait le disque transparent, les navigateurs affichaient encore le carré
blanc.

L'import statique fait passer le fichier par le pipeline de Next, qui lui donne
une URL contenant une empreinte de son contenu (`/_next/static/media/logo.<hash>.png`).
Changer le fichier change l'URL : les caches ne peuvent plus se tromper, sans
intervention.

Le filigrane de `globals.css` ne peut pas en profiter — le CSS ne passe pas par
ce pipeline. Son URL porte donc `?v=2`, **à incrémenter à la main** si le
fichier change de nouveau.

**Où le logo apparaît** : en-tête et pied de page du site public, filigrane de
`.watermark`, hero de l'accueil, en-tête de la barre latérale du back-office,
barre supérieure mobile, page de connexion.

#### Hero de l'accueil

Le logo porte déjà le nom de la marque : il **tient lieu de titre d'accueil**.
Le sur-titre « Bienvenue chez Eslie Sport » faisait donc doublon et a été retiré.
Le badge passe de 80 px à `w-52 sm:w-64 md:w-72 lg:w-80` (208 → 320 px) pour que
« ESLIE SPORT » y soit lisible, et le slogan descend de `text-5xl…8xl` à
`text-2xl…5xl` pour lui laisser la vedette sans que la page cesse de tenir dans
un écran.

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

**⚠️ Navigation : la surcharge doit citer la classe réellement posée.**
`[data-theme="light"] nav a` repeint *tous* les liens du header en `#334155`.
La règle qui rend l'onglet actif ne visait que `nav a.text-primary`, alors que
`Header.tsx` marque l'actif avec **`text-accent`** — bureau (ligne 64) comme
menu mobile (ligne 132). La règle générique l'emportait donc et **l'onglet
courant devenait indiscernable en mode clair**, alors qu'il ressort en doré en
mode sombre. Les deux classes sont désormais listées.

La couleur de l'actif est `#8A6D0A` (**4,9:1** sur blanc). L'ancienne valeur
`#B8960A` ne donnait que **2,8:1** — sous le seuil de 4,5:1 pour du texte, ce
qui aggravait le problème. Même valeur que côté admin, voir § Thème de l'admin.

Le CTA « S'inscrire » du menu mobile est un `<a>` dans `<nav>` : la règle
générique lui volait aussi sa couleur, d'où `nav a.gradient-primary { color:
#0F1724 }` (11,2:1 sur le doré).

**Règle générale** : toute surcharge d'état en mode clair doit cibler la classe
que le composant applique vraiment. Un sélecteur qui ne correspond à rien ne
produit aucune erreur — il laisse simplement la règle générique gagner, et le
défaut ne se voit qu'à l'œil, dans un seul thème.

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
│   │   └── views/     # Parties client des pages (filtres, recherche, formulaires)
│   ├── lib/           # api.ts (fetch + mediaUrl + safe), types.ts, sanitize.ts
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
- `enrollments.py` : POST / (public), DELETE /{id}, GET / (registre complet, auth), GET /export.xlsx (auth), POST /{id}/resend (auth), GET /slot/{id}, GET /slot/{id}/availability
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
- `stats.py` : GET `/stats/` (9 indicateurs) et GET `/stats/trends` (4 séries) — auth admin

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
| Recette complète des routes | ✅ | 115 cas passants — voir § Robustesse de l'API |
| Tests automatisés (`backend/tests/`) | ✅ | **341 tests pytest** sur PostgreSQL — voir § Suite de tests |

### Suite de tests de l'API

`backend/tests/` — **341 tests**, lancés en une commande. Ils remplacent la
recette manuelle de 115 cas, qui vivait hors du dépôt et ne rejouait donc rien
après une modification.

```bash
docker compose exec api pip install -r requirements-dev.txt   # une fois
docker compose exec api pytest                                # ~2 min
```

`requirements-dev.txt` est volontairement séparé de `requirements.txt` : pytest
et httpx n'ont rien à faire dans l'image déployée. En dehors de Docker, poser
`TEST_DATABASE_URL` pour viser la base voulue.

| Fichier | Couvre |
|---------|--------|
| `test_infrastructure.py` | `/health`, OpenAPI, en-têtes CORS et préflight |
| `test_auth.py` | connexion, inscription, renouvellement, profil, rôles |
| `test_activities.py` | catalogue, filtres, pagination, slug, suppression douce |
| `test_coaches.py` | fiches coachs, listes JSON, suppression douce |
| `test_schedule.py` | récurrents vs datés, vue hebdomadaire, glisser-déposer |
| `test_enrollments.py` | capacité, liste d'attente, promotion, places par date |
| `test_reservations_export.py` | **renseignements de paiement, recopie Google, export Excel** |
| `test_articles.py` | double lecture anonyme / admin, brouillons, horodatage |
| `test_reviews.py` | **chaîne de modération de bout en bout** |
| `test_catalogue.py` | formules, vidéos, transformations, équipements |
| `test_settings_contact.py` | liste blanche des réglages publics, messages reçus |
| `test_stats_upload.py` | 9 indicateurs, 4 séries, envoi de fichiers |
| `test_regressions.py` | **les six familles de défauts corrigées** |

#### ⚠️ Les tests tournent sur PostgreSQL, pas sur SQLite

C'est délibéré et il ne faut pas « simplifier » vers SQLite. Les garde-fous que
cette suite vérifie existent parce que **PostgreSQL** refuse ce que SQLite
accepte : cast `uuid`, violation de clé étrangère, contrainte `unique`. Sur
SQLite, la suite resterait verte après une régression — elle donnerait une
confiance fausse.

La base de test est une base **dédiée**, `<base>_test`, créée au premier
lancement et dont le schéma est reconstruit à chaque session. Les données de
développement ne sont jamais touchées.

#### ⚠️ Isolation : une transaction annulée par test

Chaque test ouvre une transaction et y greffe la session applicative en
`join_transaction_mode="create_savepoint"` : les `db.commit()` des services
deviennent des relâchements de point de reprise, et le `rollback()` final efface
tout. Aucun ordre de passage à respecter, aucun nettoyage à écrire.

**Seule exception : le compte administrateur**, écrit en dur hors transaction.
Le hachage bcrypt coûte ~0,3 s ; le refaire à chaque test coûterait plus cher
que toute la suite. C'est la seule ligne qui survit d'un test à l'autre — ce qui
permet aux tests de statistiques d'affirmer des valeurs exactes. Son rôle
`admin` l'exclut du comptage des membres.

#### ⚠️ `str(url)` masque le mot de passe

`URL.__str__` de SQLAlchemy rend `postgresql://user:***@…`. La chaîne obtenue ne
se reconnecte pas : `conftest.py` utilise `render_as_string(hide_password=False)`.
Le symptôme était une authentification refusée alors que les identifiants
étaient bons.

#### Ce que la suite fige, au-delà du nominal

- **403 sans en-tête `Authorization`, 401 avec un jeton invalide.** Le premier
  vient de `HTTPBearer`, le second de notre code. Le back-office distingue les
  deux.
- **La connexion attend un formulaire**, pas du JSON, avec un champ `username`.
- **`GET /enrollments/slot/{id}/availability` sans date ne compte personne** :
  la comparaison porte sur `NULL`. Le site public passe toujours la date.
- **Un créneau inconnu y rend 200 avec zéro place**, pas 404 : un badge
  « complet » vaut mieux qu'une erreur sur une page publique.
- **`test_regressions.py` parcourt les 23 routes à identifiant** et exige 422 sur
  un identifiant non-UUID, et jamais de 500 sur un UUID inconnu. Une nouvelle
  route qui oublierait `UUIDStr` tombe ici — à condition de l'ajouter à la liste.
- **Un garde-fou syntaxique** relit les services par arbre syntaxique pour
  interdire toute variable locale nommée `status`.

### PHASE 2 — FRONTEND PUBLIC ✅

| Élément | Statut | Notes |
|---------|--------|-------|
| Header, Footer, Hero | ✅ | Navbar + ThemeToggle + CTA |
| Mode clair/sombre | ✅ | `data-theme` sur `<html>`, anti-flash script |
| Image hero Unsplash | ✅ | Next.js Image + overlay adaptatif |
| Logo | ✅ | Badge circulaire **à fond transparent**, généré par `scripts/generer-logo.py` — voir § Logo et icônes |
| Favicon / icônes | ✅ | Régénérés depuis la même source, disque détouré : `app/favicon.ico` (16/32/48/64), `app/icon.png` (512), `app/apple-icon.png` (180). Identique côté `admin/app/`. Ne pas déclarer `metadata.icons` : les fichiers ont priorité. |
| **Branchement API** | ✅ | **Les 13 pages consomment l'API. Plus aucune donnée factice.** Voir § Branchement du site public. |
| Formulaires publics | ✅ | Contact → `POST /contact/`, inscription cours → `POST /enrollments/`, avis → `POST /reviews/` |

### Branchement du site public sur l'API

Les pages publiques tournaient sur des tableaux `mock*` codés en dur, et les
formulaires simulaient l'envoi avec un `setTimeout`. Tout passe désormais par
`frontend/lib/api.ts`.

#### Architecture retenue

Les pages sont des **composants serveur** qui appellent l'API et passent les
données en props ; seule l'interactivité (filtres, recherche, lecteur vidéo,
formulaires) vit dans des composants client sous `components/views/`. Le HTML
est donc rendu avec le contenu réel — indispensable pour le référencement.

| Page | Source |
|------|--------|
| `/` | activités, planning, formules, coachs, transformations, avis, articles |
| `/activites`, `/activites/[slug]` | `/activities/` + créneaux filtrés par activité |
| `/planning` | `/schedule/` + places restantes par créneau |
| `/abonnements` | `/subscriptions/` — comparatif généré depuis les formules réelles |
| `/coachs`, `/equipements` | `/coaches/`, `/equipment/` |
| `/articles`, `/articles/[slug]` | `/articles/` (publiés uniquement) |
| `/videos`, `/transformations`, `/avis` | `/videos/`, `/transformations/`, `/reviews/` |
| `/contact`, Footer | `/settings/public` |

#### Bas de page — copyright et signature de l'atelier

La barre du bas porte le copyright à gauche et la signature du prestataire à
droite : « Concu et developpe en Cote d'Ivoire — prepaxiasfe@gmail.com ». Elle
s'empile et se centre sous 640 px.

⚠️ **Le lien courriel vise Gmail, pas `mailto:`.** L'adresse pointe sur
`https://mail.google.com/mail/?view=cm&fs=1&to=…`, qui ouvre directement la
fenêtre de rédaction Gmail dans un nouvel onglet. Un `mailto:` classique dépend
du client de messagerie configuré sur le poste du visiteur, et ne fait souvent
rien sur une machine sans client installé. Contrepartie assumée : le visiteur
doit être connecté à un compte Google, sans quoi Gmail lui demande de
s'identifier avant d'afficher le brouillon.

Il n'existe **ni page Mentions légales ni page Confidentialité** : aucun lien
vers elles n'a été posé dans cette barre, pour ne pas produire de 404.

#### ⚠️ Deux URLs d'API, deux points de vue

`NEXT_PUBLIC_API_URL` est figée dans le bundle au build : c'est l'API **telle
que le navigateur la voit** (`http://localhost:8010`). Mais le rendu serveur
s'exécute **dans le conteneur frontend**, où `localhost:8010` ne pointe sur
rien. D'où `API_INTERNAL_URL=http://api:8000`, variable de **runtime** (pas de
rebuild nécessaire), déclarée dans `docker-compose.yml`.

`apiRoot()` dans `lib/api.ts` choisit l'une ou l'autre selon `typeof window`.
En dev local hors Docker, laisser `API_INTERNAL_URL` vide : `NEXT_PUBLIC_API_URL`
sert alors aux deux côtés.

#### ⚠️ Trailing slash obligatoire sur les collections

Les routes de collection sont déclarées `@router.get("/")` : le chemin complet
est donc `/api/v1/activities/` **avec** slash final. L'appeler sans slash
déclenche un 307 — tolérable en GET, cassant en POST cross-origin (le préflight
CORS ne suit pas la redirection). `lib/api.ts` met le slash partout ; les
routes de détail (`/activities/{slug}`) n'en prennent pas.

#### ⚠️ Images : chemins relatifs

Les uploads sont stockés en `/uploads/...` (chemin relatif). `mediaUrl()` les
préfixe par l'URL **publique** de l'API — jamais par `API_INTERNAL_URL`,
invisible depuis le navigateur. Toute nouvelle image issue de l'admin doit
passer par ce helper.

#### ⚠️ Contenu HTML des articles

Le `RichEditor` de l'admin produit du HTML (`contentEditable` → `innerHTML`),
injecté via `dangerouslySetInnerHTML`. C'est une surface XSS stockée : le
contenu est **systématiquement désinfecté** par `lib/sanitize.ts`
(`isomorphic-dompurify`, liste blanche de balises). Sa mise en forme vient des
règles `.article-content` de `globals.css`, pas de `@tailwindcss/typography`
qui n'est pas installé.

#### Dégradation si l'API est indisponible

Chaque appel de page passe par `safe(promise, fallback)` : une API éteinte
renvoie la valeur de repli et la page affiche son état « aucun contenu » au lieu
de retourner une 500. C'est ce qui permet au `next build` de réussir sans
backend démarré.

#### Cache

`fetchApi` utilise `next: { revalidate: 60 }` par défaut. Les lectures
temps réel (places restantes) et toutes les écritures passent en
`cache: 'no-store'`. Une modification dans l'admin apparaît donc sur le site
public en moins d'une minute.

### PHASE 3 — ADMIN DASHBOARD ✅

| Élément | Statut | Notes |
|---------|--------|-------|
| Auth JWT + refresh auto | ✅ | Renouvellement 2min avant expiration |
| Login page | ✅ | Email + mot de passe, vérification rôle admin |
| Sidebar navigation | ✅ | 12 entrées (Dashboard → Paramètres) |
| Dashboard + graphiques | ✅ | 8 StatCards (`/stats/`) + 4 graphiques (`/stats/trends`) — plus aucune donnée factice |
| Activités CRUD | ✅ | DataTable + Modal + FileUpload |
| Planning drag & drop | ✅ | Grille 7j×15h, glisser-déposer, double-clic ajout, toggle grille/liste |
| Abonnements CRUD | ✅ | Prix FCFA, avantages multi-lignes |
| Coachs CRUD | ✅ | Photo FileUpload, certifications/spécialités multi-lignes |
| Articles CRUD | ✅ | RichEditor pour contenu, FileUpload pour couverture |
| Vidéos CRUD | ✅ | URL vidéo + miniature FileUpload |
| Transformations CRUD | ✅ | FileUpload avant/après, mise en avant |
| Équipements CRUD | ✅ | Par zone, FileUpload image |
| Avis modération | ✅ | File filtrable, pastille de la barre latérale — voir § Modération des avis |
| Réservations | ✅ | Registre complet + export Excel — voir § Registre des réservations |
| Contacts | ✅ | Lecture + marquer lu, indicateur non-lu |
| Paramètres | ✅ | 8 clés (nom salle, téléphone, email, adresse, horaires, réseaux sociaux) |
| Thème bi-chrome | ✅ | Contenu en clair via `.admin-content`, Sidebar et `/login` sombres |
| Affichage mobile / tablette | ✅ | Sidebar en tiroir, DataTable en cartes — voir § Adaptation mobile |
| Vérification des formulaires | ✅ | Messages d'informations manquantes sur les 9 formulaires — voir § Vérification des formulaires |

### PHASE 4 — DOCKER ✅

| Élément | Statut | Notes |
|---------|--------|-------|
| docker-compose.yml | ✅ | db, redis, api, frontend, admin — ports hôte décalés (voir § Ports) |
| Dockerfiles | ✅ | Backend, Frontend, Admin (multi-stage, `output: standalone`, user non-root) |
| `.dockerignore` | ✅ | Frontend + Admin — évite de copier le `node_modules` Windows de l'hôte |
| Variables `NEXT_PUBLIC_*` | ✅ | Passées en `build.args` (voir ci-dessous) |

#### ⚠️ Le frontend exige Node 22

`frontend/Dockerfile` est sur **`node:22-alpine`**, l'admin reste sur
`node:20-alpine`. Ce n'est pas une incohérence à corriger : le site public tire
`isomorphic-dompurify` (désinfection du HTML des articles), donc `jsdom@30` et
`undici@8`, qui déclarent tous deux `engines: node ^22.22.2 || ^24.15.0 ||
>=26.0.0`. Sous Node 20, le build échoue en fin de course, à la collecte des
pages :

```
Failed to load external module jsdom: TypeError: webidl.util.markAsUncloneable is not a function
```

L'erreur ne survient qu'après le TypeScript, soit ~4 min de build, et ne
mentionne pas la version de Node — d'où le temps perdu à la diagnostiquer.
L'admin n'a pas cette dépendance ; le remonter n'apporterait rien.

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

### Adaptation mobile et tablette

Le site public était déjà responsive. **Le back-office ne l'était pas du tout** :
il comptait 4 utilisations de breakpoints au total, et sa barre latérale
`fixed w-64` doublée d'un `ml-64` sur le `<main>` mangeait 256 px des 375 px
d'un téléphone — le contenu était poussé hors de l'écran.

#### Le point de bascule est `lg` (1024 px)

Au-dessus, rien ne change : barre latérale fixe, tableaux, grille de planning.
En dessous, la barre devient un **tiroir** et une barre supérieure apparaît.

L'état du tiroir vit dans `app/(admin)/layout.tsx`, qui gère aussi les trois
façons de le refermer : navigation vers une autre page, clic sur le voile,
touche Échap. Il bloque également le défilement du fond pendant l'ouverture.
`Sidebar.tsx` ne fait qu'afficher — il reçoit `open` et `onClose`.

⚠️ **La barre latérale passe en `invisible` quand le tiroir est fermé**, pas
seulement en `-translate-x-full`. Un simple décalage laisserait les douze liens
atteignables au clavier alors qu'ils sont hors de l'écran. `lg:visible` annule
la règle sur grand écran.

⚠️ **La barre supérieure mobile est hors de `.admin-content`.** C'est
volontaire : elle hérite donc du bleu nuit du `body` et reste dans le même
registre que la barre latérale, sans exception à écrire. Même raisonnement que
pour la Sidebar, décrit plus haut.

⚠️ **`min-w-0` sur le `<main>`.** Sans lui, un tableau large étire le conteneur
et fait défiler la page entière au lieu du seul tableau.

#### DataTable : tableau au-dessus de `md`, cartes en dessous

Un tableau de cinq ou six colonnes impose sous 768 px un défilement horizontal
où l'on perd la colonne qui nomme la ligne. Les mêmes `columns` alimentent donc
une carte par enregistrement, chaque valeur précédée de son libellé. **Les 12
pages en bénéficient sans modification** — tout est dans `DataTable.tsx`.

#### Planning : la vue Liste devient le défaut sur petit écran

La grille 7 jours × 15 heures réclame ~900 px, et le glisser-déposer HTML5 ne
répond pas au tactile. Sous `lg`, `viewMode` bascule donc sur `list`, qui expose
les mêmes actions Modifier / Supprimer. La grille reste accessible d'un clic,
avec défilement horizontal.

#### Le reste

Les 12 grilles de formulaire `grid-cols-2` deviennent `grid-cols-1
sm:grid-cols-2` — deux champs côte à côte font 150 px chacun sur un téléphone.
Les 7 en-têtes de page titre + bouton s'empilent sous `sm`. Les marges de la
modale passent de 24 px à 16 px sous `sm`, où elles coûtaient un sixième de la
largeur.

#### Vérification

`scripts/audit-responsive.mjs` pilote Chrome par le protocole DevTools —
Node 22 fournit `WebSocket` en global, donc aucune dépendance. Il parcourt les
11 pages publiques et 7 pages admin en 375 px et 768 px, s'authentifie en
injectant le jeton dans `localStorage`, et relève les débordements horizontaux
avec le nom des éléments fautifs, plus une capture par page.

⚠️ **La sonde ignore ce qui vit dans un conteneur défilable.** Un carrousel ou
un tableau en `overflow-x-auto` dépasse la fenêtre par construction : sans ce
filtre, `TransformationSlider`, `ScheduleGrid` et le comparatif des abonnements
remontaient comme fautifs alors que `scrollWidth` valait exactement
`innerWidth`.

Résultat : **36 combinaisons page × largeur, aucun débordement**. Ouverture du
tiroir, fermeture par le voile et par Échap, et tenue de la modale (351 px dans
une fenêtre de 375 px) vérifiées séparément.

### Vérification des formulaires du back-office

Les neuf formulaires (activités, coachs, abonnements, vidéos, équipements,
transformations, articles, planning, paramètres) refusent l'envoi tant qu'une
information obligatoire manque, et **disent laquelle**.

Avant, ils s'appuyaient sur l'attribut `required` du navigateur pour une partie
des champs seulement, et l'API répondait pour le reste — par un code et un nom de
colonne en anglais.

#### Le mécanisme, identique partout

`admin/lib/validation.ts` fournit les briques (`verifierRequis`,
`verifierNombre`, `estEmail`, `estUrl`, `heureEnMinutes`, `texteBrut`), chaque
page déclare sa fonction `valider(form)`, et `admin/components/FormErrors.tsx`
affiche : un récapitulatif en tête de formulaire, un message sous chaque champ
fautif, une bordure rouge (`.input-error`) et un astérisque au libellé.

```tsx
const valider = (form: Form): Erreurs => { ... };          // règles de la page

useEffect(() => { if (soumis) setErreurs(valider(form)); }, [form, soumis]);

const manques = valider(form);                              // à l'envoi
setErreurs(manques);
if (aDesErreurs(manques)) return;                           // aucun appel API
```

Rien ne s'affiche avant la première tentative d'enregistrement ; ensuite la liste
se vide au fur et à mesure de la saisie. Le `useEffect` évite d'avoir à modifier
les vingt `onChange` de chaque page.

#### ⚠️ Les `required` natifs ont été retirés, les `<form>` portent `noValidate`

Sinon le navigateur interrompt l'envoi **avant** notre code, avec sa propre
bulle, dans sa propre langue, et un seul champ à la fois. Les deux mécanismes ne
cohabitent pas : c'est l'un ou l'autre.

#### Ce qui est exigé, et pourquoi

La règle est : **les colonnes NOT NULL du modèle**, plus les cas où une valeur
vide passe la base mais casse le site public.

| Formulaire | Obligatoire | Au-delà de la base |
|------------|-------------|--------------------|
| Activités | nom, description, catégorie, niveau, durée, capacité | — |
| Coachs | nom | — |
| Abonnements | nom, prix, durée | — |
| Vidéos | titre, URL, catégorie | URL en `http(s)://` |
| Équipements | nom, zone, quantité | — |
| Transformations | nom du membre | **les deux images** : la page publique est un curseur avant/après |
| Articles | titre, contenu | contenu jugé sur le **texte**, pas sur le HTML |
| Planning | activité, coach, début, fin | fin > début ; date exigée si non récurrent |
| Paramètres | nom, téléphone, e-mail, adresse, horaires | e-mail et URL des réseaux vérifiés |

⚠️ **Les champs numériques retombent à `0` quand on les vide** (`+e.target.value`
sur une chaîne vide). Sans minimum, une formule à 0 FCFA ou une activité de durée
nulle partiraient en base sans que personne ne s'en aperçoive : d'où
`verifierNombre`, qui exige au moins 1.

⚠️ **Le contenu d'un article se juge sur son texte brut.** Le `contentEditable`
laisse `<p><br></p>` dès qu'on y clique : sans retirer les balises, un article
visuellement vide passerait pour rédigé.

#### ⚠️ `apiFetch` affichait « [object Object] »

Sur un 422, FastAPI renvoie un **tableau d'objets** dans `detail`, pas une
chaîne : `new Error(err.detail)` produisait « [object Object] » pour toute erreur
de saisie. `messageDErreur()` dans `admin/lib/api.ts` reconstitue désormais
`champ : message`. Les erreurs serveur s'affichent dans le bandeau du formulaire,
plus dans une `alert()` du navigateur.

### Registre des réservations

La salle tenait son registre dans un **formulaire Google** : date, nom, type de
séance, formule de paiement, montant encaissé, coach, remarque. Notre système de
réservation ne demandait qu'une partie de ces informations — il les demande
maintenant toutes, et **recopie chaque réservation dans ce formulaire**.

Le visiteur ne voit jamais le formulaire Google. Il réserve sur le site, comme
avant ; la recopie se fait de serveur à serveur.

#### Ce qui a été ajouté à `enrollments`

| Colonne | Origine |
|---------|---------|
| `session_type` | question « Type de séance » — Individuel / Collectif |
| `payment_type` | question « Type de paiement » — 4 formules |
| `amount_paid` | question « Montant payé » |
| `feedback` | question « Vos avis » |
| `forwarded_to_google` | suivi de la recopie |
| `google_error` | raison du dernier échec |

Toutes **nullables** : les réservations antérieures n'en ont aucune, et il
n'existe pas de valeur par défaut honnête à leur inventer. Côté API elles sont
facultatives — une réservation reste valable sans elles — mais leur absence
empêche la recopie, que le formulaire Google exige.

Le **nom du coach** n'est pas demandé au membre : il vient du créneau réservé.

#### La recopie ne peut jamais faire échouer une réservation

`enrollment_service.recopier_vers_google()` est appelée **après** que la place
est prise et validée. Si Google refuse ou ne répond pas, le visiteur ne voit
aucune erreur : l'échec est noté sur la ligne, la page « Réservations » du
back-office le signale et propose de le rejouer (`POST /enrollments/{id}/resend`).

⚠️ **La date part en une seule valeur `AAAA-MM-JJ`.** La recette officieuse qui
circule décrit un triplet `entry.NNNN_year` / `_month` / `_day` : ce formulaire
le **refuse par un 400**. Vérifié sur le formulaire réel.

⚠️ **Les intitulés des choix doivent être exacts, accents compris.** Envoyer
« Seance » au lieu de « Séance » suffit à faire rejeter tout l'envoi. Les
`Literal` de `schemas.py` et les constantes de `frontend/lib/types.ts` reprennent
ces intitulés mot pour mot — un 422 explicite vaut mieux qu'un 400 de Google.

⚠️ `GOOGLE_FORM_ENABLED=false` coupe la recopie sans rien casser d'autre. C'est
la valeur utilisée par la suite de tests : **aucun test ne poste dans le vrai
formulaire**.

⚠️ Le point d'entrée `formResponse` n'est pas une API publique : Google peut le
changer sans prévenir. D'où le principe ci-dessus — la base locale fait foi.

#### Export Excel

`GET /enrollments/export.xlsx`, réservé à l'admin, produit un vrai `.xlsx`
(openpyxl) : 14 colonnes, en-tête figé, filtre automatique. Un CSV renommé
s'ouvrirait de travers dès qu'une remarque contient une virgule.

Les colonnes aplatissent le créneau — activité, horaire, coach — et traduisent
le statut (`cancelled` → « Annulé ») : le fichier doit se lire sans connaître le
modèle de données.

⚠️ **L'export applique exactement les filtres de la liste.** Période, statut,
formule, type de séance, activité : le fichier téléchargé contient ce que
l'écran affiche, jamais autre chose.

⚠️ **Le téléchargement passe par `fetch`, pas par un lien.** La route exige un
en-tête `Authorization` qu'un `<a href>` ne porte pas — elle répondrait 403.
`telechargerFichier()` dans `admin/lib/api.ts` récupère le fichier, puis
déclenche l'enregistrement depuis un lien temporaire sur le blob obtenu. Le nom
du fichier vient du `Content-Disposition` renvoyé par l'API.

#### La liste du back-office montre aussi les annulations

`GET /enrollments/` sert le registre complet, annulations comprises —
contrairement à `GET /enrollments/slot/{id}`, qui les écarte parce qu'il sert à
compter les places. Un registre ne s'ampute pas de ses lignes barrées.

### Modération des avis

Un avis déposé par un visiteur **n'est visible sur le site public qu'après
approbation d'un administrateur**. Le chemin complet :

1. `POST /reviews/` — sans authentification, depuis `ReviewForm.tsx`. Le service
   force `is_approved=False` ; le schéma `ReviewCreate` ne porte pas ce champ,
   donc un client ne peut pas se publier lui-même. Le visiteur lit « Votre avis
   sera publié après modération ».
2. `GET /reviews/all` — réservé à l'admin, montre la file complète.
3. `PUT /reviews/{id}/approve` — bascule `is_approved`.
4. `GET /reviews/` — public, ne renvoie que les avis approuvés. C'est cette route
   qu'appellent la page `/avis` et l'accueil.

Supprimer un avis le retire **définitivement** de la base (pas de suppression
douce, contrairement aux activités ou aux coachs).

#### Ce que voit l'administrateur

La page `/avis` s'ouvre sur les avis **en attente** et propose trois onglets
comptés — En attente / Publiés / Tous. Le badge d'un avis approuvé dit « Visible
sur le site », pas seulement « Approuvé ».

La barre latérale porte une **pastille orange** sur *Avis* et *Messages*,
alimentée par `pending_reviews` et `unread_contacts` de `GET /stats/`, rechargée
à chaque navigation. Sans elle, rien ne signalait qu'un avis attendait tant qu'on
n'ouvrait pas la page.

⚠️ **Le site public met jusqu'à une minute à refléter une approbation** :
`fetchApi` revalide toutes les 60 s. Ce n'est pas un défaut de la modération.

Les 22 tests de `backend/tests/test_reviews.py` figent cette chaîne, y compris la
tentative de s'auto-publier en envoyant `is_approved: true`.

### Statistiques du tableau de bord

Deux routes, toutes deux réservées à l'admin.

`GET /stats/` renvoie 9 indicateurs instantanés : `total_members`,
`active_subscriptions`, `today_enrollments`, `total_activities`,
`total_coaches`, `unread_contacts`, `pending_reviews`, `fill_rate`,
`monthly_revenue`. Les noms doivent rester alignés avec l'interface
`DashboardStats` de `admin/lib/types.ts` — un écart se traduit par des cartes
vides, sans erreur visible.

`GET /stats/trends` renvoie 4 séries de points `{label, value}` : inscriptions
et taux de remplissage sur la **semaine en cours** (lundi → dimanche), revenu
sur les **6 derniers mois**, et les **5 activités** les plus suivies.

⚠️ **Le revenu par mois est une estimation.** Il n'existe pas de table de
paiements : aucun historique de transactions n'est disponible. La série
reconstitue le revenu récurrent tel qu'il se présentait à la fin de chaque
mois, en sommant le prix des formules des membres actifs inscrits à cette date.
Les résiliations passées n'étant pas traçables, **la courbe ne peut que
croître**. Une table de paiements serait nécessaire pour un revenu réel.

⚠️ Le palmarès des activités utilise des **jointures externes** : une activité
sans aucune inscription reste présente avec la valeur 0. Sans cela, un
catalogue neuf produirait un graphique vide.

⚠️ L'API renvoie des **FCFA bruts** ; c'est le dashboard qui divise par 1000
pour son axe « x1000 FCFA ».

### Routes à double lecture (anonyme / admin)

`get_optional_user` (dans `core/dependencies.py`) identifie l'appelant si un
jeton valide est fourni, et renvoie `None` sinon — sans lever de 401. Il repose
sur un `HTTPBearer(auto_error=False)`. Un jeton invalide est traité comme une
absence de jeton.

Cela permet à une même URL de servir deux publics :

| Route | Visiteur anonyme | Admin authentifié |
|-------|------------------|-------------------|
| `GET /articles/` | publiés uniquement, **quel que soit `?status=`** | `?status` respecté ; sans filtre, publiés **+ brouillons** |
| `GET /settings/public` | 8 clés en liste blanche | idem |
| `GET /settings/` | 403 | toutes les clés |

⚠️ Sans le garde-fou sur `?status=`, `GET /articles/?status=draft` exposait les
brouillons publiquement. Et symétriquement, l'admin — qui n'envoie pas de
`status` — ne voyait jamais ses propres brouillons dans sa liste.

⚠️ `GET /settings/` reste réservé à l'admin. Le site public lit
`GET /settings/public`, dont la liste blanche est `PUBLIC_SETTING_KEYS` dans
`settings_service.py`. **Une nouvelle clé de paramètre n'est pas publique par
défaut** : il faut l'ajouter explicitement à cette liste.

### Robustesse de l'API — codes d'erreur et pièges

Toutes les routes ont été testées une à une (108 cas : nominal, authentification,
identifiants inconnus, identifiants malformés, validation, CORS). Les quatre
familles de défauts ci-dessous renvoyaient un **500** au lieu du code attendu.

#### ⚠️ Les identifiants sont des colonnes `uuid` PostgreSQL

Une chaîne qui n'est pas un UUID partait telle quelle dans la requête SQL et
PostgreSQL levait `invalid input syntax for type uuid` — soit un 500 sur un
simple `GET /coaches/nimportequoi`.

Le type `UUIDStr` de **`app/core/validators.py`** valide en amont et rend un
**422**. Il est posé sur tous les paramètres de chemin `{id}` des 11 fichiers de
routes, et sur les clés étrangères des schémas d'entrée (`activity_id`,
`coach_id`, `slot_id`).

**Toute nouvelle route prenant un identifiant doit le typer `UUIDStr`, jamais
`str`.**

#### ⚠️ Les clés étrangères doivent être vérifiées avant l'insertion

`POST /enrollments/` avec un `slot_id` inconnu, `POST`/`PUT /schedule/` avec un
`activity_id`/`coach_id` inconnu : la `ForeignKeyViolation` remontait en 500.

`enrollment_service.enroll()` et `schedule_service._check_references()`
contrôlent désormais l'existence des références et lèvent un **404**.

#### ⚠️ Les slugs sont uniques et dérivés d'un champ libre

Le slug d'une activité vient de son `name`, celui d'un article de son `title`,
et la colonne porte une contrainte `unique`. **Publier deux articles au même
titre, ou renommer une activité vers un nom déjà pris, plantait l'admin en
500.**

`app/services/slug_service.py` centralise `slugify()` et `unique_slug()`, qui
suffixe `-2`, `-3`… jusqu'à trouver un slug libre. Son paramètre `exclude_id`
écarte la ligne en cours de modification : réenregistrer une activité sans
changer son nom ne doit pas la suffixer elle-même.

Les anciens `_slugify()` dupliqués dans `activity_service.py` et
`article_service.py` ont été supprimés au profit de ce module.

#### ⚠️ `subfolder` de l'upload — traversée de répertoire

`POST /upload/?subfolder=../../../tmp/evil` écrivait réellement le fichier hors
de `/app/uploads`. Le paramètre est maintenant restreint à **un seul segment**
`[A-Za-z0-9_-]{1,64}` (`SUBFOLDER_PATTERN` dans `media_service.py`), ce qui
interdit de fait `..`, les séparateurs de chemin et les chemins absolus.
`delete_file()` — encore non câblée à une route — vérifie de la même façon que
le chemin résolu reste sous `UPLOAD_DIR`.

#### ⚠️ Un `null` explicite sur un champ obligatoire

Les schémas `*Update` déclarent tous leurs champs `X | None = None` pour les
rendre facultatifs. `model_dump(exclude_unset=True)` distingue bien « champ
absent » de « champ à `null` », mais rien n'empêchait le second de partir en
base : `PUT /activities/{id}` avec `{"name": null}` levait une violation NOT
NULL, soit un 500. Le cas est atteignable depuis les formulaires de l'admin.

`reject_null_on_required(Model, update_data)` — dans `app/core/validators.py` —
lit la nullabilité réelle des colonnes SQLAlchemy et rend un **422**. Les huit
services de mise à jour l'appellent avant d'affecter les champs.

Mettre à `null` reste permis sur les colonnes nullables : vider la photo d'un
coach ou la date d'un créneau ponctuel continue de fonctionner. **Tout nouveau
service de mise à jour doit appeler ce garde-fou.**

#### ⚠️ Ne jamais nommer une variable locale `status`

`enrollment_service.enroll()` faisait `status = "enrolled" if …`, ce qui masque
le module `status` importé de FastAPI **sur toute la fonction** : référencer
`status.HTTP_404_NOT_FOUND` plus haut levait un `UnboundLocalError`. La variable
s'appelle `statut`. Le piège vaut pour tout service qui importe `status`.

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

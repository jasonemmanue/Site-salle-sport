import Link from 'next/link';
import Hero from '@/components/Hero';
import SectionTitle from '@/components/SectionTitle';
import ActivityCard from '@/components/ActivityCard';
import SubscriptionCard from '@/components/SubscriptionCard';
import CoachCard from '@/components/CoachCard';
import TransformationSlider from '@/components/TransformationSlider';
import ReviewCard from '@/components/ReviewCard';
import BMICalculator from '@/components/BMICalculator';
import ArticleCard from '@/components/ArticleCard';
import ScheduleGrid from '@/components/ScheduleGrid';
import type { Activity, Subscription, Coach, Transformation, Review, Article } from '@/lib/types';

/* ──────────────────────── Mock Data ──────────────────────── */

const mockActivities: Activity[] = [
  {
    id: '1',
    name: 'Musculation',
    slug: 'musculation',
    description: 'Renforcez votre masse musculaire avec nos equipements de pointe et nos programmes personnalises.',
    category: 'force',
    level: 'all',
    duration_minutes: 60,
    max_capacity: 20,
    image_url: '',
    is_active: true,
    order: 1,
  },
  {
    id: '2',
    name: 'HIIT Cardio',
    slug: 'hiit-cardio',
    description: 'Entrainement fractionne haute intensite pour bruler un maximum de calories en un minimum de temps.',
    category: 'cardio',
    level: 'intermediate',
    duration_minutes: 45,
    max_capacity: 15,
    image_url: '',
    is_active: true,
    order: 2,
  },
  {
    id: '3',
    name: 'Yoga Vinyasa',
    slug: 'yoga-vinyasa',
    description: 'Fluidite, souplesse et serenite. Enchainements dynamiques pour equilibrer corps et esprit.',
    category: 'flexibility',
    level: 'beginner',
    duration_minutes: 60,
    max_capacity: 12,
    image_url: '',
    is_active: true,
    order: 3,
  },
  {
    id: '4',
    name: 'Boxe Anglaise',
    slug: 'boxe-anglaise',
    description: 'Apprenez les techniques de boxe, ameliorez votre endurance et votre confiance en vous.',
    category: 'martial_arts',
    level: 'all',
    duration_minutes: 60,
    max_capacity: 16,
    image_url: '',
    is_active: true,
    order: 4,
  },
  {
    id: '5',
    name: 'Zumba Fitness',
    slug: 'zumba-fitness',
    description: 'Dansez, bougez, amusez-vous ! Un cours energique sur des rythmes latinos entrainants.',
    category: 'dance',
    level: 'beginner',
    duration_minutes: 45,
    max_capacity: 25,
    image_url: '',
    is_active: true,
    order: 5,
  },
  {
    id: '6',
    name: 'CrossFit',
    slug: 'crossfit',
    description: 'Depassez vos limites avec des WOD intenses combinant halterophilie, gym et cardio.',
    category: 'force',
    level: 'advanced',
    duration_minutes: 60,
    max_capacity: 12,
    image_url: '',
    is_active: true,
    order: 6,
  },
];

const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Basic',
    price: 29,
    duration_months: 1,
    features: [
      'Acces salle de musculation',
      'Vestiaires et douches',
      'Horaires : 8h - 20h',
      'Application mobile',
    ],
    is_active: true,
    order: 1,
  },
  {
    id: '2',
    name: 'Premium',
    price: 49,
    duration_months: 1,
    features: [
      'Acces illimite 7j/7',
      'Tous les cours collectifs',
      'Programme personnalise',
      'Suivi nutritionnel',
      'Casier personnel',
    ],
    is_active: true,
    order: 2,
  },
  {
    id: '3',
    name: 'Elite',
    price: 79,
    duration_months: 1,
    features: [
      'Tout le Premium inclus',
      'Coach personnel dedie',
      'Acces espace VIP',
      'Seances de cryotherapie',
      'Bilan corporel mensuel',
      'Invite gratuit 2x / mois',
    ],
    is_active: true,
    order: 3,
  },
];

const mockCoaches: Coach[] = [
  {
    id: '1',
    name: 'Marc Dupont',
    photo_url: '',
    certifications: ['BPJEPS Force', 'Certification CrossFit L2'],
    specialties: ['Musculation', 'CrossFit', 'Halterophilie'],
    bio: 'Passionne de force athletique depuis 12 ans, Marc accompagne ses eleves vers la performance et le depassement de soi.',
    is_active: true,
    order: 1,
  },
  {
    id: '2',
    name: 'Sophie Martin',
    photo_url: '',
    certifications: ['Diplome Yoga Alliance RYT-500', 'Formation Pilates'],
    specialties: ['Yoga', 'Pilates', 'Meditation'],
    bio: 'Sophie allie douceur et exigence pour vous guider vers un equilibre entre force et souplesse interieure.',
    is_active: true,
    order: 2,
  },
  {
    id: '3',
    name: 'Lucas Bernard',
    photo_url: '',
    certifications: ['CQP Instructeur Fitness', 'Les Mills BODYCOMBAT'],
    specialties: ['HIIT', 'Cardio', 'Boxe'],
    bio: 'Ancien sportif de haut niveau, Lucas vous pousse a repousser vos limites dans une ambiance motivante.',
    is_active: true,
    order: 3,
  },
  {
    id: '4',
    name: 'Camille Leroy',
    photo_url: '',
    certifications: ['Diplome EAT Danse', 'Instructrice Zumba Certifiee'],
    specialties: ['Zumba', 'Danse', 'Stretching'],
    bio: 'Avec Camille, chaque cours est une fete ! Sa joie de vivre et son energie sont communicatives.',
    is_active: true,
    order: 4,
  },
];

const mockTransformations: Transformation[] = [
  {
    id: '1',
    member_name: 'Julien Moreau',
    before_image_url: '',
    after_image_url: '',
    testimonial: 'En 6 mois, j\'ai perdu 15 kg et gagne en confiance. Le suivi des coachs a tout change pour moi.',
    duration_text: '6 mois',
    is_featured: true,
    is_published: true,
    created_at: '2025-01-15',
  },
  {
    id: '2',
    member_name: 'Marie Blanc',
    before_image_url: '',
    after_image_url: '',
    testimonial: 'Apres ma grossesse, FitnessPro m\'a aidee a retrouver la forme avec un programme adapte et bienveillant.',
    duration_text: '8 mois',
    is_featured: true,
    is_published: true,
    created_at: '2025-02-20',
  },
  {
    id: '3',
    member_name: 'Thomas Petit',
    before_image_url: '',
    after_image_url: '',
    testimonial: 'De debutant complet a 3 seances par semaine. Le CrossFit avec Marc a transforme mon physique et mon mental.',
    duration_text: '1 an',
    is_featured: true,
    is_published: true,
    created_at: '2024-11-10',
  },
  {
    id: '4',
    member_name: 'Amina Diallo',
    before_image_url: '',
    after_image_url: '',
    testimonial: 'J\'ai gagne en muscle et en assurance. Les cours collectifs m\'ont aussi permis de rencontrer des gens formidables.',
    duration_text: '4 mois',
    is_featured: true,
    is_published: true,
    created_at: '2025-03-05',
  },
];

const mockReviews: Review[] = [
  {
    id: '1',
    author_name: 'Alexandre Faure',
    rating: 5,
    comment: 'Meilleure salle de la region ! Les coachs sont attentifs, les equipements impeccables et l\'ambiance est au top. Je recommande a 100%.',
    is_approved: true,
    created_at: '2025-04-12',
  },
  {
    id: '2',
    author_name: 'Nadia Benali',
    rating: 5,
    comment: 'Je cherchais une salle avec des cours de yoga de qualite et j\'ai trouve bien plus que ca. L\'espace est magnifique et l\'equipe exceptionnelle.',
    is_approved: true,
    created_at: '2025-03-28',
  },
  {
    id: '3',
    author_name: 'Pierre Lambert',
    rating: 4,
    comment: 'Super salle, tres bien equipee. Les cours de HIIT sont intenses et les resultats sont la. Seul bemol : un peu de monde aux heures de pointe.',
    is_approved: true,
    created_at: '2025-05-02',
  },
];

const mockArticles: Article[] = [
  {
    id: '1',
    title: '5 Exercices Incontournables pour Sculpter vos Abdominaux',
    slug: '5-exercices-abdominaux',
    content: 'Decouvrez les meilleurs exercices pour travailler vos abdominaux en profondeur. Du crunch classique au gainage dynamique, ces mouvements vous aideront a obtenir un ventre tonique et dessine.',
    excerpt: 'Les meilleurs mouvements pour un ventre tonique et dessine, adaptes a tous les niveaux.',
    cover_image_url: '',
    status: 'published',
    published_at: '2025-06-15',
    author_id: '1',
  },
  {
    id: '2',
    title: 'Nutrition Sportive : Que Manger Avant et Apres l\'Entrainement',
    slug: 'nutrition-sportive-avant-apres',
    content: 'L\'alimentation est la cle de la performance. Apprenez a optimiser vos repas autour de vos seances pour maximiser vos resultats et votre recuperation.',
    excerpt: 'Optimisez vos repas pour de meilleures performances et une recuperation optimale.',
    cover_image_url: '',
    status: 'published',
    published_at: '2025-06-08',
    author_id: '2',
  },
  {
    id: '3',
    title: 'Les Bienfaits du Yoga sur la Performance Sportive',
    slug: 'bienfaits-yoga-performance',
    content: 'Le yoga n\'est pas reserve aux debutants ou aux personnes cherchant la relaxation. Decouvrez comment la pratique reguliere du yoga peut ameliorer vos performances dans toutes les disciplines.',
    excerpt: 'Comment le yoga ameliore flexibilite, concentration et recuperation chez les sportifs.',
    cover_image_url: '',
    status: 'published',
    published_at: '2025-05-25',
    author_id: '2',
  },
];

/* ──────────────────────── Page ──────────────────────── */

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <Hero />

      {/* ── Activites ── */}
      <section className="py-24 bg-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Nos Activites"
            subtitle="Des programmes varies pour tous les niveaux et tous les objectifs."
            accent
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/activites"
              className="inline-flex items-center gap-2 border-2 border-white/20 px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-wider text-white transition-all hover:border-primary hover:text-primary"
            >
              Voir toutes les activites
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Planning Preview ── */}
      <section className="py-24 bg-dark-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Planning de la Semaine"
            subtitle="Consultez nos cours et reservez votre creneau en un clic."
          />
          <div className="glass rounded-2xl p-6 sm:p-8">
            <ScheduleGrid />
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/planning"
              className="inline-flex items-center gap-2 gradient-primary px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-wider text-white transition-transform hover:scale-105"
            >
              Voir le planning complet
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Abonnements ── */}
      <section className="py-24 bg-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Nos Formules"
            subtitle="Choisissez l'abonnement qui correspond a vos ambitions."
            accent
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {mockSubscriptions.map((sub) => (
              <SubscriptionCard
                key={sub.id}
                subscription={sub}
                popular={sub.name === 'Premium'}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Coachs ── */}
      <section className="py-24 bg-dark-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Nos Coachs"
            subtitle="Une equipe de professionnels certifies, passionnes et a votre ecoute."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockCoaches.map((coach) => (
              <CoachCard key={coach.id} coach={coach} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Transformations ── */}
      <section className="py-24 bg-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Transformations"
            subtitle="Decouvrez les resultats impressionnants de nos membres."
            accent
          />
          <div className="max-w-3xl mx-auto">
            <TransformationSlider transformations={mockTransformations} />
          </div>
        </div>
      </section>

      {/* ── Temoignages ── */}
      <section className="py-24 bg-dark-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Temoignages"
            subtitle="Ce que nos membres disent de leur experience chez FitnessPro."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {mockReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Calculateur IMC ── */}
      <section className="py-24 bg-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Calculateur IMC"
            subtitle="Evaluez votre Indice de Masse Corporelle en quelques secondes."
            accent
          />
          <div className="max-w-lg mx-auto">
            <BMICalculator />
          </div>
        </div>
      </section>

      {/* ── Articles Recents ── */}
      <section className="py-24 bg-dark-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Articles Recents"
            subtitle="Conseils, astuces et actualites pour optimiser votre entrainement."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="relative py-24 overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(225,29,72,0.2) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(249,115,22,0.15) 0%, transparent 50%), linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-gradient">
            Pret a commencer ?
          </h2>
          <p className="mt-6 text-lg text-dark-muted max-w-2xl mx-auto leading-relaxed">
            Rejoignez plus de 500 membres actifs et commencez votre transformation des aujourd'hui. Premier cours d'essai offert !
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/abonnements"
              className="gradient-primary px-10 py-4 rounded-lg text-base font-bold uppercase tracking-wider text-white transition-transform hover:scale-105 animate-pulse-glow"
            >
              Choisir mon abonnement
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white/20 px-10 py-4 rounded-lg text-base font-bold uppercase tracking-wider text-white transition-all hover:border-primary hover:text-primary"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

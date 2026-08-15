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
import {
  getActivities,
  getArticles,
  getCoaches,
  getReviews,
  getSchedule,
  getSubscriptions,
  getTransformations,
  safe,
} from '@/lib/api';

export default async function HomePage() {
  // Toutes les sections proviennent de l'API. Chaque appel est protege par
  // safe() : si l'API est injoignable, la section concernee disparait au lieu
  // de faire tomber la page d'accueil entiere.
  const [activities, slots, subscriptions, coaches, transformations, reviews, articlesPage] =
    await Promise.all([
      safe(getActivities(), []),
      safe(getSchedule(), []),
      safe(getSubscriptions(), []),
      safe(getCoaches(), []),
      safe(getTransformations(true), []),
      safe(getReviews(), []),
      safe(getArticles(1, 3), { items: [], total: 0, page: 1, pages: 0 }),
    ]);

  const featuredActivities = activities.slice(0, 6);
  const featuredCoaches = coaches.slice(0, 4);
  const featuredReviews = reviews.slice(0, 3);
  const recentArticles = articlesPage.items.slice(0, 3);
  const popularId = subscriptions.find((s) => s.duration_months >= 1)?.id;

  return (
    <>
      {/* ── Hero ── */}
      <Hero />

      {/* ── Activites ── */}
      {featuredActivities.length > 0 && (
        <section className="py-24 bg-dark">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              title="Nos Activites"
              subtitle="Des programmes varies pour tous les niveaux et tous les objectifs."
              accent
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredActivities.map((activity) => (
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
      )}

      {/* ── Planning Preview ── */}
      {slots.length > 0 && (
        <section className="py-24 bg-dark-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              title="Planning de la Semaine"
              subtitle="Consultez nos cours et reservez votre creneau en un clic."
            />
            <div className="glass rounded-2xl p-6 sm:p-8">
              <ScheduleGrid slots={slots} />
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/planning"
                className="inline-flex items-center gap-2 gradient-primary px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-wider text-black transition-transform hover:scale-105"
              >
                Voir le planning complet
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Abonnements ── */}
      {subscriptions.length > 0 && (
        <section className="py-24 bg-dark">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              title="Nos Formules"
              subtitle="Choisissez l'abonnement qui correspond a vos ambitions."
              accent
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {subscriptions.slice(0, 3).map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  popular={sub.id === popularId}
                />
              ))}
            </div>
            {subscriptions.length > 3 && (
              <div className="mt-10 text-center">
                <Link
                  href="/abonnements"
                  className="inline-flex items-center gap-2 border-2 border-white/20 px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-wider text-white transition-all hover:border-primary hover:text-primary"
                >
                  Comparer toutes les formules
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Coachs ── */}
      {featuredCoaches.length > 0 && (
        <section className="py-24 bg-dark-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              title="Nos Coachs"
              subtitle="Une equipe de professionnels certifies, passionnes et a votre ecoute."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCoaches.map((coach) => (
                <CoachCard key={coach.id} coach={coach} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Transformations ── */}
      {transformations.length > 0 && (
        <section className="py-24 bg-dark">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              title="Transformations"
              subtitle="Decouvrez les resultats impressionnants de nos membres."
              accent
            />
            <div className="max-w-3xl mx-auto">
              <TransformationSlider transformations={transformations} />
            </div>
          </div>
        </section>
      )}

      {/* ── Temoignages ── */}
      {featuredReviews.length > 0 && (
        <section className="py-24 bg-dark-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              title="Temoignages"
              subtitle="Ce que nos membres disent de leur experience chez Eslie Sport."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {featuredReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/avis"
                className="inline-flex items-center gap-2 border-2 border-white/20 px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-wider text-white transition-all hover:border-primary hover:text-primary"
              >
                Lire tous les avis
              </Link>
            </div>
          </div>
        </section>
      )}

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
      {recentArticles.length > 0 && (
        <section className="py-24 bg-dark-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              title="Articles Recents"
              subtitle="Conseils, astuces et actualites pour optimiser votre entrainement."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Final ── */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0 hero-gradient"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 60%), linear-gradient(180deg, #000000 0%, #0a0a0a 50%, #000000 100%)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-gradient">
            Pret a commencer ?
          </h2>
          <p className="mt-6 text-lg text-dark-muted max-w-2xl mx-auto leading-relaxed">
            Rejoignez la communaute Eslie Sport et commencez votre transformation des aujourd&apos;hui.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/abonnements"
              className="gradient-primary px-10 py-4 rounded-lg text-base font-bold uppercase tracking-wider text-black transition-transform hover:scale-105 animate-pulse-glow"
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

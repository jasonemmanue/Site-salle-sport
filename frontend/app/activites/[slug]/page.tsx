import Link from 'next/link';
import { notFound } from 'next/navigation';
import SectionTitle from '@/components/SectionTitle';
import ActivityCard from '@/components/ActivityCard';
import { ApiError, getActivities, getActivity, getSchedule, mediaUrl, safe } from '@/lib/api';
import type { Activity } from '@/lib/types';

const categoryLabels: Record<string, string> = {
  force: 'Force',
  cardio: 'Cardio',
  flexibility: 'Souplesse',
  martial_arts: 'Arts Martiaux',
  dance: 'Danse',
};

const levelLabels: Record<string, string> = {
  beginner: 'Debutant',
  intermediate: 'Intermediaire',
  advanced: 'Avance',
  all: 'Tous niveaux',
};

const dayLabels = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

/**
 * Un slug absent doit rendre un vrai 404, pas se rabattre silencieusement sur
 * une autre activite. Les autres erreurs (API injoignable) remontent, Next.js
 * affiche alors sa page d'erreur plutot qu'un contenu faux.
 */
async function loadActivity(slug: string): Promise<Activity> {
  try {
    return await getActivity(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const activity = await safe(getActivity(slug), null);
  if (!activity) return { title: 'Activite | Eslie Sport' };
  return {
    title: `${activity.name} | Eslie Sport`,
    description: activity.description?.slice(0, 160) || `Decouvrez ${activity.name} chez Eslie Sport.`,
  };
}

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const activity = await loadActivity(slug);

  const [allSlots, allActivities] = await Promise.all([
    safe(getSchedule(), []),
    safe(getActivities(), []),
  ]);

  const slots = allSlots
    .filter((s) => s.activity_id === activity.id)
    .sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time));

  const related = allActivities
    .filter((a) => a.id !== activity.id && a.category === activity.category)
    .slice(0, 3);

  const categoryGradients: Record<string, string> = {
    force: 'rgba(255,255,255,0.05)',
    cardio: 'rgba(255,255,255,0.04)',
    flexibility: 'rgba(255,255,255,0.03)',
    martial_arts: 'rgba(255,255,255,0.04)',
    dance: 'rgba(255,255,255,0.05)',
  };

  return (
    <>
      {/* ── Hero Banner ── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 hero-gradient"
          style={{
            background: `radial-gradient(ellipse at 40% 50%, ${categoryGradients[activity.category] || categoryGradients.force} 0%, transparent 50%), linear-gradient(180deg, #000000 0%, #0a0a0a 60%, #000000 100%)`,
          }}
        />
        {activity.image_url && (
          <>
            <img
              src={mediaUrl(activity.image_url)}
              alt={activity.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 hero-overlay" />
          </>
        )}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-dark-muted">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/activites" className="hover:text-white transition-colors">Activites</Link>
            <span>/</span>
            <span className="text-primary">{activity.name}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="gradient-primary rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider text-black">
              {categoryLabels[activity.category] ?? activity.category}
            </span>
            <span className="border border-secondary/30 text-secondary rounded-full px-4 py-1 text-xs font-bold">
              {levelLabels[activity.level] ?? activity.level}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-white">
            {activity.name}
          </h1>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="py-16 bg-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main content */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-white mb-4">A propos de cette activite</h2>
              <p className="text-dark-muted leading-relaxed text-base whitespace-pre-line">
                {activity.description || 'La description de cette activite sera bientot disponible.'}
              </p>

              {/* Creneaux reels issus du planning */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-white mb-6">Creneaux disponibles</h2>
                {slots.length > 0 ? (
                  <div className="space-y-3">
                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-dark-border bg-dark-card p-4 transition-all hover:border-primary/30"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[60px]">
                            <p className="text-lg font-bold text-white">{slot.start_time}</p>
                            <p className="text-xs text-dark-muted">{slot.end_time}</p>
                          </div>
                          <div className="h-10 w-px bg-dark-border" />
                          <div>
                            <p className="text-sm font-semibold text-white">{dayLabels[slot.day_of_week]}</p>
                            <p className="text-xs text-dark-muted">Coach : {slot.coach?.name || 'A definir'}</p>
                          </div>
                        </div>
                        <Link
                          href="/planning"
                          className="mt-3 sm:mt-0 inline-flex items-center justify-center rounded-lg gradient-primary px-5 py-2 text-xs font-bold uppercase tracking-wider text-black transition-transform hover:scale-105"
                        >
                          Reserver
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dark-border bg-dark-card p-8 text-center">
                    <p className="text-dark-muted">
                      Aucun creneau n'est programme pour cette activite pour le moment.
                    </p>
                    <Link href="/contact" className="mt-3 inline-block text-primary font-semibold text-sm hover:underline">
                      Contactez-nous pour en savoir plus
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="rounded-2xl border border-dark-border bg-dark-card p-6 sticky top-24">
                <h3 className="text-lg font-bold text-white mb-6">Informations cles</h3>
                <ul className="space-y-5">
                  <li className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-dark-muted">Duree</p>
                      <p className="text-sm font-semibold text-white">{activity.duration_minutes} minutes</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                      <svg className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-dark-muted">Capacite</p>
                      <p className="text-sm font-semibold text-white">{activity.max_capacity} personnes</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-dark-muted">Niveau</p>
                      <p className="text-sm font-semibold text-white">{levelLabels[activity.level] ?? activity.level}</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                      <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-dark-muted">Categorie</p>
                      <p className="text-sm font-semibold text-white">{categoryLabels[activity.category] ?? activity.category}</p>
                    </div>
                  </li>
                </ul>

                <Link
                  href="/planning"
                  className="mt-8 block text-center gradient-primary py-3.5 rounded-lg text-sm font-bold uppercase tracking-wider text-black transition-transform hover:scale-105 animate-pulse-glow"
                >
                  Reserver un creneau
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Related Activities ── */}
      {related.length > 0 && (
        <section className="py-20 bg-dark-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              title="Activites Similaires"
              subtitle="Explorez d'autres activites dans la meme categorie."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((a) => (
                <ActivityCard key={a.id} activity={a} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

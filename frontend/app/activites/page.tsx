import ActivitiesView from '@/components/views/ActivitiesView';
import { getActivities, safe } from '@/lib/api';

export const metadata = {
  title: 'Activites | Eslie Sport',
  description:
    'Musculation, fitness, zumba, kick boxing, wushu — decouvrez toutes les activites encadrees par nos coachs a Abidjan.',
};

export default async function ActivitesPage() {
  const activities = await safe(getActivities(), []);

  return (
    <>
      {/* ── Hero Banner ── */}
      <section className="watermark relative pt-32 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 hero-gradient"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 60%), linear-gradient(180deg, #000000 0%, #0a0a0a 50%, #000000 100%)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold mb-4">
            Decouvrez
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-gradient">
            Nos Activites
          </h1>
          <p className="mt-4 text-lg text-dark-muted max-w-2xl mx-auto">
            Des programmes varies et encadres par des professionnels pour atteindre tous vos objectifs fitness.
          </p>
        </div>
      </section>

      {/* ── Filters + Grid ── */}
      <section className="py-16 bg-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ActivitiesView activities={activities} />
        </div>
      </section>
    </>
  );
}

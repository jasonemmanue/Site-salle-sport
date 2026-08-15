import SectionTitle from '@/components/SectionTitle';
import CoachCard from '@/components/CoachCard';
import { getCoaches, safe } from '@/lib/api';

export const metadata = {
  title: 'Nos Coachs | Eslie Sport',
  description: 'Decouvrez notre equipe de coachs certifies et passionnes, prets a vous accompagner vers vos objectifs.',
};

/* ──────────────────────── Page ──────────────────────── */

export default async function CoachsPage() {
  const coaches = await safe(getCoaches(), []);

  return (
    <>
      {/* ── Hero Banner ── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 hero-gradient"
          style={{
            background:
              'radial-gradient(ellipse at 40% 50%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(255,255,255,0.03) 0%, transparent 50%), linear-gradient(180deg, #000000 0%, #0a0a0a 60%, #000000 100%)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold mb-4">
            L'equipe
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-gradient">
            Nos Coachs
          </h1>
          <p className="mt-4 text-lg text-dark-muted max-w-2xl mx-auto">
            Des professionnels certifies, passionnes et a votre ecoute pour vous accompagner vers vos objectifs.
          </p>
        </div>
      </section>

      {/* ── Coaches Grid ── */}
      <section className="py-16 bg-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {coaches.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {coaches.map((coach) => (
                <CoachCard key={coach.id} coach={coach} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dark-border bg-dark-card p-16 text-center">
              <p className="text-dark-muted text-lg">
                La presentation de notre equipe arrive tres bientot.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Coaching Philosophy ── */}
      <section className="py-20 bg-dark-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Notre Philosophie"
            subtitle="Ce qui nous differencie, c'est l'humain au coeur de chaque seance."
            accent
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Value 1 */}
            <div className="glass rounded-2xl p-8 text-center transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
                <svg className="h-7 w-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Expertise Certifiee</h3>
              <p className="text-sm text-dark-muted leading-relaxed">
                Tous nos coachs sont diplomes d'Etat ou certifies par des organismes reconnus. Formation continue garantie.
              </p>
            </div>

            {/* Value 2 */}
            <div className="glass rounded-2xl p-8 text-center transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
                <svg className="h-7 w-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Suivi Personnalise</h3>
              <p className="text-sm text-dark-muted leading-relaxed">
                Chaque membre est unique. Nos coachs adaptent les exercices, l'intensite et les conseils a votre profil et vos objectifs.
              </p>
            </div>

            {/* Value 3 */}
            <div className="glass rounded-2xl p-8 text-center transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
                <svg className="h-7 w-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Passion & Bienveillance</h3>
              <p className="text-sm text-dark-muted leading-relaxed">
                Plus que des entraineurs, nos coachs sont des mentors. Ils vous motivent, vous ecoutent et celebrent vos progres avec vous.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

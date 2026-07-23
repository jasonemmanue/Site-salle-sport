import ScheduleGrid from '@/components/ScheduleGrid';
import SectionTitle from '@/components/SectionTitle';

export const metadata = {
  title: 'Planning | FitnessPro',
  description: 'Consultez le planning hebdomadaire de nos cours collectifs et reservez votre creneau.',
};

export default function PlanningPage() {
  return (
    <>
      {/* ── Hero Banner ── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.12) 0%, transparent 50%), linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 60%, #0a0a0a 100%)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold mb-4">
            Organisez votre semaine
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-gradient">
            Planning des Cours
          </h1>
          <p className="mt-4 text-lg text-dark-muted max-w-2xl mx-auto">
            Retrouvez l'ensemble de nos cours collectifs, filtrez par jour et reservez votre place directement en ligne.
          </p>
        </div>
      </section>

      {/* ── Schedule Grid ── */}
      <section className="py-16 bg-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Legend */}
          <div className="mb-10 glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Legende des categories
            </h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm text-dark-muted">Force</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-orange-500" />
                <span className="text-sm text-dark-muted">Cardio</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm text-dark-muted">Souplesse</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-purple-500" />
                <span className="text-sm text-dark-muted">Arts Martiaux</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-pink-500" />
                <span className="text-sm text-dark-muted">Danse</span>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="glass rounded-2xl p-6 sm:p-8">
            <ScheduleGrid />
          </div>

          {/* Info box */}
          <div className="mt-10 rounded-2xl border border-dark-border bg-dark-card p-6 sm:p-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Comment s'inscrire a un cours ?
            </h3>
            <ol className="space-y-3 text-sm text-dark-muted">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full gradient-primary text-xs font-bold text-white">1</span>
                <span>Selectionnez le jour qui vous interesse dans les onglets ci-dessus.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full gradient-primary text-xs font-bold text-white">2</span>
                <span>Cliquez sur le creneau de votre choix pour voir les details et la disponibilite.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full gradient-primary text-xs font-bold text-white">3</span>
                <span>Remplissez le formulaire d'inscription avec vos coordonnees.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full gradient-primary text-xs font-bold text-white">4</span>
                <span>Vous recevrez une confirmation par email. Presentez-vous 10 minutes avant le debut du cours.</span>
              </li>
            </ol>
          </div>
        </div>
      </section>
    </>
  );
}

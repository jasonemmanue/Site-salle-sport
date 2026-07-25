import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      {/* Decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-secondary/5 blur-3xl" />
        <div className="absolute top-1/3 right-1/3 h-32 w-32 rounded-full bg-accent/5 blur-2xl" />
      </div>

      <div className="relative">
        {/* Dumbbell icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl glass">
          <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h1.5m15 0H21m-18 9h1.5m15 0H21M6 12h12M6 7.5v9m12-9v9M9 7.5v9m6-9v9M4.5 7.5h1v9h-1a1.5 1.5 0 01-1.5-1.5v-6A1.5 1.5 0 014.5 7.5zm15 0h1a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 01-1.5 1.5h-1v-9z" />
          </svg>
        </div>

        {/* 404 */}
        <h1 className="text-8xl sm:text-9xl font-black tracking-tighter">
          <span className="text-gradient">404</span>
        </h1>

        <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-white">
          Page non trouvee
        </h2>

        <p className="mt-3 text-dark-muted max-w-md mx-auto">
          Oups ! Il semble que cette page ait quitte la salle. Pas de panique, retournez a l&apos;accueil pour reprendre l&apos;entrainement.
        </p>

        {/* CTA */}
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl gradient-primary px-8 py-3.5 text-sm font-bold text-black transition-all hover:shadow-lg hover:shadow-white/10 hover:scale-105"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Retour a l&apos;accueil
        </Link>

        {/* Decorative fitness icons row */}
        <div className="mt-12 flex items-center justify-center gap-6 text-dark-border">
          {/* Heart rate */}
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          {/* Lightning */}
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          {/* Fire */}
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
          </svg>
          {/* Trophy */}
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.896m5.25-6.388V2.72" />
          </svg>
        </div>
      </div>
    </div>
  );
}

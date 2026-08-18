'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  const closeNav = useCallback(() => setNavOpen(false), []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Le tiroir couvre l'ecran sur mobile : naviguer doit le refermer.
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNavOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navOpen]);

  // Empeche le fond de defiler derriere le tiroir ouvert.
  useEffect(() => {
    if (!navOpen) return;
    const precedent = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = precedent;
    };
  }, [navOpen]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="animate-pulse text-primary">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar open={navOpen} onClose={closeNav} />

      {/* `lg:ml-64` degage la place de la barre laterale, qui est en position
          fixe. En dessous de `lg` elle devient un tiroir : aucune marge. */}
      <div className="flex min-h-screen flex-col lg:ml-64">
        {/* Barre superieure mobile. Hors de `.admin-content`, elle garde donc
            le bleu nuit du body — meme registre que la barre laterale. */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-dark-border bg-dark-card px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={navOpen}
            className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg transition-colors hover:bg-dark-lighter"
          >
            <span className="block h-0.5 w-5 bg-secondary" />
            <span className="block h-0.5 w-5 bg-secondary" />
            <span className="block h-0.5 w-5 bg-secondary" />
          </button>
          <Image src="/logo.png" alt="" width={96} height={96} className="h-8 w-8 shrink-0" />
          <span className="text-base font-black tracking-wider">
            <span className="text-primary">ESLIE</span>
            <span className="text-secondary"> ADMIN</span>
          </span>
        </header>

        {/* `min-w-0` : sans lui, un tableau large etire le conteneur et fait
            defiler la page entiere au lieu du seul tableau. */}
        <main className="admin-content min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

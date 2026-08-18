'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import type { DashboardStats } from '@/lib/types';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/activites', label: 'Activites', icon: '🏋️' },
  { href: '/planning', label: 'Planning', icon: '📅' },
  { href: '/abonnements', label: 'Abonnements', icon: '💳' },
  { href: '/coachs', label: 'Coachs', icon: '👨‍🏫' },
  { href: '/articles', label: 'Articles', icon: '📝' },
  { href: '/videos', label: 'Videos', icon: '🎬' },
  { href: '/transformations', label: 'Transformations', icon: '💪' },
  { href: '/equipements', label: 'Equipements', icon: '🔧' },
  { href: '/avis', label: 'Avis', icon: '⭐' },
  { href: '/contacts', label: 'Messages', icon: '📩' },
  { href: '/parametres', label: 'Parametres', icon: '⚙️' },
];

interface SidebarProps {
  /** Etat du tiroir sous 1024px. Au-dessus, la barre est toujours visible. */
  open: boolean;
  onClose: () => void;
}

/**
 * Barre laterale fixe a partir de `lg`, tiroir coulissant en dessous.
 *
 * L'etat vit dans le layout, qui gere aussi la fermeture au changement de
 * page, la touche Echap et le blocage du defilement de fond.
 *
 * `invisible` quand le tiroir est ferme : sans cela les douze liens restent
 * accessibles au clavier alors qu'ils sont hors de l'ecran. `lg:visible`
 * annule la regle sur grand ecran.
 */
export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, token, logout } = useAuth();
  const [enAttente, setEnAttente] = useState({ avis: 0, messages: 0 });

  // Un avis depose par un visiteur reste invisible sur le site public tant
  // que personne ne l'approuve. Sans ce compteur, rien ne signale qu'il y a
  // quelque chose a traiter tant qu'on n'ouvre pas la page Avis.
  // Recharge a chaque navigation : approuver un avis fait retomber le compteur.
  useEffect(() => {
    if (!token) return;
    apiFetch<DashboardStats>('/api/v1/stats/', { token })
      .then((stats) => setEnAttente({ avis: stats.pending_reviews, messages: stats.unread_contacts }))
      .catch(() => {});
  }, [token, pathname]);

  const compteur = (href: string) =>
    href === '/avis' ? enAttente.avis : href === '/contacts' ? enAttente.messages : 0;

  return (
    <>
      {/* Voile — mobile et tablette uniquement */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        aria-label="Navigation principale"
        className={`fixed left-0 top-0 z-50 flex h-full w-72 max-w-[85vw] flex-col border-r border-dark-border bg-dark-card transition-[transform,visibility] duration-300 lg:w-64 lg:translate-x-0 lg:visible ${
          open ? 'visible translate-x-0' : 'invisible -translate-x-full'
        }`}
      >
        {/* En-tete */}
        <div className="flex items-start justify-between gap-2 border-b border-dark-border p-5 sm:p-6">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/logo.png"
              alt=""
              width={128}
              height={128}
              className="h-11 w-11 shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-xl font-black tracking-wider">
                <span className="text-primary">ESLIE</span>
                <span className="text-secondary"> ADMIN</span>
              </h1>
              {user && (
                <p className="mt-1 truncate text-xs text-dark-muted">{user.email}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
            className="-mr-1 -mt-1 shrink-0 rounded-lg p-2 text-2xl leading-none text-dark-muted transition-colors hover:bg-dark-lighter hover:text-white lg:hidden"
          >
            &times;
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-secondary hover:bg-dark-lighter hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {compteur(item.href) > 0 && (
                  <span
                    className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white"
                    aria-label={`${compteur(item.href)} en attente`}
                  >
                    {compteur(item.href)}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Deconnexion */}
        <div className="border-t border-dark-border p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
          >
            <span className="text-lg">🚪</span>
            Deconnexion
          </button>
        </div>
      </aside>
    </>
  );
}

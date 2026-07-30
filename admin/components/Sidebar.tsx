'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

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

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-dark-card border-r border-dark-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-dark-border">
        <h1 className="text-xl font-black tracking-wider">
          <span className="text-primary">ESLIE</span>
          <span className="text-secondary"> ADMIN</span>
        </h1>
        {user && (
          <p className="text-xs text-dark-muted mt-1 truncate">{user.email}</p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
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
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-dark-border">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <span className="text-lg">🚪</span>
          Deconnexion
        </button>
      </div>
    </aside>
  );
}

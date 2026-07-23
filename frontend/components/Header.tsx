'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/activites', label: 'Activites' },
  { href: '/planning', label: 'Planning' },
  { href: '/abonnements', label: 'Abonnements' },
  { href: '/coachs', label: 'Coachs' },
  { href: '/articles', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 text-2xl font-black tracking-wider">
            FITNESS<span className="text-primary">PRO</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold uppercase tracking-wide transition-colors hover:text-primary ${
                    isActive ? 'text-primary' : 'text-white/80'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-4">
            <Link
              href="/abonnements"
              className="hidden sm:inline-flex gradient-primary px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider text-white transition-transform hover:scale-105 animate-pulse-glow"
            >
              S&apos;inscrire
            </Link>

            {/* Hamburger */}
            <button
              type="button"
              className="lg:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              <span
                className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
                  mobileOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
                  mobileOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
                  mobileOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? 'max-h-screen' : 'max-h-0'
        }`}
      >
        <nav className="glass border-t border-white/10 px-4 py-6 space-y-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-colors ${
                  isActive
                    ? 'bg-primary/20 text-primary'
                    : 'text-white/80 hover:bg-white/5 hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/abonnements"
            className="block mt-4 gradient-primary text-center px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider text-white"
          >
            S&apos;inscrire
          </Link>
        </nav>
      </div>
    </header>
  );
}

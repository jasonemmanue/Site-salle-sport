'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

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
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Eslie Sport" width={44} height={44} className="rounded-full" />
            <span className="text-xl font-black tracking-wider">
              <span className="text-accent">ESLIE</span><span className="text-secondary"> SPORT</span>
            </span>
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
                  className={`text-sm font-semibold uppercase tracking-wide transition-colors hover:text-accent ${
                    isActive ? 'text-accent' : 'text-secondary'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* CTA + theme toggle + hamburger */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link
              href="/abonnements"
              className="hidden sm:inline-flex gradient-primary px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider text-dark transition-transform hover:scale-105 animate-pulse-glow"
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
                className={`block h-0.5 w-6 bg-secondary transition-all duration-300 ${
                  mobileOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-secondary transition-all duration-300 ${
                  mobileOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-secondary transition-all duration-300 ${
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
        <nav className="glass border-t border-accent/10 px-4 py-6 space-y-1">
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
                    ? 'bg-accent/15 text-accent'
                    : 'text-secondary hover:bg-accent/5 hover:text-accent'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/abonnements"
            className="block mt-4 gradient-primary text-center px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider text-dark"
          >
            S&apos;inscrire
          </Link>
        </nav>
      </div>
    </header>
  );
}

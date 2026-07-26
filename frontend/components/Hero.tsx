'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface CounterProps {
  end: number;
  suffix: string;
  label: string;
  delay: number;
}

function AnimatedCounter({ end, suffix, label, delay }: CounterProps) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [started, end]);

  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-black text-gradient animate-count-up">
        {count}{suffix}
      </div>
      <div className="mt-1 text-sm text-dark-muted uppercase tracking-wider">{label}</div>
    </div>
  );
}

const stats = [
  { end: 500, suffix: '+', label: 'Membres', delay: 0 },
  { end: 50, suffix: '+', label: 'Cours / Semaine', delay: 200 },
  { end: 15, suffix: '', label: 'Coachs', delay: 400 },
  { end: 10, suffix: ' ans', label: "d'Experience", delay: 600 },
];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background: gym photo + dark overlay */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80"
          alt="Salle de sport moderne avec equipements"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 hero-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center pt-20">
        <div className="animate-fade-in-up">
          <p className="text-sm sm:text-base uppercase tracking-[0.3em] text-primary font-semibold mb-6">
            Bienvenue chez FitnessPro
          </p>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.95]">
            <span className="text-gradient">Depassez</span>
            <br />
            <span className="text-white">Vos Limites</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-dark-muted max-w-2xl mx-auto leading-relaxed">
            Equipements haut de gamme, coachs certifies et programmes
            personnalises. Rejoignez la communaute FitnessPro et transformez
            votre vie.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/abonnements"
              className="gradient-primary px-8 py-4 rounded-lg text-base font-bold uppercase tracking-wider text-black transition-transform hover:scale-105 animate-pulse-glow"
            >
              Commencer maintenant
            </Link>
            <Link
              href="/activites"
              className="border-2 border-white/20 px-8 py-4 rounded-lg text-base font-bold uppercase tracking-wider text-white transition-all hover:border-primary hover:text-primary"
            >
              Voir nos activites
            </Link>
          </div>
        </div>

        {/* Stats counters */}
        <div
          className="mt-20 mb-10 grid grid-cols-2 md:grid-cols-4 gap-8 glass rounded-2xl px-8 py-10 max-w-4xl mx-auto"
          style={{ animationDelay: '0.4s' }}
        >
          {stats.map((stat) => (
            <AnimatedCounter key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark to-transparent" />
    </section>
  );
}

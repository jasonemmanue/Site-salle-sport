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
      <div className="text-3xl sm:text-4xl font-black text-accent animate-count-up">
        {count}{suffix}
      </div>
      <div className="mt-1 text-sm text-secondary uppercase tracking-wider">{label}</div>
    </div>
  );
}

const stats = [
  { end: 200, suffix: '+', label: 'Membres', delay: 0 },
  { end: 15, suffix: '+', label: 'Cours / Semaine', delay: 200 },
  { end: 5, suffix: '', label: 'Coachs', delay: 400 },
  { end: 7, suffix: 'j/7', label: 'Ouvert', delay: 600 },
];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background: gym photo + overlay */}
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

      {/* Plus de filigrane ici : le badge est desormais affiche en grand au
          premier plan, et sa copie a 4 % d'opacite juste derriere brouillait
          l'image au lieu de meubler. Le filigrane du pied de page reste. */}

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center pt-20">
        <div className="animate-fade-in-up">
          {/* Le logo porte le nom de la marque : il tient lieu de titre d'accueil,
              d'ou sa taille et l'absence de sur-titre au-dessus du slogan. */}
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="Eslie Sport"
              width={512}
              height={512}
              priority
              className="h-auto w-52 drop-shadow-[0_10px_30px_rgba(0,0,0,0.45)] sm:w-64 md:w-72 lg:w-80"
            />
          </div>

          <h1 className="mt-8 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase leading-[1.1] tracking-tight">
            <span className="text-gradient">Parce que le corps</span>
            <br />
            <span className="text-white">a besoin de <span className="text-accent">sport</span></span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
            Equipements de qualite, coachs passionnes et programmes
            personnalises. Rejoignez la communaute Eslie Sport et transformez
            votre vie.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/abonnements"
              className="gradient-primary px-8 py-4 rounded-lg text-base font-bold uppercase tracking-wider text-dark transition-transform hover:scale-105 animate-pulse-glow"
            >
              Commencer maintenant
            </Link>
            <Link
              href="/activites"
              className="border-2 border-secondary/30 px-8 py-4 rounded-lg text-base font-bold uppercase tracking-wider text-secondary transition-all hover:border-accent hover:text-accent"
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

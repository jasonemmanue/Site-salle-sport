'use client';

import { useState } from 'react';
import SectionTitle from '@/components/SectionTitle';
import ActivityCard from '@/components/ActivityCard';
import type { Activity, ActivityCategory, ActivityLevel } from '@/lib/types';

/* ──────────────────────── Mock Data ──────────────────────── */

const mockActivities: Activity[] = [
  {
    id: '1',
    name: 'Musculation',
    slug: 'musculation',
    description: 'Renforcez votre masse musculaire avec nos equipements de pointe et nos programmes adaptes a chaque niveau.',
    category: 'force',
    level: 'all',
    duration_minutes: 60,
    max_capacity: 20,
    image_url: '',
    is_active: true,
    order: 1,
  },
  {
    id: '2',
    name: 'HIIT Cardio',
    slug: 'hiit-cardio',
    description: 'Entrainement fractionne haute intensite pour bruler un maximum de calories en un minimum de temps.',
    category: 'cardio',
    level: 'intermediate',
    duration_minutes: 45,
    max_capacity: 15,
    image_url: '',
    is_active: true,
    order: 2,
  },
  {
    id: '3',
    name: 'Yoga Vinyasa',
    slug: 'yoga-vinyasa',
    description: 'Fluidite, souplesse et serenite. Enchainements dynamiques pour equilibrer corps et esprit.',
    category: 'flexibility',
    level: 'beginner',
    duration_minutes: 60,
    max_capacity: 12,
    image_url: '',
    is_active: true,
    order: 3,
  },
  {
    id: '4',
    name: 'Boxe Anglaise',
    slug: 'boxe-anglaise',
    description: 'Apprenez les techniques de boxe, ameliorez votre endurance et developpez votre confiance en vous.',
    category: 'martial_arts',
    level: 'all',
    duration_minutes: 60,
    max_capacity: 16,
    image_url: '',
    is_active: true,
    order: 4,
  },
  {
    id: '5',
    name: 'Zumba Fitness',
    slug: 'zumba-fitness',
    description: 'Dansez, bougez, amusez-vous ! Un cours energique sur des rythmes latinos entrainants.',
    category: 'dance',
    level: 'beginner',
    duration_minutes: 45,
    max_capacity: 25,
    image_url: '',
    is_active: true,
    order: 5,
  },
  {
    id: '6',
    name: 'CrossFit',
    slug: 'crossfit',
    description: 'Depassez vos limites avec des WOD intenses combinant halterophilie, gymnastique et cardio.',
    category: 'force',
    level: 'advanced',
    duration_minutes: 60,
    max_capacity: 12,
    image_url: '',
    is_active: true,
    order: 6,
  },
  {
    id: '7',
    name: 'Pilates Reformer',
    slug: 'pilates-reformer',
    description: 'Travaillez en profondeur vos muscles stabilisateurs sur machine Reformer pour un corps tonique et aligne.',
    category: 'flexibility',
    level: 'intermediate',
    duration_minutes: 50,
    max_capacity: 10,
    image_url: '',
    is_active: true,
    order: 7,
  },
  {
    id: '8',
    name: 'Spinning',
    slug: 'spinning',
    description: 'Pedalez au rythme de la musique dans une ambiance immersive. Ideal pour bruler des graisses.',
    category: 'cardio',
    level: 'intermediate',
    duration_minutes: 45,
    max_capacity: 20,
    image_url: '',
    is_active: true,
    order: 8,
  },
  {
    id: '9',
    name: 'Kickboxing',
    slug: 'kickboxing',
    description: 'Combinaison de coups de poing et de pied pour un entrainement complet alliant technique et cardio.',
    category: 'martial_arts',
    level: 'intermediate',
    duration_minutes: 60,
    max_capacity: 14,
    image_url: '',
    is_active: true,
    order: 9,
  },
  {
    id: '10',
    name: 'Danse Contemporaine',
    slug: 'danse-contemporaine',
    description: 'Exprimez-vous a travers le mouvement. Un cours artistique qui melange technique et creativite.',
    category: 'dance',
    level: 'all',
    duration_minutes: 60,
    max_capacity: 18,
    image_url: '',
    is_active: true,
    order: 10,
  },
  {
    id: '11',
    name: 'Circuit Training',
    slug: 'circuit-training',
    description: 'Enchainement d\'ateliers varies pour travailler force, endurance et agilite en un seul cours.',
    category: 'cardio',
    level: 'all',
    duration_minutes: 50,
    max_capacity: 16,
    image_url: '',
    is_active: true,
    order: 11,
  },
  {
    id: '12',
    name: 'Halterophilie',
    slug: 'halterophilie',
    description: 'Maitrisez l\'arrache et l\'epaule-jete avec un encadrement technique rigoureux et progressif.',
    category: 'force',
    level: 'advanced',
    duration_minutes: 75,
    max_capacity: 8,
    image_url: '',
    is_active: true,
    order: 12,
  },
];

/* ──────────────────────── Filters Config ──────────────────────── */

const categories: { value: ActivityCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'force', label: 'Force' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Souplesse' },
  { value: 'martial_arts', label: 'Arts Martiaux' },
  { value: 'dance', label: 'Danse' },
];

const levels: { value: ActivityLevel | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'beginner', label: 'Debutant' },
  { value: 'intermediate', label: 'Intermediaire' },
  { value: 'advanced', label: 'Avance' },
];

/* ──────────────────────── Page ──────────────────────── */

export default function ActivitesPage() {
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<ActivityLevel | 'all'>('all');

  const filtered = mockActivities.filter((a) => {
    const catOk = selectedCategory === 'all' || a.category === selectedCategory;
    const lvlOk = selectedLevel === 'all' || a.level === selectedLevel || a.level === 'all';
    return catOk && lvlOk;
  });

  return (
    <>
      {/* ── Hero Banner ── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 30% 50%, rgba(225,29,72,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(59,130,246,0.1) 0%, transparent 50%), linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 60%, #0a0a0a 100%)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold mb-4">
            Decouvrez
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-gradient">
            Nos Activites
          </h1>
          <p className="mt-4 text-lg text-dark-muted max-w-2xl mx-auto">
            Des programmes varies et encadres par des professionnels pour atteindre tous vos objectifs fitness.
          </p>
        </div>
      </section>

      {/* ── Filters + Grid ── */}
      <section className="py-16 bg-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Category filters */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-dark-muted uppercase tracking-wider mb-3">
              Categorie
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    selectedCategory === cat.value
                      ? 'gradient-primary text-white shadow-lg shadow-primary/30'
                      : 'border border-dark-border bg-dark-card text-dark-muted hover:border-primary/40 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Level filters */}
          <div className="mb-10">
            <p className="text-sm font-semibold text-dark-muted uppercase tracking-wider mb-3">
              Niveau
            </p>
            <div className="flex flex-wrap gap-2">
              {levels.map((lvl) => (
                <button
                  key={lvl.value}
                  onClick={() => setSelectedLevel(lvl.value)}
                  className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    selectedLevel === lvl.value
                      ? 'bg-secondary text-white shadow-lg shadow-secondary/30'
                      : 'border border-dark-border bg-dark-card text-dark-muted hover:border-secondary/40 hover:text-white'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <p className="mb-6 text-sm text-dark-muted">
            {filtered.length} activite{filtered.length > 1 ? 's' : ''} trouvee{filtered.length > 1 ? 's' : ''}
          </p>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dark-border bg-dark-card p-16 text-center">
              <svg className="mx-auto h-12 w-12 text-dark-border mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <p className="text-dark-muted text-lg">Aucune activite ne correspond a vos criteres.</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedLevel('all');
                }}
                className="mt-4 text-primary font-semibold text-sm hover:underline"
              >
                Reinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

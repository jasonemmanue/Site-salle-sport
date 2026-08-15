'use client';

import { useState } from 'react';
import ActivityCard from '@/components/ActivityCard';
import type { Activity, ActivityCategory, ActivityLevel } from '@/lib/types';

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

export default function ActivitiesView({ activities }: { activities: Activity[] }) {
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<ActivityLevel | 'all'>('all');

  const filtered = activities.filter((a) => {
    const catOk = selectedCategory === 'all' || a.category === selectedCategory;
    const lvlOk = selectedLevel === 'all' || a.level === selectedLevel || a.level === 'all';
    return catOk && lvlOk;
  });

  // Catalogue vide : la salle n'a encore rien publie depuis l'admin.
  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-dark-border bg-dark-card p-16 text-center">
        <svg className="mx-auto h-12 w-12 text-dark-border mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <p className="text-dark-muted text-lg">Nos activites seront publiees tres prochainement.</p>
      </div>
    );
  }

  return (
    <>
      {/* Category filters */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-secondary-light uppercase tracking-wider mb-3">
          Categorie
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                selectedCategory === cat.value
                  ? 'gradient-primary text-black shadow-lg shadow-primary/30'
                  : 'border border-dark-border bg-dark-card text-secondary-light hover:border-primary/40 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Level filters */}
      <div className="mb-10">
        <p className="text-sm font-semibold text-secondary-light uppercase tracking-wider mb-3">
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
                  : 'border border-dark-border bg-dark-card text-secondary-light hover:border-secondary/40 hover:text-white'
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
    </>
  );
}

import Link from 'next/link';
import type { Activity, ActivityCategory } from '@/lib/types';

interface ActivityCardProps {
  activity: Activity;
}

const categoryColors: Record<ActivityCategory, string> = {
  force: 'bg-white',
  cardio: 'bg-white/80',
  flexibility: 'bg-white/60',
  martial_arts: 'bg-white/70',
  dance: 'bg-white/90',
};

const categoryLabels: Record<ActivityCategory, string> = {
  force: 'Force',
  cardio: 'Cardio',
  flexibility: 'Souplesse',
  martial_arts: 'Arts martiaux',
  dance: 'Danse',
};

const levelLabels: Record<string, string> = {
  beginner: 'Debutant',
  intermediate: 'Intermediaire',
  advanced: 'Avance',
  all: 'Tous niveaux',
};

export default function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <Link
      href={`/activites/${activity.slug}`}
      className="group relative block rounded-xl overflow-hidden bg-dark-card border border-dark-border transition-all duration-300 hover:scale-[1.03] hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
    >
      {/* Image placeholder with gradient */}
      <div className="relative h-52 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${
              activity.category === 'force'
                ? '#1a1a1a, #111111'
                : activity.category === 'cardio'
                ? '#1f1f1f, #0f0f0f'
                : activity.category === 'flexibility'
                ? '#181818, #0d0d0d'
                : activity.category === 'martial_arts'
                ? '#1c1c1c, #0e0e0e'
                : '#171717, #0b0b0b'
            })`,
          }}
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category badge */}
        <span
          className={`absolute top-3 left-3 ${categoryColors[activity.category]} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-black`}
        >
          {categoryLabels[activity.category]}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
          {activity.name}
        </h3>

        <div className="mt-3 flex items-center gap-3">
          {/* Level badge */}
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-secondary border border-secondary/30 rounded-full px-2.5 py-0.5">
            {levelLabels[activity.level] ?? activity.level}
          </span>

          {/* Duration */}
          <span className="text-xs text-dark-muted flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {activity.duration_minutes} min
          </span>
        </div>

        {activity.description && (
          <p className="mt-3 text-sm text-dark-muted line-clamp-2">
            {activity.description}
          </p>
        )}
      </div>
    </Link>
  );
}

import Link from 'next/link';
import type { Activity, ActivityCategory } from '@/lib/types';

interface ActivityCardProps {
  activity: Activity;
}

const categoryColors: Record<ActivityCategory, string> = {
  force: 'bg-red-600',
  cardio: 'bg-orange-500',
  flexibility: 'bg-emerald-500',
  martial_arts: 'bg-violet-600',
  dance: 'bg-pink-500',
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
                ? '#991b1b, #7f1d1d'
                : activity.category === 'cardio'
                ? '#9a3412, #7c2d12'
                : activity.category === 'flexibility'
                ? '#065f46, #064e3b'
                : activity.category === 'martial_arts'
                ? '#5b21b6, #4c1d95'
                : '#9d174d, #831843'
            })`,
          }}
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category badge */}
        <span
          className={`absolute top-3 left-3 ${categoryColors[activity.category]} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white`}
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

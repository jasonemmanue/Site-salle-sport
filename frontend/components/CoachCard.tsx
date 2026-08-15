import { mediaUrl } from '@/lib/api';
import type { Coach } from '@/lib/types';

interface CoachCardProps {
  coach: Coach;
}

export default function CoachCard({ coach }: CoachCardProps) {
  return (
    <div className="group relative rounded-xl overflow-hidden bg-dark-card border border-dark-border transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      {/* Photo du coach, ou initiales si l'admin n'en a pas televerse */}
      <div className="relative h-72 overflow-hidden flex items-center justify-center">
        <div
          className="absolute inset-0 card-gradient"
          style={{
            background:
              'radial-gradient(circle at 50% 40%, #0a0a0a 0%, #000000 100%)',
          }}
        />
        {coach.photo_url ? (
          <img
            src={mediaUrl(coach.photo_url)}
            alt={coach.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="relative w-32 h-32 rounded-full gradient-primary flex items-center justify-center text-4xl font-black text-black select-none">
            {coach.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </div>
        )}

        {/* Hover overlay with bio */}
        {coach.bio && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-sm text-white/90 text-center leading-relaxed line-clamp-6">
              {coach.bio}
            </p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
          {coach.name}
        </h3>

        {/* Specialties */}
        {coach.specialties.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {coach.specialties.map((spec) => (
              <span
                key={spec}
                className="text-xs font-semibold text-accent bg-accent/10 border border-accent/20 rounded-full px-2.5 py-0.5"
              >
                {spec}
              </span>
            ))}
          </div>
        )}

        {/* Certifications */}
        {coach.certifications.length > 0 && (
          <div className="mt-3">
            <p className="text-xs uppercase tracking-wider text-dark-muted mb-1.5">Certifications</p>
            <ul className="space-y-1">
              {coach.certifications.map((cert) => (
                <li key={cert} className="text-xs text-white/70 flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-primary shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {cert}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

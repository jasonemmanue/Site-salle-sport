import type { Subscription } from '@/lib/types';
import Link from 'next/link';

interface SubscriptionCardProps {
  subscription: Subscription;
  popular?: boolean;
}

export default function SubscriptionCard({
  subscription,
  popular = false,
}: SubscriptionCardProps) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
        popular
          ? 'bg-dark-card border-2 border-primary shadow-lg shadow-primary/20'
          : 'glass border border-dark-border hover:border-primary/40'
      }`}
    >
      {/* Popular badge */}
      {popular && (
        <div className="gradient-primary text-center py-2 text-xs font-bold uppercase tracking-widest text-black">
          Populaire
        </div>
      )}

      <div className="p-8">
        {/* Plan name */}
        <h3 className="text-lg font-bold uppercase tracking-wider text-white">
          {subscription.name}
        </h3>

        {/* Price */}
        <div className="mt-4 flex items-baseline gap-2">
          <span className={`text-4xl font-black ${popular ? 'text-gradient' : 'text-white'}`}>
            {subscription.price.toLocaleString('fr-FR')}
          </span>
          <span className="text-dark-muted text-sm">
            FCFA{subscription.duration_months === 1 ? ' / mois' : subscription.duration_months === 0 ? '' : ` / ${subscription.duration_months} mois`}
          </span>
        </div>

        {/* Features */}
        <ul className="mt-8 space-y-4">
          {subscription.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm">
              <svg
                className={`w-5 h-5 shrink-0 mt-0.5 ${popular ? 'text-primary' : 'text-secondary'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-white/80">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href="/contact"
          className={`mt-8 block text-center py-3.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
            popular
              ? 'gradient-primary text-black hover:scale-105 animate-pulse-glow'
              : 'border-2 border-white/20 text-white hover:border-primary hover:text-primary'
          }`}
        >
          Choisir ce plan
        </Link>
      </div>
    </div>
  );
}

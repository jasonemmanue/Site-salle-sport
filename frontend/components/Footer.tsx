import Link from 'next/link';
import Image from 'next/image';
import { getSettings, safe } from '@/lib/api';

const quickLinks = [
  { href: '/activites', label: 'Activites' },
  { href: '/planning', label: 'Planning' },
  { href: '/abonnements', label: 'Abonnements' },
  { href: '/coachs', label: 'Nos Coachs' },
  { href: '/articles', label: 'Blog Fitness' },
  { href: '/contact', label: 'Contact' },
];

const socialIcons: Record<string, { label: string; path: string }> = {
  facebook_url: {
    label: 'Facebook',
    path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
  instagram_url: {
    label: 'Instagram',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  },
  youtube_url: {
    label: 'YouTube',
    path: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
};

export default async function Footer() {
  // Coordonnees et reseaux sociaux proviennent des parametres edites dans
  // l'admin : les modifier ne demande plus de toucher au code.
  const settings = await safe(getSettings(), {});

  const gymName = settings.gym_name || 'Eslie Sport';
  const socials = Object.entries(socialIcons)
    .map(([key, icon]) => ({ ...icon, url: settings[key] }))
    .filter((s) => s.url);

  return (
    <footer className="relative bg-dark-card border-t border-dark-border">
      {/* Gradient top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <Image src="/logo.png" alt="" width={400} height={400} className="opacity-[0.03]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt={gymName} width={36} height={36} className="rounded-full" />
              <span className="text-xl font-black tracking-wider">
                <span className="text-accent">ESLIE</span><span className="text-secondary"> SPORT</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-dark-muted">
              Parce que le corps a besoin de sport. Des equipements de qualite,
              des coachs passionnes et une communaute motivante pour vous
              accompagner vers vos objectifs.
            </p>

            {/* Reseaux sociaux — seuls ceux renseignes dans l'admin apparaissent */}
            {socials.length > 0 && (
              <div className="mt-6 flex gap-4">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="text-dark-muted hover:text-accent transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-accent">Liens Rapides</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-dark-muted hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-accent">Horaires</h3>
            <p className="text-sm text-white whitespace-pre-line">
              {settings.opening_hours || 'Nous contacter pour connaitre nos horaires.'}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-accent">Contact</h3>
            <ul className="space-y-3 text-sm text-dark-muted">
              {settings.address && <li>{settings.address}</li>}
              {settings.phone && (
                <li>
                  <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="hover:text-accent transition-colors">
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.email && (
                <li>
                  <a href={`mailto:${settings.email}`} className="hover:text-accent transition-colors">
                    {settings.email}
                  </a>
                </li>
              )}
            </ul>

            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-lg gradient-primary px-5 py-2.5 text-sm font-bold text-black transition-transform hover:scale-105"
            >
              Nous ecrire
            </Link>
          </div>
        </div>

        {/* Bottom bar — copyright a gauche, signature de l'atelier a droite.
            Empile et centre sous 640px, sur une seule ligne au-dessus. */}
        <div className="mt-12 border-t border-dark-border pt-8">
          <div className="flex flex-col items-center gap-3 text-sm text-dark-muted sm:flex-row sm:justify-between sm:gap-6">
            <p className="text-center sm:text-left">
              &copy; {new Date().getFullYear()} {gymName}. Tous droits reserves.
            </p>

            {/* Le lien ouvre directement la fenetre de redaction Gmail, plutot
                qu'un mailto: qui depend du client de messagerie du visiteur. */}
            <p className="text-center sm:text-right">
              Concu et developpe en Cote d&apos;Ivoire{' '}
              <span className="text-dark-border" aria-hidden="true">&mdash;</span>{' '}
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=prepaxiasfe@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-secondary underline decoration-dark-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              >
                prepaxiasfe@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

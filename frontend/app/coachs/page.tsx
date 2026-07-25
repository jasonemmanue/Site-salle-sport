import SectionTitle from '@/components/SectionTitle';
import CoachCard from '@/components/CoachCard';
import type { Coach } from '@/lib/types';

export const metadata = {
  title: 'Nos Coachs | FitnessPro',
  description: 'Decouvrez notre equipe de coachs certifies et passionnes, prets a vous accompagner vers vos objectifs.',
};

/* ──────────────────────── Mock Data ──────────────────────── */

const mockCoaches: Coach[] = [
  {
    id: '1',
    name: 'Marc Dupont',
    photo_url: '',
    certifications: ['BPJEPS Force', 'Certification CrossFit L2', 'Diplome STAPS'],
    specialties: ['Musculation', 'CrossFit', 'Halterophilie'],
    bio: 'Passionne de force athletique depuis 12 ans, Marc a forme plus de 300 eleves. Son approche rigoureuse et bienveillante vous aidera a repousser vos limites en toute securite. Ancien competiteur en force athletique, il transmet sa passion du mouvement et de la performance.',
    is_active: true,
    order: 1,
  },
  {
    id: '2',
    name: 'Sophie Martin',
    photo_url: '',
    certifications: ['Yoga Alliance RYT-500', 'Formation Pilates Mat & Reformer', 'Diplome en Naturopathie'],
    specialties: ['Yoga', 'Pilates', 'Meditation'],
    bio: 'Sophie allie douceur et exigence pour vous guider vers un equilibre entre force et souplesse. Avec plus de 8 ans d\'experience, elle propose des cours adaptes a tous les niveaux, de la relaxation au yoga dynamique avance.',
    is_active: true,
    order: 2,
  },
  {
    id: '3',
    name: 'Lucas Bernard',
    photo_url: '',
    certifications: ['CQP Instructeur Fitness', 'Les Mills BODYCOMBAT', 'BPJEPS APT'],
    specialties: ['HIIT', 'Cardio', 'Boxe'],
    bio: 'Ancien sportif de haut niveau en kickboxing, Lucas vous pousse a repousser vos limites dans une ambiance electrique. Ses cours sont intenses, structures et toujours accompagnes d\'une playlist qui dechire.',
    is_active: true,
    order: 3,
  },
  {
    id: '4',
    name: 'Camille Leroy',
    photo_url: '',
    certifications: ['Diplome d\'Etat Danse', 'Instructrice Zumba Certifiee', 'Formation Barre au Sol'],
    specialties: ['Zumba', 'Danse', 'Stretching'],
    bio: 'Avec Camille, chaque cours est une fete ! Danseuse professionnelle reconvertie dans le fitness, elle combine technique, fun et transpiration. Ses cours de Zumba et de danse fitness sont les plus populaires de la salle.',
    is_active: true,
    order: 4,
  },
  {
    id: '5',
    name: 'Antoine Rousseau',
    photo_url: '',
    certifications: ['Diplome Kinesitherapie', 'Certification TRX', 'Formation Nutrition Sportive'],
    specialties: ['Reeducation', 'Fonctionnel', 'Nutrition'],
    bio: 'Kinesitherapeute de formation, Antoine apporte un regard medical et preventif a l\'entrainement. Ideal pour les personnes en reprise d\'activite ou souhaitant un suivi personnalise alliant performance et sante.',
    is_active: true,
    order: 5,
  },
  {
    id: '6',
    name: 'Yasmine El Amrani',
    photo_url: '',
    certifications: ['BPJEPS AGF', 'Formation Spinning ICG', 'Certification Kettlebell IKFF'],
    specialties: ['Spinning', 'Circuit Training', 'Kettlebell'],
    bio: 'Yasmine est une boule d\'energie ! Specialiste du cardio sous toutes ses formes, elle vous fera transpirer avec le sourire. Ses cours de spinning immerifs en musique sont une experience a part entiere.',
    is_active: true,
    order: 6,
  },
];

/* ──────────────────────── Page ──────────────────────── */

export default function CoachsPage() {
  return (
    <>
      {/* ── Hero Banner ── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 hero-gradient"
          style={{
            background:
              'radial-gradient(ellipse at 40% 50%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(255,255,255,0.03) 0%, transparent 50%), linear-gradient(180deg, #000000 0%, #0a0a0a 60%, #000000 100%)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold mb-4">
            L'equipe
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-gradient">
            Nos Coachs
          </h1>
          <p className="mt-4 text-lg text-dark-muted max-w-2xl mx-auto">
            Des professionnels certifies, passionnes et a votre ecoute pour vous accompagner vers vos objectifs.
          </p>
        </div>
      </section>

      {/* ── Coaches Grid ── */}
      <section className="py-16 bg-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCoaches.map((coach) => (
              <CoachCard key={coach.id} coach={coach} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Coaching Philosophy ── */}
      <section className="py-20 bg-dark-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Notre Philosophie"
            subtitle="Ce qui nous differencie, c'est l'humain au coeur de chaque seance."
            accent
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Value 1 */}
            <div className="glass rounded-2xl p-8 text-center transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
                <svg className="h-7 w-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Expertise Certifiee</h3>
              <p className="text-sm text-dark-muted leading-relaxed">
                Tous nos coachs sont diplomes d'Etat ou certifies par des organismes reconnus. Formation continue garantie.
              </p>
            </div>

            {/* Value 2 */}
            <div className="glass rounded-2xl p-8 text-center transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
                <svg className="h-7 w-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Suivi Personnalise</h3>
              <p className="text-sm text-dark-muted leading-relaxed">
                Chaque membre est unique. Nos coachs adaptent les exercices, l'intensite et les conseils a votre profil et vos objectifs.
              </p>
            </div>

            {/* Value 3 */}
            <div className="glass rounded-2xl p-8 text-center transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
                <svg className="h-7 w-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Passion & Bienveillance</h3>
              <p className="text-sm text-dark-muted leading-relaxed">
                Plus que des entraineurs, nos coachs sont des mentors. Ils vous motivent, vous ecoutent et celebrent vos progres avec vous.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

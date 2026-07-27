import Link from 'next/link';
import SectionTitle from '@/components/SectionTitle';
import ActivityCard from '@/components/ActivityCard';
import type { Activity, ScheduleSlot, Coach } from '@/lib/types';

/* ──────────────────────── Mock Data ──────────────────────── */

const allActivities: Activity[] = [
  {
    id: '1',
    name: 'Musculation',
    slug: 'musculation',
    description: 'Renforcez votre masse musculaire avec nos equipements de qualite et l\'accompagnement quotidien de Coach Toussaint. Disponible tous les jours de 6h a 21h, il vous guide dans l\'execution des mouvements et l\'optimisation de vos seances. Que vous soyez debutant ou confirme, notre espace musculation vous offre tout le necessaire pour progresser en toute securite.',
    category: 'force',
    level: 'all',
    duration_minutes: 90,
    max_capacity: 15,
    image_url: '',
    is_active: true,
    order: 1,
  },
  {
    id: '2',
    name: 'Fitness',
    slug: 'fitness',
    description: 'Seances dynamiques pour ameliorer votre condition physique generale avec Coach Leo. Les cours ont lieu les lundis, mercredis et vendredis de 21h a 22h. Un programme complet combinant cardio, renforcement et souplesse pour un corps tonique et en pleine sante.',
    category: 'cardio',
    level: 'all',
    duration_minutes: 60,
    max_capacity: 15,
    image_url: '',
    is_active: true,
    order: 2,
  },
  {
    id: '3',
    name: 'Zumba',
    slug: 'zumba',
    description: 'Dansez, bougez, amusez-vous ! Un cours energique sur des rythmes latinos entrainants avec Coach Adonis chaque jeudi a 18h. La Zumba combine danse et fitness pour un entrainement cardio fun et accessible a tous. Aucune experience en danse requise, juste l\'envie de bouger !',
    category: 'dance',
    level: 'beginner',
    duration_minutes: 90,
    max_capacity: 15,
    image_url: '',
    is_active: true,
    order: 3,
  },
  {
    id: '4',
    name: 'Kick Boxing',
    slug: 'kick-boxing',
    description: 'Apprenez les techniques de kick boxing avec Coach David les mercredis et samedis a 16h. Travaillez coups de poing et coups de pied sur sacs de frappe et pattes d\'ours. Un excellent moyen de se defouler, ameliorer son endurance et developper sa confiance en soi.',
    category: 'martial_arts',
    level: 'all',
    duration_minutes: 90,
    max_capacity: 15,
    image_url: '',
    is_active: true,
    order: 4,
  },
  {
    id: '5',
    name: 'Wushu',
    slug: 'wushu',
    description: 'Art martial chinois traditionnel avec Maitre Kabore les mercredis et samedis de 15h a 16h. Discipline, souplesse et maitrise de soi sont au programme. Le Wushu allie techniques de combat, formes artistiques et philosophie martiale pour un developpement physique et mental complet.',
    category: 'martial_arts',
    level: 'all',
    duration_minutes: 60,
    max_capacity: 15,
    image_url: '',
    is_active: true,
    order: 5,
  },
];

const mockCoaches: Coach[] = [
  { id: '1', name: 'Coach Toussaint', photo_url: '', certifications: [], specialties: ['Musculation'], bio: '', is_active: true, order: 1 },
  { id: '2', name: 'Coach Adonis', photo_url: '', certifications: [], specialties: ['Zumba'], bio: '', is_active: true, order: 2 },
  { id: '3', name: 'Coach David', photo_url: '', certifications: [], specialties: ['Kick Boxing'], bio: '', is_active: true, order: 3 },
  { id: '4', name: 'Coach Leo', photo_url: '', certifications: [], specialties: ['Fitness'], bio: '', is_active: true, order: 4 },
  { id: '5', name: 'Maitre Kabore', photo_url: '', certifications: [], specialties: ['Wushu'], bio: '', is_active: true, order: 5 },
];

const activitySlots: Record<string, { coachId: string; days: (0 | 1 | 2 | 3 | 4 | 5 | 6)[]; startTime: string; endTime: string }[]> = {
  '1': [{ coachId: '1', days: [0, 1, 2, 3, 4, 5, 6], startTime: '06:00', endTime: '21:00' }],
  '2': [{ coachId: '4', days: [0, 2, 4], startTime: '21:00', endTime: '22:00' }],
  '3': [{ coachId: '2', days: [3], startTime: '18:00', endTime: '19:30' }],
  '4': [{ coachId: '3', days: [2, 5], startTime: '16:00', endTime: '17:30' }],
  '5': [{ coachId: '5', days: [2, 5], startTime: '15:00', endTime: '16:00' }],
};

function getMockSlots(activityId: string): ScheduleSlot[] {
  const config = activitySlots[activityId] || activitySlots['1'];
  const slots: ScheduleSlot[] = [];
  config.forEach((c) => {
    const coach = mockCoaches.find((co) => co.id === c.coachId) || mockCoaches[0];
    c.days.forEach((day, i) => {
      slots.push({
        id: `slot-${activityId}-${day}`,
        activity_id: activityId,
        coach_id: coach.id,
        coach,
        day_of_week: day,
        start_time: c.startTime,
        end_time: c.endTime,
        is_recurring: true,
        is_active: true,
        enrolled_count: [8, 5, 11, 7, 9, 6, 10][i % 7],
      });
    });
  });
  return slots;
}

const categoryLabels: Record<string, string> = {
  force: 'Force',
  cardio: 'Cardio',
  flexibility: 'Souplesse',
  martial_arts: 'Arts Martiaux',
  dance: 'Danse',
};

const levelLabels: Record<string, string> = {
  beginner: 'Debutant',
  intermediate: 'Intermediaire',
  advanced: 'Avance',
  all: 'Tous niveaux',
};

const dayLabels = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

/* ──────────────────────── Page ──────────────────────── */

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const activity = allActivities.find((a) => a.slug === slug) || allActivities[0];
  const slots = getMockSlots(activity.id);
  const related = allActivities.filter((a) => a.id !== activity.id && a.category === activity.category).slice(0, 3);

  // Category gradient backgrounds
  const categoryGradients: Record<string, string> = {
    force: 'rgba(255,255,255,0.05)',
    cardio: 'rgba(255,255,255,0.04)',
    flexibility: 'rgba(255,255,255,0.03)',
    martial_arts: 'rgba(255,255,255,0.04)',
    dance: 'rgba(255,255,255,0.05)',
  };

  return (
    <>
      {/* ── Hero Banner ── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 hero-gradient"
          style={{
            background: `radial-gradient(ellipse at 40% 50%, ${categoryGradients[activity.category] || categoryGradients.force} 0%, transparent 50%), linear-gradient(180deg, #000000 0%, #0a0a0a 60%, #000000 100%)`,
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-dark-muted">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/activites" className="hover:text-white transition-colors">Activites</Link>
            <span>/</span>
            <span className="text-primary">{activity.name}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="gradient-primary rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider text-black">
              {categoryLabels[activity.category]}
            </span>
            <span className="border border-secondary/30 text-secondary rounded-full px-4 py-1 text-xs font-bold">
              {levelLabels[activity.level]}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-white">
            {activity.name}
          </h1>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="py-16 bg-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main content */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-white mb-4">A propos de cette activite</h2>
              <p className="text-dark-muted leading-relaxed text-base">
                {activity.description}
              </p>

              {/* Schedule for this activity */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-white mb-6">Creneaux disponibles</h2>
                <div className="space-y-3">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-dark-border bg-dark-card p-4 transition-all hover:border-primary/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[60px]">
                          <p className="text-lg font-bold text-white">{slot.start_time}</p>
                          <p className="text-xs text-dark-muted">{slot.end_time}</p>
                        </div>
                        <div className="h-10 w-px bg-dark-border" />
                        <div>
                          <p className="text-sm font-semibold text-white">{dayLabels[slot.day_of_week]}</p>
                          <p className="text-xs text-dark-muted">Coach : {slot.coach?.name || 'A definir'}</p>
                        </div>
                      </div>
                      <Link
                        href="/planning"
                        className="mt-3 sm:mt-0 inline-flex items-center justify-center rounded-lg gradient-primary px-5 py-2 text-xs font-bold uppercase tracking-wider text-black transition-transform hover:scale-105"
                      >
                        Reserver
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="rounded-2xl border border-dark-border bg-dark-card p-6 sticky top-24">
                <h3 className="text-lg font-bold text-white mb-6">Informations cles</h3>
                <ul className="space-y-5">
                  <li className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-dark-muted">Duree</p>
                      <p className="text-sm font-semibold text-white">{activity.duration_minutes} minutes</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                      <svg className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-dark-muted">Capacite</p>
                      <p className="text-sm font-semibold text-white">{activity.max_capacity} personnes</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-dark-muted">Niveau</p>
                      <p className="text-sm font-semibold text-white">{levelLabels[activity.level]}</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                      <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-dark-muted">Categorie</p>
                      <p className="text-sm font-semibold text-white">{categoryLabels[activity.category]}</p>
                    </div>
                  </li>
                </ul>

                <Link
                  href="/planning"
                  className="mt-8 block text-center gradient-primary py-3.5 rounded-lg text-sm font-bold uppercase tracking-wider text-black transition-transform hover:scale-105 animate-pulse-glow"
                >
                  Reserver un creneau
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Related Activities ── */}
      {related.length > 0 && (
        <section className="py-20 bg-dark-card">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              title="Activites Similaires"
              subtitle="Explorez d'autres activites dans la meme categorie."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((a) => (
                <ActivityCard key={a.id} activity={a} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

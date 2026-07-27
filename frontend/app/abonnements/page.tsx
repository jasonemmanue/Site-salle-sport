'use client';

import { useState } from 'react';
import Link from 'next/link';
import SectionTitle from '@/components/SectionTitle';
import SubscriptionCard from '@/components/SubscriptionCard';
import type { Subscription } from '@/lib/types';

/* ──────────────────────── Mock Data ──────────────────────── */

const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Inscription',
    price: 5000,
    duration_months: 0,
    features: [
      'Frais d\'inscription unique',
      'Bilan sportif initial offert',
      'Carte membre personnalisee',
      'Visite guidee de la salle',
      'Seance decouverte avec un coach',
    ],
    is_active: true,
    order: 1,
  },
  {
    id: '2',
    name: 'Abonnement Mensuel',
    price: 25000,
    duration_months: 1,
    features: [
      'Acces illimite 7j/7',
      'Tous les cours collectifs',
      'Vestiaires et douches',
      'Programme personnalise',
      'Suivi nutritionnel',
      'Parking gratuit',
    ],
    is_active: true,
    order: 2,
  },
];

/* ──────────────────────── Comparison Table ──────────────────────── */

const comparisonFeatures = [
  { label: 'Frais d\'inscription', inscription: true, abonnement: false },
  { label: 'Bilan sportif initial', inscription: true, abonnement: false },
  { label: 'Carte membre', inscription: true, abonnement: false },
  { label: 'Seance decouverte', inscription: true, abonnement: false },
  { label: 'Acces salle illimite 7j/7', inscription: false, abonnement: true },
  { label: 'Cours collectifs inclus', inscription: false, abonnement: true },
  { label: 'Vestiaires & douches', inscription: false, abonnement: true },
  { label: 'Programme personnalise', inscription: false, abonnement: true },
  { label: 'Suivi nutritionnel', inscription: false, abonnement: true },
  { label: 'Parking gratuit', inscription: false, abonnement: true },
  { label: 'Application mobile', inscription: false, abonnement: true },
];

/* ──────────────────────── FAQ ──────────────────────── */

const faqItems = [
  {
    question: 'Puis-je changer de formule en cours d\'abonnement ?',
    answer: 'Oui, vous pouvez upgrader votre formule a tout moment. La difference sera calculee au prorata. Le downgrade est possible a la fin de votre periode en cours.',
  },
  {
    question: 'Y a-t-il un engagement minimum ?',
    answer: 'Non, tous nos abonnements sont sans engagement. Vous pouvez resilier a tout moment avec un preavis de 30 jours.',
  },
  {
    question: 'Proposez-vous des tarifs etudiants ou seniors ?',
    answer: 'Oui ! Nous offrons -20% sur toutes nos formules pour les etudiants (sur presentation d\'un justificatif) et les seniors de plus de 65 ans.',
  },
  {
    question: 'Comment fonctionne le cours d\'essai gratuit ?',
    answer: 'Votre premier cours est offert, sans engagement. Il vous suffit de vous presenter a l\'accueil avec une piece d\'identite et une tenue de sport. Un coach vous guidera.',
  },
  {
    question: 'Les formules incluent-elles le parking ?',
    answer: 'Le parking est gratuit et accessible a tous nos membres, quelle que soit la formule choisie. Nous disposons de 50 places de stationnement.',
  },
  {
    question: 'Puis-je geler mon abonnement en cas de blessure ou vacances ?',
    answer: 'Oui, vous pouvez geler votre abonnement jusqu\'a 30 jours par an (sur justificatif medical pour les periodes superieures). Contactez l\'accueil ou l\'espace membre en ligne.',
  },
];

/* ──────────────────────── Component ──────────────────────── */

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-dark-border rounded-xl overflow-hidden transition-colors hover:border-primary/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left bg-dark-card"
      >
        <span className="text-sm font-semibold text-white pr-4">{question}</span>
        <svg
          className={`w-5 h-5 text-primary shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 pb-5 text-sm text-dark-muted leading-relaxed bg-dark-card">
          {answer}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────── Page ──────────────────────── */

export default function AbonnementsPage() {
  return (
    <>
      {/* ── Hero Banner ── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 hero-gradient"
          style={{
            background:
              'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(255,255,255,0.03) 0%, transparent 50%), linear-gradient(180deg, #000000 0%, #0a0a0a 60%, #000000 100%)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold mb-4">
            Investissez en vous
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-gradient">
            Nos Formules
          </h1>
          <p className="mt-4 text-lg text-dark-muted max-w-2xl mx-auto">
            Des abonnements flexibles et sans engagement, adaptes a vos besoins et a votre budget.
          </p>
        </div>
      </section>

      {/* ── Subscription Cards ── */}
      <section className="py-16 bg-dark">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {mockSubscriptions.map((sub) => (
              <SubscriptionCard
                key={sub.id}
                subscription={sub}
                popular={sub.name === 'Abonnement Mensuel'}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison Table ── */}
      <section className="py-20 bg-dark-card">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Comparaison des Formules"
            subtitle="Retrouvez en detail ce qui est inclus dans chaque abonnement."
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="py-4 px-4 text-left text-sm font-semibold text-dark-muted uppercase tracking-wider">
                    Fonctionnalite
                  </th>
                  <th className="py-4 px-4 text-center text-sm font-semibold text-white">Inscription</th>
                  <th className="py-4 px-4 text-center">
                    <span className="text-sm font-semibold text-gradient">Abonnement</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature) => (
                  <tr key={feature.label} className="border-b border-dark-border/50 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 text-sm text-dark-muted">{feature.label}</td>
                    <td className="py-4 px-4 text-center">
                      {feature.inscription ? (
                        <svg className="mx-auto h-5 w-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-dark-border">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {feature.abonnement ? (
                        <svg className="mx-auto h-5 w-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-dark-border">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {/* Price row */}
                <tr className="border-t-2 border-dark-border">
                  <td className="py-6 px-4 text-sm font-bold text-white uppercase">Tarif</td>
                  <td className="py-6 px-4 text-center text-xl font-black text-white">5 000<span className="text-sm text-dark-muted"> FCFA</span></td>
                  <td className="py-6 px-4 text-center text-xl font-black text-gradient">25 000<span className="text-sm text-dark-muted"> FCFA/mois</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-dark">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Questions Frequentes"
            subtitle="Tout ce que vous devez savoir avant de vous inscrire."
            accent
          />
          <div className="space-y-3">
            {faqItems.map((item) => (
              <FAQItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Entreprise ── */}
      <section className="py-20 bg-dark-card">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass rounded-2xl p-10 sm:p-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase">
              Offre Entreprise & Groupes
            </h2>
            <p className="mt-4 text-dark-muted text-lg max-w-xl mx-auto">
              Vous etes une entreprise ou un groupe de plus de 5 personnes ? Beneficiez de tarifs preferentiels et d'un accompagnement dedie.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 gradient-primary px-10 py-4 rounded-lg text-base font-bold uppercase tracking-wider text-black transition-transform hover:scale-105"
            >
              Demander un devis
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

import Link from 'next/link';
import SectionTitle from '@/components/SectionTitle';
import SubscriptionCard from '@/components/SubscriptionCard';
import FaqAccordion, { type FaqItem } from '@/components/views/FaqAccordion';
import { getSubscriptions, safe } from '@/lib/api';

export const metadata = {
  title: 'Nos Formules | Eslie Sport',
  description:
    'Inscription, mensualite, formules Kung-Fu Wushu et Boxe & Kick Boxing — comparez nos abonnements et choisissez celui qui vous correspond.',
};

const faqItems: FaqItem[] = [
  {
    question: 'Puis-je changer de formule en cours d\'abonnement ?',
    answer: 'Oui, vous pouvez upgrader votre formule a tout moment. La difference sera calculee au prorata. Le downgrade est possible a la fin de votre periode en cours.',
  },
  {
    question: 'Y a-t-il un engagement minimum ?',
    answer: 'Non, tous nos abonnements sont sans engagement. Vous pouvez resilier a tout moment avec un preavis de 30 jours.',
  },
  {
    question: 'Comment se deroule ma premiere venue ?',
    answer: 'Presentez-vous a l\'accueil avec une piece d\'identite et une tenue de sport. Un coach vous fait visiter la salle et vous guide pour votre premiere seance.',
  },
  {
    question: 'Quels sont les moyens de paiement acceptes ?',
    answer: 'Les paiements se font sur place, en especes ou par mobile money. Contactez-nous au prealable si vous souhaitez regler autrement.',
  },
  {
    question: 'Puis-je geler mon abonnement en cas de blessure ?',
    answer: 'Oui, sur presentation d\'un justificatif medical. Adressez votre demande a l\'accueil de la salle.',
  },
];

export default async function AbonnementsPage() {
  const subscriptions = await safe(getSubscriptions(), []);

  // La formule mise en avant est la premiere formule recurrente (mensuelle).
  // Sans recurrence dans le catalogue, aucune carte n'est mise en avant.
  const popularId = subscriptions.find((s) => s.duration_months >= 1)?.id;

  // Lignes du comparatif : union ordonnee des avantages de toutes les formules.
  // Le tableau suit ainsi le catalogue reel, quel que soit le nombre de formules.
  const allFeatures: string[] = [];
  for (const sub of subscriptions) {
    for (const feature of sub.features) {
      if (!allFeatures.includes(feature)) allFeatures.push(feature);
    }
  }

  return (
    <>
      {/* ── Hero Banner ── */}
      <section className="watermark relative pt-32 pb-20 overflow-hidden">
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
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {subscriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subscriptions.map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  popular={sub.id === popularId}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dark-border bg-dark-card p-16 text-center max-w-2xl mx-auto">
              <p className="text-dark-muted text-lg">
                Nos formules sont en cours de mise a jour.
              </p>
              <Link href="/contact" className="mt-4 inline-block text-primary font-semibold text-sm hover:underline">
                Contactez-nous pour connaitre nos tarifs
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Comparison Table ── */}
      {allFeatures.length > 0 && (
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
                    <th className="py-4 px-4 text-left text-sm font-semibold text-secondary-light uppercase tracking-wider">
                      Avantage
                    </th>
                    {subscriptions.map((sub) => (
                      <th key={sub.id} className="py-4 px-4 text-center">
                        <span
                          className={`text-sm font-semibold ${
                            sub.id === popularId ? 'text-gradient' : 'text-white'
                          }`}
                        >
                          {sub.name}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allFeatures.map((feature) => (
                    <tr key={feature} className="border-b border-dark-border/50 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 text-sm text-dark-muted">{feature}</td>
                      {subscriptions.map((sub) => (
                        <td key={sub.id} className="py-4 px-4 text-center">
                          {sub.features.includes(feature) ? (
                            <>
                              <svg className="mx-auto h-5 w-5 text-success" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="sr-only">Inclus</span>
                            </>
                          ) : (
                            <>
                              <span className="text-dark-border" aria-hidden="true">—</span>
                              <span className="sr-only">Non inclus</span>
                            </>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Price row */}
                  <tr className="border-t-2 border-dark-border">
                    <td className="py-6 px-4 text-sm font-bold text-white uppercase">Tarif</td>
                    {subscriptions.map((sub) => (
                      <td
                        key={sub.id}
                        className={`py-6 px-4 text-center text-xl font-black ${
                          sub.id === popularId ? 'text-gradient' : 'text-white'
                        }`}
                      >
                        {sub.price.toLocaleString('fr-FR')}
                        <span className="text-sm text-dark-muted">
                          {' '}FCFA{sub.duration_months === 1 ? '/mois' : sub.duration_months > 1 ? `/${sub.duration_months} mois` : ''}
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      <section className="py-20 bg-dark">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Questions Frequentes"
            subtitle="Tout ce que vous devez savoir avant de vous inscrire."
            accent
          />
          <FaqAccordion items={faqItems} />
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

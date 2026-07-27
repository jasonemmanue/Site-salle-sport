import SectionTitle from "@/components/SectionTitle";
import ContactForm from "@/components/ContactForm";

const INFO_ITEMS = [
  {
    label: "Adresse",
    value: "Abidjan, Cote d'Ivoire",
    icon: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
  },
  {
    label: "Telephone",
    value: "05 45 07 98 50",
    icon: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z",
  },
  {
    label: "Email",
    value: "contact@esliesport.com",
    icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
  },
];

const HORAIRES = [
  { day: "Lundi - Samedi", hours: "6h00 - 21h00" },
  { day: "Dimanche", hours: "6h00 - 21h00 (acces libre)" },
  { day: "Jours feries", hours: "Ouvert 7j/7" },
];

const SOCIAL_LINKS = [
  {
    name: "Facebook",
    icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    name: "Instagram",
    icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    name: "YouTube",
    icon: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    name: "TikTok",
    icon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  },
];

const FAQ = [
  {
    question: "Comment fonctionne l'inscription ?",
    answer: "L'inscription est simple : choisissez votre formule d'abonnement, remplissez le formulaire en ligne ou venez directement a la salle. Un coach vous accueillera pour une visite guidee et un bilan sportif gratuit.",
  },
  {
    question: "Y a-t-il un parking disponible ?",
    answer: "Oui, nous disposons d'un parking gratuit de 50 places reserve a nos membres. Un parking a velo securise est egalement disponible a l'entree.",
  },
  {
    question: "Puis-je geler mon abonnement ?",
    answer: "Vous pouvez suspendre votre abonnement jusqu'a 30 jours par an en cas de vacances, blessure ou raison medicale (avec justificatif). Contactez l'accueil pour en faire la demande.",
  },
  {
    question: "Les cours collectifs sont-ils inclus ?",
    answer: "Oui, tous nos cours collectifs (HIIT, yoga, boxe, Pilates, cycling...) sont inclus dans les formules Premium et VIP. La formule Essentielle donne acces a 4 cours par mois.",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 gradient-hero opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            <span className="text-gradient">Contactez-nous</span>
          </h1>
          <p className="mt-4 text-lg text-dark-muted max-w-2xl mx-auto">
            Une question ? N&apos;hesitez pas a nous contacter. Notre equipe est la pour vous.
          </p>
        </div>
      </section>

      {/* Contact Section: Form + Info */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left: Contact Form */}
          <div>
            <h2 className="mb-6 text-2xl font-bold text-white">Envoyez-nous un message</h2>
            <ContactForm />
          </div>

          {/* Right: Info */}
          <div className="space-y-8">
            {/* Contact Info */}
            <div className="space-y-4">
              {INFO_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="glass rounded-2xl p-5 flex items-start gap-4 transition-all duration-300 hover:border-primary/30"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl gradient-primary">
                    <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-dark-muted">{item.label}</p>
                    <p className="text-base font-semibold text-white">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Horaires */}
            <div className="glass rounded-2xl p-6">
              <h3 className="mb-4 text-lg font-bold text-white flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Horaires d&apos;ouverture
              </h3>
              <div className="space-y-3">
                {HORAIRES.map((h) => (
                  <div key={h.day} className="flex items-center justify-between text-sm">
                    <span className="text-dark-muted">{h.day}</span>
                    <span className="font-semibold text-white">{h.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="relative h-56 overflow-hidden rounded-2xl border border-dark-border bg-gradient-to-br from-white/5 via-dark-card to-white/5">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <svg className="h-10 w-10 text-dark-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                </svg>
                <p className="text-sm font-semibold text-dark-muted">42 Avenue des Champions, 75015 Paris</p>
                <p className="text-xs text-dark-muted/60">Carte interactive</p>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white">Suivez-nous</h3>
              <div className="flex gap-3">
                {SOCIAL_LINKS.map((social) => (
                  <button
                    key={social.name}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-dark-border bg-dark-card text-dark-muted transition-all hover:border-primary/40 hover:text-primary hover:scale-105"
                    aria-label={social.name}
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.icon} />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-20">
        <SectionTitle
          title="Questions Frequentes"
          subtitle="Les reponses aux questions les plus posees par nos membres"
          accent
        />
        <div className="space-y-4">
          {FAQ.map((faq) => (
            <div
              key={faq.question}
              className="glass rounded-2xl p-6 transition-all duration-300 hover:border-primary/30"
            >
              <h4 className="mb-2 text-base font-bold text-white flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full gradient-primary text-xs font-bold text-black mt-0.5">
                  ?
                </span>
                {faq.question}
              </h4>
              <p className="ml-9 text-sm text-dark-muted leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

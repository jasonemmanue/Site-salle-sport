"use client";

import SectionTitle from "@/components/SectionTitle";
import TransformationSlider from "@/components/TransformationSlider";
import type { Transformation } from "@/lib/types";
import Link from "next/link";

const mockTransformations: Transformation[] = [
  {
    id: "1",
    member_name: "Sophie M.",
    before_image_url: "",
    after_image_url: "",
    testimonial: "En 6 mois chez FitnessPro, j'ai perdu 15 kg et gagne une confiance en moi incroyable. Les coachs sont exceptionnels et le programme personnalise a fait toute la difference.",
    duration_text: "6 mois",
    is_featured: true,
    is_published: true,
    created_at: "2026-06-15T10:00:00Z",
  },
  {
    id: "2",
    member_name: "Marc D.",
    before_image_url: "",
    after_image_url: "",
    testimonial: "J'ai gagne 8 kg de muscle sec en suivant le programme de prise de masse. L'accompagnement nutritionnel a ete determinant dans ma progression.",
    duration_text: "8 mois",
    is_featured: true,
    is_published: true,
    created_at: "2026-05-20T10:00:00Z",
  },
  {
    id: "3",
    member_name: "Amina K.",
    before_image_url: "",
    after_image_url: "",
    testimonial: "Apres ma grossesse, je pensais ne jamais retrouver ma forme. Grace aux cours collectifs et au suivi personnalise, j'ai retrouve mon corps en 4 mois.",
    duration_text: "4 mois",
    is_featured: true,
    is_published: true,
    created_at: "2026-04-10T10:00:00Z",
  },
  {
    id: "4",
    member_name: "Thomas L.",
    before_image_url: "",
    after_image_url: "",
    testimonial: "A 52 ans, je suis en meilleure forme qu'a 30. Le programme senior de FitnessPro m'a permis de retrouver energie et vitalite au quotidien.",
    duration_text: "12 mois",
    is_featured: false,
    is_published: true,
    created_at: "2026-03-05T10:00:00Z",
  },
  {
    id: "5",
    member_name: "Lea R.",
    before_image_url: "",
    after_image_url: "",
    testimonial: "Le HIIT et la boxe m'ont transformee. Moins 10 kg, plus de tonicite et surtout une energie debordante. Je recommande a 100% !",
    duration_text: "5 mois",
    is_featured: false,
    is_published: true,
    created_at: "2026-02-18T10:00:00Z",
  },
  {
    id: "6",
    member_name: "Karim B.",
    before_image_url: "",
    after_image_url: "",
    testimonial: "De sedentaire total a coureur de semi-marathon en 10 mois. Les coachs de FitnessPro m'ont pousse a me depasser chaque jour.",
    duration_text: "10 mois",
    is_featured: false,
    is_published: true,
    created_at: "2026-01-22T10:00:00Z",
  },
];

const stats = [
  { value: "200+", label: "Transformations reussies" },
  { value: "98%", label: "De satisfaction" },
  { value: "-12 kg", label: "Perte moyenne en 6 mois" },
  { value: "150+", label: "Objectifs atteints ce mois" },
];

export default function TransformationsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 gradient-hero opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(225,29,72,0.15),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            <span className="text-gradient">Transformations & Resultats</span>
          </h1>
          <p className="mt-4 text-lg text-dark-muted max-w-2xl mx-auto">
            Decouvrez les parcours inspirants de nos membres. Votre transformation commence ici.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-2xl p-5 text-center transition-all duration-300 hover:border-primary/30"
            >
              <p className="text-2xl sm:text-3xl font-extrabold text-gradient">{stat.value}</p>
              <p className="mt-1 text-xs sm:text-sm text-dark-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Slider */}
      <section className="mx-auto max-w-3xl px-8 sm:px-12 py-16">
        <SectionTitle
          title="Avant / Apres"
          subtitle="Faites defiler pour voir les transformations de nos membres"
          accent
        />
        <TransformationSlider transformations={mockTransformations.filter((t) => t.is_featured)} autoPlay autoPlayInterval={6000} />
      </section>

      {/* All Transformations Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <SectionTitle
          title="Toutes les Transformations"
          subtitle="Chaque parcours est unique, chaque resultat est une victoire"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockTransformations.map((t) => (
            <div
              key={t.id}
              className="overflow-hidden rounded-2xl border border-dark-border bg-dark-card transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
            >
              {/* Before / After */}
              <div className="grid grid-cols-2 gap-px bg-dark-border">
                <div className="relative aspect-square bg-dark-card overflow-hidden">
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-dark-card to-dark-lighter">
                    <svg className="h-12 w-12 text-dark-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                    </svg>
                  </div>
                  <span className="absolute bottom-2 left-2 rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">
                    Avant
                  </span>
                </div>
                <div className="relative aspect-square bg-dark-card overflow-hidden">
                  <div className="flex h-full w-full items-center justify-center gradient-primary opacity-80">
                    <svg className="h-12 w-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                    </svg>
                  </div>
                  <span className="absolute bottom-2 left-2 rounded-full gradient-primary px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">
                    Apres
                  </span>
                </div>
              </div>
              {/* Info */}
              <div className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-base font-bold text-white">{t.member_name}</h4>
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                    {t.duration_text}
                  </span>
                </div>
                <p className="text-sm text-dark-muted italic leading-relaxed line-clamp-3">
                  &ldquo;{t.testimonial}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative overflow-hidden rounded-2xl gradient-primary p-8 sm:p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="relative">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Commencez votre transformation
            </h3>
            <p className="mt-3 text-white/80 max-w-xl mx-auto">
              Rejoignez nos 200+ membres qui ont deja atteint leurs objectifs. Votre parcours commence des aujourd&apos;hui.
            </p>
            <Link
              href="/abonnements"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-primary transition-all hover:bg-white/90 hover:shadow-lg"
            >
              Voir nos abonnements
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

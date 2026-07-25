"use client";

import { useState } from "react";
import SectionTitle from "@/components/SectionTitle";
import ReviewCard from "@/components/ReviewCard";
import type { Review } from "@/lib/types";

const mockReviews: Review[] = [
  {
    id: "1",
    author_name: "Caroline P.",
    rating: 5,
    comment: "Une salle exceptionnelle ! Les equipements sont modernes, les coachs sont professionnels et bienveillants. L'ambiance est motivante sans etre intimidante. Je recommande les yeux fermes.",
    is_approved: true,
    created_at: "2026-07-10T14:30:00Z",
  },
  {
    id: "2",
    author_name: "Julien R.",
    rating: 5,
    comment: "Inscrit depuis 8 mois et je n'ai jamais ete aussi en forme. Les cours de HIIT sont incroyables et le planning est tres flexible. Le rapport qualite-prix est imbattable.",
    is_approved: true,
    created_at: "2026-06-25T09:00:00Z",
  },
  {
    id: "3",
    author_name: "Fatima A.",
    rating: 5,
    comment: "Le personnel est aux petits soins. J'ai commence avec zero experience et les coachs m'ont guidee pas a pas. Aujourd'hui, je suis accro aux cours collectifs !",
    is_approved: true,
    created_at: "2026-06-18T16:00:00Z",
  },
  {
    id: "4",
    author_name: "Pierre M.",
    rating: 4,
    comment: "Tres bonne salle avec des equipements de qualite. Seul bemol : l'affluence en fin de journee peut etre importante. Je conseille d'y aller le matin pour profiter pleinement.",
    is_approved: true,
    created_at: "2026-06-10T11:00:00Z",
  },
  {
    id: "5",
    author_name: "Emma L.",
    rating: 5,
    comment: "Le meilleur investissement pour ma sante ! Les cours de yoga sont fantastiques et le sauna apres l'entrainement, c'est le bonheur. Merci a toute l'equipe.",
    is_approved: true,
    created_at: "2026-05-28T13:00:00Z",
  },
  {
    id: "6",
    author_name: "Alexandre T.",
    rating: 5,
    comment: "En tant qu'ancien sportif de haut niveau, je suis tres exigeant. FitnessPro repond a toutes mes attentes : materiel pro, coaching de qualite et ambiance top.",
    is_approved: true,
    created_at: "2026-05-15T10:00:00Z",
  },
  {
    id: "7",
    author_name: "Nadia B.",
    rating: 4,
    comment: "Salle propre et bien entretenue. Les vestiaires sont spacieux et le parking est un vrai plus. J'aurais aime plus d'horaires pour les cours de boxe.",
    is_approved: true,
    created_at: "2026-05-02T18:00:00Z",
  },
  {
    id: "8",
    author_name: "Lucas G.",
    rating: 5,
    comment: "J'ai perdu 20 kg en un an grace au suivi personnalise. Les coachs sont attentifs et adaptent les programmes en fonction de ma progression. Extraordinaire.",
    is_approved: true,
    created_at: "2026-04-20T15:00:00Z",
  },
];

const ratingBreakdown = [
  { stars: 5, percent: 85 },
  { stars: 4, percent: 10 },
  { stars: 3, percent: 3 },
  { stars: 2, percent: 1 },
  { stars: 1, percent: 1 },
];

function StarIcon({ filled, size = "h-5 w-5" }: { filled: boolean; size?: string }) {
  return (
    <svg
      className={`${size} ${filled ? "text-accent" : "text-dark-border"}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export default function AvisPage() {
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 0, comment: "" });
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const averageRating = 4.8;
  const totalReviews = mockReviews.length;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewForm.name.trim() || reviewForm.rating === 0 || !reviewForm.comment.trim()) return;
    setSubmitted(true);
    setReviewForm({ name: "", rating: 0, comment: "" });
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 gradient-hero opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            <span className="text-gradient">Avis de nos Membres</span>
          </h1>
          <p className="mt-4 text-lg text-dark-muted max-w-2xl mx-auto">
            Decouvrez ce que nos membres pensent de leur experience chez FitnessPro.
          </p>
        </div>
      </section>

      {/* Rating Overview */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="glass rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-8">
          {/* Average */}
          <div className="text-center shrink-0">
            <p className="text-6xl font-extrabold text-gradient">{averageRating}</p>
            <div className="mt-2 flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} filled={i < Math.round(averageRating)} size="h-6 w-6" />
              ))}
            </div>
            <p className="mt-2 text-sm text-dark-muted">{totalReviews} avis verifies</p>
          </div>

          {/* Breakdown */}
          <div className="flex-1 w-full space-y-2">
            {ratingBreakdown.map((rb) => (
              <div key={rb.stars} className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-sm text-dark-muted w-16 shrink-0">
                  {rb.stars}
                  <StarIcon filled size="h-3.5 w-3.5" />
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-dark-lighter overflow-hidden">
                  <div
                    className="h-full rounded-full gradient-primary transition-all duration-500"
                    style={{ width: `${rb.percent}%` }}
                  />
                </div>
                <span className="text-xs text-dark-muted w-10 text-right">{rb.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </section>

      {/* Leave a Review Form */}
      <section className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 pb-20">
        <SectionTitle
          title="Laisser un avis"
          subtitle="Partagez votre experience avec la communaute FitnessPro"
          accent
        />

        {submitted ? (
          <div className="glass rounded-2xl p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
              <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">Merci pour votre avis !</h3>
            <p className="mb-6 text-sm text-dark-muted">
              Votre avis sera publie apres moderation.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="rounded-xl gradient-primary px-6 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-105"
            >
              Laisser un autre avis
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 sm:p-8 space-y-5">
            {/* Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-white">Votre nom</label>
              <input
                type="text"
                value={reviewForm.name}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Prenom N."
                className="w-full rounded-xl border border-dark-border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-dark-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Votre note</label>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReviewForm((prev) => ({ ...prev, rating: i + 1 }))}
                    onMouseEnter={() => setHoverRating(i + 1)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <StarIcon
                      filled={i < (hoverRating || reviewForm.rating)}
                      size="h-8 w-8"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="mb-1 block text-sm font-medium text-white">Votre commentaire</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                placeholder="Partagez votre experience..."
                rows={4}
                className="w-full rounded-xl border border-dark-border bg-white/5 px-4 py-3 text-sm text-white placeholder-dark-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-xl gradient-primary py-3 text-sm font-bold text-black transition-all hover:shadow-lg hover:shadow-white/10 hover:scale-[1.02]"
            >
              Publier mon avis
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

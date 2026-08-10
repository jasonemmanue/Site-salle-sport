"use client";

import { useState } from "react";
import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import ArticleCard from "@/components/ArticleCard";
import Pagination from "@/components/Pagination";
import type { Article } from "@/lib/types";

const CATEGORIES = ["Tous", "Nutrition", "Entrainement", "Recuperation", "Motivation"];

const mockArticles: Article[] = [
  {
    id: "1",
    title: "10 aliments essentiels pour la prise de masse musculaire",
    slug: "10-aliments-prise-de-masse",
    content: "Decouvrez les meilleurs aliments pour optimiser votre prise de masse musculaire. De la poitrine de poulet aux flocons d'avoine, en passant par les oeufs et le saumon, chaque aliment a ete selectionne pour son profil nutritionnel exceptionnel. Apprenez a composer vos repas pour maximiser vos gains tout en maintenant une alimentation equilibree et savoureuse.",
    excerpt: "Decouvrez les meilleurs aliments pour optimiser votre prise de masse musculaire et composer des repas equilibres.",
    cover_image_url: "",
    status: "published",
    published_at: "2026-07-15T10:00:00Z",
    author_id: "coach-1",
  },
  {
    id: "2",
    title: "Guide complet du HIIT : brulez les graisses en 30 minutes",
    slug: "guide-complet-hiit",
    content: "Le High Intensity Interval Training est la methode la plus efficace pour bruler les graisses en un minimum de temps. Dans ce guide complet, nous vous expliquons les principes fondamentaux du HIIT, les meilleurs exercices a integrer dans vos seances et comment structurer vos entrainements pour des resultats optimaux.",
    excerpt: "Le HIIT est la methode la plus efficace pour bruler les graisses. Decouvrez comment structurer vos seances.",
    cover_image_url: "",
    status: "published",
    published_at: "2026-07-10T08:00:00Z",
    author_id: "coach-2",
  },
  {
    id: "3",
    title: "L'importance du sommeil dans la recuperation musculaire",
    slug: "sommeil-recuperation-musculaire",
    content: "Le sommeil est un pilier souvent neglige de la performance sportive. Pendant que vous dormez, votre corps repare les fibres musculaires endommagees pendant l'entrainement et libere des hormones de croissance essentielles. Decouvrez comment optimiser votre sommeil pour accelerer votre recuperation.",
    excerpt: "Le sommeil est un pilier souvent neglige de la performance sportive. Apprenez a optimiser vos nuits.",
    cover_image_url: "",
    status: "published",
    published_at: "2026-07-05T14:00:00Z",
    author_id: "coach-1",
  },
  {
    id: "4",
    title: "5 erreurs courantes en musculation et comment les eviter",
    slug: "5-erreurs-musculation",
    content: "Meme les pratiquants experimentes commettent parfois des erreurs qui limitent leur progression. De la mauvaise execution des mouvements au surentrainement, en passant par une nutrition inadequate, nous analysons les erreurs les plus frequentes et vous donnons des solutions concretes pour progresser.",
    excerpt: "Meme les pratiquants experimentes font des erreurs. Voici comment les identifier et les corriger.",
    cover_image_url: "",
    status: "published",
    published_at: "2026-06-28T09:00:00Z",
    author_id: "coach-3",
  },
  {
    id: "5",
    title: "Meditation et sport : le duo gagnant pour la performance",
    slug: "meditation-sport-performance",
    content: "La meditation n'est pas reservee aux yogis. De plus en plus d'athletes de haut niveau integrent la pleine conscience dans leur routine. Decouvrez comment 10 minutes de meditation par jour peuvent ameliorer votre concentration, reduire le stress et booster vos performances sportives.",
    excerpt: "Decouvrez comment la meditation peut ameliorer votre concentration et booster vos performances sportives.",
    cover_image_url: "",
    status: "published",
    published_at: "2026-06-20T11:00:00Z",
    author_id: "coach-2",
  },
  {
    id: "6",
    title: "Nutrition pre et post-entrainement : le guide ultime",
    slug: "nutrition-pre-post-entrainement",
    content: "Ce que vous mangez avant et apres votre entrainement a un impact direct sur vos performances et votre recuperation. Apprenez a chronometrer vos repas et a choisir les bons nutriments pour maximiser chaque seance. Des idees de repas et snacks simples a preparer inclus.",
    excerpt: "Ce que vous mangez avant et apres l'entrainement impacte directement vos performances et votre recuperation.",
    cover_image_url: "",
    status: "published",
    published_at: "2026-06-15T07:00:00Z",
    author_id: "coach-1",
  },
];

const categoryMap: Record<string, string[]> = {
  Nutrition: ["10-aliments-prise-de-masse", "nutrition-pre-post-entrainement"],
  Entrainement: ["guide-complet-hiit", "5-erreurs-musculation"],
  Recuperation: ["sommeil-recuperation-musculaire"],
  Motivation: ["meditation-sport-performance"],
};

export default function ArticlesPage() {
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered =
    activeCategory === "Tous"
      ? mockArticles
      : mockArticles.filter((a) => categoryMap[activeCategory]?.includes(a.slug));

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 gradient-hero opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            <span className="text-gradient">Blog Fitness & Bien-etre</span>
          </h1>
          <p className="mt-4 text-lg text-dark-muted max-w-2xl mx-auto">
            Conseils d&apos;experts, astuces nutrition et entrainements pour atteindre vos objectifs.
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentPage(1);
              }}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                activeCategory === cat
                  ? "gradient-primary text-black shadow-lg shadow-white/10"
                  : "border border-dark-border bg-dark-card text-secondary-light hover:border-primary/60 hover:bg-dark-lighter hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Featured Article */}
        {featured && (
          <Link href={`/articles/${featured.slug}`} className="group mb-12 block">
            <div className="overflow-hidden rounded-2xl border border-dark-border bg-dark-card transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 sm:flex">
              {/* Image */}
              <div className="relative h-64 overflow-hidden bg-dark-lighter sm:h-auto sm:w-1/2">
                <div className="flex h-full w-full items-center justify-center gradient-primary opacity-60">
                  <svg className="h-20 w-20 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-dark-card/80 hidden sm:block" />
                <span className="absolute left-4 top-4 rounded-full gradient-primary px-4 py-1.5 text-xs font-bold text-black">
                  A la une
                </span>
              </div>
              {/* Content */}
              <div className="flex flex-col justify-center p-6 sm:w-1/2 sm:p-8">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">Article vedette</p>
                <h2 className="mb-3 text-2xl font-bold text-white group-hover:text-primary transition-colors sm:text-3xl">
                  {featured.title}
                </h2>
                <p className="mb-4 text-dark-muted leading-relaxed">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-4 text-xs text-dark-muted">
                  <span>
                    {new Date(featured.published_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {Math.max(1, Math.ceil(featured.content.length / 1500))} min
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Articles Grid */}
        {rest.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-12">
          <Pagination currentPage={currentPage} totalPages={3} onPageChange={setCurrentPage} />
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import SectionTitle from "@/components/SectionTitle";
import type { Video } from "@/lib/types";

const CATEGORIES = ["Tous", "Musculation", "Cardio", "Yoga", "HIIT", "Stretching"];

const mockVideos: Video[] = [
  {
    id: "1",
    title: "Seance complete full body - 45 minutes",
    description: "Entrainement complet ciblant tous les groupes musculaires. Ideal pour les debutants et intermediaires.",
    video_url: "",
    thumbnail_url: "",
    category: "Musculation",
    is_published: true,
    order: 1,
    created_at: "2026-07-18T10:00:00Z",
  },
  {
    id: "2",
    title: "HIIT brule-graisse express - 20 minutes",
    description: "Seance HIIT intense pour bruler un maximum de calories en un minimum de temps. Aucun equipement necessaire.",
    video_url: "",
    thumbnail_url: "",
    category: "HIIT",
    is_published: true,
    order: 2,
    created_at: "2026-07-15T08:00:00Z",
  },
  {
    id: "3",
    title: "Yoga matinal pour sportifs - 30 minutes",
    description: "Routine de yoga douce pour ameliorer votre flexibilite et preparer votre corps a l'entrainement.",
    video_url: "",
    thumbnail_url: "",
    category: "Yoga",
    is_published: true,
    order: 3,
    created_at: "2026-07-12T07:00:00Z",
  },
  {
    id: "4",
    title: "Programme pectoraux & triceps",
    description: "Entrainement intensif pour developper les pectoraux et les triceps. 6 exercices expliques en detail.",
    video_url: "",
    thumbnail_url: "",
    category: "Musculation",
    is_published: true,
    order: 4,
    created_at: "2026-07-10T14:00:00Z",
  },
  {
    id: "5",
    title: "Cardio boxing sans materiel - 25 minutes",
    description: "Seance de cardio inspiree de la boxe pour travailler coordination, endurance et explosivite.",
    video_url: "",
    thumbnail_url: "",
    category: "Cardio",
    is_published: true,
    order: 5,
    created_at: "2026-07-08T09:00:00Z",
  },
  {
    id: "6",
    title: "Etirements post-entrainement complets",
    description: "Routine d'etirements de 15 minutes pour favoriser la recuperation et eviter les courbatures.",
    video_url: "",
    thumbnail_url: "",
    category: "Stretching",
    is_published: true,
    order: 6,
    created_at: "2026-07-05T16:00:00Z",
  },
  {
    id: "7",
    title: "Programme dos & biceps - Volume",
    description: "Seance axee sur le volume musculaire du dos et des biceps. Techniques avancees incluses.",
    video_url: "",
    thumbnail_url: "",
    category: "Musculation",
    is_published: true,
    order: 7,
    created_at: "2026-07-03T11:00:00Z",
  },
  {
    id: "8",
    title: "Tabata extreme - 4 minutes intenses",
    description: "Le protocole Tabata : 20 secondes d'effort maximal, 10 secondes de repos, 8 rounds. Pret ?",
    video_url: "",
    thumbnail_url: "",
    category: "HIIT",
    is_published: true,
    order: 8,
    created_at: "2026-07-01T13:00:00Z",
  },
];

const categoryGradients: Record<string, string> = {
  Musculation: "from-primary/80 to-red-700/60",
  Cardio: "from-accent/80 to-yellow-600/60",
  Yoga: "from-emerald-500/80 to-teal-600/60",
  HIIT: "from-red-600/80 to-pink-600/60",
  Stretching: "from-secondary/80 to-indigo-600/60",
};

function PlayButton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/80">
        <svg className="h-7 w-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>
  );
}

export default function VideosPage() {
  const [activeCategory, setActiveCategory] = useState("Tous");

  const filtered =
    activeCategory === "Tous"
      ? mockVideos
      : mockVideos.filter((v) => v.category === activeCategory);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 gradient-hero opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.15),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            <span className="text-gradient">Videos d&apos;Entrainement</span>
          </h1>
          <p className="mt-4 text-lg text-dark-muted max-w-2xl mx-auto">
            Suivez nos coachs en video et entrainez-vous ou que vous soyez.
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                activeCategory === cat
                  ? "gradient-primary text-white shadow-lg shadow-primary/30"
                  : "border border-dark-border bg-dark-card text-dark-muted hover:border-primary/40 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Featured Video */}
        {featured && (
          <div className="group mb-12 cursor-pointer overflow-hidden rounded-2xl border border-dark-border bg-dark-card transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 sm:flex">
            <div className="relative h-64 overflow-hidden bg-dark-lighter sm:h-auto sm:w-3/5">
              <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${categoryGradients[featured.category] || "from-primary/80 to-accent/60"}`}>
                <svg className="h-24 w-24 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <PlayButton />
              <span className="absolute left-4 top-4 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white">
                {featured.category}
              </span>
            </div>
            <div className="flex flex-col justify-center p-6 sm:w-2/5 sm:p-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">Video vedette</p>
              <h2 className="mb-3 text-2xl font-bold text-white group-hover:text-primary transition-colors">
                {featured.title}
              </h2>
              <p className="mb-4 text-dark-muted leading-relaxed">
                {featured.description}
              </p>
              <span className="text-xs text-dark-muted">
                {new Date(featured.created_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        )}

        {/* Videos Grid */}
        {rest.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rest.map((video) => (
              <div
                key={video.id}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-dark-border bg-dark-card transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
              >
                {/* Thumbnail */}
                <div className="relative h-44 overflow-hidden bg-dark-lighter">
                  <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${categoryGradients[video.category] || "from-primary/80 to-accent/60"}`}>
                    <svg className="h-12 w-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  </div>
                  <PlayButton />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-card/60 to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                    {video.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="mb-1.5 text-sm font-bold text-white group-hover:text-primary transition-colors line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-xs text-dark-muted line-clamp-2">
                    {video.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { mediaUrl } from "@/lib/api";
import type { Video } from "@/lib/types";

const categoryGradients: Record<string, string> = {
  Musculation: "from-white/20 to-white/5",
  Cardio: "from-white/15 to-white/5",
  Yoga: "from-white/10 to-white/5",
  HIIT: "from-white/15 to-white/10",
  Stretching: "from-white/10 to-white/5",
};

function gradientFor(category: string) {
  return categoryGradients[category] || "from-primary/80 to-accent/60";
}

/**
 * Transforme une URL YouTube/Vimeo en URL d'integration. Renvoie null pour les
 * autres URL, qui seront alors lues par la balise <video> ou ouvertes telles
 * quelles.
 */
function embedUrl(url: string): string | null {
  const youtube = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  return null;
}

function isDirectFile(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url);
}

function PlayButton({ large = false }: { large?: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className={`flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/80 ${
          large ? "h-16 w-16" : "h-12 w-12"
        }`}
      >
        <svg className={`text-white ml-1 ${large ? "h-7 w-7" : "h-5 w-5"}`} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>
  );
}

function Thumbnail({ video, large = false }: { video: Video; large?: boolean }) {
  return (
    <>
      {video.thumbnail_url ? (
        <img
          src={mediaUrl(video.thumbnail_url)}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradientFor(video.category)}`}>
          <svg className={`text-white/20 ${large ? "h-24 w-24" : "h-12 w-12"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>
      )}
      <PlayButton large={large} />
    </>
  );
}

function VideoPlayer({ video, onClose }: { video: Video; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const embed = embedUrl(video.video_url);
  const src = mediaUrl(video.video_url);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
      onClick={onClose}
    >
      <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold text-white">{video.title}</h3>
          <button
            onClick={onClose}
            aria-label="Fermer la video"
            className="shrink-0 rounded-lg border border-white/20 px-3 py-1 text-sm text-white transition-colors hover:border-primary hover:text-primary"
          >
            Fermer
          </button>
        </div>

        <div className="aspect-video overflow-hidden rounded-2xl border border-dark-border bg-black">
          {embed ? (
            <iframe
              src={embed}
              title={video.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : isDirectFile(video.video_url) ? (
            <video src={src} controls autoPlay className="h-full w-full" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center">
              <p className="text-dark-muted">Cette video s&apos;ouvre sur une plateforme externe.</p>
              <a
                href={video.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="gradient-primary rounded-lg px-6 py-3 text-sm font-bold uppercase tracking-wider text-black"
              >
                Ouvrir la video
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VideosView({ videos }: { videos: Video[] }) {
  // Les categories viennent du champ libre saisi dans l'admin : on construit les
  // onglets a partir de ce qui existe reellement, pas d'une liste figee.
  const categories = ["Tous", ...Array.from(new Set(videos.map((v) => v.category).filter(Boolean)))];

  const [activeCategory, setActiveCategory] = useState("Tous");
  const [playing, setPlaying] = useState<Video | null>(null);

  if (videos.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-2xl border border-dark-border bg-dark-card p-16 text-center">
          <p className="text-dark-muted text-lg">
            Nos premieres videos d&apos;entrainement arrivent bientot.
          </p>
        </div>
      </section>
    );
  }

  const filtered =
    activeCategory === "Tous" ? videos : videos.filter((v) => v.category === activeCategory);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <>
      {/* Category Tabs */}
      {categories.length > 2 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  activeCategory === cat
                    ? "gradient-primary text-black shadow-lg shadow-white/10"
                    : "border border-dark-border bg-dark-card text-secondary-light hover:border-primary/40 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Featured Video */}
        {featured && (
          <button
            onClick={() => setPlaying(featured)}
            className="group mb-12 block w-full overflow-hidden rounded-2xl border border-dark-border bg-dark-card text-left transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 sm:flex"
          >
            <div className="relative h-64 overflow-hidden bg-dark-lighter sm:h-auto sm:w-3/5">
              <Thumbnail video={featured} large />
              <span className="absolute left-4 top-4 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white">
                {featured.category}
              </span>
            </div>
            <div className="flex flex-col justify-center p-6 sm:w-2/5 sm:p-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">Video vedette</p>
              <h2 className="mb-3 text-2xl font-bold text-white group-hover:text-primary transition-colors">
                {featured.title}
              </h2>
              {featured.description && (
                <p className="mb-4 text-dark-muted leading-relaxed">{featured.description}</p>
              )}
              <span className="text-xs text-dark-muted">
                {new Date(featured.created_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </button>
        )}

        {/* Videos Grid */}
        {rest.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rest.map((video) => (
              <button
                key={video.id}
                onClick={() => setPlaying(video)}
                className="group overflow-hidden rounded-2xl border border-dark-border bg-dark-card text-left transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="relative h-44 overflow-hidden bg-dark-lighter">
                  <Thumbnail video={video} />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dark-card/60 to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                    {video.category}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="mb-1.5 text-sm font-bold text-white group-hover:text-primary transition-colors line-clamp-2">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-xs text-dark-muted line-clamp-2">{video.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {playing && <VideoPlayer video={playing} onClose={() => setPlaying(null)} />}
    </>
  );
}

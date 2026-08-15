"use client";

import { useState, useEffect, useCallback } from "react";
import { mediaUrl } from "@/lib/api";
import type { TransformationSliderProps } from "@/lib/types";

export default function TransformationSlider({
  transformations,
  autoPlay = true,
  autoPlayInterval = 5000,
}: TransformationSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = transformations.length;

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (!autoPlay || total <= 1) return;
    const interval = setInterval(goNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, goNext, total]);

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-dark-border bg-dark-card p-12 text-center">
        <p className="text-dark-muted">Aucune transformation disponible.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Cards container */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {transformations.map((t) => (
            <div key={t.id} className="w-full shrink-0 px-2">
              <div className="rounded-2xl border border-dark-border bg-dark-card overflow-hidden">
                {/* Images */}
                <div className="grid grid-cols-2 gap-px bg-dark-border">
                  {/* Before */}
                  <div className="relative aspect-[4/5] bg-dark-card overflow-hidden">
                    {t.before_image_url ? (
                      <img
                        src={mediaUrl(t.before_image_url)}
                        alt={`${t.member_name} - Avant`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-dark-card to-dark-lighter">
                        <svg className="h-16 w-16 text-dark-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-3 left-3 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white">
                      AVANT
                    </span>
                  </div>

                  {/* After */}
                  <div className="relative aspect-[4/5] bg-dark-card overflow-hidden">
                    {t.after_image_url ? (
                      <img
                        src={mediaUrl(t.after_image_url)}
                        alt={`${t.member_name} - Apres`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center gradient-primary opacity-80">
                        <svg className="h-16 w-16 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-3 left-3 rounded-full gradient-primary px-3 py-1 text-xs font-semibold text-black">
                      APRES
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-lg font-bold text-white">{t.member_name}</h4>
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {t.duration_text}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-dark-muted italic">
                    &ldquo;{t.testimonial}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {total > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute -left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-dark-border bg-dark-card text-white shadow-lg transition-all hover:border-primary/40 hover:bg-dark-lighter sm:-left-5"
            aria-label="Precedent"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goNext}
            className="absolute -right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-dark-border bg-dark-card text-white shadow-lg transition-all hover:border-primary/40 hover:bg-dark-lighter sm:-right-5"
            aria-label="Suivant"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {transformations.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "w-6 gradient-primary"
                  : "w-2 bg-dark-border hover:bg-dark-muted"
              }`}
              aria-label={`Aller a la transformation ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

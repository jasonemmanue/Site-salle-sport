"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitReview } from "@/lib/api";

function StarIcon({ filled, size = "h-5 w-5" }: { filled: boolean; size?: string }) {
  return (
    <svg
      className={`${size} ${filled ? "text-accent" : "text-dark-border"}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export default function ReviewForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", rating: 0, comment: "" });
  const [hoverRating, setHoverRating] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) return setError("Merci d'indiquer votre nom.");
    if (form.rating === 0) return setError("Merci d'attribuer une note.");
    if (!form.comment.trim()) return setError("Merci d'ecrire un commentaire.");

    setStatus("sending");
    try {
      await submitReview({
        author_name: form.name.trim(),
        rating: form.rating,
        comment: form.comment.trim(),
      });
      setStatus("sent");
      setForm({ name: "", rating: 0, comment: "" });
      // L'avis part en moderation : rien de nouveau a afficher tout de suite,
      // mais on rafraichit pour rester coherent si l'admin a publie entre-temps.
      router.refresh();
    } catch {
      setStatus("idle");
      setError("L'envoi a echoue. Verifiez votre connexion et reessayez.");
    }
  }

  if (status === "sent") {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
          <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mb-2 text-xl font-bold text-white">Merci pour votre avis !</h3>
        <p className="mb-6 text-sm text-dark-muted">
          Votre avis sera publie apres moderation par notre equipe.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="rounded-xl gradient-primary px-6 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-105"
        >
          Laisser un autre avis
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 sm:p-8 space-y-5">
      <div>
        <label htmlFor="review-name" className="mb-1 block text-sm font-medium text-white">
          Votre nom
        </label>
        <input
          id="review-name"
          type="text"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Prenom N."
          maxLength={80}
          className="w-full rounded-xl border border-dark-border bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-secondary-light outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-white">Votre note</span>
        <div className="flex gap-1" role="radiogroup" aria-label="Note sur 5">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={form.rating === i + 1}
              aria-label={`${i + 1} etoile${i > 0 ? "s" : ""}`}
              onClick={() => setForm((prev) => ({ ...prev, rating: i + 1 }))}
              onMouseEnter={() => setHoverRating(i + 1)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110"
            >
              <StarIcon filled={i < (hoverRating || form.rating)} size="h-8 w-8" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="review-comment" className="mb-1 block text-sm font-medium text-white">
          Votre commentaire
        </label>
        <textarea
          id="review-comment"
          value={form.comment}
          onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
          placeholder="Partagez votre experience..."
          rows={4}
          maxLength={1000}
          className="w-full resize-none rounded-xl border border-dark-border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-secondary-light outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-xl gradient-primary py-3 text-sm font-bold text-black transition-all hover:shadow-lg hover:shadow-white/10 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
      >
        {status === "sending" ? "Envoi en cours..." : "Publier mon avis"}
      </button>
    </form>
  );
}

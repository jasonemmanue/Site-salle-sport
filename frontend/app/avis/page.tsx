import SectionTitle from "@/components/SectionTitle";
import ReviewCard from "@/components/ReviewCard";
import ReviewForm from "@/components/views/ReviewForm";
import { getReviews, safe } from "@/lib/api";

export const metadata = {
  title: "Avis de nos Membres | Eslie Sport",
  description:
    "Les temoignages verifies des membres d'Eslie Sport. Partagez vous aussi votre experience.",
};

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

export default async function AvisPage() {
  // L'API ne renvoie que les avis approuves par l'admin.
  const reviews = await safe(getReviews(), []);

  const totalReviews = reviews.length;

  // Moyenne et repartition calculees sur les avis reels — plus de note figee.
  const averageRating =
    totalReviews > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
      : 0;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    return {
      stars,
      count,
      percent: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0,
    };
  });

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
            Decouvrez ce que nos membres pensent de leur experience chez Eslie Sport.
          </p>
        </div>
      </section>

      {/* Rating Overview — masque tant qu'aucun avis n'est publie */}
      {totalReviews > 0 && (
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 -mt-6">
          <div className="glass rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-8">
            <div className="text-center shrink-0">
              <p className="text-6xl font-extrabold text-gradient">
                {averageRating.toLocaleString("fr-FR", { minimumFractionDigits: 1 })}
              </p>
              <div className="mt-2 flex justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} filled={i < Math.round(averageRating)} size="h-6 w-6" />
                ))}
              </div>
              <p className="mt-2 text-sm text-dark-muted">
                {totalReviews} avis publie{totalReviews > 1 ? "s" : ""}
              </p>
            </div>

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
      )}

      {/* Reviews Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {totalReviews > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dark-border bg-dark-card p-16 text-center">
            <p className="text-dark-muted text-lg">
              Aucun avis publie pour le moment. Soyez le premier a partager votre experience !
            </p>
          </div>
        )}
      </section>

      {/* Leave a Review Form */}
      <section className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 pb-20">
        <SectionTitle
          title="Laisser un avis"
          subtitle="Partagez votre experience avec la communaute Eslie Sport"
          accent
        />
        <ReviewForm />
      </section>
    </div>
  );
}

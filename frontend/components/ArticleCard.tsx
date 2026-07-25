import Link from "next/link";
import type { ArticleCardProps } from "@/lib/types";

export default function ArticleCard({ article }: ArticleCardProps) {
  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const readTime = Math.max(1, Math.ceil(article.content.length / 1500));

  return (
    <Link href={`/articles/${article.slug}`} className="group block">
      <article className="overflow-hidden rounded-2xl border border-dark-border bg-dark-card transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-dark-lighter">
          {article.cover_image_url ? (
            <img
              src={article.cover_image_url}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center gradient-primary opacity-60">
              <svg className="h-12 w-12 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5" />
              </svg>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-card/80 to-transparent" />

          {/* Category tag */}
          <span className="absolute left-3 top-3 rounded-full gradient-primary px-3 py-1 text-xs font-semibold text-black">
            Fitness
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="mb-2 text-lg font-bold text-white line-clamp-2 transition-colors group-hover:text-primary">
            {article.title}
          </h3>

          <p className="mb-4 text-sm text-dark-muted line-clamp-2">
            {article.excerpt}
          </p>

          <div className="flex items-center justify-between text-xs text-dark-muted">
            {publishedDate && <span>{publishedDate}</span>}
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {readTime} min
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

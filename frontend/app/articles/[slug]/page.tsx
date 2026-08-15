import Link from "next/link";
import { notFound } from "next/navigation";
import ShareButtons from "@/components/ShareButtons";
import { ApiError, getArticle, getArticles, mediaUrl, safe } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize";
import type { Article } from "@/lib/types";

async function loadArticle(slug: string): Promise<Article> {
  try {
    return await getArticle(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await safe(getArticle(slug), null);
  if (!article) return { title: "Article | Eslie Sport" };
  return {
    title: `${article.title} | Eslie Sport`,
    description: article.excerpt?.slice(0, 160) || undefined,
  };
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await loadArticle(slug);

  const { items: allArticles } = await safe(getArticles(), {
    items: [],
    total: 0,
    page: 1,
    pages: 0,
  });

  const related = allArticles.filter((a) => a.slug !== article.slug).slice(0, 3);

  const authorName = "Equipe Eslie Sport";

  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const readTime = Math.max(1, Math.ceil(article.content.length / 1500));

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 gradient-hero opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <Link
            href="/articles"
            className="mb-6 inline-flex items-center gap-2 text-sm text-secondary-light hover:text-primary transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Retour au blog
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {article.title}
          </h1>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-dark-muted">
            <span className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-xs font-bold text-black">
                {authorName.charAt(0)}
              </span>
              {authorName}
            </span>
            {publishedDate && <span>{publishedDate}</span>}
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {readTime} min de lecture
            </span>
          </div>
        </div>
      </section>

      {/* Cover image */}
      {article.cover_image_url && (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 -mt-8 mb-12">
          <img
            src={mediaUrl(article.cover_image_url)}
            alt={article.title}
            className="w-full rounded-2xl border border-dark-border object-cover"
          />
        </div>
      )}

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col gap-12 lg:flex-row">
          <article className="flex-1">
            <div className="glass rounded-2xl p-6 sm:p-10">
              {/*
                Contenu HTML redige dans l'admin, desinfecte cote serveur avant
                injection — voir lib/sanitize.ts.
              */}
              <div
                className="article-content"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
              />

              <ShareButtons title={article.title} />
            </div>
          </article>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6">
            <div className="glass rounded-2xl p-6 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full gradient-primary text-2xl font-bold text-black">
                {authorName.charAt(0)}
              </div>
              <h4 className="text-lg font-bold text-white">{authorName}</h4>
              <p className="mt-1 text-sm text-dark-muted">Coachs certifies Eslie Sport</p>
            </div>

            {related.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h4 className="mb-4 text-lg font-bold text-white">Articles similaires</h4>
                <div className="space-y-4">
                  {related.map((ra) => (
                    <Link
                      key={ra.slug}
                      href={`/articles/${ra.slug}`}
                      className="group block rounded-xl border border-dark-border bg-white/5 p-4 transition-all hover:border-primary/40"
                    >
                      <h5 className="text-sm font-semibold text-white group-hover:text-primary transition-colors line-clamp-2">
                        {ra.title}
                      </h5>
                      {ra.published_at && (
                        <p className="mt-1 text-xs text-dark-muted">
                          {new Date(ra.published_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}

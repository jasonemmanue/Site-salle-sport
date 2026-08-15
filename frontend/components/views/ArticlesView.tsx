"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import Pagination from "@/components/Pagination";
import { mediaUrl } from "@/lib/api";
import type { Article } from "@/lib/types";

const PER_PAGE = 9;

export default function ArticlesView({ articles }: { articles: Article[] }) {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.excerpt ?? "").toLowerCase().includes(q)
    );
  }, [articles, query]);

  // L'article vedette n'a de sens que sur la premiere page d'une liste non filtree.
  const showFeatured = currentPage === 1 && !query.trim();
  const featured = showFeatured ? filtered[0] : undefined;
  const listed = showFeatured ? filtered.slice(1) : filtered;

  const totalPages = Math.max(1, Math.ceil(listed.length / PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const visible = listed.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (articles.length === 0) {
    return (
      <div className="rounded-2xl border border-dark-border bg-dark-card p-16 text-center">
        <p className="text-dark-muted text-lg">
          Nos premiers articles arrivent tres bientot.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Recherche */}
      <div className="mb-12 mx-auto max-w-md">
        <label htmlFor="article-search" className="sr-only">
          Rechercher un article
        </label>
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-light"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            id="article-search"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Rechercher un article..."
            className="w-full rounded-xl border border-dark-border bg-dark-card py-3 pl-11 pr-4 text-sm text-white placeholder:text-secondary-light focus:border-primary/60 focus:outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dark-border bg-dark-card p-16 text-center">
          <p className="text-dark-muted text-lg">
            Aucun article ne correspond a &laquo;&nbsp;{query}&nbsp;&raquo;.
          </p>
          <button
            onClick={() => setQuery("")}
            className="mt-4 text-primary font-semibold text-sm hover:underline"
          >
            Effacer la recherche
          </button>
        </div>
      )}

      {/* Article vedette */}
      {featured && (
        <Link href={`/articles/${featured.slug}`} className="group mb-12 block">
          <div className="overflow-hidden rounded-2xl border border-dark-border bg-dark-card transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 sm:flex">
            <div className="relative h-64 overflow-hidden bg-dark-lighter sm:h-auto sm:w-1/2">
              {featured.cover_image_url ? (
                <img
                  src={mediaUrl(featured.cover_image_url)}
                  alt={featured.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center gradient-primary opacity-60">
                  <svg className="h-20 w-20 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-dark-card/80 hidden sm:block" />
              <span className="absolute left-4 top-4 rounded-full gradient-primary px-4 py-1.5 text-xs font-bold text-black">
                A la une
              </span>
            </div>
            <div className="flex flex-col justify-center p-6 sm:w-1/2 sm:p-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">Article vedette</p>
              <h2 className="mb-3 text-2xl font-bold text-white group-hover:text-primary transition-colors sm:text-3xl">
                {featured.title}
              </h2>
              {featured.excerpt && (
                <p className="mb-4 text-dark-muted leading-relaxed">{featured.excerpt}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-dark-muted">
                {featured.published_at && (
                  <span>
                    {new Date(featured.published_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
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

      {/* Grille */}
      {visible.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {/* Pagination — masquee tant qu'il n'y a qu'une page */}
      {totalPages > 1 && (
        <div className="mt-12">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </>
  );
}

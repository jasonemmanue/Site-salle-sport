"use client";

import type { PaginationProps } from "@/lib/types";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex h-10 items-center gap-1 rounded-lg border border-dark-border bg-dark-card px-3 text-sm font-medium text-white transition-colors hover:bg-dark-lighter disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Page precedente"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="hidden sm:inline">Precedent</span>
      </button>

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`dots-${i}`} className="px-1 text-dark-muted">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
              page === currentPage
                ? "gradient-primary text-black shadow-lg shadow-white/10"
                : "border border-dark-border bg-dark-card text-white hover:bg-dark-lighter"
            }`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex h-10 items-center gap-1 rounded-lg border border-dark-border bg-dark-card px-3 text-sm font-medium text-white transition-colors hover:bg-dark-lighter disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Page suivante"
      >
        <span className="hidden sm:inline">Suivant</span>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}

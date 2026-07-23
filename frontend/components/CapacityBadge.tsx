"use client";

import type { CapacityBadgeProps } from "@/lib/types";

export default function CapacityBadge({ current, max }: CapacityBadgeProps) {
  const remaining = max - current;
  const percentage = remaining / max;

  const isFull = remaining <= 0;

  const colorClass = isFull
    ? "bg-error/20 text-error border-error/30"
    : percentage < 0.2
      ? "bg-error/20 text-error border-error/30"
      : percentage < 0.5
        ? "bg-warning/20 text-warning border-warning/30"
        : "bg-success/20 text-success border-success/30";

  const pulseClass = !isFull && percentage < 0.2 ? "animate-pulse" : "";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colorClass} ${pulseClass}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isFull
            ? "bg-error"
            : percentage < 0.2
              ? "bg-error"
              : percentage < 0.5
                ? "bg-warning"
                : "bg-success"
        }`}
      />
      {isFull ? "COMPLET" : `${remaining} place${remaining > 1 ? "s" : ""}`}
    </span>
  );
}

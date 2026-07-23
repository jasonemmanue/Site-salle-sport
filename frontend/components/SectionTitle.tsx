import type { SectionTitleProps } from "@/lib/types";

export default function SectionTitle({ title, subtitle, accent = false }: SectionTitleProps) {
  return (
    <div className="text-center mb-12">
      <h2
        className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight ${
          accent ? "text-gradient" : "text-white"
        }`}
      >
        {title}
      </h2>

      {subtitle && (
        <p className="mt-4 text-dark-muted text-base sm:text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}

      <div className="mt-6 flex items-center justify-center gap-2">
        <span className="block h-1 w-8 rounded-full bg-primary" />
        <span className="block h-1 w-16 rounded-full gradient-primary" />
        <span className="block h-1 w-8 rounded-full bg-primary" />
      </div>
    </div>
  );
}

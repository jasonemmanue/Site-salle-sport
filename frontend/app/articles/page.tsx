import ArticlesView from "@/components/views/ArticlesView";
import { getArticles, safe } from "@/lib/api";

export const metadata = {
  title: "Blog Fitness & Bien-etre | Eslie Sport",
  description:
    "Conseils d'experts, astuces nutrition et entrainements par les coachs d'Eslie Sport.",
};

export default async function ArticlesPage() {
  // L'API ne renvoie que les articles publies par defaut : les brouillons de
  // l'admin ne fuitent pas sur le site public.
  const { items } = await safe(getArticles(), { items: [], total: 0, page: 1, pages: 0 });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="watermark relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 gradient-hero opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_70%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            <span className="text-gradient">Blog Fitness &amp; Bien-etre</span>
          </h1>
          <p className="mt-4 text-lg text-dark-muted max-w-2xl mx-auto">
            Conseils d&apos;experts, astuces nutrition et entrainements pour atteindre vos objectifs.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <ArticlesView articles={items} />
      </section>
    </div>
  );
}

import Link from "next/link";
import type { Article } from "@/lib/types";

const mockArticles: Record<string, { article: Article; category: string; author: string; content: string }> = {
  "10-aliments-prise-de-masse": {
    article: {
      id: "1",
      title: "10 aliments essentiels pour la prise de masse musculaire",
      slug: "10-aliments-prise-de-masse",
      content: "",
      excerpt: "Decouvrez les meilleurs aliments pour optimiser votre prise de masse musculaire.",
      cover_image_url: "",
      status: "published",
      published_at: "2026-07-15T10:00:00Z",
      author_id: "coach-1",
    },
    category: "Nutrition",
    author: "Coach Thomas",
    content: `
La prise de masse musculaire ne se fait pas uniquement a la salle. Votre alimentation joue un role crucial dans la construction musculaire. Voici les 10 aliments incontournables.

## 1. Poitrine de poulet

Avec environ 31 g de proteines pour 100 g et tres peu de graisses, la poitrine de poulet est l'aliment de reference pour les sportifs. Facile a cuisiner et versatile, elle s'integre dans tous vos repas.

## 2. Oeufs entiers

Les oeufs sont une source complete de proteines contenant tous les acides amines essentiels. Le jaune apporte des vitamines D et B12 essentielles a la recuperation.

## 3. Saumon

Riche en proteines et en omega-3, le saumon favorise la recuperation musculaire et reduit l'inflammation post-entrainement. Visez 2 a 3 portions par semaine.

## 4. Flocons d'avoine

Source de glucides complexes a index glycemique bas, les flocons d'avoine fournissent une energie stable pour vos entrainements. Ils sont aussi riches en fibres.

## 5. Patate douce

Alternative saine aux glucides raffines, la patate douce apporte des glucides complexes, du potassium et des vitamines A et C.

## 6. Fromage blanc 0%

Riche en caseine (proteine a digestion lente), le fromage blanc est ideal en collation ou avant le coucher pour alimenter vos muscles toute la nuit.

## 7. Brocoli

Ce super-legume est riche en vitamines C et K, en fibres et en composes anti-inflammatoires. Il aide a maintenir un systeme immunitaire fort pendant les periodes d'entrainement intense.

## 8. Riz complet

Le riz complet apporte des glucides complexes et des fibres pour une energie durable. C'est la base parfaite pour vos repas post-entrainement.

## 9. Amandes

Riches en graisses saines, en proteines et en magnesium, les amandes sont le snack ideal du sportif. Une poignee par jour suffit.

## 10. Banane

Riche en potassium et en glucides rapides, la banane est parfaite avant ou apres l'entrainement pour refaire le plein d'energie et prevenir les crampes.

### Conclusion

Integrez progressivement ces aliments dans votre alimentation quotidienne. Associez-les a un entrainement structure et un sommeil de qualite pour des resultats optimaux.
    `,
  },
};

const defaultArticleData = {
  article: {
    id: "0",
    title: "Article Fitness",
    slug: "article",
    content: "",
    excerpt: "Contenu bientot disponible.",
    cover_image_url: "",
    status: "published" as const,
    published_at: "2026-07-01T10:00:00Z",
    author_id: "coach-1",
  },
  category: "Fitness",
  author: "Coach FitnessPro",
  content: `
## Bienvenue sur notre blog

Cet article est en cours de redaction. Revenez bientot pour decouvrir nos conseils fitness et bien-etre.

### Restez connecte

Nos coachs preparent du contenu de qualite pour vous aider a atteindre vos objectifs. En attendant, n'hesitez pas a consulter nos autres articles.

### Nos engagements

- Des conseils bases sur la science
- Des programmes adaptes a tous les niveaux
- Un suivi personnalise avec nos coachs
  `,
};

const relatedArticles = [
  { slug: "guide-complet-hiit", title: "Guide complet du HIIT", date: "10 juillet 2026" },
  { slug: "sommeil-recuperation-musculaire", title: "L'importance du sommeil dans la recuperation", date: "5 juillet 2026" },
  { slug: "5-erreurs-musculation", title: "5 erreurs courantes en musculation", date: "28 juin 2026" },
];

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = mockArticles[slug] || { ...defaultArticleData, article: { ...defaultArticleData.article, slug, title: slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") } };

  const { article, category, author, content } = data;
  const publishedDate = new Date(article.published_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const readTime = Math.max(1, Math.ceil(content.length / 1500));

  const paragraphs = content.trim().split("\n").filter(Boolean);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 gradient-hero opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <Link
            href="/articles"
            className="mb-6 inline-flex items-center gap-2 text-sm text-dark-muted hover:text-primary transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Retour au blog
          </Link>
          <span className="mb-4 inline-block rounded-full gradient-primary px-4 py-1.5 text-xs font-bold text-black">
            {category}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {article.title}
          </h1>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-dark-muted">
            <span className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-xs font-bold text-black">
                {author.charAt(0)}
              </span>
              {author}
            </span>
            <span>{publishedDate}</span>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {readTime} min de lecture
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col gap-12 lg:flex-row">
          {/* Main content */}
          <article className="flex-1">
            <div className="glass rounded-2xl p-6 sm:p-10">
              <div className="prose-custom space-y-4">
                {paragraphs.map((para, i) => {
                  const trimmed = para.trim();
                  if (trimmed.startsWith("### ")) {
                    return (
                      <h3 key={i} className="text-xl font-bold text-white mt-8 mb-3">
                        {trimmed.replace("### ", "")}
                      </h3>
                    );
                  }
                  if (trimmed.startsWith("## ")) {
                    return (
                      <h2 key={i} className="text-2xl font-bold text-gradient mt-10 mb-4">
                        {trimmed.replace("## ", "")}
                      </h2>
                    );
                  }
                  if (trimmed.startsWith("- ")) {
                    return (
                      <li key={i} className="ml-4 text-dark-muted leading-relaxed list-disc">
                        {trimmed.replace("- ", "")}
                      </li>
                    );
                  }
                  return (
                    <p key={i} className="text-dark-muted leading-relaxed text-base">
                      {trimmed}
                    </p>
                  );
                })}
              </div>

              {/* Share */}
              <div className="mt-12 border-t border-dark-border pt-8">
                <p className="mb-4 text-sm font-semibold text-white">Partager cet article</p>
                <div className="flex gap-3">
                  {/* Facebook */}
                  <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-dark-border bg-dark-card text-dark-muted transition-all hover:border-[#1877F2] hover:text-[#1877F2]">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>
                  {/* Twitter / X */}
                  <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-dark-border bg-dark-card text-dark-muted transition-all hover:border-white hover:text-white">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </button>
                  {/* LinkedIn */}
                  <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-dark-border bg-dark-card text-dark-muted transition-all hover:border-[#0A66C2] hover:text-[#0A66C2]">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6">
            {/* Author card */}
            <div className="glass rounded-2xl p-6 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full gradient-primary text-2xl font-bold text-black">
                {author.charAt(0)}
              </div>
              <h4 className="text-lg font-bold text-white">{author}</h4>
              <p className="mt-1 text-sm text-dark-muted">Coach certifie FitnessPro</p>
            </div>

            {/* Related articles */}
            <div className="glass rounded-2xl p-6">
              <h4 className="mb-4 text-lg font-bold text-white">Articles similaires</h4>
              <div className="space-y-4">
                {relatedArticles.map((ra) => (
                  <Link
                    key={ra.slug}
                    href={`/articles/${ra.slug}`}
                    className="group block rounded-xl border border-dark-border bg-white/5 p-4 transition-all hover:border-primary/40"
                  >
                    <h5 className="text-sm font-semibold text-white group-hover:text-primary transition-colors line-clamp-2">
                      {ra.title}
                    </h5>
                    <p className="mt-1 text-xs text-dark-muted">{ra.date}</p>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

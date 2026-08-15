import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import TransformationSlider from "@/components/TransformationSlider";
import { getTransformations, mediaUrl, safe } from "@/lib/api";

export const metadata = {
  title: "Transformations & Resultats | Eslie Sport",
  description:
    "Les parcours avant/apres de nos membres chez Eslie Sport, a Abidjan.",
};

export default async function TransformationsPage() {
  const transformations = await safe(getTransformations(), []);
  const featured = transformations.filter((t) => t.is_featured);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 gradient-hero opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            <span className="text-gradient">Transformations &amp; Resultats</span>
          </h1>
          <p className="mt-4 text-lg text-dark-muted max-w-2xl mx-auto">
            Decouvrez les parcours inspirants de nos membres. Votre transformation commence ici.
          </p>
          {transformations.length > 0 && (
            <p className="mt-6 inline-block glass rounded-2xl px-6 py-3">
              <span className="text-2xl font-extrabold text-gradient">
                {transformations.length}
              </span>{" "}
              <span className="text-sm text-dark-muted">
                parcours partages par nos membres
              </span>
            </p>
          )}
        </div>
      </section>

      {/* Slider — uniquement les transformations mises en avant dans l'admin */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-3xl px-8 sm:px-12 py-16">
          <SectionTitle
            title="Avant / Apres"
            subtitle="Faites defiler pour voir les transformations de nos membres"
            accent
          />
          <TransformationSlider transformations={featured} autoPlay autoPlayInterval={6000} />
        </section>
      )}

      {/* All Transformations Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <SectionTitle
          title="Toutes les Transformations"
          subtitle="Chaque parcours est unique, chaque resultat est une victoire"
        />
        {transformations.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {transformations.map((t) => (
              <div
                key={t.id}
                className="overflow-hidden rounded-2xl border border-dark-border bg-dark-card transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
              >
                {/* Before / After */}
                <div className="grid grid-cols-2 gap-px bg-dark-border">
                  <div className="relative aspect-square bg-dark-card overflow-hidden">
                    {t.before_image_url ? (
                      <img
                        src={mediaUrl(t.before_image_url)}
                        alt={`${t.member_name} - Avant`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-dark-card to-dark-lighter">
                        <svg className="h-12 w-12 text-dark-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                        </svg>
                      </div>
                    )}
                    <span className="absolute bottom-2 left-2 rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">
                      Avant
                    </span>
                  </div>
                  <div className="relative aspect-square bg-dark-card overflow-hidden">
                    {t.after_image_url ? (
                      <img
                        src={mediaUrl(t.after_image_url)}
                        alt={`${t.member_name} - Apres`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center gradient-primary opacity-80">
                        <svg className="h-12 w-12 text-black/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                        </svg>
                      </div>
                    )}
                    <span className="absolute bottom-2 left-2 rounded-full gradient-primary px-2.5 py-0.5 text-[10px] font-bold text-black uppercase">
                      Apres
                    </span>
                  </div>
                </div>
                {/* Info */}
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h4 className="text-base font-bold text-white">{t.member_name}</h4>
                    {t.duration_text && (
                      <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                        {t.duration_text}
                      </span>
                    )}
                  </div>
                  {t.testimonial && (
                    <p className="text-sm text-dark-muted italic leading-relaxed line-clamp-3">
                      &ldquo;{t.testimonial}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dark-border bg-dark-card p-16 text-center">
            <p className="text-dark-muted text-lg">
              Les premiers parcours de nos membres seront publies tres bientot.
            </p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative overflow-hidden rounded-2xl gradient-primary p-8 sm:p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="relative">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-black">
              Commencez votre transformation
            </h3>
            <p className="mt-3 text-black/70 max-w-xl mx-auto">
              Rejoignez nos membres et atteignez vos objectifs. Votre parcours commence des aujourd&apos;hui.
            </p>
            <Link
              href="/abonnements"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-black/90 hover:shadow-lg"
            >
              Voir nos abonnements
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

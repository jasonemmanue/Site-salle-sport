import VideosView from "@/components/views/VideosView";
import { getVideos, safe } from "@/lib/api";

export const metadata = {
  title: "Videos d'Entrainement | Eslie Sport",
  description:
    "Suivez nos coachs en video : musculation, cardio, HIIT, stretching — entrainez-vous ou que vous soyez.",
};

export default async function VideosPage() {
  const videos = await safe(getVideos(), []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 gradient-hero opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            <span className="text-gradient">Videos d&apos;Entrainement</span>
          </h1>
          <p className="mt-4 text-lg text-dark-muted max-w-2xl mx-auto">
            Suivez nos coachs en video et entrainez-vous ou que vous soyez.
          </p>
        </div>
      </section>

      <VideosView videos={videos} />
    </div>
  );
}

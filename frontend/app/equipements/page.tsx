import SectionTitle from "@/components/SectionTitle";
import EquipmentView from "@/components/views/EquipmentView";
import { getEquipment, getSettings, safe } from "@/lib/api";

export const metadata = {
  title: "Nos Equipements | Eslie Sport",
  description:
    "Machines de musculation, cardio, materiel fonctionnel et vestiaires — decouvrez les installations d'Eslie Sport.",
};

export default async function EquipementsPage() {
  const [equipment, settings] = await Promise.all([
    safe(getEquipment(), []),
    safe(getSettings(), {}),
  ]);

  // Les caracteristiques des locaux ne sont pas modelisees en base ; seuls les
  // horaires le sont, via les parametres edites dans l'admin.
  const facilityFeatures = [
    { label: "Superficie", value: "2 500 m²", icon: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" },
    { label: "Climatisation", value: "Integrale", icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636" },
    { label: "Parking", value: "50 places", icon: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.122-.504 1.095-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" },
    { label: "Wi-Fi", value: "Gratuit", icon: "M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" },
    { label: "Horaires", value: settings.opening_hours || "7h - 20h", icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Accessible PMR", value: "Oui", icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="watermark relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 gradient-hero opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_70%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            <span className="text-gradient">Nos Equipements</span>
          </h1>
          <p className="mt-4 text-lg text-dark-muted max-w-2xl mx-auto">
            Un espace equipe des meilleures machines pour atteindre vos objectifs.
          </p>
        </div>
      </section>

      <EquipmentView equipment={equipment} />

      {/* Facility Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <SectionTitle
          title="Nos Installations"
          subtitle="Un espace moderne et confortable pour votre entrainement"
          accent
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facilityFeatures.map((feat) => (
            <div
              key={feat.label}
              className="glass rounded-2xl p-6 flex items-center gap-4 transition-all duration-300 hover:border-primary/30"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-primary">
                <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={feat.icon} />
                </svg>
              </div>
              <div>
                <p className="text-sm text-dark-muted">{feat.label}</p>
                <p className="text-lg font-bold text-white">{feat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

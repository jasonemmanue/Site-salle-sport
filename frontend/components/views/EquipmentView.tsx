"use client";

import { useState } from "react";
import { mediaUrl } from "@/lib/api";
import type { Equipment, EquipmentZone } from "@/lib/types";

const ZONES: { key: EquipmentZone; label: string; icon: string }[] = [
  { key: "musculation", label: "Musculation", icon: "M3 6h18M3 12h18M3 18h18" },
  { key: "cardio", label: "Cardio", icon: "M3.172 5.172a4 4 0 015.656 0L12 8.344l3.172-3.172a4 4 0 115.656 5.656L12 19.656l-8.828-8.828a4 4 0 010-5.656z" },
  { key: "stretching", label: "Stretching", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" },
  { key: "functional", label: "Fonctionnel", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" },
  { key: "locker", label: "Vestiaires", icon: "M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" },
];

function ZoneGradient({ zone }: { zone: EquipmentZone }) {
  const gradients: Record<EquipmentZone, string> = {
    musculation: "from-white/20 to-white/5",
    cardio: "from-white/15 to-white/5",
    stretching: "from-white/10 to-white/5",
    functional: "from-white/15 to-white/5",
    locker: "from-white/10 to-white/5",
  };
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${gradients[zone]} opacity-60`} />
  );
}

export default function EquipmentView({ equipment }: { equipment: Equipment[] }) {
  // N'afficher que les onglets de zone qui contiennent reellement du materiel :
  // un onglet vide donne l'impression d'un site casse.
  const populatedZones = ZONES.filter((z) => equipment.some((eq) => eq.zone === z.key));
  const [activeZone, setActiveZone] = useState<EquipmentZone | null>(
    populatedZones[0]?.key ?? null
  );

  if (equipment.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-2xl border border-dark-border bg-dark-card p-16 text-center">
          <p className="text-dark-muted text-lg">
            L'inventaire de nos equipements sera publie tres prochainement.
          </p>
        </div>
      </section>
    );
  }

  const filtered = equipment.filter((eq) => eq.zone === activeZone);

  return (
    <>
      {/* Zone Filter Tabs */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {populatedZones.map((zone) => (
            <button
              key={zone.key}
              onClick={() => setActiveZone(zone.key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                activeZone === zone.key
                  ? "gradient-primary text-black shadow-lg shadow-white/10 scale-105"
                  : "border border-dark-border bg-dark-card text-secondary-light hover:border-primary/40 hover:text-white"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={zone.icon} />
              </svg>
              {zone.label}
            </button>
          ))}
        </div>
      </section>

      {/* Equipment Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((eq) => (
            <div
              key={eq.id}
              className="group overflow-hidden rounded-2xl border border-dark-border bg-dark-card transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="relative h-48 overflow-hidden bg-dark-lighter">
                <ZoneGradient zone={eq.zone} />
                {eq.image_url ? (
                  <img
                    src={mediaUrl(eq.image_url)}
                    alt={eq.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="relative flex h-full w-full items-center justify-center">
                    <svg className="h-16 w-16 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                )}
                {/* Quantity badge */}
                <span className="absolute top-3 right-3 rounded-full gradient-primary px-3 py-1 text-xs font-bold text-black shadow-lg">
                  x{eq.quantity}
                </span>
                <div className="absolute inset-0 bg-gradient-to-t from-dark-card/80 to-transparent" />
              </div>

              <div className="p-5">
                <h3 className="mb-2 text-lg font-bold text-white group-hover:text-primary transition-colors">
                  {eq.name}
                </h3>
                {eq.description && (
                  <p className="text-sm text-dark-muted leading-relaxed">
                    {eq.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

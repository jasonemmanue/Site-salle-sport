"use client";

import { useState } from "react";
import SectionTitle from "@/components/SectionTitle";
import type { Equipment, EquipmentZone } from "@/lib/types";

const ZONES: { key: EquipmentZone; label: string; icon: string }[] = [
  { key: "musculation", label: "Musculation", icon: "M3 6h18M3 12h18M3 18h18" },
  { key: "cardio", label: "Cardio", icon: "M3.172 5.172a4 4 0 015.656 0L12 8.344l3.172-3.172a4 4 0 115.656 5.656L12 19.656l-8.828-8.828a4 4 0 010-5.656z" },
  { key: "stretching", label: "Stretching", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" },
  { key: "functional", label: "Fonctionnel", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" },
  { key: "locker", label: "Vestiaires", icon: "M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" },
];

const mockEquipment: Equipment[] = [
  // Musculation
  { id: "1", name: "Banc de developpement couche", description: "Banc reglable avec support barre olympique. Ideal pour le developpement de la poitrine et des triceps.", zone: "musculation", image_url: "", quantity: 6, is_active: true },
  { id: "2", name: "Cage a squat", description: "Cage de squat professionnelle avec barres de securite reglables et support pour tractions.", zone: "musculation", image_url: "", quantity: 4, is_active: true },
  { id: "3", name: "Halteres (2-50 kg)", description: "Jeu complet d'halteres en fonte caoutchoutee, de 2 kg a 50 kg par increment de 2 kg.", zone: "musculation", image_url: "", quantity: 30, is_active: true },
  { id: "4", name: "Poulie haute / basse", description: "Machine a poulie reglable pour travail du dos, biceps, triceps et epaules.", zone: "musculation", image_url: "", quantity: 3, is_active: true },
  // Cardio
  { id: "5", name: "Tapis de course Technogym", description: "Tapis de course professionnel avec ecran tactile, programmes predefinis et suivi cardiaque.", zone: "cardio", image_url: "", quantity: 12, is_active: true },
  { id: "6", name: "Velo elliptique", description: "Elliptique a resistance magnetique avec programmes d'entrainement et suivi des calories.", zone: "cardio", image_url: "", quantity: 8, is_active: true },
  { id: "7", name: "Rameur Concept2", description: "Rameur d'interieur professionnel utilise en competition. Ideal pour le cardio complet.", zone: "cardio", image_url: "", quantity: 6, is_active: true },
  { id: "8", name: "Velo d'appartement", description: "Velo stationnaire avec resistance reglable et programmes de spinning.", zone: "cardio", image_url: "", quantity: 10, is_active: true },
  // Stretching
  { id: "9", name: "Tapis de yoga", description: "Tapis antiderapant haute densite pour yoga, Pilates et etirements au sol.", zone: "stretching", image_url: "", quantity: 20, is_active: true },
  { id: "10", name: "Foam roller", description: "Rouleau de massage en mousse pour l'auto-massage et la recuperation musculaire.", zone: "stretching", image_url: "", quantity: 15, is_active: true },
  { id: "11", name: "Ballon de stabilite", description: "Swiss ball de 55 a 75 cm pour exercices de gainage et d'equilibre.", zone: "stretching", image_url: "", quantity: 10, is_active: true },
  // Fonctionnel
  { id: "12", name: "Kettlebells (4-32 kg)", description: "Collection complete de kettlebells en fonte pour entrainements fonctionnels et HIIT.", zone: "functional", image_url: "", quantity: 20, is_active: true },
  { id: "13", name: "Battle ropes", description: "Cordes ondulatoires de 12 metres pour le conditionnement metabolique.", zone: "functional", image_url: "", quantity: 4, is_active: true },
  { id: "14", name: "Box de pliometrie", description: "Boites de saut reglables en 3 hauteurs pour les exercices explosifs.", zone: "functional", image_url: "", quantity: 6, is_active: true },
  // Vestiaires
  { id: "15", name: "Casiers securises", description: "Casiers individuels avec serrure a code pour ranger vos affaires en toute securite.", zone: "locker", image_url: "", quantity: 120, is_active: true },
  { id: "16", name: "Douches individuelles", description: "Cabines de douche privatives avec gel douche et shampoing fournis.", zone: "locker", image_url: "", quantity: 16, is_active: true },
  { id: "17", name: "Sauna", description: "Sauna finlandais traditionnel pour la detente et la recuperation apres l'effort.", zone: "locker", image_url: "", quantity: 1, is_active: true },
];

const FACILITY_FEATURES = [
  { label: "Superficie", value: "2 500 m²", icon: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" },
  { label: "Climatisation", value: "Integrale", icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636" },
  { label: "Parking", value: "50 places", icon: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.122-.504 1.095-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" },
  { label: "Wi-Fi", value: "Gratuit", icon: "M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" },
  { label: "Horaires", value: "6h - 23h", icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" },
  { label: "Accessible PMR", value: "Oui", icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" },
];

function ZoneGradient({ zone }: { zone: EquipmentZone }) {
  const gradients: Record<EquipmentZone, string> = {
    musculation: "from-primary/80 to-accent/60",
    cardio: "from-red-500/80 to-pink-500/60",
    stretching: "from-emerald-500/80 to-teal-500/60",
    functional: "from-secondary/80 to-indigo-500/60",
    locker: "from-violet-500/80 to-purple-500/60",
  };
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${gradients[zone]} opacity-60`} />
  );
}

export default function EquipementsPage() {
  const [activeZone, setActiveZone] = useState<EquipmentZone>("musculation");

  const filtered = mockEquipment.filter((eq) => eq.zone === activeZone);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 gradient-hero opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(225,29,72,0.15),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            <span className="text-gradient">Nos Equipements</span>
          </h1>
          <p className="mt-4 text-lg text-dark-muted max-w-2xl mx-auto">
            Plus de 2 500 m&sup2; equipes des meilleures machines pour atteindre vos objectifs.
          </p>
        </div>
      </section>

      {/* Zone Filter Tabs */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {ZONES.map((zone) => (
            <button
              key={zone.key}
              onClick={() => setActiveZone(zone.key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                activeZone === zone.key
                  ? "gradient-primary text-white shadow-lg shadow-primary/30 scale-105"
                  : "border border-dark-border bg-dark-card text-dark-muted hover:border-primary/40 hover:text-white"
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
              {/* Image placeholder */}
              <div className="relative h-48 overflow-hidden bg-dark-lighter">
                <ZoneGradient zone={eq.zone} />
                <div className="relative flex h-full w-full items-center justify-center">
                  <svg className="h-16 w-16 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                {/* Quantity badge */}
                <span className="absolute top-3 right-3 rounded-full gradient-primary px-3 py-1 text-xs font-bold text-white shadow-lg">
                  x{eq.quantity}
                </span>
                <div className="absolute inset-0 bg-gradient-to-t from-dark-card/80 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="mb-2 text-lg font-bold text-white group-hover:text-primary transition-colors">
                  {eq.name}
                </h3>
                <p className="text-sm text-dark-muted leading-relaxed">
                  {eq.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Facility Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <SectionTitle
          title="Nos Installations"
          subtitle="Un espace moderne et confortable pour votre entrainement"
          accent
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FACILITY_FEATURES.map((feat) => (
            <div
              key={feat.label}
              className="glass rounded-2xl p-6 flex items-center gap-4 transition-all duration-300 hover:border-primary/30"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-primary">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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

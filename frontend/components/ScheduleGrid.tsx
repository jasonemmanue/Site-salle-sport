"use client";

import { useCallback, useEffect, useState } from "react";
import CapacityBadge from "./CapacityBadge";
import EnrollmentForm from "./EnrollmentForm";
import { getSlotAvailability, safe } from "@/lib/api";
import type { DayOfWeek, ScheduleSlot, SlotAvailability } from "@/lib/types";

const DAYS = [
  { key: 0, label: "Lun", full: "Lundi" },
  { key: 1, label: "Mar", full: "Mardi" },
  { key: 2, label: "Mer", full: "Mercredi" },
  { key: 3, label: "Jeu", full: "Jeudi" },
  { key: 4, label: "Ven", full: "Vendredi" },
  { key: 5, label: "Sam", full: "Samedi" },
  { key: 6, label: "Dim", full: "Dimanche" },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  force: "border-l-white bg-white/5",
  cardio: "border-l-white/80 bg-white/[0.04]",
  flexibility: "border-l-white/60 bg-white/[0.03]",
  martial_arts: "border-l-white/70 bg-white/[0.035]",
  dance: "border-l-white/90 bg-white/[0.045]",
};

const CATEGORY_LABELS: Record<string, string> = {
  force: "Force",
  cardio: "Cardio",
  flexibility: "Souplesse",
  martial_arts: "Arts martiaux",
  dance: "Danse",
};

/**
 * Date de la prochaine occurrence d'un jour de la semaine, au format `YYYY-MM-DD`.
 *
 * Les creneaux sont recurrents (day_of_week), mais une inscription porte sur une
 * date precise : il faut donc resoudre "mercredi" en une vraie date. Le jour
 * courant compte comme prochaine occurrence.
 *
 * Convention backend : 0 = lundi (comme `date.weekday()` en Python), alors que
 * `Date.getDay()` renvoie 0 pour dimanche — d'ou le decalage.
 */
function nextDateForDay(dayOfWeek: number): string {
  const today = new Date();
  const todayIndex = (today.getDay() + 6) % 7;
  const delta = (dayOfWeek - todayIndex + 7) % 7;
  const target = new Date(today);
  target.setDate(today.getDate() + delta);
  // Formatage local : toISOString() convertit en UTC et peut reculer d'un jour.
  const month = String(target.getMonth() + 1).padStart(2, "0");
  const day = String(target.getDate()).padStart(2, "0");
  return `${target.getFullYear()}-${month}-${day}`;
}

export default function ScheduleGrid({ slots }: { slots: ScheduleSlot[] }) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(0);
  const [availability, setAvailability] = useState<Record<string, SlotAvailability>>({});
  const [enrollingSlot, setEnrollingSlot] = useState<ScheduleSlot | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  // Le jour courant est calcule apres l'hydratation : le faire pendant le rendu
  // ferait diverger le HTML serveur et le HTML client.
  useEffect(() => {
    setSelectedDay(((new Date().getDay() + 6) % 7) as DayOfWeek);
  }, []);

  const daySlots = slots
    .filter((s) => s.day_of_week === selectedDay)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const targetDate = nextDateForDay(selectedDay);

  const loadAvailability = useCallback(async () => {
    if (daySlots.length === 0) return;
    const results = await Promise.all(
      daySlots.map(async (slot) => {
        const data = await safe(getSlotAvailability(slot.id, targetDate), null);
        return [slot.id, data] as const;
      })
    );
    setAvailability((prev) => {
      const next = { ...prev };
      for (const [id, data] of results) {
        if (data) next[id] = data;
      }
      return next;
    });
    // daySlots est derive de selectedDay : la dependance sur les ids evite une
    // boucle de rendu tout en rechargeant quand le jour change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay, targetDate, slots]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const dayLabel = DAYS[selectedDay].full.toLowerCase();

  return (
    <div>
      {/* Day tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {DAYS.map((day) => (
          <button
            key={day.key}
            onClick={() => setSelectedDay(day.key)}
            aria-pressed={selectedDay === day.key}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              selectedDay === day.key
                ? "gradient-primary text-black shadow-lg shadow-white/10"
                : "border border-dark-border bg-dark-card text-secondary-light hover:border-primary/40 hover:text-white"
            }`}
          >
            <span className="sm:hidden">{day.label}</span>
            <span className="hidden sm:inline">{day.full}</span>
          </button>
        ))}
      </div>

      {/* Category legend */}
      <div className="mb-4 flex flex-wrap gap-3">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-dark-muted">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                key === "force"
                  ? "bg-white"
                  : key === "cardio"
                    ? "bg-white/80"
                    : key === "flexibility"
                      ? "bg-white/60"
                      : key === "martial_arts"
                        ? "bg-white/70"
                        : "bg-white/90"
              }`}
            />
            {label}
          </div>
        ))}
      </div>

      {confirmation && (
        <div
          role="status"
          className="mb-4 rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-success"
        >
          {confirmation}
        </div>
      )}

      {/* Slots */}
      <div className="space-y-3 overflow-x-auto">
        {daySlots.length === 0 ? (
          <div className="rounded-2xl border border-dark-border bg-dark-card p-12 text-center">
            <p className="text-dark-muted">Aucun cours programme le {dayLabel}.</p>
          </div>
        ) : (
          daySlots.map((slot) => {
            const category = slot.activity?.category || "force";
            const slotAvailability = availability[slot.id];
            const maxCap =
              slotAvailability?.max_capacity ??
              slot.max_capacity_override ??
              slot.activity?.max_capacity ??
              0;
            const enrolled = slotAvailability?.enrolled_count ?? 0;

            return (
              <button
                key={slot.id}
                onClick={() => setEnrollingSlot(slot)}
                className={`w-full rounded-xl border-l-4 p-4 text-left transition-all duration-200 hover:scale-[1.01] border border-dark-border hover:border-primary/30 ${
                  CATEGORY_COLORS[category] || "border-l-gray-500 bg-gray-500/10"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">{slot.start_time}</p>
                      <p className="text-xs text-dark-muted">{slot.end_time}</p>
                    </div>

                    <div className="h-10 w-px bg-dark-border" />

                    <div>
                      <h4 className="text-base font-bold text-white">
                        {slot.activity?.name || "Cours"}
                      </h4>
                      <p className="text-sm text-dark-muted">
                        {slot.coach?.name || "Coach"} &middot;{" "}
                        {slot.activity?.duration_minutes || 60} min
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Le badge n'apparait qu'une fois la disponibilite reelle connue */}
                    {slotAvailability && maxCap > 0 && (
                      <CapacityBadge current={enrolled} max={maxCap} />
                    )}

                    <span className="rounded-lg bg-white/5 px-2 py-1 text-xs text-dark-muted">
                      {CATEGORY_LABELS[category] || category}
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {enrollingSlot && (
        <EnrollmentForm
          slot={enrollingSlot}
          specificDate={targetDate}
          onClose={() => setEnrollingSlot(null)}
          onSuccess={(status) => {
            setConfirmation(
              status === "waitlisted"
                ? "Le cours est complet : vous etes inscrit sur la liste d'attente. Nous vous contacterons si une place se libere."
                : "Votre inscription est enregistree. A tres bientot !"
            );
            loadAvailability();
          }}
        />
      )}
    </div>
  );
}

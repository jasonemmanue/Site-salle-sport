"use client";

import { useState } from "react";
import type { ScheduleSlot, Activity, Coach } from "@/lib/types";
import CapacityBadge from "./CapacityBadge";

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
  force: "border-l-red-500 bg-red-500/10",
  cardio: "border-l-orange-500 bg-orange-500/10",
  flexibility: "border-l-green-500 bg-green-500/10",
  martial_arts: "border-l-purple-500 bg-purple-500/10",
  dance: "border-l-pink-500 bg-pink-500/10",
};

const CATEGORY_LABELS: Record<string, string> = {
  force: "Force",
  cardio: "Cardio",
  flexibility: "Souplesse",
  martial_arts: "Arts martiaux",
  dance: "Danse",
};

// Mock data
const MOCK_ACTIVITIES: Activity[] = [
  { id: "1", name: "Musculation", slug: "musculation", description: "", category: "force", level: "all", duration_minutes: 60, max_capacity: 20, image_url: "", is_active: true, order: 1 },
  { id: "2", name: "HIIT", slug: "hiit", description: "", category: "cardio", level: "intermediate", duration_minutes: 45, max_capacity: 15, image_url: "", is_active: true, order: 2 },
  { id: "3", name: "Yoga", slug: "yoga", description: "", category: "flexibility", level: "beginner", duration_minutes: 60, max_capacity: 12, image_url: "", is_active: true, order: 3 },
  { id: "4", name: "Boxe", slug: "boxe", description: "", category: "martial_arts", level: "all", duration_minutes: 60, max_capacity: 16, image_url: "", is_active: true, order: 4 },
  { id: "5", name: "Zumba", slug: "zumba", description: "", category: "dance", level: "beginner", duration_minutes: 45, max_capacity: 25, image_url: "", is_active: true, order: 5 },
  { id: "6", name: "CrossFit", slug: "crossfit", description: "", category: "force", level: "advanced", duration_minutes: 60, max_capacity: 12, image_url: "", is_active: true, order: 6 },
  { id: "7", name: "Pilates", slug: "pilates", description: "", category: "flexibility", level: "all", duration_minutes: 50, max_capacity: 15, image_url: "", is_active: true, order: 7 },
  { id: "8", name: "Spinning", slug: "spinning", description: "", category: "cardio", level: "intermediate", duration_minutes: 45, max_capacity: 20, image_url: "", is_active: true, order: 8 },
];

const MOCK_COACHES: Coach[] = [
  { id: "1", name: "Marc Dupont", photo_url: "", certifications: [], specialties: [], bio: "", is_active: true, order: 1 },
  { id: "2", name: "Sophie Martin", photo_url: "", certifications: [], specialties: [], bio: "", is_active: true, order: 2 },
  { id: "3", name: "Lucas Bernard", photo_url: "", certifications: [], specialties: [], bio: "", is_active: true, order: 3 },
];

const SCHEDULE_PATTERN: { activityIdx: number; coachIdx: number; time: string; enrolled: number }[][] = [
  // Lundi
  [
    { activityIdx: 0, coachIdx: 0, time: "07:00", enrolled: 14 },
    { activityIdx: 1, coachIdx: 2, time: "09:00", enrolled: 12 },
    { activityIdx: 2, coachIdx: 1, time: "10:30", enrolled: 8 },
    { activityIdx: 3, coachIdx: 2, time: "12:00", enrolled: 10 },
    { activityIdx: 5, coachIdx: 0, time: "17:30", enrolled: 11 },
    { activityIdx: 4, coachIdx: 1, time: "19:00", enrolled: 20 },
  ],
  // Mardi
  [
    { activityIdx: 7, coachIdx: 2, time: "07:00", enrolled: 16 },
    { activityIdx: 6, coachIdx: 1, time: "09:30", enrolled: 9 },
    { activityIdx: 0, coachIdx: 0, time: "12:00", enrolled: 15 },
    { activityIdx: 1, coachIdx: 2, time: "17:30", enrolled: 13 },
    { activityIdx: 3, coachIdx: 0, time: "18:30", enrolled: 14 },
    { activityIdx: 2, coachIdx: 1, time: "19:30", enrolled: 10 },
  ],
  // Mercredi
  [
    { activityIdx: 5, coachIdx: 0, time: "07:00", enrolled: 10 },
    { activityIdx: 4, coachIdx: 1, time: "09:00", enrolled: 18 },
    { activityIdx: 7, coachIdx: 2, time: "10:30", enrolled: 17 },
    { activityIdx: 0, coachIdx: 0, time: "14:00", enrolled: 12 },
    { activityIdx: 2, coachIdx: 1, time: "17:30", enrolled: 7 },
    { activityIdx: 1, coachIdx: 2, time: "19:00", enrolled: 14 },
  ],
  // Jeudi
  [
    { activityIdx: 3, coachIdx: 2, time: "07:00", enrolled: 11 },
    { activityIdx: 6, coachIdx: 1, time: "09:30", enrolled: 13 },
    { activityIdx: 0, coachIdx: 0, time: "12:00", enrolled: 18 },
    { activityIdx: 5, coachIdx: 0, time: "17:30", enrolled: 12 },
    { activityIdx: 4, coachIdx: 1, time: "18:30", enrolled: 22 },
    { activityIdx: 7, coachIdx: 2, time: "19:30", enrolled: 15 },
  ],
  // Vendredi
  [
    { activityIdx: 1, coachIdx: 2, time: "07:00", enrolled: 10 },
    { activityIdx: 2, coachIdx: 1, time: "09:00", enrolled: 11 },
    { activityIdx: 0, coachIdx: 0, time: "10:30", enrolled: 16 },
    { activityIdx: 3, coachIdx: 2, time: "14:00", enrolled: 13 },
    { activityIdx: 5, coachIdx: 0, time: "17:30", enrolled: 12 },
    { activityIdx: 4, coachIdx: 1, time: "19:00", enrolled: 25 },
  ],
  // Samedi
  [
    { activityIdx: 0, coachIdx: 0, time: "09:00", enrolled: 17 },
    { activityIdx: 7, coachIdx: 2, time: "10:30", enrolled: 14 },
    { activityIdx: 2, coachIdx: 1, time: "14:00", enrolled: 9 },
    { activityIdx: 4, coachIdx: 1, time: "16:00", enrolled: 21 },
  ],
  // Dimanche
  [
    { activityIdx: 2, coachIdx: 1, time: "09:30", enrolled: 10 },
    { activityIdx: 6, coachIdx: 1, time: "11:00", enrolled: 12 },
    { activityIdx: 7, coachIdx: 2, time: "16:00", enrolled: 8 },
  ],
];

const MOCK_SLOTS: ScheduleSlot[] = SCHEDULE_PATTERN.flatMap((daySlots, dayIndex) =>
  daySlots.map((s, i) => {
    const activity = MOCK_ACTIVITIES[s.activityIdx];
    const coach = MOCK_COACHES[s.coachIdx];
    const startHour = parseInt(s.time.split(":")[0]);
    const endTime = `${String(startHour + 1).padStart(2, "0")}:00`;
    return {
      id: `${dayIndex}-${i}`,
      activity_id: activity.id,
      coach_id: coach.id,
      day_of_week: dayIndex as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      start_time: s.time,
      end_time: endTime,
      is_recurring: true,
      is_active: true,
      activity,
      coach,
      enrolled_count: s.enrolled,
    };
  })
);

export default function ScheduleGrid() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [clickedSlot, setClickedSlot] = useState<string | null>(null);

  const daySlots = MOCK_SLOTS.filter((s) => s.day_of_week === selectedDay).sort(
    (a, b) => a.start_time.localeCompare(b.start_time)
  );

  function handleSlotClick(slotId: string) {
    setClickedSlot(slotId);
    setTimeout(() => setClickedSlot(null), 600);
  }

  return (
    <div>
      {/* Day tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {DAYS.map((day) => (
          <button
            key={day.key}
            onClick={() => setSelectedDay(day.key)}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              selectedDay === day.key
                ? "gradient-primary text-white shadow-lg shadow-primary/30"
                : "border border-dark-border bg-dark-card text-dark-muted hover:border-primary/40 hover:text-white"
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
                  ? "bg-red-500"
                  : key === "cardio"
                    ? "bg-orange-500"
                    : key === "flexibility"
                      ? "bg-green-500"
                      : key === "martial_arts"
                        ? "bg-purple-500"
                        : "bg-pink-500"
              }`}
            />
            {label}
          </div>
        ))}
      </div>

      {/* Slots grid */}
      <div className="space-y-3 overflow-x-auto">
        {daySlots.length === 0 ? (
          <div className="rounded-2xl border border-dark-border bg-dark-card p-12 text-center">
            <p className="text-dark-muted">Aucun cours programme ce jour.</p>
          </div>
        ) : (
          daySlots.map((slot) => {
            const category = slot.activity?.category || "force";
            const maxCap = slot.max_capacity_override ?? slot.activity?.max_capacity ?? 20;
            const enrolled = slot.enrolled_count ?? 0;
            const isClicked = clickedSlot === slot.id;

            return (
              <button
                key={slot.id}
                onClick={() => handleSlotClick(slot.id)}
                className={`w-full rounded-xl border-l-4 p-4 text-left transition-all duration-200 hover:scale-[1.01] ${
                  CATEGORY_COLORS[category] || "border-l-gray-500 bg-gray-500/10"
                } ${
                  isClicked
                    ? "ring-2 ring-primary shadow-lg shadow-primary/20 scale-[1.02]"
                    : "border border-dark-border hover:border-primary/30"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    {/* Time */}
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">{slot.start_time}</p>
                      <p className="text-xs text-dark-muted">{slot.end_time}</p>
                    </div>

                    <div className="h-10 w-px bg-dark-border" />

                    {/* Activity & Coach */}
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
                    <CapacityBadge current={enrolled} max={maxCap} />

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
    </div>
  );
}

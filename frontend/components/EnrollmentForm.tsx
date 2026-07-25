"use client";

import { useState } from "react";
import type { EnrollmentFormProps, EnrollmentFormData } from "@/lib/types";

type FormErrors = Partial<Record<keyof EnrollmentFormData, string>>;

export default function EnrollmentForm({ slot, onClose, onSubmit }: EnrollmentFormProps) {
  const [formData, setFormData] = useState<EnrollmentFormData>({
    user_name: "",
    user_email: "",
    user_phone: "",
    slot_id: slot.id,
    specific_date: new Date().toISOString().split("T")[0],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  function validate(): boolean {
    const errs: FormErrors = {};

    if (!formData.user_name.trim()) {
      errs.user_name = "Le nom est requis";
    }

    if (!formData.user_email.trim()) {
      errs.user_email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user_email)) {
      errs.user_email = "Email invalide";
    }

    if (!formData.user_phone.trim()) {
      errs.user_phone = "Le telephone est requis";
    } else if (!/^[\d\s+()-]{8,}$/.test(formData.user_phone)) {
      errs.user_phone = "Numero invalide";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");

    try {
      await new Promise((r) => setTimeout(r, 1200));
      onSubmit(formData);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  function handleChange(field: keyof EnrollmentFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  // Success state
  if (status === "success") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="glass w-full max-w-md rounded-2xl p-8 text-center animate-fade-in-up">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
            <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold text-white">Inscription confirmee !</h3>
          <p className="mb-6 text-sm text-dark-muted">
            Vous recevrez un email de confirmation sous peu.
          </p>
          <button
            onClick={onClose}
            className="rounded-xl gradient-primary px-6 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-105"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass w-full max-w-md rounded-2xl p-6 animate-fade-in-up">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">S&apos;inscrire au cours</h3>
            <p className="mt-1 text-sm text-dark-muted">
              {slot.activity?.name || "Cours"} &middot; {slot.start_time} - {slot.end_time}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-dark-muted transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error banner */}
        {status === "error" && (
          <div className="mb-4 rounded-lg bg-error/10 border border-error/30 p-3 text-sm text-error">
            Une erreur est survenue. Veuillez reessayer.
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom */}
          <div>
            <label className="mb-1 block text-sm font-medium text-white">
              Nom complet
            </label>
            <input
              type="text"
              value={formData.user_name}
              onChange={(e) => handleChange("user_name", e.target.value)}
              placeholder="Jean Dupont"
              className={`w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-dark-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${
                errors.user_name ? "border-error" : "border-dark-border"
              }`}
            />
            {errors.user_name && (
              <p className="mt-1 text-xs text-error">{errors.user_name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-white">
              Email
            </label>
            <input
              type="email"
              value={formData.user_email}
              onChange={(e) => handleChange("user_email", e.target.value)}
              placeholder="jean@exemple.fr"
              className={`w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-dark-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${
                errors.user_email ? "border-error" : "border-dark-border"
              }`}
            />
            {errors.user_email && (
              <p className="mt-1 text-xs text-error">{errors.user_email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1 block text-sm font-medium text-white">
              Telephone
            </label>
            <input
              type="tel"
              value={formData.user_phone}
              onChange={(e) => handleChange("user_phone", e.target.value)}
              placeholder="06 12 34 56 78"
              className={`w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-dark-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${
                errors.user_phone ? "border-error" : "border-dark-border"
              }`}
            />
            {errors.user_phone && (
              <p className="mt-1 text-xs text-error">{errors.user_phone}</p>
            )}
          </div>

          {/* Selected slot display */}
          <div className="rounded-xl border border-dark-border bg-white/5 p-3">
            <p className="text-xs font-medium text-dark-muted uppercase tracking-wider mb-1">
              Creneau selectionne
            </p>
            <p className="text-sm font-semibold text-white">
              {slot.activity?.name || "Cours"} — {slot.start_time} a {slot.end_time}
            </p>
            {slot.coach && (
              <p className="text-xs text-dark-muted mt-0.5">Coach : {slot.coach.name}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-xl gradient-primary py-3 text-sm font-bold text-black transition-all hover:shadow-lg hover:shadow-white/10 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {status === "loading" ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Inscription en cours...
              </span>
            ) : (
              "Confirmer l'inscription"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

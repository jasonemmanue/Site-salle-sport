"use client";

import { useState } from "react";
import { submitContact } from "@/lib/api";
import type { ContactFormData } from "@/lib/types";

const SUBJECT_OPTIONS = [
  "Informations generales",
  "Abonnements",
  "Cours collectifs",
  "Coaching prive",
  "Reclamation",
  "Autre",
];

type FormErrors = Partial<Record<keyof ContactFormData, string>>;

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  function validate(): boolean {
    const errs: FormErrors = {};

    if (!formData.name.trim()) errs.name = "Le nom est requis";
    if (!formData.email.trim()) {
      errs.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = "Email invalide";
    }
    if (!formData.phone.trim()) {
      errs.phone = "Le telephone est requis";
    } else if (!/^[\d\s+()-]{8,}$/.test(formData.phone)) {
      errs.phone = "Numero invalide";
    }
    if (!formData.subject) errs.subject = "Selectionnez un sujet";
    if (!formData.message.trim()) {
      errs.message = "Le message est requis";
    } else if (formData.message.trim().length < 10) {
      errs.message = "Le message doit faire au moins 10 caracteres";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");

    try {
      await submitContact({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject,
        message: formData.message.trim(),
      });
      setStatus("success");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  function handleChange(field: keyof ContactFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  if (status === "success") {
    return (
      <div className="glass rounded-2xl p-8 text-center animate-fade-in-up">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
          <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mb-2 text-xl font-bold text-white">Message envoye !</h3>
        <p className="mb-6 text-sm text-dark-muted">
          Nous vous repondrons dans les plus brefs delais.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="rounded-xl gradient-primary px-6 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-105"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error banner */}
        {status === "error" && (
          <div className="rounded-lg bg-error/10 border border-error/30 p-3 text-sm text-error">
            Une erreur est survenue. Veuillez reessayer.
          </div>
        )}

        {/* Name & Email row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-white">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Votre nom"
              className={`w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-dark-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${
                errors.name ? "border-error" : "border-dark-border"
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-error">{errors.name}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-white">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="votre@email.fr"
              className={`w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-dark-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${
                errors.email ? "border-error" : "border-dark-border"
              }`}
            />
            {errors.email && <p className="mt-1 text-xs text-error">{errors.email}</p>}
          </div>
        </div>

        {/* Phone & Subject row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-white">Telephone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="06 12 34 56 78"
              className={`w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-dark-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${
                errors.phone ? "border-error" : "border-dark-border"
              }`}
            />
            {errors.phone && <p className="mt-1 text-xs text-error">{errors.phone}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-white">Sujet</label>
            <select
              value={formData.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              className={`w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${
                errors.subject ? "border-error" : "border-dark-border"
              } ${!formData.subject ? "text-dark-muted" : ""}`}
            >
              <option value="" className="bg-dark-card">Selectionnez un sujet</option>
              {SUBJECT_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-dark-card text-white">
                  {opt}
                </option>
              ))}
            </select>
            {errors.subject && <p className="mt-1 text-xs text-error">{errors.subject}</p>}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="mb-1 block text-sm font-medium text-white">Message</label>
          <textarea
            value={formData.message}
            onChange={(e) => handleChange("message", e.target.value)}
            placeholder="Votre message..."
            rows={5}
            className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-dark-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary resize-none ${
              errors.message ? "border-error" : "border-dark-border"
            }`}
          />
          {errors.message && <p className="mt-1 text-xs text-error">{errors.message}</p>}
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
              Envoi en cours...
            </span>
          ) : (
            "Envoyer le message"
          )}
        </button>
      </form>
    </div>
  );
}

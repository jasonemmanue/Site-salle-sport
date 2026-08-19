"use client";

import { useEffect, useState } from "react";
import { enrollInClass } from "@/lib/api";
import { PAYMENT_TYPES, SESSION_TYPES } from "@/lib/types";
import type {
  EnrollmentFormProps,
  EnrollmentFormData,
  EnrollmentStatus,
  PaymentType,
  SessionType,
} from "@/lib/types";

type FormErrors = Partial<Record<keyof EnrollmentFormData, string>>;

/** Les trois temps de la saisie. Un ecran de telephone n'affiche pas les huit
 *  champs d'un coup : plutot que de faire defiler une colonne interminable, on
 *  demande les informations par groupes qui tiennent dans la fenetre. */
const ETAPES = [
  { titre: "Vos coordonnees", resume: "Qui reserve" },
  { titre: "Votre seance", resume: "Seance et paiement" },
  { titre: "Confirmation", resume: "Verification" },
] as const;

/** Montant indicatif de la grille tarifaire, propose comme aide a la saisie.
 *  Le membre reste libre de corriger : c'est ce qu'il a paye qui est enregistre,
 *  pas ce que le tarif prevoit. */
const MONTANTS_INDICATIFS: Record<PaymentType, number> = {
  "Abonnée mensuel": 30000,
  Séance: 3000,
  "Abonnement de karaté": 10000,
  "Abonnement de box": 15000,
};

export default function EnrollmentForm({
  slot,
  specificDate,
  onClose,
  onSuccess,
}: EnrollmentFormProps) {
  const [formData, setFormData] = useState<EnrollmentFormData>({
    user_name: "",
    user_email: "",
    user_phone: "",
    slot_id: slot.id,
    specific_date: specificDate,
    // Pre-remplissage raisonnable : un creneau du planning est une seance
    // encadree, donc collective. Le membre peut corriger.
    session_type: "Collectif",
    payment_type: undefined,
    amount_paid: null,
    feedback: "",
  });
  const [etape, setEtape] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [resultStatus, setResultStatus] = useState<EnrollmentStatus>("enrolled");

  // Echap ferme la fenetre, et le fond ne defile pas derriere elle : sans cela,
  // le doigt qui fait defiler le formulaire entraine la page avec lui des qu'il
  // arrive en butee.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  /** Chaque etape ne valide que ses propres champs : on ne reproche pas au
   *  visiteur, des la premiere page, d'avoir laisse vide un champ qu'il n'a pas
   *  encore vu. */
  function validerEtape(n: number): FormErrors {
    const errs: FormErrors = {};

    if (n === 0) {
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
    }

    if (n === 1) {
      // La formule de paiement alimente le registre de la salle : sans elle, la
      // reservation ne peut pas y etre reportee.
      if (!formData.payment_type) {
        errs.payment_type = "Choisissez une formule";
      }

      if (formData.amount_paid != null && formData.amount_paid < 0) {
        errs.amount_paid = "Le montant ne peut pas etre negatif";
      }
    }

    return errs;
  }

  function suivant() {
    const manques = validerEtape(etape);
    setErrors(manques);
    if (Object.keys(manques).length > 0) return;
    setEtape((n) => Math.min(n + 1, ETAPES.length - 1));
  }

  function precedent() {
    setErrors({});
    setEtape((n) => Math.max(n - 1, 0));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Le bouton d'envoi n'existe qu'a la derniere etape, mais un « Entree »
    // frappe dans un champ soumet le formulaire : on avance alors d'une etape
    // au lieu de partir avec une saisie incomplete.
    if (etape < ETAPES.length - 1) {
      suivant();
      return;
    }

    // Filet de securite : on revalide tout avant l'appel, au cas ou une etape
    // aurait ete revisitee et videe apres coup.
    const manques = { ...validerEtape(0), ...validerEtape(1) };
    if (Object.keys(manques).length > 0) {
      setErrors(manques);
      setEtape(manques.payment_type || manques.amount_paid ? 1 : 0);
      return;
    }

    setStatus("loading");

    try {
      const enrollment = await enrollInClass(formData);
      // Le backend bascule en liste d'attente quand le cours est plein : c'est
      // sa reponse qui fait foi, pas la capacite affichee au clic.
      setResultStatus(enrollment.status);
      setStatus("success");
      onSuccess(enrollment.status);
    } catch {
      setStatus("error");
    }
  }

  function handleChange(
    field: keyof EnrollmentFormData,
    value: string | number | null
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  const champ = (enErreur?: string) =>
    `w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-dark-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${
      enErreur ? "border-error" : "border-dark-border"
    }`;

  const dateLisible = new Date(`${specificDate}T00:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Success state
  if (status === "success") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="glass w-full max-w-md rounded-2xl p-8 text-center animate-fade-in-up">
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
              resultStatus === "waitlisted" ? "bg-warning/20" : "bg-success/20"
            }`}
          >
            <svg
              className={`h-8 w-8 ${resultStatus === "waitlisted" ? "text-warning" : "text-success"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold text-white">
            {resultStatus === "waitlisted" ? "Inscrit en liste d'attente" : "Inscription confirmee !"}
          </h3>
          <p className="mb-6 text-sm text-dark-muted">
            {resultStatus === "waitlisted"
              ? "Le cours est complet. Vous serez contacte des qu'une place se libere."
              : "Votre place est reservee. Presentez-vous 10 minutes avant le debut du cours."}
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
    // Le conteneur defile lui-meme : sur un ecran bas (telephone couche, petit
    // portable), une fenetre plus haute que la vue restait auparavant coupee
    // sans aucun moyen d'atteindre le bouton d'envoi.
    <div
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div
          className="glass flex max-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl animate-fade-in-up sm:max-h-[calc(100dvh-2rem)]"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="titre-inscription"
        >
          {/* En-tete fixe : il porte le fil d'Ariane des etapes, qui doit rester
              visible pendant que le corps du formulaire defile. */}
          <div className="shrink-0 border-b border-dark-border/60 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 id="titre-inscription" className="text-lg font-bold text-white sm:text-xl">
                  S&apos;inscrire au cours
                </h3>
                <p className="mt-1 truncate text-sm text-dark-muted">
                  {slot.activity?.name || "Cours"} &middot; {slot.start_time} - {slot.end_time}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="shrink-0 rounded-lg p-1.5 text-dark-muted transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Fil des etapes */}
            <ol className="mt-4 flex items-center gap-2">
              {ETAPES.map((e, i) => (
                <li key={e.titre} className="flex flex-1 flex-col gap-1.5">
                  <span
                    className={`h-1 rounded-full transition-colors ${
                      i <= etape ? "bg-primary" : "bg-dark-border"
                    }`}
                  />
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                      i === etape ? "text-primary" : "text-dark-muted"
                    }`}
                  >
                    {e.resume}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
            {/* Corps defilant */}
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
              {status === "error" && (
                <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error">
                  Une erreur est survenue. Veuillez reessayer.
                </div>
              )}

              {/* ── Etape 1 : coordonnees ── */}
              {etape === 0 && (
                <>
                  <div>
                    <label htmlFor="insc-nom" className="mb-1 block text-sm font-medium text-white">
                      Nom complet
                    </label>
                    <input
                      id="insc-nom"
                      type="text"
                      autoComplete="name"
                      value={formData.user_name}
                      onChange={(e) => handleChange("user_name", e.target.value)}
                      placeholder="Jean Dupont"
                      className={champ(errors.user_name)}
                    />
                    {errors.user_name && (
                      <p className="mt-1 text-xs text-error">{errors.user_name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="insc-email" className="mb-1 block text-sm font-medium text-white">
                      Email
                    </label>
                    <input
                      id="insc-email"
                      type="email"
                      autoComplete="email"
                      value={formData.user_email}
                      onChange={(e) => handleChange("user_email", e.target.value)}
                      placeholder="jean@exemple.fr"
                      className={champ(errors.user_email)}
                    />
                    {errors.user_email && (
                      <p className="mt-1 text-xs text-error">{errors.user_email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="insc-tel" className="mb-1 block text-sm font-medium text-white">
                      Telephone
                    </label>
                    <input
                      id="insc-tel"
                      type="tel"
                      autoComplete="tel"
                      value={formData.user_phone}
                      onChange={(e) => handleChange("user_phone", e.target.value)}
                      placeholder="+225 07 00 00 00 00"
                      className={champ(errors.user_phone)}
                    />
                    {errors.user_phone && (
                      <p className="mt-1 text-xs text-error">{errors.user_phone}</p>
                    )}
                  </div>
                </>
              )}

              {/* ── Etape 2 : seance et paiement ── */}
              {etape === 1 && (
                <>
                  <fieldset>
                    <legend className="mb-1 block text-sm font-medium text-white">
                      Type de seance
                    </legend>
                    <div className="flex gap-2">
                      {SESSION_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          aria-pressed={formData.session_type === type}
                          onClick={() => handleChange("session_type", type as SessionType)}
                          className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                            formData.session_type === type
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-dark-border text-secondary hover:border-primary/40 hover:text-white"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className="mb-1 block text-sm font-medium text-white">
                      Formule de paiement
                    </legend>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {PAYMENT_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          aria-pressed={formData.payment_type === type}
                          onClick={() => handleChange("payment_type", type as PaymentType)}
                          className={`rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                            formData.payment_type === type
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-dark-border text-secondary hover:border-primary/40 hover:text-white"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    {errors.payment_type && (
                      <p className="mt-1 text-xs text-error">{errors.payment_type}</p>
                    )}
                  </fieldset>

                  <div>
                    <label htmlFor="insc-montant" className="mb-1 block text-sm font-medium text-white">
                      Montant paye (FCFA){" "}
                      <span className="font-normal text-dark-muted">— facultatif</span>
                    </label>
                    <input
                      id="insc-montant"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={500}
                      value={formData.amount_paid ?? ""}
                      onChange={(e) =>
                        handleChange("amount_paid", e.target.value ? Number(e.target.value) : null)
                      }
                      placeholder={String(
                        formData.payment_type ? MONTANTS_INDICATIFS[formData.payment_type] : 3000
                      )}
                      className={champ(errors.amount_paid)}
                    />
                    {errors.amount_paid ? (
                      <p className="mt-1 text-xs text-error">{errors.amount_paid}</p>
                    ) : (
                      formData.payment_type && (
                        <p className="mt-1 text-xs text-dark-muted">
                          Tarif de la formule :{" "}
                          {MONTANTS_INDICATIFS[formData.payment_type].toLocaleString("fr-FR")} FCFA
                        </p>
                      )
                    )}
                  </div>
                </>
              )}

              {/* ── Etape 3 : verification ── */}
              {etape === 2 && (
                <>
                  <div className="rounded-xl border border-dark-border bg-white/5 p-3">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-dark-muted">
                      Creneau selectionne
                    </p>
                    <p className="text-sm font-semibold text-white">
                      {slot.activity?.name || "Cours"} — {slot.start_time} a {slot.end_time}
                    </p>
                    <p className="mt-0.5 text-xs text-dark-muted">Seance du {dateLisible}</p>
                    {slot.coach && (
                      <p className="mt-0.5 text-xs text-dark-muted">Coach : {slot.coach.name}</p>
                    )}
                  </div>

                  <dl className="rounded-xl border border-dark-border bg-white/5 p-3 text-sm">
                    {[
                      ["Nom", formData.user_name],
                      ["Email", formData.user_email],
                      ["Telephone", formData.user_phone],
                      ["Type de seance", formData.session_type],
                      ["Formule", formData.payment_type],
                      [
                        "Montant",
                        formData.amount_paid != null
                          ? `${formData.amount_paid.toLocaleString("fr-FR")} FCFA`
                          : "non precise",
                      ],
                    ].map(([libelle, valeur]) => (
                      <div
                        key={libelle}
                        className="flex items-baseline justify-between gap-3 py-1"
                      >
                        <dt className="shrink-0 text-xs text-dark-muted">{libelle}</dt>
                        <dd className="min-w-0 truncate text-right font-medium text-white">
                          {valeur || "—"}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div>
                    <label htmlFor="insc-remarque" className="mb-1 block text-sm font-medium text-white">
                      Une remarque ?{" "}
                      <span className="font-normal text-dark-muted">— facultatif</span>
                    </label>
                    <textarea
                      id="insc-remarque"
                      value={formData.feedback ?? ""}
                      onChange={(e) => handleChange("feedback", e.target.value)}
                      placeholder="Vos objectifs, une contrainte, une question..."
                      rows={3}
                      maxLength={1000}
                      className="w-full resize-none rounded-xl border border-dark-border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-dark-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Pied fixe : le bouton d'action reste sous le pouce, quelle que
                soit la hauteur du contenu. */}
            <div className="shrink-0 border-t border-dark-border/60 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                {etape > 0 && (
                  <button
                    type="button"
                    onClick={precedent}
                    className="rounded-xl border border-dark-border px-4 py-3 text-sm font-semibold text-secondary transition-colors hover:border-primary/40 hover:text-white"
                  >
                    Retour
                  </button>
                )}

                {etape < ETAPES.length - 1 ? (
                  <button
                    type="button"
                    onClick={suivant}
                    className="flex-1 rounded-xl gradient-primary py-3 text-sm font-bold text-black transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10"
                  >
                    Continuer
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="flex-1 rounded-xl gradient-primary py-3 text-sm font-bold text-black transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
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
                )}
              </div>
              <p className="mt-2 text-center text-[11px] text-dark-muted">
                Etape {etape + 1} sur {ETAPES.length} — {ETAPES[etape].titre}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

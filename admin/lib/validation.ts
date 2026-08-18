/**
 * Verification des formulaires du back-office, avant tout appel a l'API.
 *
 * Pourquoi cote client alors que l'API valide deja : parce que l'API repond par
 * un code et un detail technique (`422`, `field required`, le nom anglais de la
 * colonne). L'administrateur, lui, doit lire « La description est obligatoire »
 * sous le champ concerne, et voir d'un coup **toutes** les informations qui
 * manquent, pas la premiere.
 *
 * Les regles reprennent exactement les colonnes NOT NULL du modele, plus les
 * cas ou une valeur vide passe la base mais casse le site public (un article
 * sans contenu, une transformation sans photo avant/apres).
 *
 * Les attributs `required` natifs ont ete retires des formulaires au profit de
 * ces regles, et les `<form>` portent `noValidate` : sinon le navigateur
 * interrompt l'envoi avant notre code, avec sa propre bulle, dans sa propre
 * langue, et un seul champ a la fois.
 */

export type Erreurs = Record<string, string>;

/** Vide au sens « l'utilisateur n'a rien saisi ». */
export function estVide(valeur: unknown): boolean {
  if (valeur === null || valeur === undefined) return true;
  if (typeof valeur === 'string') return valeur.trim() === '';
  if (Array.isArray(valeur)) return valeur.length === 0;
  return false;
}

/**
 * Texte reellement saisi dans le RichEditor.
 *
 * Le `contentEditable` laisse derriere lui `<p><br></p>` ou `&nbsp;` des qu'on
 * y a clique : sans retirer les balises, un contenu visuellement vide passerait
 * pour rempli.
 */
export function texteBrut(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function verifierRequis<F extends object>(
  form: F,
  requis: Array<[Extract<keyof F, string>, string]>
): Erreurs {
  const erreurs: Erreurs = {};
  for (const [champ, libelle] of requis) {
    if (estVide(form[champ])) erreurs[champ] = `${libelle} est obligatoire.`;
  }
  return erreurs;
}

/** Nombre attendu strictement positif (duree, capacite, quantite, prix). */
export function verifierNombre(
  valeur: unknown,
  libelle: string,
  { minimum = 1 }: { minimum?: number } = {}
): string | null {
  if (valeur === null || valeur === undefined || valeur === '') return `${libelle} est obligatoire.`;
  const nombre = Number(valeur);
  if (Number.isNaN(nombre)) return `${libelle} doit etre un nombre.`;
  if (nombre < minimum) return `${libelle} doit valoir au moins ${minimum}.`;
  return null;
}

export function estEmail(valeur: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valeur.trim());
}

export function estUrl(valeur: string): boolean {
  try {
    const url = new URL(valeur.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** `HH:MM` — les heures du planning sont stockees en texte. */
export function heureEnMinutes(valeur: string): number | null {
  const trouve = /^(\d{1,2}):(\d{2})$/.exec(valeur.trim());
  if (!trouve) return null;
  const heures = Number(trouve[1]);
  const minutes = Number(trouve[2]);
  if (heures > 23 || minutes > 59) return null;
  return heures * 60 + minutes;
}

export function aDesErreurs(erreurs: Erreurs): boolean {
  return Object.keys(erreurs).length > 0;
}

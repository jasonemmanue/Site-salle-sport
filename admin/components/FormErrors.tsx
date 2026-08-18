'use client';

import type { Erreurs } from '@/lib/validation';

/**
 * Affichage des informations manquantes dans un formulaire.
 *
 * `ErrorSummary` coiffe le formulaire : l'administrateur voit d'un coup tout ce
 * qui bloque, y compris les champs sortis de l'ecran dans une modale qui
 * defile. `FieldError` repete le message sous le champ fautif.
 *
 * Les rouges sont volontairement fonces : le contenu du back-office est en
 * theme clair (`.admin-content`), ou `text-red-400` ne donne que 3:1.
 */

export function ErrorSummary({ erreurs, erreurApi }: { erreurs: Erreurs; erreurApi?: string }) {
  const messages = Object.values(erreurs);
  if (messages.length === 0 && !erreurApi) return null;

  return (
    <div
      role="alert"
      className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {erreurApi && <p className="font-semibold">{erreurApi}</p>}
      {messages.length > 0 && (
        <>
          <p className={`font-semibold ${erreurApi ? 'mt-2' : ''}`}>
            {messages.length === 1
              ? 'Une information obligatoire manque :'
              : `${messages.length} informations obligatoires manquent :`}
          </p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {messages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-sm font-medium text-red-700">
      {message}
    </p>
  );
}

/** Asterisque des libelles de champs obligatoires. */
export function Requis() {
  return (
    <span className="text-red-600" aria-hidden="true">
      {' '}
      *
    </span>
  );
}

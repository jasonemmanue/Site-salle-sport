const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface FetchOptions extends RequestInit {
  token?: string;
}

/** Un element du `detail` d'une reponse 422 de FastAPI. */
interface DetailValidation {
  loc?: (string | number)[];
  msg?: string;
}

/**
 * Rend lisible le `detail` d'une reponse en erreur.
 *
 * Sur un 422, FastAPI renvoie un **tableau d'objets**, pas une chaine :
 * `new Error(detail)` affichait donc « [object Object] » a l'administrateur,
 * quelle que soit l'erreur de saisie. On reconstitue ici le nom du champ suivi
 * du message.
 */
export function messageDErreur(detail: unknown, defaut: string): string {
  if (typeof detail === 'string' && detail) return detail;

  if (Array.isArray(detail)) {
    const lignes = (detail as DetailValidation[])
      .map((element) => {
        // `loc` vaut par exemple ["body", "max_capacity"] : le dernier segment
        // est le champ, les precedents disent seulement ou il se trouve.
        const champ = element.loc?.filter((part) => part !== 'body').join(' > ');
        const message = element.msg || 'valeur refusee';
        return champ ? `${champ} : ${message}` : message;
      })
      .filter(Boolean);
    if (lignes.length) return `Donnees refusees par le serveur — ${lignes.join(' ; ')}`;
  }

  return defaut;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers: customHeaders, ...rest } = options;
  const headers: Record<string, string> = {
    ...Object.fromEntries(Object.entries(customHeaders || {})),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!(rest.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_URL}${path}`, { headers, ...rest });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(messageDErreur(err.detail, res.statusText));
  }
  if (res.status === 204) return null as T;
  return res.json();
}

export async function login(email: string, password: string) {
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error('Email ou mot de passe incorrect');
  return res.json() as Promise<{ access_token: string; refresh_token: string; token_type: string }>;
}

/**
 * Telecharge un fichier servi par une route protegee.
 *
 * Un simple `<a href>` ne porte pas l'en-tete `Authorization` : la route
 * repondrait 403. On recupere donc le fichier par `fetch`, puis on declenche
 * l'enregistrement depuis un lien temporaire pointant sur le blob obtenu.
 *
 * Le nom du fichier vient de l'en-tete `Content-Disposition` renvoye par l'API,
 * pour que serveur et client ne le decident pas chacun de leur cote.
 */
export async function telechargerFichier(path: string, token: string): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(messageDErreur(err.detail, res.statusText));
  }

  const disposition = res.headers.get('Content-Disposition') || '';
  const nom = /filename="?([^"]+)"?/.exec(disposition)?.[1] || 'export.xlsx';

  const url = URL.createObjectURL(await res.blob());
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nom;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  // Sans cette liberation, le blob reste en memoire jusqu'au rechargement.
  URL.revokeObjectURL(url);
}

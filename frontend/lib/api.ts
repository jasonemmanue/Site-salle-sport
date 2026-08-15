import type {
  Activity,
  ActivityCategory,
  ActivityLevel,
  Article,
  Coach,
  ContactFormData,
  Enrollment,
  EnrollmentFormData,
  Equipment,
  EquipmentZone,
  PaginatedResponse,
  Review,
  ReviewFormData,
  ScheduleSlot,
  Setting,
  SlotAvailability,
  Subscription,
  Transformation,
  Video,
  WeeklySchedule,
} from './types';

/**
 * Deux URLs, deux points de vue.
 *
 * NEXT_PUBLIC_API_URL est figee dans le bundle au build : c'est l'API telle que
 * le NAVIGATEUR la voit (http://localhost:8010 en Docker).
 *
 * Le rendu serveur, lui, s'execute DANS le conteneur frontend, ou localhost:8010
 * ne pointe sur rien. Il lui faut le nom de service Docker (http://api:8000),
 * fourni par API_INTERNAL_URL — variable de runtime, donc modifiable sans rebuild.
 */
const BROWSER_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const SERVER_API_URL = process.env.API_INTERNAL_URL || BROWSER_API_URL;

function apiRoot(): string {
  return typeof window === 'undefined' ? SERVER_API_URL : BROWSER_API_URL;
}

/**
 * Les uploads sont stockes en chemin relatif (`/uploads/images/xxx.jpg`) et
 * servis par l'API. Le navigateur doit donc les prefixer par l'URL publique de
 * l'API — jamais par celle du reseau Docker, invisible depuis l'exterieur.
 */
export function mediaUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  return `${BROWSER_API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Duree de cache par defaut du rendu serveur, en secondes. */
const DEFAULT_REVALIDATE = 60;

interface FetchOptions extends RequestInit {
  /** Secondes de cache ISR. `0` force un fetch a chaque requete. */
  revalidate?: number;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { revalidate = DEFAULT_REVALIDATE, headers, ...rest } = options;
  const url = `${apiRoot()}/api/v1${endpoint}`;

  const response = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...(revalidate > 0 ? { next: { revalidate } } : { cache: 'no-store' as RequestCache }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new ApiError(body || response.statusText, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Enrobe un appel API pour qu'une panne reseau ou une API eteinte n'ecroule pas
 * la page entiere : on retombe sur une valeur vide et la page affiche son etat
 * "aucun contenu". Un site vitrine doit rester debout meme sans backend.
 */
export async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[api]', error instanceof Error ? error.message : error);
    }
    return fallback;
  }
}

/* ─────────────────────────── Activites ─────────────────────────── */

export async function getActivities(params?: {
  category?: ActivityCategory;
  level?: ActivityLevel;
  limit?: number;
}): Promise<Activity[]> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.level) query.set('level', params.level);
  query.set('limit', String(params?.limit ?? 100));
  const page = await fetchApi<PaginatedResponse<Activity>>(`/activities/?${query}`);
  return page.items;
}

export async function getActivity(slug: string): Promise<Activity> {
  return fetchApi<Activity>(`/activities/${slug}`);
}

/* ─────────────────────────── Coachs ─────────────────────────── */

export async function getCoaches(): Promise<Coach[]> {
  return fetchApi<Coach[]>('/coaches/');
}

/* ─────────────────────────── Planning ─────────────────────────── */

export async function getSchedule(date?: string): Promise<ScheduleSlot[]> {
  const query = date ? `?date=${encodeURIComponent(date)}` : '';
  return fetchApi<ScheduleSlot[]>(`/schedule/${query}`);
}

export async function getWeeklySchedule(): Promise<WeeklySchedule> {
  return fetchApi<WeeklySchedule>('/schedule/weekly');
}

export async function getSlotAvailability(
  slotId: string,
  specificDate?: string
): Promise<SlotAvailability> {
  const query = specificDate ? `?specific_date=${encodeURIComponent(specificDate)}` : '';
  return fetchApi<SlotAvailability>(`/enrollments/slot/${slotId}/availability${query}`, {
    revalidate: 0,
  });
}

export async function enrollInClass(data: EnrollmentFormData): Promise<Enrollment> {
  return fetchApi<Enrollment>('/enrollments/', {
    method: 'POST',
    body: JSON.stringify(data),
    revalidate: 0,
  });
}

/* ─────────────────────────── Abonnements ─────────────────────────── */

export async function getSubscriptions(): Promise<Subscription[]> {
  return fetchApi<Subscription[]>('/subscriptions/');
}

/* ─────────────────────────── Articles ─────────────────────────── */

export async function getArticles(page = 1, limit = 100): Promise<PaginatedResponse<Article>> {
  return fetchApi<PaginatedResponse<Article>>(`/articles/?page=${page}&limit=${limit}`);
}

export async function getArticle(slug: string): Promise<Article> {
  return fetchApi<Article>(`/articles/${slug}`);
}

/* ─────────────────────────── Videos ─────────────────────────── */

export async function getVideos(category?: string): Promise<Video[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  return fetchApi<Video[]>(`/videos/${query}`);
}

/* ─────────────────────────── Transformations ─────────────────────────── */

export async function getTransformations(featuredOnly = false): Promise<Transformation[]> {
  const query = featuredOnly ? '?featured_only=true' : '';
  return fetchApi<Transformation[]>(`/transformations/${query}`);
}

/* ─────────────────────────── Equipements ─────────────────────────── */

export async function getEquipment(zone?: EquipmentZone): Promise<Equipment[]> {
  const query = zone ? `?zone=${encodeURIComponent(zone)}` : '';
  return fetchApi<Equipment[]>(`/equipment/${query}`);
}

/* ─────────────────────────── Avis ─────────────────────────── */

export async function getReviews(): Promise<Review[]> {
  return fetchApi<Review[]>('/reviews/');
}

export async function submitReview(data: ReviewFormData): Promise<Review> {
  return fetchApi<Review>('/reviews/', {
    method: 'POST',
    body: JSON.stringify(data),
    revalidate: 0,
  });
}

/* ─────────────────────────── Contact ─────────────────────────── */

export async function submitContact(data: ContactFormData): Promise<void> {
  await fetchApi<unknown>('/contact/', {
    method: 'POST',
    body: JSON.stringify(data),
    revalidate: 0,
  });
}

/* ─────────────────────────── Parametres ─────────────────────────── */

/**
 * Les parametres de la salle (telephone, adresse, horaires, reseaux sociaux)
 * sont edites dans l'admin. Retourne une map cle → valeur, plus commode que la
 * liste brute renvoyee par l'API.
 */
export async function getSettings(): Promise<Record<string, string>> {
  const items = await fetchApi<Setting[]>('/settings/public');
  return Object.fromEntries(items.map((s) => [s.key, s.value]));
}

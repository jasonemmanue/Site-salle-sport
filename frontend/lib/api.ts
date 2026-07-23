import type {
  Activity,
  ActivityCategory,
  ActivityLevel,
  Article,
  Coach,
  Contact,
  Enrollment,
  EnrollmentFormData,
  Equipment,
  EquipmentZone,
  PaginatedResponse,
  Review,
  ScheduleSlot,
  Subscription,
  Transformation,
  Video,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}/api/v1${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');
    throw new ApiError(errorBody, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function getActivities(
  category?: ActivityCategory,
  level?: ActivityLevel
): Promise<PaginatedResponse<Activity>> {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (level) params.set('level', level);
  const query = params.toString();
  return fetchApi<PaginatedResponse<Activity>>(`/activities${query ? `?${query}` : ''}`);
}

export async function getActivity(slug: string): Promise<Activity> {
  return fetchApi<Activity>(`/activities/${slug}`);
}

export async function getCoaches(): Promise<Coach[]> {
  return fetchApi<Coach[]>('/coaches');
}

export async function getSchedule(date?: string): Promise<ScheduleSlot[]> {
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  const query = params.toString();
  return fetchApi<ScheduleSlot[]>(`/schedule${query ? `?${query}` : ''}`);
}

export async function getSubscriptions(): Promise<Subscription[]> {
  return fetchApi<Subscription[]>('/subscriptions');
}

export async function enrollInClass(data: EnrollmentFormData): Promise<Enrollment> {
  return fetchApi<Enrollment>('/enrollments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getArticles(
  page?: number,
  status?: 'draft' | 'published'
): Promise<PaginatedResponse<Article>> {
  const params = new URLSearchParams();
  if (page) params.set('page', String(page));
  if (status) params.set('status', status);
  const query = params.toString();
  return fetchApi<PaginatedResponse<Article>>(`/articles${query ? `?${query}` : ''}`);
}

export async function getArticle(slug: string): Promise<Article> {
  return fetchApi<Article>(`/articles/${slug}`);
}

export async function getVideos(): Promise<Video[]> {
  return fetchApi<Video[]>('/videos');
}

export async function getTransformations(featured_only?: boolean): Promise<Transformation[]> {
  const params = new URLSearchParams();
  if (featured_only) params.set('featured_only', 'true');
  const query = params.toString();
  return fetchApi<Transformation[]>(`/transformations${query ? `?${query}` : ''}`);
}

export async function getEquipment(zone?: EquipmentZone): Promise<Equipment[]> {
  const params = new URLSearchParams();
  if (zone) params.set('zone', zone);
  const query = params.toString();
  return fetchApi<Equipment[]>(`/equipment${query ? `?${query}` : ''}`);
}

export async function getReviews(): Promise<Review[]> {
  return fetchApi<Review[]>('/reviews');
}

export async function submitReview(data: Omit<Review, 'id' | 'is_approved' | 'created_at'>): Promise<Review> {
  return fetchApi<Review>('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function submitContact(data: Contact): Promise<void> {
  return fetchApi<void>('/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export type ActivityCategory = 'force' | 'cardio' | 'flexibility' | 'martial_arts' | 'dance';
export type ActivityLevel = 'beginner' | 'intermediate' | 'advanced' | 'all';
export type EnrollmentStatus = 'enrolled' | 'waitlisted' | 'cancelled';
export type ArticleStatus = 'draft' | 'published';
export type EquipmentZone = 'musculation' | 'cardio' | 'stretching' | 'functional' | 'locker';
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/*
 * Les champs marques `| null` le sont cote backend (`str | None` dans
 * schemas.py). Les typer non-nullables ici masquait la realite tant que les
 * pages tournaient sur des mocks toujours remplis.
 */

export interface Activity {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ActivityCategory;
  level: ActivityLevel;
  duration_minutes: number;
  max_capacity: number;
  image_url: string | null;
  is_active: boolean;
  order: number;
}

export interface Coach {
  id: string;
  name: string;
  photo_url: string | null;
  certifications: string[];
  specialties: string[];
  bio: string | null;
  is_active: boolean;
  order: number;
}

export interface ScheduleSlot {
  id: string;
  activity_id: string;
  coach_id: string;
  activity: Activity | null;
  coach: Coach | null;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  specific_date: string | null;
  max_capacity_override: number | null;
  is_active: boolean;
}

/** Reponse de GET /enrollments/slot/{id}/availability */
export interface SlotAvailability {
  enrolled_count: number;
  max_capacity: number;
  available: number;
}

/** Reponse de GET /schedule/weekly : creneaux groupes par jour (0 = lundi). */
export type WeeklySchedule = Partial<Record<`${DayOfWeek}`, ScheduleSlot[]>>;

export interface Enrollment {
  id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  slot_id: string;
  specific_date: string;
  status: EnrollmentStatus;
  enrolled_at: string;
}

export interface Subscription {
  id: string;
  name: string;
  price: number;
  duration_months: number;
  features: string[];
  is_active: boolean;
  order: number;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  status: ArticleStatus;
  published_at: string | null;
  author_id: string;
  created_at: string;
}

export interface Video {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  category: string;
  is_published: boolean;
  order: number;
  created_at: string;
}

export interface Transformation {
  id: string;
  member_name: string;
  before_image_url: string | null;
  after_image_url: string | null;
  testimonial: string | null;
  duration_text: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
}

export interface Equipment {
  id: string;
  name: string;
  description: string | null;
  zone: EquipmentZone;
  image_url: string | null;
  quantity: number;
  is_active: boolean;
}

export interface Review {
  id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

/* ===== Corps des formulaires publics ===== */

/** Intitules exacts attendus par le formulaire Google de la salle : toute
 *  variante (un accent en moins) y serait refusee. */
export const SESSION_TYPES = ['Individuel', 'Collectif'] as const;
export type SessionType = (typeof SESSION_TYPES)[number];

export const PAYMENT_TYPES = [
  'Abonnée mensuel',
  'Séance',
  'Abonnement de karaté',
  'Abonnement de box',
] as const;
export type PaymentType = (typeof PAYMENT_TYPES)[number];

export interface EnrollmentFormData {
  user_name: string;
  user_email: string;
  user_phone: string;
  slot_id: string;
  /** Format ISO `YYYY-MM-DD` — le backend attend un `date` Pydantic. */
  specific_date: string;
  /** Renseignements du registre de la salle. Facultatifs cote API, demandes
   *  ici : sans eux, la reservation ne peut pas etre recopiee dans le
   *  formulaire Google, qui les exige. */
  session_type?: SessionType;
  payment_type?: PaymentType;
  amount_paid?: number | null;
  feedback?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface ReviewFormData {
  author_name: string;
  rating: number;
  comment: string;
}

/* ===== Component Props ===== */

export interface CapacityBadgeProps {
  current: number;
  max: number;
}

export interface SectionTitleProps {
  title: string;
  subtitle?: string;
  accent?: boolean;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface ArticleCardProps {
  article: Article;
}

export interface ReviewCardProps {
  review: Review;
}

export interface EnrollmentFormProps {
  slot: ScheduleSlot;
  /** Date `YYYY-MM-DD` de la seance visee, resolue depuis le jour recurrent. */
  specificDate: string;
  onClose: () => void;
  onSuccess: (status: EnrollmentStatus) => void;
}

export interface TransformationSliderProps {
  transformations: Transformation[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

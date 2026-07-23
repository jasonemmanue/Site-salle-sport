export type ActivityCategory = 'force' | 'cardio' | 'flexibility' | 'martial_arts' | 'dance';
export type ActivityLevel = 'beginner' | 'intermediate' | 'advanced' | 'all';
export type EnrollmentStatus = 'enrolled' | 'waitlisted' | 'cancelled';
export type ArticleStatus = 'draft' | 'published';
export type EquipmentZone = 'musculation' | 'cardio' | 'stretching' | 'functional' | 'locker';

export interface Activity {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ActivityCategory;
  level: ActivityLevel;
  duration_minutes: number;
  max_capacity: number;
  image_url: string;
  is_active: boolean;
  order: number;
}

export interface Coach {
  id: string;
  name: string;
  photo_url: string;
  certifications: string[];
  specialties: string[];
  bio: string;
  is_active: boolean;
  order: number;
}

export interface ScheduleSlot {
  id: string;
  activity_id: string;
  coach_id: string;
  activity?: Activity;
  coach?: Coach;
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  specific_date?: string;
  max_capacity_override?: number;
  is_active: boolean;
  enrolled_count?: number;
}

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
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image_url: string;
  status: ArticleStatus;
  published_at: string;
  author_id: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  category: string;
  is_published: boolean;
  order: number;
  created_at: string;
}

export interface Transformation {
  id: string;
  member_name: string;
  before_image_url: string;
  after_image_url: string;
  testimonial: string;
  duration_text: string;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
}

export interface Equipment {
  id: string;
  name: string;
  description: string;
  zone: EquipmentZone;
  image_url: string;
  quantity: number;
  is_active: boolean;
}

export interface Review {
  id: string;
  author_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

export interface Contact {
  id?: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface DashboardStats {
  active_members: number;
  today_enrollments: number;
  fill_rate: number;
  monthly_revenue: number;
}

export interface ScheduleView {
  [day: number]: ScheduleSlot[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export interface EnrollmentFormData {
  user_name: string;
  user_email: string;
  user_phone: string;
  slot_id: string;
  specific_date: string;
}

// ===== Component Props =====

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
  onClose: () => void;
  onSubmit: (data: EnrollmentFormData) => void;
}

export interface TransformationSliderProps {
  transformations: Transformation[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

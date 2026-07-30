export interface Activity {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  level: string;
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
  bio: string;
  is_active: boolean;
  order: number;
}

export interface ScheduleSlot {
  id: string;
  activity_id: string;
  coach_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  specific_date: string | null;
  max_capacity_override: number | null;
  is_active: boolean;
  activity?: Activity;
  coach?: Coach;
}

export interface Enrollment {
  id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  slot_id: string;
  specific_date: string;
  status: string;
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
  excerpt: string;
  cover_image_url: string | null;
  status: string;
  published_at: string | null;
  author_id: string;
  created_at: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
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
  zone: string;
  image_url: string | null;
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
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_members: number;
  active_subscriptions: number;
  today_enrollments: number;
  total_activities: number;
  total_coaches: number;
  unread_contacts: number;
  pending_reviews: number;
  fill_rate: number;
  monthly_revenue: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

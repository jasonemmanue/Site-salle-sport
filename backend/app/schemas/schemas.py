from datetime import date, datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, EmailStr, Field

T = TypeVar("T")


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ActivityCreate(BaseModel):
    name: str
    slug: str
    description: str
    category: str
    level: str
    duration_minutes: int
    max_capacity: int
    image_url: str | None = None
    is_active: bool = True
    order: int = 0


class ActivityUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    category: str | None = None
    level: str | None = None
    duration_minutes: int | None = None
    max_capacity: int | None = None
    image_url: str | None = None
    is_active: bool | None = None
    order: int | None = None


class ActivityResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    category: str
    level: str
    duration_minutes: int
    max_capacity: int
    image_url: str | None
    is_active: bool
    order: int

    model_config = ConfigDict(from_attributes=True)


class CoachCreate(BaseModel):
    name: str
    photo_url: str | None = None
    certifications: list[str] = []
    specialties: list[str] = []
    bio: str | None = None
    is_active: bool = True
    order: int = 0


class CoachUpdate(BaseModel):
    name: str | None = None
    photo_url: str | None = None
    certifications: list[str] | None = None
    specialties: list[str] | None = None
    bio: str | None = None
    is_active: bool | None = None
    order: int | None = None


class CoachResponse(BaseModel):
    id: str
    name: str
    photo_url: str | None
    certifications: list
    specialties: list
    bio: str | None
    is_active: bool
    order: int

    model_config = ConfigDict(from_attributes=True)


class ScheduleSlotCreate(BaseModel):
    activity_id: str
    coach_id: str
    day_of_week: int = Field(ge=0, le=6)
    start_time: str
    end_time: str
    is_recurring: bool = True
    specific_date: date | None = None
    max_capacity_override: int | None = None
    is_active: bool = True


class ScheduleSlotUpdate(BaseModel):
    activity_id: str | None = None
    coach_id: str | None = None
    day_of_week: int | None = Field(default=None, ge=0, le=6)
    start_time: str | None = None
    end_time: str | None = None
    is_recurring: bool | None = None
    specific_date: date | None = None
    max_capacity_override: int | None = None
    is_active: bool | None = None


class ScheduleSlotResponse(BaseModel):
    id: str
    activity_id: str
    coach_id: str
    day_of_week: int
    start_time: str
    end_time: str
    is_recurring: bool
    specific_date: date | None
    max_capacity_override: int | None
    is_active: bool
    activity: ActivityResponse | None = None
    coach: CoachResponse | None = None

    model_config = ConfigDict(from_attributes=True)


class EnrollmentCreate(BaseModel):
    user_name: str
    user_email: EmailStr
    user_phone: str
    slot_id: str
    specific_date: date


class EnrollmentResponse(BaseModel):
    id: str
    user_name: str
    user_email: str
    user_phone: str
    slot_id: str
    specific_date: date
    status: str
    enrolled_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SubscriptionCreate(BaseModel):
    name: str
    price: float
    duration_months: int
    features: list[str] = []
    is_active: bool = True
    order: int = 0


class SubscriptionUpdate(BaseModel):
    name: str | None = None
    price: float | None = None
    duration_months: int | None = None
    features: list[str] | None = None
    is_active: bool | None = None
    order: int | None = None


class SubscriptionResponse(BaseModel):
    id: str
    name: str
    price: float
    duration_months: int
    features: list
    is_active: bool
    order: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ArticleCreate(BaseModel):
    title: str
    slug: str
    content: str
    excerpt: str | None = None
    cover_image_url: str | None = None
    status: str = "draft"


class ArticleUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    content: str | None = None
    excerpt: str | None = None
    cover_image_url: str | None = None
    status: str | None = None
    published_at: datetime | None = None


class ArticleResponse(BaseModel):
    id: str
    title: str
    slug: str
    content: str
    excerpt: str | None
    cover_image_url: str | None
    status: str
    published_at: datetime | None
    author_id: str
    created_at: datetime
    author: UserResponse | None = None

    model_config = ConfigDict(from_attributes=True)


class VideoCreate(BaseModel):
    title: str
    description: str | None = None
    video_url: str
    thumbnail_url: str | None = None
    category: str
    is_published: bool = False
    order: int = 0


class VideoUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    video_url: str | None = None
    thumbnail_url: str | None = None
    category: str | None = None
    is_published: bool | None = None
    order: int | None = None


class VideoResponse(BaseModel):
    id: str
    title: str
    description: str | None
    video_url: str
    thumbnail_url: str | None
    category: str
    is_published: bool
    order: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TransformationCreate(BaseModel):
    member_name: str
    before_image_url: str | None = None
    after_image_url: str | None = None
    testimonial: str | None = None
    duration_text: str | None = None
    is_featured: bool = False
    is_published: bool = False


class TransformationUpdate(BaseModel):
    member_name: str | None = None
    before_image_url: str | None = None
    after_image_url: str | None = None
    testimonial: str | None = None
    duration_text: str | None = None
    is_featured: bool | None = None
    is_published: bool | None = None


class TransformationResponse(BaseModel):
    id: str
    member_name: str
    before_image_url: str | None
    after_image_url: str | None
    testimonial: str | None
    duration_text: str | None
    is_featured: bool
    is_published: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EquipmentCreate(BaseModel):
    name: str
    description: str | None = None
    zone: str
    image_url: str | None = None
    quantity: int = 1
    is_active: bool = True


class EquipmentUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    zone: str | None = None
    image_url: str | None = None
    quantity: int | None = None
    is_active: bool | None = None


class EquipmentResponse(BaseModel):
    id: str
    name: str
    description: str | None
    zone: str
    image_url: str | None
    quantity: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class ReviewCreate(BaseModel):
    author_name: str
    rating: int = Field(ge=1, le=5)
    comment: str | None = None


class ReviewResponse(BaseModel):
    id: str
    author_name: str
    rating: int
    comment: str | None
    is_approved: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    subject: str
    message: str


class ContactResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str | None
    subject: str
    message: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SettingUpdate(BaseModel):
    key: str
    value: str


class SettingResponse(BaseModel):
    id: str
    key: str
    value: str

    model_config = ConfigDict(from_attributes=True)


class DashboardStats(BaseModel):
    active_members: int
    today_enrollments: int
    fill_rate: float
    monthly_revenue: float


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    pages: int

from datetime import date, datetime, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.models import (
    Activity,
    Coach,
    Contact,
    Enrollment,
    Review,
    ScheduleSlot,
    Subscription,
    User,
)


def get_dashboard_stats(db: Session) -> dict:
    total_members = db.query(User).filter(User.role == "member").count()
    active_subscriptions = (
        db.query(User)
        .filter(User.is_active == True, User.subscription_id.isnot(None))
        .count()
    )
    total_activities = db.query(Activity).filter(Activity.is_active == True).count()
    total_coaches = db.query(Coach).filter(Coach.is_active == True).count()
    unread_contacts = db.query(Contact).filter(Contact.is_read == False).count()
    pending_reviews = db.query(Review).filter(Review.is_approved == False).count()

    today = date.today()
    today_enrollments = (
        db.query(Enrollment)
        .filter(
            Enrollment.specific_date == today,
            Enrollment.status == "enrolled",
        )
        .count()
    )

    today_weekday = today.weekday()
    today_slots = (
        db.query(ScheduleSlot)
        .filter(
            ScheduleSlot.is_active == True,
            (
                (ScheduleSlot.is_recurring == True) & (ScheduleSlot.day_of_week == today_weekday)
                | (ScheduleSlot.specific_date == today)
            ),
        )
        .all()
    )

    total_capacity = 0
    total_enrolled = 0
    for slot in today_slots:
        cap = slot.max_capacity_override if slot.max_capacity_override is not None else slot.activity.max_capacity
        total_capacity += cap
        enrolled = (
            db.query(Enrollment)
            .filter(
                Enrollment.slot_id == slot.id,
                Enrollment.specific_date == today,
                Enrollment.status == "enrolled",
            )
            .count()
        )
        total_enrolled += enrolled

    fill_rate = round((total_enrolled / total_capacity * 100), 1) if total_capacity > 0 else 0.0

    active_subs = (
        db.query(func.coalesce(func.sum(Subscription.price), 0))
        .join(User, User.subscription_id == Subscription.id)
        .filter(User.is_active == True)
        .scalar()
    )
    monthly_revenue = float(active_subs) if active_subs else 0.0

    return {
        "total_members": total_members,
        "active_subscriptions": active_subscriptions,
        "today_enrollments": today_enrollments,
        "total_activities": total_activities,
        "total_coaches": total_coaches,
        "unread_contacts": unread_contacts,
        "pending_reviews": pending_reviews,
        "fill_rate": fill_rate,
        "monthly_revenue": monthly_revenue,
    }

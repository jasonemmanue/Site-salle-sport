from datetime import date, datetime, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.models import Enrollment, ScheduleSlot, Subscription, User


def get_dashboard_stats(db: Session) -> dict:
    active_members = db.query(User).filter(User.is_active == True, User.role == "member").count()

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
        "active_members": active_members,
        "today_enrollments": today_enrollments,
        "fill_rate": fill_rate,
        "monthly_revenue": monthly_revenue,
    }

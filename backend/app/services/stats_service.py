from datetime import date, datetime, timedelta, timezone

from sqlalchemy import desc, func
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


JOURS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
MOIS_FR = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun",
           "Jui", "Aou", "Sep", "Oct", "Nov", "Dec"]


def _slots_du_jour(db: Session, weekday: int, jour: date) -> list[ScheduleSlot]:
    """Creneaux actifs ce jour-la : recurrents du bon jour de semaine, ou datés."""
    return (
        db.query(ScheduleSlot)
        .filter(
            ScheduleSlot.is_active == True,
            (
                (ScheduleSlot.is_recurring == True) & (ScheduleSlot.day_of_week == weekday)
                | (ScheduleSlot.specific_date == jour)
            ),
        )
        .all()
    )


def _capacite_et_inscrits(db: Session, slots: list[ScheduleSlot], jour: date) -> tuple[int, int]:
    capacite = 0
    inscrits = 0
    for slot in slots:
        cap = (
            slot.max_capacity_override
            if slot.max_capacity_override is not None
            else slot.activity.max_capacity
        )
        capacite += cap
        inscrits += (
            db.query(Enrollment)
            .filter(
                Enrollment.slot_id == slot.id,
                Enrollment.specific_date == jour,
                Enrollment.status == "enrolled",
            )
            .count()
        )
    return capacite, inscrits


def get_dashboard_trends(db: Session) -> dict:
    """Tendances du tableau de bord.

    Semaine en cours (lundi -> dimanche) pour les inscriptions et le taux de
    remplissage, 6 derniers mois pour le revenu, 5 activites pour le palmares.

    Le revenu est une ESTIMATION : il n'existe pas de table de paiements, donc
    aucun historique de transactions. On reconstitue le revenu recurrent tel
    qu'il se presentait a la fin de chaque mois, en sommant le prix des formules
    des membres actifs inscrits a cette date. Les resiliations passees ne sont
    pas retracables : la courbe ne peut donc que croitre.
    """
    today = date.today()
    lundi = today - timedelta(days=today.weekday())

    enrollments_by_day = []
    fill_rate_by_day = []
    for i, libelle in enumerate(JOURS_FR):
        jour = lundi + timedelta(days=i)
        slots = _slots_du_jour(db, i, jour)
        capacite, inscrits = _capacite_et_inscrits(db, slots, jour)
        enrollments_by_day.append({"label": libelle, "value": float(inscrits)})
        taux = round(inscrits / capacite * 100, 1) if capacite > 0 else 0.0
        fill_rate_by_day.append({"label": libelle, "value": taux})

    revenue_by_month = []
    for recul in range(5, -1, -1):
        annee, mois = today.year, today.month - recul
        while mois <= 0:
            mois += 12
            annee -= 1
        fin = date(annee + 1, 1, 1) if mois == 12 else date(annee, mois + 1, 1)
        total = (
            db.query(func.coalesce(func.sum(Subscription.price), 0))
            .join(User, User.subscription_id == Subscription.id)
            .filter(User.is_active == True, User.created_at < fin)
            .scalar()
        )
        revenue_by_month.append({"label": MOIS_FR[mois - 1], "value": float(total or 0)})

    # Palmares : jointures externes pour garder les activites sans inscription,
    # sinon un catalogue neuf produirait un graphique vide.
    lignes = (
        db.query(Activity.name, func.count(Enrollment.id).label("total"))
        .outerjoin(ScheduleSlot, ScheduleSlot.activity_id == Activity.id)
        .outerjoin(
            Enrollment,
            (Enrollment.slot_id == ScheduleSlot.id) & (Enrollment.status == "enrolled"),
        )
        .filter(Activity.is_active == True)
        .group_by(Activity.id, Activity.name)
        .order_by(desc("total"), Activity.name)
        .limit(5)
        .all()
    )
    top_activities = [{"label": nom, "value": float(total)} for nom, total in lignes]

    return {
        "enrollments_by_day": enrollments_by_day,
        "revenue_by_month": revenue_by_month,
        "top_activities": top_activities,
        "fill_rate_by_day": fill_rate_by_day,
    }

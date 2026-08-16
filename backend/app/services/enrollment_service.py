from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.models import Enrollment, ScheduleSlot


def _get_max_capacity(slot: ScheduleSlot) -> int:
    if slot.max_capacity_override is not None:
        return slot.max_capacity_override
    return slot.activity.max_capacity


def get_slot_availability(db: Session, slot_id, date=None) -> dict:
    slot = db.query(ScheduleSlot).filter(ScheduleSlot.id == slot_id).first()
    if not slot:
        return {"enrolled_count": 0, "max_capacity": 0, "available": 0}
    enrolled_count = (
        db.query(Enrollment)
        .filter(
            Enrollment.slot_id == slot_id,
            Enrollment.specific_date == date,
            Enrollment.status == "enrolled",
        )
        .count()
    )
    max_cap = _get_max_capacity(slot)
    return {
        "enrolled_count": enrolled_count,
        "max_capacity": max_cap,
        "available": max(0, max_cap - enrolled_count),
    }


def enroll(db: Session, data) -> Enrollment:
    # Sans ce controle, un slot_id inconnu part en base et la violation de cle
    # etrangere remonte en 500 au lieu du 404 attendu.
    slot = db.query(ScheduleSlot).filter(ScheduleSlot.id == data.slot_id).first()
    if slot is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Creneau introuvable",
        )

    availability = get_slot_availability(db, data.slot_id, data.specific_date)
    # Nom distinct de `status` : ce dernier est le module importe de fastapi,
    # une variable locale du meme nom le masquerait dans toute la fonction.
    statut = "enrolled" if availability["available"] > 0 else "waitlisted"
    enrollment = Enrollment(
        id=str(uuid4()),
        user_name=data.user_name,
        user_email=data.user_email,
        user_phone=data.user_phone,
        slot_id=data.slot_id,
        specific_date=data.specific_date,
        status=statut,
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


def cancel_enrollment(db: Session, enrollment_id) -> bool:
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not enrollment:
        return False
    enrollment.status = "cancelled"
    db.commit()

    _promote_waitlisted(db, enrollment.slot_id, enrollment.specific_date)
    return True


def _promote_waitlisted(db: Session, slot_id, specific_date):
    availability = get_slot_availability(db, slot_id, specific_date)
    if availability["available"] <= 0:
        return
    next_waitlisted = (
        db.query(Enrollment)
        .filter(
            Enrollment.slot_id == slot_id,
            Enrollment.specific_date == specific_date,
            Enrollment.status == "waitlisted",
        )
        .order_by(Enrollment.enrolled_at)
        .first()
    )
    if next_waitlisted:
        next_waitlisted.status = "enrolled"
        db.commit()


def get_slot_enrollments(db: Session, slot_id, date=None) -> list[Enrollment]:
    query = db.query(Enrollment).filter(
        Enrollment.slot_id == slot_id,
        Enrollment.status != "cancelled",
    )
    if date is not None:
        query = query.filter(Enrollment.specific_date == date)
    return query.order_by(Enrollment.enrolled_at).all()

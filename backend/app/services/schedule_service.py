from collections import defaultdict
from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.validators import reject_null_on_required
from app.models.models import Activity, Coach, ScheduleSlot


def _check_references(db: Session, activity_id, coach_id) -> None:
    """Verifie que l'activite et le coach references existent.

    Sinon la violation de cle etrangere remonte en 500 au lieu d'un 404.
    """
    if activity_id is not None and db.query(Activity.id).filter(Activity.id == activity_id).first() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activite introuvable",
        )
    if coach_id is not None and db.query(Coach.id).filter(Coach.id == coach_id).first() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coach introuvable",
        )


def _base_query(db: Session):
    return db.query(ScheduleSlot).options(
        joinedload(ScheduleSlot.activity),
        joinedload(ScheduleSlot.coach),
    )


def get_schedule(db: Session, date=None) -> list[ScheduleSlot]:
    query = _base_query(db).filter(ScheduleSlot.is_active == True)
    if date:
        day_of_week = date.weekday()
        query = query.filter(
            (ScheduleSlot.is_recurring == True) & (ScheduleSlot.day_of_week == day_of_week)
            | (ScheduleSlot.specific_date == date)
        )
    return query.order_by(ScheduleSlot.day_of_week, ScheduleSlot.start_time).all()


def get_slot_by_id(db: Session, slot_id) -> ScheduleSlot | None:
    return _base_query(db).filter(ScheduleSlot.id == slot_id).first()


def create_slot(db: Session, data) -> ScheduleSlot:
    _check_references(db, data.activity_id, data.coach_id)
    slot = ScheduleSlot(id=str(uuid4()), **data.model_dump())
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot


def update_slot(db: Session, slot_id, data) -> ScheduleSlot | None:
    slot = db.query(ScheduleSlot).filter(ScheduleSlot.id == slot_id).first()
    if not slot:
        return None
    _check_references(db, data.activity_id, data.coach_id)
    update_data = data.model_dump(exclude_unset=True)
    reject_null_on_required(ScheduleSlot, update_data)
    for key, value in update_data.items():
        setattr(slot, key, value)
    db.commit()
    db.refresh(slot)
    return slot


def delete_slot(db: Session, slot_id) -> bool:
    slot = db.query(ScheduleSlot).filter(ScheduleSlot.id == slot_id).first()
    if not slot:
        return False
    slot.is_active = False
    db.commit()
    return True


def get_weekly_schedule(db: Session) -> dict[int, list[ScheduleSlot]]:
    slots = _base_query(db).filter(
        ScheduleSlot.is_active == True,
        ScheduleSlot.is_recurring == True,
    ).order_by(ScheduleSlot.start_time).all()
    grouped: dict[int, list[ScheduleSlot]] = defaultdict(list)
    for slot in slots:
        grouped[slot.day_of_week].append(slot)
    return dict(grouped)

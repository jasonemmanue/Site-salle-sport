from uuid import uuid4

from sqlalchemy.orm import Session

from app.core.validators import reject_null_on_required
from app.models.models import Coach


def get_coaches(db: Session) -> list[Coach]:
    return db.query(Coach).filter(Coach.is_active == True).order_by(Coach.order).all()


def get_coach_by_id(db: Session, coach_id) -> Coach | None:
    return db.query(Coach).filter(Coach.id == coach_id).first()


def create_coach(db: Session, data) -> Coach:
    coach = Coach(id=str(uuid4()), **data.model_dump())
    db.add(coach)
    db.commit()
    db.refresh(coach)
    return coach


def update_coach(db: Session, coach_id, data) -> Coach | None:
    coach = db.query(Coach).filter(Coach.id == coach_id).first()
    if not coach:
        return None
    update_data = data.model_dump(exclude_unset=True)
    reject_null_on_required(Coach, update_data)
    for key, value in update_data.items():
        setattr(coach, key, value)
    db.commit()
    db.refresh(coach)
    return coach


def delete_coach(db: Session, coach_id) -> bool:
    coach = db.query(Coach).filter(Coach.id == coach_id).first()
    if not coach:
        return False
    coach.is_active = False
    db.commit()
    return True

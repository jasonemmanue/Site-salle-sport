from uuid import uuid4

from sqlalchemy.orm import Session

from app.core.validators import reject_null_on_required
from app.models.models import Equipment


def get_equipment(db: Session, zone: str | None = None) -> list[Equipment]:
    query = db.query(Equipment).filter(Equipment.is_active == True)
    if zone:
        query = query.filter(Equipment.zone == zone)
    return query.order_by(Equipment.name).all()


def create_equipment(db: Session, data) -> Equipment:
    eq = Equipment(id=str(uuid4()), **data.model_dump())
    db.add(eq)
    db.commit()
    db.refresh(eq)
    return eq


def update_equipment(db: Session, eq_id, data) -> Equipment | None:
    eq = db.query(Equipment).filter(Equipment.id == eq_id).first()
    if not eq:
        return None
    update_data = data.model_dump(exclude_unset=True)
    reject_null_on_required(Equipment, update_data)
    for key, value in update_data.items():
        setattr(eq, key, value)
    db.commit()
    db.refresh(eq)
    return eq


def delete_equipment(db: Session, eq_id) -> bool:
    eq = db.query(Equipment).filter(Equipment.id == eq_id).first()
    if not eq:
        return False
    eq.is_active = False
    db.commit()
    return True

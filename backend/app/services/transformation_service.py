from uuid import uuid4

from sqlalchemy.orm import Session

from app.core.validators import reject_null_on_required
from app.models.models import Transformation


def get_transformations(db: Session, featured_only: bool = False) -> list[Transformation]:
    query = db.query(Transformation).filter(Transformation.is_published == True)
    if featured_only:
        query = query.filter(Transformation.is_featured == True)
    return query.order_by(Transformation.created_at.desc()).all()


def create_transformation(db: Session, data) -> Transformation:
    t = Transformation(id=str(uuid4()), **data.model_dump())
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


def update_transformation(db: Session, t_id, data) -> Transformation | None:
    t = db.query(Transformation).filter(Transformation.id == t_id).first()
    if not t:
        return None
    update_data = data.model_dump(exclude_unset=True)
    reject_null_on_required(Transformation, update_data)
    for key, value in update_data.items():
        setattr(t, key, value)
    db.commit()
    db.refresh(t)
    return t


def delete_transformation(db: Session, t_id) -> bool:
    t = db.query(Transformation).filter(Transformation.id == t_id).first()
    if not t:
        return False
    db.delete(t)
    db.commit()
    return True

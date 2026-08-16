from uuid import uuid4

from sqlalchemy.orm import Session

from app.core.validators import reject_null_on_required
from app.models.models import Subscription


def get_subscriptions(db: Session) -> list[Subscription]:
    return db.query(Subscription).filter(Subscription.is_active == True).order_by(Subscription.order).all()


def create_subscription(db: Session, data) -> Subscription:
    sub = Subscription(id=str(uuid4()), **data.model_dump())
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


def update_subscription(db: Session, sub_id, data) -> Subscription | None:
    sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
    if not sub:
        return None
    update_data = data.model_dump(exclude_unset=True)
    reject_null_on_required(Subscription, update_data)
    for key, value in update_data.items():
        setattr(sub, key, value)
    db.commit()
    db.refresh(sub)
    return sub


def delete_subscription(db: Session, sub_id) -> bool:
    sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
    if not sub:
        return False
    sub.is_active = False
    db.commit()
    return True

import re
import unicodedata
from uuid import uuid4

from sqlalchemy.orm import Session

from app.models.models import Activity


def _slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text.lower().strip())
    return re.sub(r"[-\s]+", "-", text)


def get_activities(
    db: Session,
    category: str | None = None,
    level: str | None = None,
    skip: int = 0,
    limit: int = 20,
) -> tuple[list[Activity], int]:
    query = db.query(Activity).filter(Activity.is_active == True)
    if category:
        query = query.filter(Activity.category == category)
    if level:
        query = query.filter(Activity.level == level)
    total = query.count()
    items = query.order_by(Activity.order).offset(skip).limit(limit).all()
    return items, total


def get_activity_by_slug(db: Session, slug: str) -> Activity | None:
    return db.query(Activity).filter(Activity.slug == slug, Activity.is_active == True).first()


def create_activity(db: Session, data) -> Activity:
    dump = data.model_dump()
    dump["slug"] = _slugify(data.name)
    activity = Activity(
        id=str(uuid4()),
        **dump,
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


def update_activity(db: Session, activity_id, data) -> Activity | None:
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        return None
    update_data = data.model_dump(exclude_unset=True)
    if "name" in update_data:
        update_data["slug"] = _slugify(update_data["name"])
    for key, value in update_data.items():
        setattr(activity, key, value)
    db.commit()
    db.refresh(activity)
    return activity


def delete_activity(db: Session, activity_id) -> bool:
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        return False
    activity.is_active = False
    db.commit()
    return True

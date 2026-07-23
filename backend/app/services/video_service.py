from uuid import uuid4

from sqlalchemy.orm import Session

from app.models.models import Video


def get_videos(db: Session, category: str | None = None) -> list[Video]:
    query = db.query(Video).filter(Video.is_published == True)
    if category:
        query = query.filter(Video.category == category)
    return query.order_by(Video.order).all()


def create_video(db: Session, data) -> Video:
    video = Video(id=str(uuid4()), **data.model_dump())
    db.add(video)
    db.commit()
    db.refresh(video)
    return video


def update_video(db: Session, video_id, data) -> Video | None:
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(video, key, value)
    db.commit()
    db.refresh(video)
    return video


def delete_video(db: Session, video_id) -> bool:
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        return False
    db.delete(video)
    db.commit()
    return True

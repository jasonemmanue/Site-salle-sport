from uuid import uuid4

from sqlalchemy.orm import Session

from app.models.models import Review


def get_approved_reviews(db: Session) -> list[Review]:
    return db.query(Review).filter(Review.is_approved == True).order_by(Review.created_at.desc()).all()


def get_all_reviews(db: Session) -> list[Review]:
    return db.query(Review).order_by(Review.created_at.desc()).all()


def create_review(db: Session, data) -> Review:
    review = Review(id=str(uuid4()), is_approved=False, **data.model_dump())
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


def approve_review(db: Session, review_id) -> Review | None:
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        return None
    review.is_approved = True
    db.commit()
    db.refresh(review)
    return review


def delete_review(db: Session, review_id) -> bool:
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        return False
    db.delete(review)
    db.commit()
    return True

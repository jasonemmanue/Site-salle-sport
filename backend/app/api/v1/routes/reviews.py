from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_admin_user, get_db
from app.models.models import User
from app.schemas.schemas import ReviewCreate, ReviewResponse
from app.services import review_service

router = APIRouter()


@router.get("/", response_model=list[ReviewResponse])
def list_approved_reviews(db: Session = Depends(get_db)):
    return review_service.get_approved_reviews(db)


@router.get("/all", response_model=list[ReviewResponse])
def list_all_reviews(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    return review_service.get_all_reviews(db)


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(data: ReviewCreate, db: Session = Depends(get_db)):
    return review_service.create_review(db, data)


@router.put("/{review_id}/approve", response_model=ReviewResponse)
def approve_review(
    review_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    review = review_service.approve_review(db, review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    return review


@router.delete("/{review_id}")
def delete_review(
    review_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    success = review_service.delete_review(db, review_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    return {"ok": True}

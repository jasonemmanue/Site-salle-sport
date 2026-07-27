from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_admin_user, get_db
from app.models.models import User
from app.schemas.schemas import ActivityCreate, ActivityResponse, ActivityUpdate, PaginatedResponse
from app.services import activity_service

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[ActivityResponse])
def list_activities(
    category: str | None = Query(None),
    level: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    skip = (page - 1) * limit
    items, total = activity_service.get_activities(db, category=category, level=level, skip=skip, limit=limit)
    pages = (total + limit - 1) // limit if limit > 0 else 0
    return PaginatedResponse(items=items, total=total, page=page, pages=pages)


@router.get("/{slug}", response_model=ActivityResponse)
def get_activity(slug: str, db: Session = Depends(get_db)):
    activity = activity_service.get_activity_by_slug(db, slug)
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    return activity


@router.post("/", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activity(
    data: ActivityCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    return activity_service.create_activity(db, data)


@router.put("/{activity_id}", response_model=ActivityResponse)
def update_activity(
    activity_id: str,
    data: ActivityUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    activity = activity_service.update_activity(db, activity_id, data)
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    return activity


@router.delete("/{activity_id}")
def delete_activity(
    activity_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    success = activity_service.delete_activity(db, activity_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    return {"ok": True}

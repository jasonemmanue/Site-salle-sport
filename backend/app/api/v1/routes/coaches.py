from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_admin_user, get_db
from app.core.validators import UUIDStr
from app.models.models import User
from app.schemas.schemas import CoachCreate, CoachResponse, CoachUpdate
from app.services import coach_service

router = APIRouter()


@router.get("/", response_model=list[CoachResponse])
def list_coaches(db: Session = Depends(get_db)):
    return coach_service.get_coaches(db)


@router.get("/{coach_id}", response_model=CoachResponse)
def get_coach(coach_id: UUIDStr, db: Session = Depends(get_db)):
    coach = coach_service.get_coach_by_id(db, coach_id)
    if not coach:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coach not found")
    return coach


@router.post("/", response_model=CoachResponse, status_code=status.HTTP_201_CREATED)
def create_coach(
    data: CoachCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    return coach_service.create_coach(db, data)


@router.put("/{coach_id}", response_model=CoachResponse)
def update_coach(
    coach_id: UUIDStr,
    data: CoachUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    coach = coach_service.update_coach(db, coach_id, data)
    if not coach:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coach not found")
    return coach


@router.delete("/{coach_id}")
def delete_coach(
    coach_id: UUIDStr,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    success = coach_service.delete_coach(db, coach_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coach not found")
    return {"ok": True}

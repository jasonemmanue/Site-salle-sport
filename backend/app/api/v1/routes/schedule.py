from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_admin_user, get_db
from app.core.validators import UUIDStr
from app.models.models import User
from app.schemas.schemas import ScheduleSlotCreate, ScheduleSlotResponse, ScheduleSlotUpdate
from app.services import schedule_service

router = APIRouter()


@router.get("/", response_model=list[ScheduleSlotResponse])
def get_schedule(
    date: date | None = Query(None),
    db: Session = Depends(get_db),
):
    return schedule_service.get_schedule(db, date=date)


@router.get("/weekly")
def get_weekly_schedule(db: Session = Depends(get_db)):
    return schedule_service.get_weekly_schedule(db)


@router.post("/", response_model=ScheduleSlotResponse, status_code=status.HTTP_201_CREATED)
def create_slot(
    data: ScheduleSlotCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    return schedule_service.create_slot(db, data)


@router.put("/{slot_id}", response_model=ScheduleSlotResponse)
def update_slot(
    slot_id: UUIDStr,
    data: ScheduleSlotUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    slot = schedule_service.update_slot(db, slot_id, data)
    if not slot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Slot not found")
    return slot


@router.delete("/{slot_id}")
def delete_slot(
    slot_id: UUIDStr,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    success = schedule_service.delete_slot(db, slot_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Slot not found")
    return {"ok": True}

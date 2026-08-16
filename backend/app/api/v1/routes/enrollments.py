from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_admin_user, get_db
from app.core.validators import UUIDStr
from app.models.models import User
from app.schemas.schemas import EnrollmentCreate, EnrollmentResponse
from app.services import enrollment_service

router = APIRouter()


@router.post("/", response_model=EnrollmentResponse, status_code=status.HTTP_201_CREATED)
def enroll(data: EnrollmentCreate, db: Session = Depends(get_db)):
    return enrollment_service.enroll(db, data)


@router.delete("/{enrollment_id}")
def cancel_enrollment(enrollment_id: UUIDStr, db: Session = Depends(get_db)):
    success = enrollment_service.cancel_enrollment(db, enrollment_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")
    return {"ok": True}


@router.get("/slot/{slot_id}", response_model=list[EnrollmentResponse])
def get_slot_enrollments(
    slot_id: UUIDStr,
    specific_date: date | None = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    return enrollment_service.get_slot_enrollments(db, slot_id, date=specific_date)


@router.get("/slot/{slot_id}/availability")
def get_slot_availability(
    slot_id: UUIDStr,
    specific_date: date | None = Query(None),
    db: Session = Depends(get_db),
):
    return enrollment_service.get_slot_availability(db, slot_id, date=specific_date)

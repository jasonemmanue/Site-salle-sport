from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_admin_user, get_db
from app.models.models import User
from app.schemas.schemas import ContactCreate, ContactResponse
from app.services import contact_service

router = APIRouter()


@router.post("/", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def submit_contact(data: ContactCreate, db: Session = Depends(get_db)):
    return contact_service.create_contact(db, data)


@router.get("/", response_model=list[ContactResponse])
def list_contacts(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    return contact_service.get_contacts(db)


@router.put("/{contact_id}/read", response_model=ContactResponse)
def mark_contact_read(
    contact_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    contact = contact_service.mark_as_read(db, contact_id)
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
    return contact

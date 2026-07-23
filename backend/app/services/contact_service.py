from uuid import uuid4

from sqlalchemy.orm import Session

from app.models.models import Contact


def get_contacts(db: Session) -> list[Contact]:
    return db.query(Contact).order_by(Contact.created_at.desc()).all()


def create_contact(db: Session, data) -> Contact:
    contact = Contact(id=str(uuid4()), **data.model_dump())
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


def mark_as_read(db: Session, contact_id) -> Contact | None:
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        return None
    contact.is_read = True
    db.commit()
    db.refresh(contact)
    return contact

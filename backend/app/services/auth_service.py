from uuid import uuid4

from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.models import User


def authenticate(db: Session, email: str, password: str) -> User | None:
    user = db.query(User).filter(User.email == email, User.is_active == True).first()
    if not user or not verify_password(password, user.password_hash):
        return None
    return user


def create_user(
    db: Session,
    email: str,
    password: str,
    full_name: str,
    role: str = "member",
) -> User:
    user = User(
        id=str(uuid4()),
        email=email,
        password_hash=hash_password(password),
        full_name=full_name,
        role=role,
        qr_code=str(uuid4()),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id) -> User | None:
    return db.query(User).filter(User.id == user_id).first()

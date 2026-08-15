from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_admin_user, get_db
from app.models.models import User
from app.schemas.schemas import SettingResponse, SettingUpdate
from app.services import settings_service

router = APIRouter()


@router.get("/public", response_model=list[SettingResponse])
def list_public_settings(db: Session = Depends(get_db)):
    """Coordonnees et horaires affiches par le site public — sans auth."""
    return settings_service.get_public_settings(db)


@router.get("/", response_model=list[SettingResponse])
def list_settings(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    return settings_service.get_settings(db)


@router.put("/", response_model=SettingResponse)
def update_setting(
    data: SettingUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    return settings_service.update_setting(db, data.key, data.value)

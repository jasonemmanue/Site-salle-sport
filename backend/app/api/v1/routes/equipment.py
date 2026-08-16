from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_admin_user, get_db
from app.core.validators import UUIDStr
from app.models.models import User
from app.schemas.schemas import EquipmentCreate, EquipmentResponse, EquipmentUpdate
from app.services import equipment_service

router = APIRouter()


@router.get("/", response_model=list[EquipmentResponse])
def list_equipment(
    zone: str | None = Query(None),
    db: Session = Depends(get_db),
):
    return equipment_service.get_equipment(db, zone=zone)


@router.post("/", response_model=EquipmentResponse, status_code=status.HTTP_201_CREATED)
def create_equipment(
    data: EquipmentCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    return equipment_service.create_equipment(db, data)


@router.put("/{eq_id}", response_model=EquipmentResponse)
def update_equipment(
    eq_id: UUIDStr,
    data: EquipmentUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    eq = equipment_service.update_equipment(db, eq_id, data)
    if not eq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found")
    return eq


@router.delete("/{eq_id}")
def delete_equipment(
    eq_id: UUIDStr,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    success = equipment_service.delete_equipment(db, eq_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found")
    return {"ok": True}

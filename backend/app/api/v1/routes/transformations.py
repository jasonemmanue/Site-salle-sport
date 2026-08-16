from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_admin_user, get_db
from app.core.validators import UUIDStr
from app.models.models import User
from app.schemas.schemas import TransformationCreate, TransformationResponse, TransformationUpdate
from app.services import transformation_service

router = APIRouter()


@router.get("/", response_model=list[TransformationResponse])
def list_transformations(
    featured_only: bool = Query(False),
    db: Session = Depends(get_db),
):
    return transformation_service.get_transformations(db, featured_only=featured_only)


@router.post("/", response_model=TransformationResponse, status_code=status.HTTP_201_CREATED)
def create_transformation(
    data: TransformationCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    return transformation_service.create_transformation(db, data)


@router.put("/{t_id}", response_model=TransformationResponse)
def update_transformation(
    t_id: UUIDStr,
    data: TransformationUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    transformation = transformation_service.update_transformation(db, t_id, data)
    if not transformation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transformation not found")
    return transformation


@router.delete("/{t_id}")
def delete_transformation(
    t_id: UUIDStr,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    success = transformation_service.delete_transformation(db, t_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transformation not found")
    return {"ok": True}

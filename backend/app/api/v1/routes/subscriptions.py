from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_admin_user, get_db
from app.models.models import User
from app.schemas.schemas import SubscriptionCreate, SubscriptionResponse, SubscriptionUpdate
from app.services import subscription_service

router = APIRouter()


@router.get("/", response_model=list[SubscriptionResponse])
def list_subscriptions(db: Session = Depends(get_db)):
    return subscription_service.get_subscriptions(db)


@router.post("/", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
def create_subscription(
    data: SubscriptionCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    return subscription_service.create_subscription(db, data)


@router.put("/{sub_id}", response_model=SubscriptionResponse)
def update_subscription(
    sub_id: str,
    data: SubscriptionUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    sub = subscription_service.update_subscription(db, sub_id, data)
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")
    return sub


@router.delete("/{sub_id}")
def delete_subscription(
    sub_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    success = subscription_service.delete_subscription(db, sub_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")
    return {"ok": True}

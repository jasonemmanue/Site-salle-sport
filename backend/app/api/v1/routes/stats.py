from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_admin_user, get_db
from app.models.models import User
from app.schemas.schemas import DashboardStats, DashboardTrends
from app.services import stats_service

router = APIRouter()


@router.get("/", response_model=DashboardStats)
def get_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    return stats_service.get_dashboard_stats(db)


@router.get("/trends", response_model=DashboardTrends)
def get_trends(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    return stats_service.get_dashboard_trends(db)

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_admin_user, get_db
from app.models.models import User
from app.schemas.schemas import VideoCreate, VideoResponse, VideoUpdate
from app.services import video_service

router = APIRouter()


@router.get("/", response_model=list[VideoResponse])
def list_videos(
    category: str | None = Query(None),
    db: Session = Depends(get_db),
):
    return video_service.get_videos(db, category=category)


@router.post("/", response_model=VideoResponse, status_code=status.HTTP_201_CREATED)
def create_video(
    data: VideoCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    return video_service.create_video(db, data)


@router.put("/{video_id}", response_model=VideoResponse)
def update_video(
    video_id: str,
    data: VideoUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    video = video_service.update_video(db, video_id, data)
    if not video:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Video not found")
    return video


@router.delete("/{video_id}")
def delete_video(
    video_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    success = video_service.delete_video(db, video_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Video not found")
    return {"ok": True}

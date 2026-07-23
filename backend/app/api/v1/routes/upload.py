from fastapi import APIRouter, Depends, File, Query, UploadFile, status

from app.core.dependencies import get_admin_user
from app.models.models import User
from app.services import media_service

router = APIRouter()


@router.post("/", status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    subfolder: str = Query("uploads"),
    admin: User = Depends(get_admin_user),
):
    url = await media_service.save_upload(file, subfolder)
    return {"url": url}

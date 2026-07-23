import os
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile

from app.core.config import settings

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".pdf"}


async def save_upload(file: UploadFile, subfolder: str = "images") -> str:
    ext = Path(file.filename).suffix.lower() if file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Extension {ext} non autorisee")

    content = await file.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > settings.MAX_UPLOAD_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"Fichier trop volumineux ({size_mb:.1f} MB, max {settings.MAX_UPLOAD_SIZE_MB} MB)",
        )

    upload_dir = Path(settings.UPLOAD_DIR) / subfolder
    upload_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = upload_dir / filename
    file_path.write_bytes(content)

    return f"/uploads/{subfolder}/{filename}"


def delete_file(file_path: str) -> bool:
    full_path = Path(settings.UPLOAD_DIR).parent / file_path.lstrip("/")
    if full_path.exists():
        os.remove(full_path)
        return True
    return False

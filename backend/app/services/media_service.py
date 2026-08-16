import os
import re
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile

from app.core.config import settings

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".pdf"}

# Un seul segment, lettres/chiffres/tiret/underscore. Interdit de fait `..`,
# les separateurs de chemin et les chemins absolus.
SUBFOLDER_PATTERN = re.compile(r"^[A-Za-z0-9_-]{1,64}$")


def _safe_subfolder(subfolder: str) -> str:
    """Valide le sous-dossier de destination.

    `subfolder` arrive d'un parametre de requete : concatene tel quel, un
    `../../..` fait ecrire le fichier n'importe ou sur le disque du conteneur.
    """
    if not SUBFOLDER_PATTERN.match(subfolder or ""):
        raise HTTPException(
            status_code=400,
            detail="Sous-dossier invalide : lettres, chiffres, tiret et underscore uniquement",
        )
    return subfolder


async def save_upload(file: UploadFile, subfolder: str = "images") -> str:
    subfolder = _safe_subfolder(subfolder)

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
    racine = Path(settings.UPLOAD_DIR).resolve()
    cible = (racine.parent / file_path.lstrip("/")).resolve()
    # Un `../` dans file_path ferait sortir de l'arborescence des uploads.
    if not cible.is_relative_to(racine):
        raise HTTPException(status_code=400, detail="Chemin de fichier invalide")
    if cible.exists():
        os.remove(cible)
        return True
    return False

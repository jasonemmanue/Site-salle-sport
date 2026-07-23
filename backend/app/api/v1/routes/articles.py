from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_admin_user, get_db
from app.models.models import User
from app.schemas.schemas import ArticleCreate, ArticleResponse, ArticleUpdate, PaginatedResponse
from app.services import article_service

router = APIRouter()


@router.get("/")
def list_articles(
    status_filter: str | None = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    filter_status = status_filter if status_filter else "published"
    items, total = article_service.get_articles(db, status=filter_status, page=page, limit=limit)
    pages = (total + limit - 1) // limit if limit > 0 else 0
    return PaginatedResponse(items=items, total=total, page=page, pages=pages)


@router.get("/{slug}", response_model=ArticleResponse)
def get_article(slug: str, db: Session = Depends(get_db)):
    article = article_service.get_article_by_slug(db, slug)
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    return article


@router.post("/", response_model=ArticleResponse, status_code=status.HTTP_201_CREATED)
def create_article(
    data: ArticleCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    return article_service.create_article(db, data, author_id=str(admin.id))


@router.put("/{article_id}", response_model=ArticleResponse)
def update_article(
    article_id: str,
    data: ArticleUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    article = article_service.update_article(db, article_id, data)
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    return article


@router.delete("/{article_id}")
def delete_article(
    article_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    success = article_service.delete_article(db, article_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    return {"ok": True}

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy.orm import Session

from app.core.validators import reject_null_on_required
from app.models.models import Article
from app.services.slug_service import unique_slug


def get_articles(
    db: Session,
    status: str | None = None,
    page: int = 1,
    limit: int = 10,
) -> tuple[list[Article], int]:
    query = db.query(Article)
    if status:
        query = query.filter(Article.status == status)
    total = query.count()
    items = (
        query.order_by(Article.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )
    return items, total


def get_article_by_slug(db: Session, slug: str) -> Article | None:
    return db.query(Article).filter(Article.slug == slug, Article.status == "published").first()


def create_article(db: Session, data, author_id) -> Article:
    dump = data.model_dump()
    dump["slug"] = unique_slug(db, Article, dump["title"])
    article = Article(
        id=str(uuid4()),
        author_id=author_id,
        **dump,
    )
    if article.status == "published":
        article.published_at = datetime.now(timezone.utc)
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


def update_article(db: Session, article_id, data) -> Article | None:
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        return None
    update_data = data.model_dump(exclude_unset=True)
    reject_null_on_required(Article, update_data)
    if "title" in update_data:
        update_data["slug"] = unique_slug(db, Article, update_data["title"], exclude_id=article.id)
    was_draft = article.status != "published"
    for key, value in update_data.items():
        setattr(article, key, value)
    if was_draft and article.status == "published":
        article.published_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(article)
    return article


def delete_article(db: Session, article_id) -> bool:
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        return False
    db.delete(article)
    db.commit()
    return True

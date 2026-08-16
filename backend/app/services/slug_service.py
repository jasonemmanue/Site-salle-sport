"""Fabrication de slugs uniques.

Les colonnes `slug` d'`activities` et d'`articles` portent une contrainte
d'unicite. Deux activites nommees pareil — ou deux articles au meme titre —
produisent le meme slug et faisaient remonter une `UniqueViolation` en 500.
On suffixe donc `-2`, `-3`... jusqu'a trouver un slug libre.
"""

import re
import unicodedata

from sqlalchemy.orm import Session


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text.lower().strip())
    return re.sub(r"[-\s]+", "-", text).strip("-")


def unique_slug(db: Session, model, text: str, exclude_id=None) -> str:
    """Slug derive de `text`, garanti libre sur `model.slug`.

    `exclude_id` ecarte la ligne en cours de modification : renommer une
    activite sans changer son nom ne doit pas la suffixer elle-meme.
    """
    base = slugify(text) or "element"
    candidate = base
    suffixe = 2
    while True:
        query = db.query(model.id).filter(model.slug == candidate)
        if exclude_id is not None:
            query = query.filter(model.id != exclude_id)
        if query.first() is None:
            return candidate
        candidate = f"{base}-{suffixe}"
        suffixe += 1

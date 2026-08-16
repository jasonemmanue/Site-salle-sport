"""Validations partagees par les routes, les schemas et les services."""

from typing import Annotated
from uuid import UUID

from fastapi import HTTPException, status as http_status
from pydantic import AfterValidator
from sqlalchemy import inspect as sa_inspect


def _check_uuid(value: str) -> str:
    """Refuse un identifiant qui n'est pas un UUID.

    Toutes les cles primaires sont des colonnes PostgreSQL `uuid`. Sans ce
    controle, une chaine quelconque part telle quelle dans la requete SQL et
    PostgreSQL leve `invalid input syntax for type uuid` : l'appelant recoit un
    500 la ou un 422 est attendu.
    """
    try:
        UUID(value)
    except (AttributeError, TypeError, ValueError):
        raise ValueError("identifiant invalide : un UUID est attendu")
    return value


UUIDStr = Annotated[str, AfterValidator(_check_uuid)]


def reject_null_on_required(model, update_data: dict) -> None:
    """Refuse un `null` explicite sur une colonne NOT NULL.

    Les schemas `*Update` declarent tous leurs champs `X | None = None` pour les
    rendre facultatifs. `model_dump(exclude_unset=True)` distingue bien « champ
    absent » de « champ a null », mais rien n'empechait le second de partir en
    base : PostgreSQL levait alors une violation NOT NULL, soit un 500.

    Mettre a null reste permis sur les colonnes nullables — vider la photo d'un
    coach ou la date d'un creneau ponctuel doit continuer de fonctionner.
    """
    colonnes = sa_inspect(model).columns
    fautifs = sorted(
        cle
        for cle, valeur in update_data.items()
        if valeur is None and cle in colonnes and not colonnes[cle].nullable
    )
    if fautifs:
        raise HTTPException(
            status_code=http_status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Champ obligatoire, valeur nulle refusee : {', '.join(fautifs)}",
        )

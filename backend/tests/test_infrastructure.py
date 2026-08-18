"""Sante de l'application et politique CORS.

Le CORS n'est pas un detail de confort : le site public et le back-office
tournent sur des origines distinctes de l'API. Une origine retiree par
inadvertance de `CORS_ORIGINS` casse tous les appels du navigateur sans rien
casser cote serveur — d'ou ces verifications.
"""

import pytest

from app.core.config import settings


def test_health_repond_ok(client):
    reponse = client.get("/health")
    assert reponse.status_code == 200
    assert reponse.json() == {"status": "ok"}


def test_documentation_openapi_disponible(client):
    reponse = client.get("/openapi.json")
    assert reponse.status_code == 200
    assert reponse.json()["info"]["title"] == "Eslie Sport API"


@pytest.mark.parametrize("origine", settings.CORS_ORIGINS)
def test_origines_autorisees_recoivent_les_entetes_cors(client, origine):
    reponse = client.get("/api/v1/activities/", headers={"Origin": origine})
    assert reponse.status_code == 200
    assert reponse.headers.get("access-control-allow-origin") == origine


def test_prevol_autorise_le_post_depuis_le_site_public(client):
    """Le POST des formulaires publics passe par un prevol : il doit aboutir."""
    reponse = client.options(
        "/api/v1/contact/",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert reponse.status_code == 200
    assert reponse.headers.get("access-control-allow-origin") == "http://localhost:3000"


def test_origine_inconnue_ne_recoit_pas_les_entetes_cors(client):
    reponse = client.get(
        "/api/v1/activities/", headers={"Origin": "https://site-inconnu.example"}
    )
    # La reponse part quand meme — c'est le navigateur qui bloque, faute
    # d'en-tete d'autorisation.
    assert reponse.status_code == 200
    assert "access-control-allow-origin" not in reponse.headers


def test_les_ports_du_site_public_et_du_back_office_sont_autorises():
    """Garde-fou de configuration : ports Docker documentes dans CLAUDE.md."""
    for origine in ("http://localhost:3000", "http://localhost:3001", "http://localhost:3003"):
        assert origine in settings.CORS_ORIGINS

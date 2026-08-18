"""Authentification : connexion, inscription, renouvellement, profil.

Deux points de contrat que le back-office consomme et qu'une refonte casserait
sans bruit : la connexion attend un corps **form-urlencoded** (champ
`username`, pas `email`), et l'absence d'en-tete `Authorization` rend **403**
la ou un jeton invalide rend **401** — c'est `HTTPBearer` qui produit le
premier, notre code qui produit le second.
"""

from datetime import datetime, timedelta, timezone

from jose import jwt

from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token
from app.models.models import User

CHEMIN = "/api/v1/auth"


def _connexion(client, email, mot_de_passe):
    return client.post(
        f"{CHEMIN}/login", data={"username": email, "password": mot_de_passe}
    )


# --- Connexion -------------------------------------------------------------


def test_connexion_rend_les_deux_jetons(client, admin):
    reponse = _connexion(client, admin.email, admin.mot_de_passe)
    assert reponse.status_code == 200
    corps = reponse.json()
    assert corps["token_type"] == "bearer"
    assert corps["access_token"] and corps["refresh_token"]


def test_le_jeton_de_connexion_porte_le_role(client, admin):
    jeton = _connexion(client, admin.email, admin.mot_de_passe).json()["access_token"]
    charge = jwt.decode(jeton, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert charge["sub"] == admin.id
    assert charge["role"] == "admin"
    assert charge["type"] == "access"


def test_connexion_mot_de_passe_faux(client, admin):
    assert _connexion(client, admin.email, "mauvais").status_code == 401


def test_connexion_email_inconnu(client):
    assert _connexion(client, "personne@tests.eslie", "motdepasse").status_code == 401


def test_connexion_compte_desactive(client, db, membre):
    db.query(User).filter(User.id == membre.id).update({"is_active": False})
    db.commit()
    assert _connexion(client, membre.email, membre.mot_de_passe).status_code == 401


def test_connexion_sans_champs(client):
    assert client.post(f"{CHEMIN}/login", data={}).status_code == 422


def test_connexion_en_json_est_refusee(client, admin):
    """Contrat explicite : c'est un formulaire, pas du JSON."""
    reponse = client.post(
        f"{CHEMIN}/login",
        json={"username": admin.email, "password": admin.mot_de_passe},
    )
    assert reponse.status_code == 422


# --- Inscription -----------------------------------------------------------


def test_inscription_cree_un_membre(client):
    reponse = client.post(
        f"{CHEMIN}/register",
        json={
            "email": "nouveau@tests.eslie",
            "password": "motdepasse",
            "full_name": "Nouveau Membre",
        },
    )
    assert reponse.status_code == 201
    corps = reponse.json()
    assert corps["role"] == "member"
    assert corps["is_active"] is True


def test_inscription_ne_renvoie_jamais_le_hash(client):
    reponse = client.post(
        f"{CHEMIN}/register",
        json={
            "email": "discret@tests.eslie",
            "password": "motdepasse",
            "full_name": "Discret",
        },
    )
    assert "password_hash" not in reponse.json()
    assert "password" not in reponse.json()


def test_inscription_attribue_un_qr_code(client, db):
    """La colonne `users.qr_code` est unique : elle doit etre remplie a la creation."""
    reponse = client.post(
        f"{CHEMIN}/register",
        json={
            "email": "porteur@tests.eslie",
            "password": "motdepasse",
            "full_name": "Porteur de QR",
        },
    )
    utilisateur = db.query(User).filter(User.id == reponse.json()["id"]).first()
    assert utilisateur.qr_code


def test_inscription_email_deja_pris(client, admin):
    reponse = client.post(
        f"{CHEMIN}/register",
        json={"email": admin.email, "password": "motdepasse", "full_name": "Doublon"},
    )
    assert reponse.status_code == 400


def test_inscription_email_invalide(client):
    reponse = client.post(
        f"{CHEMIN}/register",
        json={"email": "pas-un-email", "password": "motdepasse", "full_name": "Bancal"},
    )
    assert reponse.status_code == 422


def test_inscription_champs_manquants(client):
    assert client.post(f"{CHEMIN}/register", json={"email": "x@tests.eslie"}).status_code == 422


# --- Renouvellement --------------------------------------------------------


def test_renouvellement_rend_un_jeton_neuf(client, admin):
    jeton = create_refresh_token({"sub": admin.id})
    reponse = client.post(f"{CHEMIN}/refresh", params={"refresh_token": jeton})
    assert reponse.status_code == 200
    assert reponse.json()["access_token"]


def test_un_jeton_d_acces_ne_vaut_pas_jeton_de_renouvellement(client, admin):
    """Le champ `type` de la charge separe les deux usages."""
    jeton = create_access_token({"sub": admin.id, "role": "admin"})
    reponse = client.post(f"{CHEMIN}/refresh", params={"refresh_token": jeton})
    assert reponse.status_code == 401


def test_renouvellement_jeton_illisible(client):
    reponse = client.post(f"{CHEMIN}/refresh", params={"refresh_token": "nimportequoi"})
    assert reponse.status_code == 401


def test_renouvellement_sans_parametre(client):
    assert client.post(f"{CHEMIN}/refresh").status_code == 422


def test_renouvellement_utilisateur_inconnu(client):
    from tests.conftest import UUID_ABSENT

    jeton = create_refresh_token({"sub": UUID_ABSENT})
    assert client.post(f"{CHEMIN}/refresh", params={"refresh_token": jeton}).status_code == 401


# --- Profil et portee des jetons ------------------------------------------


def test_profil_avec_jeton_valide(client, admin):
    reponse = client.get(f"{CHEMIN}/profile", headers=admin.entetes)
    assert reponse.status_code == 200
    assert reponse.json()["email"] == admin.email


def test_profil_sans_entete_authorization(client):
    """403 et non 401 : c'est `HTTPBearer` qui refuse avant notre code."""
    assert client.get(f"{CHEMIN}/profile").status_code == 403


def test_profil_jeton_illisible(client):
    reponse = client.get(f"{CHEMIN}/profile", headers={"Authorization": "Bearer nimportequoi"})
    assert reponse.status_code == 401


def test_profil_jeton_signe_avec_une_autre_cle(client, admin):
    jeton = jwt.encode(
        {"sub": admin.id, "role": "admin", "type": "access"},
        "une-autre-cle-secrete",
        algorithm=settings.ALGORITHM,
    )
    reponse = client.get(f"{CHEMIN}/profile", headers={"Authorization": f"Bearer {jeton}"})
    assert reponse.status_code == 401


def test_profil_jeton_expire(client, admin):
    jeton = jwt.encode(
        {
            "sub": admin.id,
            "role": "admin",
            "type": "access",
            "exp": datetime.now(timezone.utc) - timedelta(minutes=1),
        },
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    reponse = client.get(f"{CHEMIN}/profile", headers={"Authorization": f"Bearer {jeton}"})
    assert reponse.status_code == 401


def test_profil_utilisateur_absent_de_la_base(client):
    from tests.conftest import UUID_ABSENT

    jeton = create_access_token({"sub": UUID_ABSENT, "role": "admin"})
    reponse = client.get(f"{CHEMIN}/profile", headers={"Authorization": f"Bearer {jeton}"})
    assert reponse.status_code == 401


def test_profil_compte_desactive(client, db, membre):
    db.query(User).filter(User.id == membre.id).update({"is_active": False})
    db.commit()
    assert client.get(f"{CHEMIN}/profile", headers=membre.entetes).status_code == 401


def test_un_membre_n_atteint_pas_une_route_admin(client, membre):
    """Le role est verifie apres l'authentification : 403, pas 401."""
    assert client.get("/api/v1/stats/", headers=membre.entetes).status_code == 403

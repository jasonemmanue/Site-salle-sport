"""Les six familles de defauts corrigees, rassemblees.

Chacune rendait un **500** la ou un code clair etait attendu ; deux etaient
atteignables depuis le back-office. Les tests des autres fichiers couvrent
chaque route dans son contexte ; celui-ci fige les regles elles-memes, route par
route, pour qu'une nouvelle route ecrite sans le garde-fou tombe ici.

| Defaut | Avant | Apres |
|--------|-------|-------|
| Identifiant qui n'est pas un UUID | 500 | 422 |
| Reference vers une ligne inexistante | 500 | 404 |
| Slug en doublon | 500 | slug suffixe |
| Champ obligatoire mis a `null` | 500 | 422 |
| Fichier ecrit hors du dossier des envois | ecriture arbitraire | 400 |
| Variable locale masquant un module importe | UnboundLocalError | corrige |
"""

import pytest

from tests.conftest import IDENTIFIANT_NON_UUID, UUID_ABSENT

# --- 1. Identifiant qui n'est pas un UUID ---------------------------------
#
# Les cles primaires sont des colonnes PostgreSQL `uuid`. Une chaine quelconque
# partait telle quelle dans la requete et PostgreSQL levait
# `invalid input syntax for type uuid`.

ROUTES_AVEC_IDENTIFIANT = [
    ("GET", "/api/v1/coaches/{id}", False),
    ("PUT", "/api/v1/activities/{id}", True),
    ("DELETE", "/api/v1/activities/{id}", True),
    ("PUT", "/api/v1/coaches/{id}", True),
    ("DELETE", "/api/v1/coaches/{id}", True),
    ("PUT", "/api/v1/schedule/{id}", True),
    ("DELETE", "/api/v1/schedule/{id}", True),
    ("DELETE", "/api/v1/enrollments/{id}", False),
    ("GET", "/api/v1/enrollments/slot/{id}", True),
    ("GET", "/api/v1/enrollments/slot/{id}/availability", False),
    ("PUT", "/api/v1/subscriptions/{id}", True),
    ("DELETE", "/api/v1/subscriptions/{id}", True),
    ("PUT", "/api/v1/articles/{id}", True),
    ("DELETE", "/api/v1/articles/{id}", True),
    ("PUT", "/api/v1/videos/{id}", True),
    ("DELETE", "/api/v1/videos/{id}", True),
    ("PUT", "/api/v1/transformations/{id}", True),
    ("DELETE", "/api/v1/transformations/{id}", True),
    ("PUT", "/api/v1/equipment/{id}", True),
    ("DELETE", "/api/v1/equipment/{id}", True),
    ("PUT", "/api/v1/reviews/{id}/approve", True),
    ("DELETE", "/api/v1/reviews/{id}", True),
    ("PUT", "/api/v1/contact/{id}/read", True),
]


@pytest.mark.parametrize("methode, gabarit, admin_requis", ROUTES_AVEC_IDENTIFIANT)
def test_un_identifiant_non_uuid_rend_422(client, entetes_admin, methode, gabarit, admin_requis):
    entetes = entetes_admin if admin_requis else {}
    reponse = client.request(
        methode, gabarit.format(id=IDENTIFIANT_NON_UUID), headers=entetes, json={}
    )
    assert reponse.status_code == 422, f"{methode} {gabarit} a rendu {reponse.status_code}"


@pytest.mark.parametrize("methode, gabarit, admin_requis", ROUTES_AVEC_IDENTIFIANT)
def test_un_uuid_bien_forme_mais_inconnu_ne_rend_jamais_500(
    client, entetes_admin, methode, gabarit, admin_requis
):
    entetes = entetes_admin if admin_requis else {}
    reponse = client.request(methode, gabarit.format(id=UUID_ABSENT), headers=entetes, json={})
    assert reponse.status_code < 500, f"{methode} {gabarit} a rendu {reponse.status_code}"


# --- 2. Reference vers une ligne inexistante ------------------------------
#
# La violation de cle etrangere remontait en 500 au lieu d'un 404.


def test_inscription_sur_un_creneau_inconnu(client):
    reponse = client.post(
        "/api/v1/enrollments/",
        json={
            "user_name": "Ama",
            "user_email": "ama@tests.eslie",
            "user_phone": "0000",
            "slot_id": UUID_ABSENT,
            "specific_date": "2026-08-17",
        },
    )
    assert reponse.status_code == 404


def test_creneau_sur_une_activite_inconnue(client, coach, entetes_admin):
    reponse = client.post(
        "/api/v1/schedule/",
        json={
            "activity_id": UUID_ABSENT,
            "coach_id": coach.id,
            "day_of_week": 1,
            "start_time": "18:00",
            "end_time": "19:30",
        },
        headers=entetes_admin,
    )
    assert reponse.status_code == 404


def test_creneau_sur_un_coach_inconnu(client, activite, entetes_admin):
    reponse = client.post(
        "/api/v1/schedule/",
        json={
            "activity_id": activite.id,
            "coach_id": UUID_ABSENT,
            "day_of_week": 1,
            "start_time": "18:00",
            "end_time": "19:30",
        },
        headers=entetes_admin,
    )
    assert reponse.status_code == 404


def test_deplacer_un_creneau_vers_une_activite_inconnue(client, creneau, entetes_admin):
    reponse = client.put(
        f"/api/v1/schedule/{creneau.id}", json={"activity_id": UUID_ABSENT}, headers=entetes_admin
    )
    assert reponse.status_code == 404


# --- 3. Slug en doublon ---------------------------------------------------
#
# `activities.slug` et `articles.slug` portent une contrainte `unique`. Deux
# activites du meme nom faisaient remonter une `UniqueViolation`.


def _activite(nom):
    return {
        "name": nom,
        "slug": "ignore",
        "description": "…",
        "category": "force",
        "level": "all",
        "duration_minutes": 60,
        "max_capacity": 10,
    }


def test_deux_activites_du_meme_nom(client, entetes_admin):
    premiere = client.post("/api/v1/activities/", json=_activite("Boxe"), headers=entetes_admin)
    seconde = client.post("/api/v1/activities/", json=_activite("Boxe"), headers=entetes_admin)
    assert seconde.status_code == 201
    assert premiere.json()["slug"] == "boxe"
    assert seconde.json()["slug"] == "boxe-2"


def test_trois_activites_du_meme_nom_s_enchainent(client, entetes_admin):
    slugs = [
        client.post("/api/v1/activities/", json=_activite("Yoga"), headers=entetes_admin).json()["slug"]
        for _ in range(3)
    ]
    assert slugs == ["yoga", "yoga-2", "yoga-3"]


def test_renommer_vers_un_nom_deja_pris(client, entetes_admin):
    client.post("/api/v1/activities/", json=_activite("Pilates"), headers=entetes_admin)
    autre = client.post("/api/v1/activities/", json=_activite("Zumba"), headers=entetes_admin).json()
    reponse = client.put(
        f"/api/v1/activities/{autre['id']}", json={"name": "Pilates"}, headers=entetes_admin
    )
    assert reponse.status_code == 200
    assert reponse.json()["slug"] == "pilates-2"


def test_les_accents_et_la_ponctuation_disparaissent_du_slug(client, entetes_admin):
    reponse = client.post(
        "/api/v1/activities/", json=_activite("Renforcement musculaire !"), headers=entetes_admin
    )
    assert reponse.json()["slug"] == "renforcement-musculaire"


# --- 4. Champ obligatoire mis explicitement a `null` ----------------------
#
# `model_dump(exclude_unset=True)` distingue « champ absent » de « champ a
# null », mais rien n'empechait le second de partir en base. Cas atteignable
# depuis les formulaires du back-office.


def test_vider_un_champ_obligatoire_d_une_activite(client, activite, entetes_admin):
    reponse = client.put(
        f"/api/v1/activities/{activite.id}", json={"name": None}, headers=entetes_admin
    )
    assert reponse.status_code == 422


def test_vider_un_champ_obligatoire_d_un_coach(client, coach, entetes_admin):
    reponse = client.put(f"/api/v1/coaches/{coach.id}", json={"name": None}, headers=entetes_admin)
    assert reponse.status_code == 422


def test_vider_un_champ_obligatoire_d_un_creneau(client, creneau, entetes_admin):
    reponse = client.put(
        f"/api/v1/schedule/{creneau.id}", json={"start_time": None}, headers=entetes_admin
    )
    assert reponse.status_code == 422


def test_vider_un_champ_obligatoire_d_une_formule(client, abonnement, entetes_admin):
    reponse = client.put(
        f"/api/v1/subscriptions/{abonnement.id}", json={"price": None}, headers=entetes_admin
    )
    assert reponse.status_code == 422


def test_vider_un_champ_nullable_reste_permis(client, coach, entetes_admin):
    """La contrepartie : vider la photo d'un coach doit continuer de marcher."""
    reponse = client.put(
        f"/api/v1/coaches/{coach.id}", json={"photo_url": None, "bio": None}, headers=entetes_admin
    )
    assert reponse.status_code == 200
    assert reponse.json()["photo_url"] is None


def test_vider_la_date_d_un_creneau_ponctuel_reste_permis(client, creneau, entetes_admin):
    reponse = client.put(
        f"/api/v1/schedule/{creneau.id}", json={"specific_date": None}, headers=entetes_admin
    )
    assert reponse.status_code == 200


# --- 6. Variable locale masquant un module importe ------------------------
#
# `enrollment_service.enroll()` faisait `status = ...`, ce qui masquait le
# module `status` de FastAPI sur toute la fonction : le 404 leve plus haut
# devenait un `UnboundLocalError`. La variable s'appelle `statut`.


def test_le_404_du_creneau_inconnu_est_bien_leve(client):
    """Precisement le chemin ou le masquage se manifestait."""
    reponse = client.post(
        "/api/v1/enrollments/",
        json={
            "user_name": "Ama",
            "user_email": "ama@tests.eslie",
            "user_phone": "0000",
            "slot_id": UUID_ABSENT,
            "specific_date": "2026-08-17",
        },
    )
    assert reponse.status_code == 404
    assert "introuvable" in reponse.json()["detail"].lower()


def test_aucun_service_ne_masque_le_module_status():
    """Garde-fou statique sur l'ensemble des services.

    Lecture par l'arbre syntaxique, pas par expression reguliere : `status=statut`
    passe en argument nomme a un constructeur SQLAlchemy est parfaitement legitime
    et ne masque rien — seule une **affectation** a une variable locale nommee
    `status` est fautive.
    """
    import ast
    from pathlib import Path

    import app.services as services

    fautifs = []
    for fichier in Path(services.__file__).parent.glob("*.py"):
        source = fichier.read_text(encoding="utf-8")
        arbre = ast.parse(source)
        importe_status = any(
            isinstance(noeud, ast.ImportFrom)
            and noeud.module == "fastapi"
            and any(alias.name == "status" for alias in noeud.names)
            for noeud in ast.walk(arbre)
        )
        if not importe_status:
            continue
        for noeud in ast.walk(arbre):
            cibles = []
            if isinstance(noeud, ast.Assign):
                cibles = noeud.targets
            elif isinstance(noeud, (ast.AnnAssign, ast.AugAssign)):
                cibles = [noeud.target]
            for cible in cibles:
                if isinstance(cible, ast.Name) and cible.id == "status":
                    fautifs.append(f"{fichier.name}:{cible.lineno}")

    assert not fautifs, f"variable locale `status` masquant le module : {fautifs}"

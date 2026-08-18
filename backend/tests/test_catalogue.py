"""Formules d'abonnement, videos, transformations, equipements.

Quatre catalogues au comportement voisin, reunis ici. Le point commun a
verifier : **ce qui n'est pas publie ou pas actif ne sort jamais de la liste
publique**, et l'ecriture reste fermee a tout ce qui n'est pas administrateur.
"""

import pytest

from tests.conftest import IDENTIFIANT_NON_UUID, UUID_ABSENT

ABONNEMENTS = "/api/v1/subscriptions"
VIDEOS = "/api/v1/videos"
TRANSFORMATIONS = "/api/v1/transformations"
EQUIPEMENTS = "/api/v1/equipment"


# --- Fermeture des ecritures, sur les quatre catalogues --------------------


@pytest.mark.parametrize(
    "chemin, charge",
    [
        (ABONNEMENTS, {"name": "Formule", "price": 30000, "duration_months": 1}),
        (VIDEOS, {"title": "Seance", "video_url": "https://x.test/v", "category": "cardio"}),
        (TRANSFORMATIONS, {"member_name": "Ama"}),
        (EQUIPEMENTS, {"name": "Tapis", "zone": "cardio"}),
    ],
)
def test_creation_sans_authentification(client, chemin, charge):
    assert client.post(f"{chemin}/", json=charge).status_code == 403


@pytest.mark.parametrize(
    "chemin, charge",
    [
        (ABONNEMENTS, {"name": "Formule", "price": 30000, "duration_months": 1}),
        (VIDEOS, {"title": "Seance", "video_url": "https://x.test/v", "category": "cardio"}),
        (TRANSFORMATIONS, {"member_name": "Ama"}),
        (EQUIPEMENTS, {"name": "Tapis", "zone": "cardio"}),
    ],
)
def test_creation_par_un_membre(client, membre, chemin, charge):
    assert client.post(f"{chemin}/", json=charge, headers=membre.entetes).status_code == 403


@pytest.mark.parametrize("chemin", [ABONNEMENTS, VIDEOS, TRANSFORMATIONS, EQUIPEMENTS])
def test_modification_identifiant_non_uuid(client, entetes_admin, chemin):
    reponse = client.put(f"{chemin}/{IDENTIFIANT_NON_UUID}", json={}, headers=entetes_admin)
    assert reponse.status_code == 422


@pytest.mark.parametrize("chemin", [ABONNEMENTS, VIDEOS, TRANSFORMATIONS, EQUIPEMENTS])
def test_suppression_identifiant_absent(client, entetes_admin, chemin):
    assert client.delete(f"{chemin}/{UUID_ABSENT}", headers=entetes_admin).status_code == 404


# --- Formules d'abonnement -------------------------------------------------


def test_liste_publique_des_formules(client, abonnement):
    reponse = client.get(f"{ABONNEMENTS}/")
    assert reponse.status_code == 200
    assert reponse.json()[0]["price"] == 30000.0


def test_les_formules_sont_triees_par_ordre(client, entetes_admin):
    for nom, ordre in (("Seconde", 2), ("Premiere", 1)):
        client.post(
            f"{ABONNEMENTS}/",
            json={"name": nom, "price": 5000, "duration_months": 1, "order": ordre},
            headers=entetes_admin,
        )
    assert [f["name"] for f in client.get(f"{ABONNEMENTS}/").json()] == ["Premiere", "Seconde"]


def test_creation_d_une_formule(client, entetes_admin):
    reponse = client.post(
        f"{ABONNEMENTS}/",
        json={
            "name": "Kung-Fu Wushu mensuel",
            "price": 10000,
            "duration_months": 1,
            "features": ["Deux seances par semaine"],
        },
        headers=entetes_admin,
    )
    assert reponse.status_code == 201
    assert reponse.json()["features"] == ["Deux seances par semaine"]


def test_formule_sans_prix(client, entetes_admin):
    reponse = client.post(
        f"{ABONNEMENTS}/", json={"name": "Sans prix", "duration_months": 1}, headers=entetes_admin
    )
    assert reponse.status_code == 422


def test_suppression_d_une_formule_est_douce(client, db, abonnement, entetes_admin):
    from app.models.models import Subscription

    client.delete(f"{ABONNEMENTS}/{abonnement.id}", headers=entetes_admin)
    assert client.get(f"{ABONNEMENTS}/").json() == []
    assert db.query(Subscription).filter(Subscription.id == abonnement.id).first().is_active is False


# --- Videos ----------------------------------------------------------------


def _creer_video(client, entetes_admin, **surcharges):
    corps = {
        "title": "Seance abdos",
        "video_url": "https://videos.test/abdos",
        "category": "entrainement",
        "is_published": True,
    }
    corps.update(surcharges)
    return client.post(f"{VIDEOS}/", json=corps, headers=entetes_admin)


def test_liste_publique_des_videos(client, entetes_admin):
    _creer_video(client, entetes_admin)
    assert len(client.get(f"{VIDEOS}/").json()) == 1


def test_une_video_non_publiee_reste_invisible(client, entetes_admin):
    _creer_video(client, entetes_admin, is_published=False)
    assert client.get(f"{VIDEOS}/").json() == []


def test_filtre_par_categorie_de_video(client, entetes_admin):
    _creer_video(client, entetes_admin, category="cardio")
    assert len(client.get(f"{VIDEOS}/", params={"category": "cardio"}).json()) == 1
    assert client.get(f"{VIDEOS}/", params={"category": "yoga"}).json() == []


def test_video_sans_url(client, entetes_admin):
    reponse = client.post(
        f"{VIDEOS}/", json={"title": "Sans url", "category": "cardio"}, headers=entetes_admin
    )
    assert reponse.status_code == 422


def test_suppression_d_une_video_est_definitive(client, db, entetes_admin):
    from app.models.models import Video

    identifiant = _creer_video(client, entetes_admin).json()["id"]
    client.delete(f"{VIDEOS}/{identifiant}", headers=entetes_admin)
    assert db.query(Video).filter(Video.id == identifiant).first() is None


# --- Transformations -------------------------------------------------------


def _creer_transformation(client, entetes_admin, **surcharges):
    corps = {
        "member_name": "Ama Kouassi",
        "before_image_url": "/uploads/images/avant.jpg",
        "after_image_url": "/uploads/images/apres.jpg",
        "is_published": True,
    }
    corps.update(surcharges)
    return client.post(f"{TRANSFORMATIONS}/", json=corps, headers=entetes_admin)


def test_liste_publique_des_transformations(client, entetes_admin):
    _creer_transformation(client, entetes_admin)
    assert len(client.get(f"{TRANSFORMATIONS}/").json()) == 1


def test_une_transformation_non_publiee_reste_invisible(client, entetes_admin):
    _creer_transformation(client, entetes_admin, is_published=False)
    assert client.get(f"{TRANSFORMATIONS}/").json() == []


def test_filtre_sur_les_mises_en_avant(client, entetes_admin):
    _creer_transformation(client, entetes_admin, member_name="Ordinaire", is_featured=False)
    _creer_transformation(client, entetes_admin, member_name="Vedette", is_featured=True)
    mis_en_avant = client.get(f"{TRANSFORMATIONS}/", params={"featured_only": True}).json()
    assert [element["member_name"] for element in mis_en_avant] == ["Vedette"]


# --- Equipements -----------------------------------------------------------


def _creer_equipement(client, entetes_admin, **surcharges):
    corps = {"name": "Tapis de course", "zone": "cardio", "quantity": 4}
    corps.update(surcharges)
    return client.post(f"{EQUIPEMENTS}/", json=corps, headers=entetes_admin)


def test_liste_publique_des_equipements(client, entetes_admin):
    _creer_equipement(client, entetes_admin)
    assert len(client.get(f"{EQUIPEMENTS}/").json()) == 1


def test_filtre_par_zone(client, entetes_admin):
    _creer_equipement(client, entetes_admin, zone="musculation", name="Banc")
    assert len(client.get(f"{EQUIPEMENTS}/", params={"zone": "musculation"}).json()) == 1
    assert client.get(f"{EQUIPEMENTS}/", params={"zone": "stretching"}).json() == []


def test_equipement_sans_zone(client, entetes_admin):
    reponse = client.post(f"{EQUIPEMENTS}/", json={"name": "Orphelin"}, headers=entetes_admin)
    assert reponse.status_code == 422


def test_suppression_d_un_equipement_est_douce(client, db, entetes_admin):
    from app.models.models import Equipment

    identifiant = _creer_equipement(client, entetes_admin).json()["id"]
    client.delete(f"{EQUIPEMENTS}/{identifiant}", headers=entetes_admin)
    assert client.get(f"{EQUIPEMENTS}/").json() == []
    assert db.query(Equipment).filter(Equipment.id == identifiant).first().is_active is False

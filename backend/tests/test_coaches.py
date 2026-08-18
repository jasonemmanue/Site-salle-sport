"""Coachs.

`certifications` et `specialties` sont des colonnes JSON : elles doivent faire
l'aller-retour sans se transformer en chaine.
"""

from tests.conftest import IDENTIFIANT_NON_UUID, UUID_ABSENT

CHEMIN = "/api/v1/coaches"


def _charge(**surcharges):
    corps = {
        "name": "Leo",
        "certifications": ["BPJEPS", "Secourisme"],
        "specialties": ["Seances collectives"],
        "bio": "Seances collectives du lundi, mercredi et vendredi.",
    }
    corps.update(surcharges)
    return corps


def test_liste_publique(client, coach):
    reponse = client.get(f"{CHEMIN}/")
    assert reponse.status_code == 200
    assert [element["name"] for element in reponse.json()] == ["Toussaint"]


def test_liste_triee_par_ordre(client, entetes_admin):
    client.post(f"{CHEMIN}/", json=_charge(name="Second", order=2), headers=entetes_admin)
    client.post(f"{CHEMIN}/", json=_charge(name="Premier", order=1), headers=entetes_admin)
    assert [element["name"] for element in client.get(f"{CHEMIN}/").json()] == [
        "Premier",
        "Second",
    ]


def test_detail_par_identifiant(client, coach):
    reponse = client.get(f"{CHEMIN}/{coach.id}")
    assert reponse.status_code == 200
    assert reponse.json()["certifications"] == ["BPJEPS"]


def test_detail_identifiant_absent(client):
    assert client.get(f"{CHEMIN}/{UUID_ABSENT}").status_code == 404


def test_detail_identifiant_non_uuid(client):
    assert client.get(f"{CHEMIN}/{IDENTIFIANT_NON_UUID}").status_code == 422


def test_creation_conserve_les_listes_json(client, entetes_admin):
    reponse = client.post(f"{CHEMIN}/", json=_charge(), headers=entetes_admin)
    assert reponse.status_code == 201
    assert reponse.json()["certifications"] == ["BPJEPS", "Secourisme"]
    assert reponse.json()["specialties"] == ["Seances collectives"]


def test_creation_sans_authentification(client):
    assert client.post(f"{CHEMIN}/", json=_charge()).status_code == 403


def test_creation_par_un_membre(client, membre):
    assert client.post(f"{CHEMIN}/", json=_charge(), headers=membre.entetes).status_code == 403


def test_creation_sans_nom(client, entetes_admin):
    assert client.post(f"{CHEMIN}/", json={"bio": "Sans nom"}, headers=entetes_admin).status_code == 422


def test_modification(client, coach, entetes_admin):
    reponse = client.put(
        f"{CHEMIN}/{coach.id}", json={"specialties": ["Kung-Fu Wushu"]}, headers=entetes_admin
    )
    assert reponse.status_code == 200
    assert reponse.json()["specialties"] == ["Kung-Fu Wushu"]


def test_vider_la_photo_reste_permis(client, coach, entetes_admin):
    """`photo_url` est nullable : un `null` explicite doit passer."""
    reponse = client.put(f"{CHEMIN}/{coach.id}", json={"photo_url": None}, headers=entetes_admin)
    assert reponse.status_code == 200
    assert reponse.json()["photo_url"] is None


def test_modification_identifiant_absent(client, entetes_admin):
    assert client.put(f"{CHEMIN}/{UUID_ABSENT}", json={"order": 1}, headers=entetes_admin).status_code == 404


def test_suppression_est_douce(client, db, coach, entetes_admin):
    from app.models.models import Coach

    assert client.delete(f"{CHEMIN}/{coach.id}", headers=entetes_admin).status_code == 200
    assert client.get(f"{CHEMIN}/").json() == []
    assert db.query(Coach).filter(Coach.id == coach.id).first().is_active is False


def test_le_detail_reste_accessible_apres_suppression(client, coach, entetes_admin):
    """`get_coach_by_id` ne filtre pas `is_active` : le lien direct survit.

    Sans quoi une page de planning affichant un ancien coach casserait.
    """
    client.delete(f"{CHEMIN}/{coach.id}", headers=entetes_admin)
    assert client.get(f"{CHEMIN}/{coach.id}").status_code == 200


def test_suppression_identifiant_absent(client, entetes_admin):
    assert client.delete(f"{CHEMIN}/{UUID_ABSENT}", headers=entetes_admin).status_code == 404


def test_suppression_sans_authentification(client, coach):
    assert client.delete(f"{CHEMIN}/{coach.id}").status_code == 403

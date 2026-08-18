"""Catalogue des activites.

Deux comportements qui surprennent a la lecture et que le site public exploite :
le `slug` envoye au POST est **ignore** — il est toujours derive du `name` —, et
la suppression est **douce** : la ligne reste en base avec `is_active` a faux,
donc elle disparait de la liste et son detail rend 404.
"""

from tests.conftest import IDENTIFIANT_NON_UUID, UUID_ABSENT

CHEMIN = "/api/v1/activities"


def _charge(**surcharges):
    corps = {
        "name": "Cardio Training",
        "slug": "ignore-par-le-service",
        "description": "Endurance et depense calorique.",
        "category": "cardio",
        "level": "beginner",
        "duration_minutes": 45,
        "max_capacity": 20,
    }
    corps.update(surcharges)
    return corps


# --- Lecture publique ------------------------------------------------------


def test_liste_publique_sans_authentification(client, activite):
    reponse = client.get(f"{CHEMIN}/")
    assert reponse.status_code == 200
    corps = reponse.json()
    assert corps["total"] == 1
    assert corps["page"] == 1
    assert corps["pages"] == 1
    assert corps["items"][0]["slug"] == "musculation"


def test_liste_vide_rend_zero_page(client):
    corps = client.get(f"{CHEMIN}/").json()
    assert corps == {"items": [], "total": 0, "page": 1, "pages": 0}


def test_filtre_par_categorie(client, activite):
    assert client.get(f"{CHEMIN}/", params={"category": "force"}).json()["total"] == 1
    assert client.get(f"{CHEMIN}/", params={"category": "cardio"}).json()["total"] == 0


def test_filtre_par_niveau(client, activite):
    assert client.get(f"{CHEMIN}/", params={"level": "all"}).json()["total"] == 1
    assert client.get(f"{CHEMIN}/", params={"level": "advanced"}).json()["total"] == 0


def test_pagination(client, db, activite, entetes_admin):
    for numero in range(2, 6):
        client.post(f"{CHEMIN}/", json=_charge(name=f"Activite {numero}"), headers=entetes_admin)
    corps = client.get(f"{CHEMIN}/", params={"page": 2, "limit": 2}).json()
    assert corps["total"] == 5
    assert corps["pages"] == 3
    assert len(corps["items"]) == 2


def test_page_zero_refusee(client):
    assert client.get(f"{CHEMIN}/", params={"page": 0}).status_code == 422


def test_limite_au_dela_du_plafond_refusee(client):
    assert client.get(f"{CHEMIN}/", params={"limit": 101}).status_code == 422


def test_detail_par_slug(client, activite):
    reponse = client.get(f"{CHEMIN}/musculation")
    assert reponse.status_code == 200
    assert reponse.json()["name"] == "Musculation"


def test_detail_slug_inconnu(client):
    assert client.get(f"{CHEMIN}/slug-inexistant").status_code == 404


# --- Ecriture --------------------------------------------------------------


def test_creation_par_l_admin(client, entetes_admin):
    reponse = client.post(f"{CHEMIN}/", json=_charge(), headers=entetes_admin)
    assert reponse.status_code == 201
    assert reponse.json()["name"] == "Cardio Training"


def test_le_slug_envoye_est_ignore_au_profit_du_nom(client, entetes_admin):
    reponse = client.post(
        f"{CHEMIN}/", json=_charge(slug="slug-choisi-a-la-main"), headers=entetes_admin
    )
    assert reponse.json()["slug"] == "cardio-training"


def test_creation_sans_authentification(client):
    assert client.post(f"{CHEMIN}/", json=_charge()).status_code == 403


def test_creation_par_un_membre(client, membre):
    assert client.post(f"{CHEMIN}/", json=_charge(), headers=membre.entetes).status_code == 403


def test_creation_champs_manquants(client, entetes_admin):
    reponse = client.post(f"{CHEMIN}/", json={"name": "Incomplete"}, headers=entetes_admin)
    assert reponse.status_code == 422


def test_creation_type_invalide(client, entetes_admin):
    reponse = client.post(
        f"{CHEMIN}/", json=_charge(duration_minutes="quarante-cinq"), headers=entetes_admin
    )
    assert reponse.status_code == 422


def test_modification(client, activite, entetes_admin):
    reponse = client.put(
        f"{CHEMIN}/{activite.id}", json={"max_capacity": 30}, headers=entetes_admin
    )
    assert reponse.status_code == 200
    assert reponse.json()["max_capacity"] == 30


def test_modification_partielle_preserve_le_reste(client, activite, entetes_admin):
    reponse = client.put(f"{CHEMIN}/{activite.id}", json={"order": 9}, headers=entetes_admin)
    corps = reponse.json()
    assert corps["order"] == 9
    assert corps["description"] == "Renforcement general en salle."


def test_renommer_regenere_le_slug(client, activite, entetes_admin):
    reponse = client.put(
        f"{CHEMIN}/{activite.id}", json={"name": "Musculation avancee"}, headers=entetes_admin
    )
    assert reponse.json()["slug"] == "musculation-avancee"


def test_reenregistrer_sans_changer_le_nom_ne_suffixe_pas(client, activite, entetes_admin):
    """`exclude_id` doit ecarter la ligne en cours : sinon elle se suffixe elle-meme."""
    reponse = client.put(
        f"{CHEMIN}/{activite.id}", json={"name": "Musculation"}, headers=entetes_admin
    )
    assert reponse.json()["slug"] == "musculation"


def test_modification_identifiant_absent(client, entetes_admin):
    reponse = client.put(f"{CHEMIN}/{UUID_ABSENT}", json={"order": 1}, headers=entetes_admin)
    assert reponse.status_code == 404


def test_modification_sans_authentification(client, activite):
    assert client.put(f"{CHEMIN}/{activite.id}", json={"order": 1}).status_code == 403


def test_suppression_est_douce(client, db, activite, entetes_admin):
    from app.models.models import Activity

    assert client.delete(f"{CHEMIN}/{activite.id}", headers=entetes_admin).status_code == 200
    assert db.query(Activity).filter(Activity.id == activite.id).first() is not None
    assert client.get(f"{CHEMIN}/").json()["total"] == 0
    assert client.get(f"{CHEMIN}/musculation").status_code == 404


def test_suppression_identifiant_absent(client, entetes_admin):
    assert client.delete(f"{CHEMIN}/{UUID_ABSENT}", headers=entetes_admin).status_code == 404


def test_suppression_identifiant_non_uuid(client, entetes_admin):
    reponse = client.delete(f"{CHEMIN}/{IDENTIFIANT_NON_UUID}", headers=entetes_admin)
    assert reponse.status_code == 422


def test_suppression_sans_authentification(client, activite):
    assert client.delete(f"{CHEMIN}/{activite.id}").status_code == 403

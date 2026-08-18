"""Avis : depot public, moderation, publication.

Le contrat tient en une phrase : **un avis depose par un visiteur n'est visible
sur le site public qu'apres approbation d'un administrateur.** Trois routes le
realisent, et chacune peut le trahir seule —
`POST /reviews/` s'il oubliait `is_approved=False`,
`GET /reviews/` s'il cessait de filtrer,
`GET /reviews/all` s'il devenait public.
"""

from app.models.models import Review
from tests.conftest import IDENTIFIANT_NON_UUID, UUID_ABSENT

CHEMIN = "/api/v1/reviews"


def _deposer(client, auteur="Ama Kouassi", note=5, commentaire="Salle au top."):
    return client.post(
        f"{CHEMIN}/",
        json={"author_name": auteur, "rating": note, "comment": commentaire},
    )


# --- Depot public ----------------------------------------------------------


def test_depot_sans_authentification(client):
    reponse = _deposer(client)
    assert reponse.status_code == 201


def test_un_avis_neuf_n_est_jamais_approuve(client):
    """Le coeur de la moderation : rien ne se publie tout seul."""
    assert _deposer(client).json()["is_approved"] is False


def test_le_champ_is_approved_envoye_par_le_client_est_ignore(client):
    """`ReviewCreate` ne porte pas ce champ : impossible de s'auto-publier."""
    reponse = client.post(
        f"{CHEMIN}/",
        json={
            "author_name": "Malin",
            "rating": 5,
            "comment": "Je me publie moi-meme",
            "is_approved": True,
        },
    )
    assert reponse.status_code == 201
    assert reponse.json()["is_approved"] is False


def test_note_hors_bornes(client):
    assert _deposer(client, note=0).status_code == 422
    assert _deposer(client, note=6).status_code == 422


def test_note_manquante(client):
    reponse = client.post(f"{CHEMIN}/", json={"author_name": "Ama", "comment": "Bien"})
    assert reponse.status_code == 422


def test_commentaire_facultatif(client):
    reponse = client.post(f"{CHEMIN}/", json={"author_name": "Ama", "rating": 4})
    assert reponse.status_code == 201


# --- Ce que voit le site public -------------------------------------------


def test_la_liste_publique_ignore_les_avis_en_attente(client):
    _deposer(client, "Ama")
    assert client.get(f"{CHEMIN}/").json() == []


def test_l_avis_apparait_une_fois_approuve(client, entetes_admin):
    identifiant = _deposer(client, "Ama").json()["id"]
    assert client.get(f"{CHEMIN}/").json() == []

    approbation = client.put(f"{CHEMIN}/{identifiant}/approve", headers=entetes_admin)
    assert approbation.status_code == 200
    assert approbation.json()["is_approved"] is True

    publies = client.get(f"{CHEMIN}/").json()
    assert [element["author_name"] for element in publies] == ["Ama"]


def test_la_liste_publique_est_triee_du_plus_recent_au_plus_ancien(client, db, entetes_admin):
    for auteur in ("Premier", "Second", "Troisieme"):
        identifiant = _deposer(client, auteur).json()["id"]
        client.put(f"{CHEMIN}/{identifiant}/approve", headers=entetes_admin)
    auteurs = [element["author_name"] for element in client.get(f"{CHEMIN}/").json()]
    assert set(auteurs) == {"Premier", "Second", "Troisieme"}


# --- Ce que voit l'administrateur ------------------------------------------


def test_la_file_de_moderation_est_reservee_a_l_admin(client):
    assert client.get(f"{CHEMIN}/all").status_code == 403


def test_la_file_de_moderation_est_refusee_a_un_membre(client, membre):
    assert client.get(f"{CHEMIN}/all", headers=membre.entetes).status_code == 403


def test_la_file_de_moderation_montre_les_avis_en_attente(client, entetes_admin):
    _deposer(client, "Ama")
    _deposer(client, "Bakary")
    file_attente = client.get(f"{CHEMIN}/all", headers=entetes_admin).json()
    assert len(file_attente) == 2
    assert all(element["is_approved"] is False for element in file_attente)


def test_la_file_montre_aussi_les_avis_deja_publies(client, entetes_admin):
    identifiant = _deposer(client, "Ama").json()["id"]
    client.put(f"{CHEMIN}/{identifiant}/approve", headers=entetes_admin)
    _deposer(client, "Bakary")
    file_attente = client.get(f"{CHEMIN}/all", headers=entetes_admin).json()
    assert sorted(element["is_approved"] for element in file_attente) == [False, True]


# --- Approbation et suppression -------------------------------------------


def test_approbation_reservee_a_l_admin(client):
    identifiant = _deposer(client).json()["id"]
    assert client.put(f"{CHEMIN}/{identifiant}/approve").status_code == 403


def test_approbation_refusee_a_un_membre(client, membre):
    identifiant = _deposer(client).json()["id"]
    assert client.put(f"{CHEMIN}/{identifiant}/approve", headers=membre.entetes).status_code == 403


def test_approbation_identifiant_absent(client, entetes_admin):
    assert client.put(f"{CHEMIN}/{UUID_ABSENT}/approve", headers=entetes_admin).status_code == 404


def test_approbation_identifiant_non_uuid(client, entetes_admin):
    reponse = client.put(f"{CHEMIN}/{IDENTIFIANT_NON_UUID}/approve", headers=entetes_admin)
    assert reponse.status_code == 422


def test_approuver_deux_fois_reste_sans_effet(client, entetes_admin):
    identifiant = _deposer(client).json()["id"]
    client.put(f"{CHEMIN}/{identifiant}/approve", headers=entetes_admin)
    seconde = client.put(f"{CHEMIN}/{identifiant}/approve", headers=entetes_admin)
    assert seconde.status_code == 200
    assert len(client.get(f"{CHEMIN}/").json()) == 1


def test_suppression_est_definitive(client, db, entetes_admin):
    """Contrairement aux activites, l'avis refuse est retire de la base."""
    identifiant = _deposer(client).json()["id"]
    assert client.delete(f"{CHEMIN}/{identifiant}", headers=entetes_admin).status_code == 200
    assert db.query(Review).filter(Review.id == identifiant).first() is None


def test_suppression_reservee_a_l_admin(client):
    identifiant = _deposer(client).json()["id"]
    assert client.delete(f"{CHEMIN}/{identifiant}").status_code == 403


def test_suppression_identifiant_absent(client, entetes_admin):
    assert client.delete(f"{CHEMIN}/{UUID_ABSENT}", headers=entetes_admin).status_code == 404


def test_le_compteur_du_tableau_de_bord_suit_la_file(client, entetes_admin):
    """`pending_reviews` alimente la pastille de la barre laterale du back-office."""
    assert client.get("/api/v1/stats/", headers=entetes_admin).json()["pending_reviews"] == 0

    identifiant = _deposer(client).json()["id"]
    assert client.get("/api/v1/stats/", headers=entetes_admin).json()["pending_reviews"] == 1

    client.put(f"{CHEMIN}/{identifiant}/approve", headers=entetes_admin)
    assert client.get("/api/v1/stats/", headers=entetes_admin).json()["pending_reviews"] == 0

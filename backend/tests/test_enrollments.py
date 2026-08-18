"""Inscription aux cours collectifs.

Le coeur metier de la marketplace : capacite, liste d'attente, promotion
automatique a l'annulation. La capacite vient de l'activite, sauf si le creneau
porte un `max_capacity_override`. L'activite de la fixture plafonne a **2**.

Toutes les places se comptent **pour une date donnee** : deux inscriptions au
meme creneau a deux dates differentes ne se disputent pas la meme place.
"""

from datetime import date, timedelta

from tests.conftest import IDENTIFIANT_NON_UUID, UUID_ABSENT

CHEMIN = "/api/v1/enrollments"

LUNDI = date.today() - timedelta(days=date.today().weekday())
LUNDI_SUIVANT = LUNDI + timedelta(days=7)


def _inscrire(client, creneau, prenom="Ama", jour=LUNDI):
    return client.post(
        f"{CHEMIN}/",
        json={
            "user_name": f"{prenom} Kouassi",
            "user_email": f"{prenom.lower()}@tests.eslie",
            "user_phone": "+225 0545079850",
            "slot_id": creneau.id,
            "specific_date": jour.isoformat(),
        },
    )


def _places(client, creneau, jour=LUNDI):
    return client.get(
        f"{CHEMIN}/slot/{creneau.id}/availability", params={"specific_date": jour.isoformat()}
    ).json()


# --- Inscription -----------------------------------------------------------


def test_inscription_sans_compte(client, creneau):
    """Le site public inscrit au nom et a l'e-mail, sans authentification."""
    reponse = _inscrire(client, creneau)
    assert reponse.status_code == 201
    assert reponse.json()["status"] == "enrolled"


def test_inscription_creneau_inconnu(client, creneau):
    reponse = client.post(
        f"{CHEMIN}/",
        json={
            "user_name": "Ama",
            "user_email": "ama@tests.eslie",
            "user_phone": "0000",
            "slot_id": UUID_ABSENT,
            "specific_date": LUNDI.isoformat(),
        },
    )
    assert reponse.status_code == 404


def test_inscription_creneau_non_uuid(client):
    reponse = client.post(
        f"{CHEMIN}/",
        json={
            "user_name": "Ama",
            "user_email": "ama@tests.eslie",
            "user_phone": "0000",
            "slot_id": IDENTIFIANT_NON_UUID,
            "specific_date": LUNDI.isoformat(),
        },
    )
    assert reponse.status_code == 422


def test_inscription_email_invalide(client, creneau):
    reponse = client.post(
        f"{CHEMIN}/",
        json={
            "user_name": "Ama",
            "user_email": "pas-un-email",
            "user_phone": "0000",
            "slot_id": creneau.id,
            "specific_date": LUNDI.isoformat(),
        },
    )
    assert reponse.status_code == 422


def test_inscription_sans_date(client, creneau):
    reponse = client.post(
        f"{CHEMIN}/",
        json={
            "user_name": "Ama",
            "user_email": "ama@tests.eslie",
            "user_phone": "0000",
            "slot_id": creneau.id,
        },
    )
    assert reponse.status_code == 422


# --- Places et liste d'attente ---------------------------------------------


def test_places_avant_toute_inscription(client, creneau):
    assert _places(client, creneau) == {
        "enrolled_count": 0,
        "max_capacity": 2,
        "available": 2,
    }


def test_les_places_diminuent(client, creneau):
    _inscrire(client, creneau, "Ama")
    assert _places(client, creneau)["available"] == 1


def test_au_dela_de_la_capacite_on_passe_en_liste_d_attente(client, creneau):
    _inscrire(client, creneau, "Ama")
    _inscrire(client, creneau, "Bakary")
    troisieme = _inscrire(client, creneau, "Chantal")
    assert troisieme.json()["status"] == "waitlisted"


def test_la_liste_d_attente_ne_rend_pas_les_places_negatives(client, creneau):
    for prenom in ("Ama", "Bakary", "Chantal", "Djeneba"):
        _inscrire(client, creneau, prenom)
    assert _places(client, creneau)["available"] == 0


def test_la_capacite_du_creneau_prime_sur_celle_de_l_activite(client, creneau, entetes_admin):
    client.put(
        f"/api/v1/schedule/{creneau.id}", json={"max_capacity_override": 5}, headers=entetes_admin
    )
    assert _places(client, creneau)["max_capacity"] == 5


def test_les_dates_ne_se_disputent_pas_les_memes_places(client, creneau):
    _inscrire(client, creneau, "Ama", LUNDI)
    _inscrire(client, creneau, "Bakary", LUNDI)
    assert _places(client, creneau, LUNDI)["available"] == 0
    assert _places(client, creneau, LUNDI_SUIVANT)["available"] == 2


def test_places_d_un_creneau_inconnu(client):
    """Contrat assume : pas de 404, mais une capacite nulle.

    Le site public interroge cette route creneau par creneau pour afficher le
    badge « places restantes ». Un 404 y ferait remonter une erreur pour un
    creneau supprime entre-temps ; une capacite a zero se traduit simplement
    par « complet ».
    """
    reponse = client.get(f"{CHEMIN}/slot/{UUID_ABSENT}/availability")
    assert reponse.status_code == 200
    assert reponse.json() == {"enrolled_count": 0, "max_capacity": 0, "available": 0}


def test_places_identifiant_non_uuid(client):
    assert client.get(f"{CHEMIN}/slot/{IDENTIFIANT_NON_UUID}/availability").status_code == 422


def test_places_sans_date_ne_compte_personne(client, creneau):
    """Sans `specific_date`, la comparaison porte sur NULL : le compte est nul.

    Le site public passe toujours la date (`getSlotAvailability` dans
    `frontend/lib/api.ts`). Ce test fige le comportement pour qu'un futur
    appelant qui omettrait la date ne croie pas lire un total.
    """
    _inscrire(client, creneau, "Ama")
    assert client.get(f"{CHEMIN}/slot/{creneau.id}/availability").json()["enrolled_count"] == 0


# --- Annulation ------------------------------------------------------------


def test_annulation_libere_la_place(client, creneau):
    inscription = _inscrire(client, creneau, "Ama").json()
    assert client.delete(f"{CHEMIN}/{inscription['id']}").status_code == 200
    assert _places(client, creneau)["available"] == 2


def test_annulation_promeut_le_premier_de_la_liste_d_attente(client, db, creneau, entetes_admin):
    premiere = _inscrire(client, creneau, "Ama").json()
    _inscrire(client, creneau, "Bakary")
    en_attente = _inscrire(client, creneau, "Chantal").json()
    assert en_attente["status"] == "waitlisted"

    client.delete(f"{CHEMIN}/{premiere['id']}")

    from app.models.models import Enrollment

    db.expire_all()
    promue = db.query(Enrollment).filter(Enrollment.id == en_attente["id"]).first()
    assert promue.status == "enrolled"


def test_annulation_identifiant_absent(client):
    assert client.delete(f"{CHEMIN}/{UUID_ABSENT}").status_code == 404


def test_annulation_identifiant_non_uuid(client):
    assert client.delete(f"{CHEMIN}/{IDENTIFIANT_NON_UUID}").status_code == 422


# --- Liste des inscrits (back-office) --------------------------------------


def test_liste_des_inscrits_reservee_a_l_admin(client, creneau):
    assert client.get(f"{CHEMIN}/slot/{creneau.id}").status_code == 403


def test_liste_des_inscrits_refusee_a_un_membre(client, creneau, membre):
    assert client.get(f"{CHEMIN}/slot/{creneau.id}", headers=membre.entetes).status_code == 403


def test_liste_des_inscrits(client, creneau, entetes_admin):
    _inscrire(client, creneau, "Ama")
    _inscrire(client, creneau, "Bakary")
    reponse = client.get(f"{CHEMIN}/slot/{creneau.id}", headers=entetes_admin)
    assert reponse.status_code == 200
    assert len(reponse.json()) == 2


def test_les_annulations_disparaissent_de_la_liste(client, creneau, entetes_admin):
    inscription = _inscrire(client, creneau, "Ama").json()
    _inscrire(client, creneau, "Bakary")
    client.delete(f"{CHEMIN}/{inscription['id']}")
    reponse = client.get(f"{CHEMIN}/slot/{creneau.id}", headers=entetes_admin)
    assert [element["user_name"] for element in reponse.json()] == ["Bakary Kouassi"]


def test_liste_des_inscrits_filtree_par_date(client, creneau, entetes_admin):
    _inscrire(client, creneau, "Ama", LUNDI)
    _inscrire(client, creneau, "Bakary", LUNDI_SUIVANT)
    reponse = client.get(
        f"{CHEMIN}/slot/{creneau.id}",
        params={"specific_date": LUNDI.isoformat()},
        headers=entetes_admin,
    )
    assert len(reponse.json()) == 1

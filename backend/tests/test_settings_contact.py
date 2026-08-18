"""Parametres de la salle et messages de contact.

`GET /settings/public` sert le pied de page et la page Contact du site public.
Sa liste blanche, `PUBLIC_SETTING_KEYS`, est explicite : la table `settings`
etant un fourre-tout cle/valeur, **une nouvelle cle ne doit pas devenir publique
par simple effet de bord**. C'est ce que verifie le premier bloc.
"""

from app.services.settings_service import PUBLIC_SETTING_KEYS
from tests.conftest import IDENTIFIANT_NON_UUID, UUID_ABSENT

SETTINGS = "/api/v1/settings"
CONTACT = "/api/v1/contact"


def _ecrire_reglage(client, entetes_admin, cle, valeur):
    return client.put(f"{SETTINGS}/", json={"key": cle, "value": valeur}, headers=entetes_admin)


# --- Parametres ------------------------------------------------------------


def test_les_reglages_publics_sont_lisibles_sans_authentification(client, entetes_admin):
    _ecrire_reglage(client, entetes_admin, "gym_name", "Eslie Sport")
    reponse = client.get(f"{SETTINGS}/public")
    assert reponse.status_code == 200
    assert [element["key"] for element in reponse.json()] == ["gym_name"]


def test_une_cle_hors_liste_blanche_reste_privee(client, entetes_admin):
    _ecrire_reglage(client, entetes_admin, "smtp_password", "secret-a-ne-pas-diffuser")
    cles_publiques = [element["key"] for element in client.get(f"{SETTINGS}/public").json()]
    assert "smtp_password" not in cles_publiques


def test_la_liste_blanche_couvre_les_huit_cles_du_pied_de_page():
    assert set(PUBLIC_SETTING_KEYS) == {
        "gym_name",
        "phone",
        "email",
        "address",
        "opening_hours",
        "facebook_url",
        "instagram_url",
        "youtube_url",
    }


def test_la_liste_complete_est_reservee_a_l_admin(client):
    assert client.get(f"{SETTINGS}/").status_code == 403


def test_la_liste_complete_est_refusee_a_un_membre(client, membre):
    assert client.get(f"{SETTINGS}/", headers=membre.entetes).status_code == 403


def test_l_admin_voit_toutes_les_cles(client, entetes_admin):
    _ecrire_reglage(client, entetes_admin, "gym_name", "Eslie Sport")
    _ecrire_reglage(client, entetes_admin, "smtp_password", "secret")
    cles = [element["key"] for element in client.get(f"{SETTINGS}/", headers=entetes_admin).json()]
    assert set(cles) == {"gym_name", "smtp_password"}


def test_ecrire_une_cle_inconnue_la_cree(client, entetes_admin):
    reponse = _ecrire_reglage(client, entetes_admin, "phone", "+225 0545079850")
    assert reponse.status_code == 200
    assert reponse.json()["value"] == "+225 0545079850"


def test_reecrire_une_cle_la_met_a_jour_sans_doublon(client, entetes_admin):
    _ecrire_reglage(client, entetes_admin, "phone", "ancien")
    _ecrire_reglage(client, entetes_admin, "phone", "nouveau")
    reglages = client.get(f"{SETTINGS}/", headers=entetes_admin).json()
    assert len(reglages) == 1
    assert reglages[0]["value"] == "nouveau"


def test_ecriture_sans_authentification(client):
    reponse = client.put(f"{SETTINGS}/", json={"key": "gym_name", "value": "Pirate"})
    assert reponse.status_code == 403


def test_ecriture_sans_valeur(client, entetes_admin):
    reponse = client.put(f"{SETTINGS}/", json={"key": "gym_name"}, headers=entetes_admin)
    assert reponse.status_code == 422


def test_le_back_office_envoie_une_cle_a_la_fois(client, entetes_admin):
    """Un tableau complet renvoyait 422 et rien n'etait enregistre."""
    reponse = client.put(
        f"{SETTINGS}/",
        json=[{"key": "gym_name", "value": "Eslie"}, {"key": "phone", "value": "0000"}],
        headers=entetes_admin,
    )
    assert reponse.status_code == 422


# --- Contact ---------------------------------------------------------------


def _envoyer_message(client, **surcharges):
    corps = {
        "name": "Ama Kouassi",
        "email": "ama@tests.eslie",
        "phone": "+225 0545079850",
        "subject": "Horaires du samedi",
        "message": "Bonjour, a quelle heure ouvrez-vous le samedi ?",
    }
    corps.update(surcharges)
    return client.post(f"{CONTACT}/", json=corps)


def test_envoi_d_un_message_sans_compte(client):
    reponse = _envoyer_message(client)
    assert reponse.status_code == 201
    assert reponse.json()["is_read"] is False


def test_le_telephone_est_facultatif(client):
    reponse = client.post(
        f"{CONTACT}/",
        json={
            "name": "Ama",
            "email": "ama@tests.eslie",
            "subject": "Question",
            "message": "Bonjour",
        },
    )
    assert reponse.status_code == 201


def test_email_invalide(client):
    assert _envoyer_message(client, email="pas-un-email").status_code == 422


def test_message_manquant(client):
    reponse = client.post(
        f"{CONTACT}/", json={"name": "Ama", "email": "ama@tests.eslie", "subject": "Vide"}
    )
    assert reponse.status_code == 422


def test_la_boite_de_reception_est_reservee_a_l_admin(client):
    assert client.get(f"{CONTACT}/").status_code == 403


def test_la_boite_de_reception_est_refusee_a_un_membre(client, membre):
    assert client.get(f"{CONTACT}/", headers=membre.entetes).status_code == 403


def test_l_admin_lit_les_messages(client, entetes_admin):
    _envoyer_message(client)
    reponse = client.get(f"{CONTACT}/", headers=entetes_admin)
    assert reponse.status_code == 200
    assert len(reponse.json()) == 1


def test_marquer_comme_lu(client, entetes_admin):
    identifiant = _envoyer_message(client).json()["id"]
    reponse = client.put(f"{CONTACT}/{identifiant}/read", headers=entetes_admin)
    assert reponse.status_code == 200
    assert reponse.json()["is_read"] is True


def test_le_compteur_de_messages_non_lus_suit(client, entetes_admin):
    """`unread_contacts` alimente la pastille de la barre laterale."""
    identifiant = _envoyer_message(client).json()["id"]
    assert client.get("/api/v1/stats/", headers=entetes_admin).json()["unread_contacts"] == 1
    client.put(f"{CONTACT}/{identifiant}/read", headers=entetes_admin)
    assert client.get("/api/v1/stats/", headers=entetes_admin).json()["unread_contacts"] == 0


def test_marquer_lu_identifiant_absent(client, entetes_admin):
    assert client.put(f"{CONTACT}/{UUID_ABSENT}/read", headers=entetes_admin).status_code == 404


def test_marquer_lu_identifiant_non_uuid(client, entetes_admin):
    reponse = client.put(f"{CONTACT}/{IDENTIFIANT_NON_UUID}/read", headers=entetes_admin)
    assert reponse.status_code == 422


def test_marquer_lu_sans_authentification(client):
    identifiant = _envoyer_message(client).json()["id"]
    assert client.put(f"{CONTACT}/{identifiant}/read").status_code == 403

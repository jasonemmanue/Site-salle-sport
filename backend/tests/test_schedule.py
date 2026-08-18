"""Planning hebdomadaire.

Un creneau est soit **recurrent** (il revient chaque semaine le meme jour), soit
**date** (`specific_date`). Le filtre par date doit ramener les deux : le
recurrent dont le jour de semaine correspond, et le date du jour demande.
"""

from datetime import date, timedelta

from tests.conftest import IDENTIFIANT_NON_UUID, UUID_ABSENT

CHEMIN = "/api/v1/schedule"

LUNDI = date.today() - timedelta(days=date.today().weekday())
MARDI = LUNDI + timedelta(days=1)


def _charge(activite, coach, **surcharges):
    corps = {
        "activity_id": activite.id,
        "coach_id": coach.id,
        "day_of_week": 2,
        "start_time": "20:30",
        "end_time": "22:00",
    }
    corps.update(surcharges)
    return corps


# --- Lecture publique ------------------------------------------------------


def test_liste_publique(client, creneau):
    reponse = client.get(f"{CHEMIN}/")
    assert reponse.status_code == 200
    assert len(reponse.json()) == 1


def test_le_creneau_porte_son_activite_et_son_coach(client, creneau):
    element = client.get(f"{CHEMIN}/").json()[0]
    assert element["activity"]["name"] == "Musculation"
    assert element["coach"]["name"] == "Toussaint"


def test_tri_par_jour_puis_par_heure(client, activite, coach, entetes_admin):
    client.post(f"{CHEMIN}/", json=_charge(activite, coach, day_of_week=2, start_time="18:00"), headers=entetes_admin)
    client.post(f"{CHEMIN}/", json=_charge(activite, coach, day_of_week=1, start_time="20:00"), headers=entetes_admin)
    client.post(f"{CHEMIN}/", json=_charge(activite, coach, day_of_week=2, start_time="07:00"), headers=entetes_admin)
    releve = [(e["day_of_week"], e["start_time"]) for e in client.get(f"{CHEMIN}/").json()]
    assert releve == [(1, "20:00"), (2, "07:00"), (2, "18:00")]


def test_filtre_par_date_retient_le_recurrent_du_bon_jour(client, creneau):
    """Le creneau de la fixture est recurrent le lundi."""
    assert len(client.get(f"{CHEMIN}/", params={"date": LUNDI.isoformat()}).json()) == 1
    assert client.get(f"{CHEMIN}/", params={"date": MARDI.isoformat()}).json() == []


def test_filtre_par_date_retient_aussi_le_creneau_date(client, activite, coach, entetes_admin):
    client.post(
        f"{CHEMIN}/",
        json=_charge(
            activite,
            coach,
            day_of_week=6,
            is_recurring=False,
            specific_date=MARDI.isoformat(),
        ),
        headers=entetes_admin,
    )
    assert len(client.get(f"{CHEMIN}/", params={"date": MARDI.isoformat()}).json()) == 1


def test_date_malformee_refusee(client):
    assert client.get(f"{CHEMIN}/", params={"date": "32/13/2026"}).status_code == 422


def test_vue_hebdomadaire_groupee_par_jour(client, creneau):
    reponse = client.get(f"{CHEMIN}/weekly")
    assert reponse.status_code == 200
    corps = reponse.json()
    # Les cles JSON sont des chaines, meme si le service groupe sur des entiers.
    assert list(corps.keys()) == ["0"]
    assert len(corps["0"]) == 1


def test_vue_hebdomadaire_ignore_les_creneaux_dates(client, activite, coach, entetes_admin):
    client.post(
        f"{CHEMIN}/",
        json=_charge(activite, coach, is_recurring=False, specific_date=MARDI.isoformat()),
        headers=entetes_admin,
    )
    assert client.get(f"{CHEMIN}/weekly").json() == {}


# --- Ecriture --------------------------------------------------------------


def test_creation_par_l_admin(client, activite, coach, entetes_admin):
    reponse = client.post(f"{CHEMIN}/", json=_charge(activite, coach), headers=entetes_admin)
    assert reponse.status_code == 201
    assert reponse.json()["start_time"] == "20:30"


def test_creation_sans_authentification(client, activite, coach):
    assert client.post(f"{CHEMIN}/", json=_charge(activite, coach)).status_code == 403


def test_creation_par_un_membre(client, activite, coach, membre):
    reponse = client.post(f"{CHEMIN}/", json=_charge(activite, coach), headers=membre.entetes)
    assert reponse.status_code == 403


def test_jour_de_semaine_hors_bornes(client, activite, coach, entetes_admin):
    reponse = client.post(
        f"{CHEMIN}/", json=_charge(activite, coach, day_of_week=7), headers=entetes_admin
    )
    assert reponse.status_code == 422


def test_activite_inconnue_rend_404(client, activite, coach, entetes_admin):
    reponse = client.post(
        f"{CHEMIN}/", json=_charge(activite, coach, activity_id=UUID_ABSENT), headers=entetes_admin
    )
    assert reponse.status_code == 404


def test_coach_inconnu_rend_404(client, activite, coach, entetes_admin):
    reponse = client.post(
        f"{CHEMIN}/", json=_charge(activite, coach, coach_id=UUID_ABSENT), headers=entetes_admin
    )
    assert reponse.status_code == 404


def test_activite_non_uuid_rend_422(client, activite, coach, entetes_admin):
    reponse = client.post(
        f"{CHEMIN}/",
        json=_charge(activite, coach, activity_id=IDENTIFIANT_NON_UUID),
        headers=entetes_admin,
    )
    assert reponse.status_code == 422


def test_deplacement_par_glisser_deposer(client, creneau, entetes_admin):
    """Ce que fait l'editeur du back-office : un PUT jour + heure."""
    reponse = client.put(
        f"{CHEMIN}/{creneau.id}",
        json={"day_of_week": 4, "start_time": "20:30", "end_time": "22:00"},
        headers=entetes_admin,
    )
    assert reponse.status_code == 200
    assert reponse.json()["day_of_week"] == 4


def test_modification_vers_un_coach_inconnu(client, creneau, entetes_admin):
    reponse = client.put(
        f"{CHEMIN}/{creneau.id}", json={"coach_id": UUID_ABSENT}, headers=entetes_admin
    )
    assert reponse.status_code == 404


def test_modification_identifiant_absent(client, entetes_admin):
    reponse = client.put(f"{CHEMIN}/{UUID_ABSENT}", json={"day_of_week": 1}, headers=entetes_admin)
    assert reponse.status_code == 404


def test_capacite_specifique_au_creneau(client, creneau, entetes_admin):
    reponse = client.put(
        f"{CHEMIN}/{creneau.id}", json={"max_capacity_override": 8}, headers=entetes_admin
    )
    assert reponse.json()["max_capacity_override"] == 8


def test_suppression_est_douce(client, db, creneau, entetes_admin):
    from app.models.models import ScheduleSlot

    assert client.delete(f"{CHEMIN}/{creneau.id}", headers=entetes_admin).status_code == 200
    assert client.get(f"{CHEMIN}/").json() == []
    assert db.query(ScheduleSlot).filter(ScheduleSlot.id == creneau.id).first().is_active is False


def test_suppression_identifiant_absent(client, entetes_admin):
    assert client.delete(f"{CHEMIN}/{UUID_ABSENT}", headers=entetes_admin).status_code == 404


def test_suppression_sans_authentification(client, creneau):
    assert client.delete(f"{CHEMIN}/{creneau.id}").status_code == 403

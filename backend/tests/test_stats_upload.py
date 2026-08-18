"""Tableau de bord et envoi de fichiers.

Les noms des indicateurs sont un contrat avec `admin/lib/types.ts` : un champ
renomme cote API ne provoque aucune erreur visible, juste des cartes vides dans
le back-office. D'ou la verification champ par champ.

Le second bloc couvre l'envoi de fichiers, seule route ou une entree utilisateur
touchait au systeme de fichiers du conteneur.
"""

from datetime import date, timedelta
from pathlib import Path

import pytest

from app.core.config import settings
from tests.conftest import DOSSIER_UPLOADS

STATS = "/api/v1/stats"
UPLOAD = "/api/v1/upload"

CHAMPS_ATTENDUS = {
    "total_members",
    "active_subscriptions",
    "today_enrollments",
    "total_activities",
    "total_coaches",
    "unread_contacts",
    "pending_reviews",
    "fill_rate",
    "monthly_revenue",
}


# --- Statistiques ----------------------------------------------------------


def test_les_statistiques_sont_reservees_a_l_admin(client):
    assert client.get(f"{STATS}/").status_code == 403


def test_les_statistiques_sont_refusees_a_un_membre(client, membre):
    assert client.get(f"{STATS}/", headers=membre.entetes).status_code == 403


def test_les_neuf_indicateurs_sont_presents(client, entetes_admin):
    """Contrat avec l'interface `DashboardStats` du back-office."""
    assert set(client.get(f"{STATS}/", headers=entetes_admin).json()) == CHAMPS_ATTENDUS


def test_base_vide_ne_produit_pas_de_division_par_zero(client, entetes_admin):
    corps = client.get(f"{STATS}/", headers=entetes_admin).json()
    assert corps["fill_rate"] == 0.0
    assert corps["monthly_revenue"] == 0.0


def test_comptage_des_activites_et_des_coachs(client, entetes_admin, activite, coach):
    corps = client.get(f"{STATS}/", headers=entetes_admin).json()
    assert corps["total_activities"] == 1
    assert corps["total_coaches"] == 1


def test_une_activite_supprimee_sort_du_comptage(client, entetes_admin, activite):
    client.delete(f"/api/v1/activities/{activite.id}", headers=entetes_admin)
    assert client.get(f"{STATS}/", headers=entetes_admin).json()["total_activities"] == 0


def test_taux_de_remplissage_du_jour(client, entetes_admin, db, activite, coach):
    """Un creneau du jour, capacite 2, une inscription : 50 %."""
    from app.models.models import ScheduleSlot

    aujourdhui = date.today()
    creneau = ScheduleSlot(
        activity_id=activite.id,
        coach_id=coach.id,
        day_of_week=aujourdhui.weekday(),
        start_time="07:00",
        end_time="08:00",
        is_recurring=True,
        is_active=True,
    )
    db.add(creneau)
    db.commit()
    db.refresh(creneau)

    client.post(
        "/api/v1/enrollments/",
        json={
            "user_name": "Ama",
            "user_email": "ama@tests.eslie",
            "user_phone": "0000",
            "slot_id": creneau.id,
            "specific_date": aujourdhui.isoformat(),
        },
    )
    corps = client.get(f"{STATS}/", headers=entetes_admin).json()
    assert corps["today_enrollments"] == 1
    assert corps["fill_rate"] == 50.0


def test_les_inscriptions_d_un_autre_jour_ne_comptent_pas(client, entetes_admin, creneau):
    demain = date.today() + timedelta(days=1)
    client.post(
        "/api/v1/enrollments/",
        json={
            "user_name": "Ama",
            "user_email": "ama@tests.eslie",
            "user_phone": "0000",
            "slot_id": creneau.id,
            "specific_date": demain.isoformat(),
        },
    )
    assert client.get(f"{STATS}/", headers=entetes_admin).json()["today_enrollments"] == 0


# --- Tendances -------------------------------------------------------------


def test_les_tendances_sont_reservees_a_l_admin(client):
    assert client.get(f"{STATS}/trends").status_code == 403


def test_les_quatre_series_sont_presentes(client, entetes_admin):
    corps = client.get(f"{STATS}/trends", headers=entetes_admin).json()
    assert set(corps) == {
        "enrollments_by_day",
        "revenue_by_month",
        "top_activities",
        "fill_rate_by_day",
    }


def test_la_semaine_compte_sept_points_et_le_revenu_six_mois(client, entetes_admin):
    corps = client.get(f"{STATS}/trends", headers=entetes_admin).json()
    assert len(corps["enrollments_by_day"]) == 7
    assert len(corps["fill_rate_by_day"]) == 7
    assert len(corps["revenue_by_month"]) == 6


def test_une_activite_sans_inscription_reste_au_palmares(client, entetes_admin, activite):
    """Jointures externes : sinon un catalogue neuf donnerait un graphique vide."""
    palmares = client.get(f"{STATS}/trends", headers=entetes_admin).json()["top_activities"]
    assert palmares == [{"label": "Musculation", "value": 0.0}]


def test_le_palmares_s_arrete_a_cinq_activites(client, entetes_admin, db):
    from app.models.models import Activity

    for numero in range(7):
        db.add(
            Activity(
                name=f"Activite {numero}",
                slug=f"activite-{numero}",
                description="…",
                category="force",
                level="all",
                duration_minutes=60,
                max_capacity=10,
            )
        )
    db.commit()
    palmares = client.get(f"{STATS}/trends", headers=entetes_admin).json()["top_activities"]
    assert len(palmares) == 5


# --- Envoi de fichiers -----------------------------------------------------


def _fichier(nom="photo.png", contenu=b"\x89PNG\r\n\x1a\n"):
    return {"file": (nom, contenu, "image/png")}


def test_envoi_reserve_a_l_admin(client):
    assert client.post(f"{UPLOAD}/", files=_fichier()).status_code == 403


def test_envoi_refuse_a_un_membre(client, membre):
    assert client.post(f"{UPLOAD}/", files=_fichier(), headers=membre.entetes).status_code == 403


def test_envoi_nominal(client, entetes_admin):
    reponse = client.post(
        f"{UPLOAD}/", files=_fichier(), params={"subfolder": "images"}, headers=entetes_admin
    )
    assert reponse.status_code == 201
    url = reponse.json()["url"]
    assert url.startswith("/uploads/images/")
    assert (Path(settings.UPLOAD_DIR) / url.removeprefix("/uploads/")).exists()


def test_extension_refusee(client, entetes_admin):
    reponse = client.post(
        f"{UPLOAD}/",
        files={"file": ("script.exe", b"MZ", "application/octet-stream")},
        headers=entetes_admin,
    )
    assert reponse.status_code == 400


@pytest.mark.parametrize(
    "sous_dossier",
    ["../../../tmp/evil", "..", "images/../..", "/etc", "images/sous-dossier", ""],
)
def test_le_sous_dossier_ne_peut_pas_sortir_du_dossier_des_envois(
    client, entetes_admin, sous_dossier
):
    """La faille corrigee : le fichier s'ecrivait reellement hors de `/app/uploads`."""
    reponse = client.post(
        f"{UPLOAD}/", files=_fichier(), params={"subfolder": sous_dossier}, headers=entetes_admin
    )
    assert reponse.status_code == 400


def test_aucun_fichier_n_a_ete_ecrit_hors_du_dossier(client, entetes_admin):
    client.post(
        f"{UPLOAD}/",
        files=_fichier(nom="evil.png"),
        params={"subfolder": "../../../tmp/evil"},
        headers=entetes_admin,
    )
    racine = Path(DOSSIER_UPLOADS).resolve()
    assert not (racine.parent.parent / "tmp" / "evil").exists()


def test_fichier_trop_volumineux(client, entetes_admin):
    trop_gros = b"\x00" * ((settings.MAX_UPLOAD_SIZE_MB + 1) * 1024 * 1024)
    reponse = client.post(
        f"{UPLOAD}/", files=_fichier(contenu=trop_gros), headers=entetes_admin
    )
    assert reponse.status_code == 400

"""Articles — dont la route a double lecture.

`GET /articles/` sert deux publics sur la meme URL. Un visiteur anonyme ne doit
voir que les articles publies **quel que soit le `?status=` demande** : sans ce
garde-fou, `?status=draft` exposait les brouillons. Un administrateur, lui, voit
ses brouillons quand il ne demande aucun filtre — sa liste de back-office en
depend.
"""

from tests.conftest import IDENTIFIANT_NON_UUID, UUID_ABSENT

CHEMIN = "/api/v1/articles"


def _charge(**surcharges):
    corps = {
        "title": "Cinq exercices pour le dos",
        "slug": "ignore-par-le-service",
        "content": "<p>Le contenu de l'article.</p>",
        "excerpt": "Un resume court.",
        "status": "draft",
    }
    corps.update(surcharges)
    return corps


# --- Double lecture --------------------------------------------------------


def test_anonyme_ne_voit_que_les_publies(client, article_publie, article_brouillon):
    corps = client.get(f"{CHEMIN}/").json()
    assert corps["total"] == 1
    assert corps["items"][0]["status"] == "published"


def test_anonyme_ne_peut_pas_reclamer_les_brouillons(client, article_publie, article_brouillon):
    """La faille corrigee : `?status=draft` renvoyait les brouillons a tout le monde."""
    corps = client.get(f"{CHEMIN}/", params={"status": "draft"}).json()
    assert corps["total"] == 1
    assert corps["items"][0]["status"] == "published"


def test_l_admin_voit_publies_et_brouillons(client, entetes_admin, article_publie, article_brouillon):
    corps = client.get(f"{CHEMIN}/", headers=entetes_admin).json()
    assert corps["total"] == 2


def test_l_admin_peut_filtrer_sur_les_brouillons(client, entetes_admin, article_publie, article_brouillon):
    corps = client.get(f"{CHEMIN}/", params={"status": "draft"}, headers=entetes_admin).json()
    assert [element["status"] for element in corps["items"]] == ["draft"]


def test_un_jeton_invalide_vaut_visiteur_anonyme(client, article_publie, article_brouillon):
    """`get_optional_user` ne leve pas 401 : il rend simplement None."""
    reponse = client.get(f"{CHEMIN}/", headers={"Authorization": "Bearer nimportequoi"})
    assert reponse.status_code == 200
    assert reponse.json()["total"] == 1


def test_un_membre_ne_voit_pas_les_brouillons(client, membre, article_publie, article_brouillon):
    """Le filtre porte sur le role `admin`, pas sur le fait d'etre connecte."""
    corps = client.get(f"{CHEMIN}/", headers=membre.entetes).json()
    assert corps["total"] == 1


# --- Detail ----------------------------------------------------------------


def test_detail_d_un_article_publie(client, article_publie):
    reponse = client.get(f"{CHEMIN}/bien-demarrer-la-musculation")
    assert reponse.status_code == 200
    assert reponse.json()["content"] == "<p>Contenu publie.</p>"


def test_detail_d_un_brouillon_reste_ferme(client, article_brouillon):
    """Meme avec l'adresse exacte, un brouillon n'est pas lisible publiquement."""
    assert client.get(f"{CHEMIN}/note-interne-non-publiee").status_code == 404


def test_detail_slug_inconnu(client):
    assert client.get(f"{CHEMIN}/slug-inexistant").status_code == 404


def test_l_auteur_accompagne_l_article(client, article_publie):
    assert client.get(f"{CHEMIN}/bien-demarrer-la-musculation").json()["author"]["role"] == "admin"


# --- Ecriture --------------------------------------------------------------


def test_creation_par_l_admin(client, entetes_admin):
    reponse = client.post(f"{CHEMIN}/", json=_charge(), headers=entetes_admin)
    assert reponse.status_code == 201
    assert reponse.json()["slug"] == "cinq-exercices-pour-le-dos"


def test_creation_sans_authentification(client):
    assert client.post(f"{CHEMIN}/", json=_charge()).status_code == 403


def test_un_brouillon_n_a_pas_de_date_de_publication(client, entetes_admin):
    reponse = client.post(f"{CHEMIN}/", json=_charge(status="draft"), headers=entetes_admin)
    assert reponse.json()["published_at"] is None


def test_publier_horodate_l_article(client, entetes_admin):
    reponse = client.post(f"{CHEMIN}/", json=_charge(status="published"), headers=entetes_admin)
    assert reponse.json()["published_at"] is not None


def test_passer_un_brouillon_en_publie_l_horodate(client, entetes_admin):
    identifiant = client.post(f"{CHEMIN}/", json=_charge(), headers=entetes_admin).json()["id"]
    reponse = client.put(
        f"{CHEMIN}/{identifiant}", json={"status": "published"}, headers=entetes_admin
    )
    assert reponse.json()["published_at"] is not None


def test_deux_articles_au_meme_titre(client, entetes_admin):
    """Le slug est unique : le second doit etre suffixe, pas rejete en 500."""
    premier = client.post(f"{CHEMIN}/", json=_charge(), headers=entetes_admin)
    second = client.post(f"{CHEMIN}/", json=_charge(), headers=entetes_admin)
    assert premier.json()["slug"] == "cinq-exercices-pour-le-dos"
    assert second.status_code == 201
    assert second.json()["slug"] == "cinq-exercices-pour-le-dos-2"


def test_renommer_vers_un_titre_deja_pris(client, entetes_admin):
    client.post(f"{CHEMIN}/", json=_charge(title="Titre occupe"), headers=entetes_admin)
    identifiant = client.post(
        f"{CHEMIN}/", json=_charge(title="Autre titre"), headers=entetes_admin
    ).json()["id"]
    reponse = client.put(
        f"{CHEMIN}/{identifiant}", json={"title": "Titre occupe"}, headers=entetes_admin
    )
    assert reponse.status_code == 200
    assert reponse.json()["slug"] == "titre-occupe-2"


def test_modification_identifiant_absent(client, entetes_admin):
    reponse = client.put(f"{CHEMIN}/{UUID_ABSENT}", json={"title": "X"}, headers=entetes_admin)
    assert reponse.status_code == 404


def test_modification_identifiant_non_uuid(client, entetes_admin):
    reponse = client.put(
        f"{CHEMIN}/{IDENTIFIANT_NON_UUID}", json={"title": "X"}, headers=entetes_admin
    )
    assert reponse.status_code == 422


def test_suppression_est_definitive(client, db, entetes_admin, article_publie):
    from app.models.models import Article

    assert client.delete(f"{CHEMIN}/{article_publie.id}", headers=entetes_admin).status_code == 200
    assert db.query(Article).filter(Article.id == article_publie.id).first() is None


def test_suppression_sans_authentification(client, article_publie):
    assert client.delete(f"{CHEMIN}/{article_publie.id}").status_code == 403


def test_pagination(client, entetes_admin):
    for numero in range(1, 6):
        client.post(
            f"{CHEMIN}/",
            json=_charge(title=f"Article {numero}", status="published"),
            headers=entetes_admin,
        )
    corps = client.get(f"{CHEMIN}/", params={"page": 2, "limit": 2}).json()
    assert corps["total"] == 5
    assert corps["pages"] == 3
    assert len(corps["items"]) == 2

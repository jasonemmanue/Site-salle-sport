"""Socle commun des tests de l'API.

Trois choix structurants, expliques ici une fois pour toutes.

**On teste sur PostgreSQL, pas sur SQLite.** Les garde-fous que cette suite
verifie (identifiant qui n'est pas un UUID, cle etrangere absente, slug en
doublon, champ obligatoire vide) existent parce que PostgreSQL leve une erreur
la ou SQLite laisse passer. Une suite sur SQLite resterait verte apres une
regression : elle donnerait une confiance fausse. La base de test est une base
dediee, `<base>_test`, creee au premier lancement et jamais melangee aux
donnees de developpement.

**Chaque test tourne dans une transaction annulee a la fin.** La connexion
ouvre une transaction, la session applicative s'y greffe en `create_savepoint` :
les `db.commit()` des services deviennent des relachements de point de reprise,
et le `rollback()` final efface tout. Aucun ordre de passage a respecter, aucun
nettoyage a ecrire.

**Un seul compte administrateur, hors transaction.** Le hachage bcrypt coute
~0,3 s ; le refaire a chaque test couterait plus cher que toute la suite. Ce
compte est donc ecrit en dur dans la base de test. C'est la seule ligne qui
survit d'un test a l'autre — tout le reste part au rollback, ce qui permet aux
tests de statistiques d'affirmer des valeurs exactes.
"""

import os
import tempfile

from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url

# --- Environnement : doit etre fixe AVANT le premier import de `app`. -------
# `app.core.config.settings` lit l'environnement a l'import, et
# `app.core.dependencies` construit son moteur dans la foulee. Sans ces lignes
# en tete de fichier, les tests taperaient dans la base de developpement.


def _url_de_test() -> str:
    """URL de la base de test : `TEST_DATABASE_URL`, sinon `<base>_test`."""
    explicite = os.environ.get("TEST_DATABASE_URL")
    if explicite:
        return explicite
    base = os.environ.get(
        "DATABASE_URL", "postgresql://sport_user:changeme@db:5432/salle_sport_db"
    )
    url = make_url(base).set(database=f"{make_url(base).database or 'salle_sport'}_test")
    # `str(url)` masque le mot de passe par `***` — la chaine obtenue ne se
    # reconnecte pas. Il faut le rendu explicite.
    return url.render_as_string(hide_password=False)


URL_DE_TEST = _url_de_test()
DOSSIER_UPLOADS = tempfile.mkdtemp(prefix="uploads-tests-")

os.environ["DATABASE_URL"] = URL_DE_TEST
os.environ["UPLOAD_DIR"] = DOSSIER_UPLOADS
os.environ.setdefault("SECRET_KEY", "cle-de-test-sans-valeur-en-production")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

from app.core.dependencies import get_db  # noqa: E402
from app.core.security import create_access_token  # noqa: E402
from app.main import app  # noqa: E402
from app.models.models import (  # noqa: E402
    Activity,
    Article,
    Base,
    Coach,
    ScheduleSlot,
    Subscription,
)
from app.services import auth_service  # noqa: E402

UUID_ABSENT = "00000000-0000-0000-0000-000000000000"
IDENTIFIANT_NON_UUID = "pas-un-uuid"


def _cree_la_base_si_absente(url) -> None:
    """`CREATE DATABASE` au premier lancement, via la base de maintenance."""
    moteur = create_engine(url.set(database="postgres"), isolation_level="AUTOCOMMIT")
    try:
        with moteur.connect() as connexion:
            existe = connexion.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :nom"),
                {"nom": url.database},
            ).scalar()
            if not existe:
                connexion.execute(text(f'CREATE DATABASE "{url.database}"'))
    finally:
        moteur.dispose()


@pytest.fixture(scope="session")
def moteur():
    url = make_url(URL_DE_TEST)
    _cree_la_base_si_absente(url)
    moteur = create_engine(url)
    # Schema reconstruit a chaque lancement : une migration ajoutee entre deux
    # sessions ne laisse pas une base de test a moitie a jour.
    Base.metadata.drop_all(moteur)
    Base.metadata.create_all(moteur)
    yield moteur
    moteur.dispose()


@pytest.fixture
def db(moteur):
    connexion = moteur.connect()
    transaction = connexion.begin()
    session = Session(bind=connexion, join_transaction_mode="create_savepoint")
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connexion.close()


@pytest.fixture
def client(db):
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as testeur:
        yield testeur
    app.dependency_overrides.clear()


# --- Comptes ---------------------------------------------------------------


class Compte:
    """Identite d'un compte de test, detachee de toute session SQLAlchemy."""

    def __init__(self, identifiant: str, email: str, mot_de_passe: str, role: str):
        self.id = identifiant
        self.email = email
        self.mot_de_passe = mot_de_passe
        self.role = role
        self.jeton = create_access_token({"sub": identifiant, "role": role})

    @property
    def entetes(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self.jeton}"}


@pytest.fixture(scope="session")
def admin(moteur) -> Compte:
    """Compte administrateur ecrit en dur dans la base de test.

    Hors transaction de test, donc partage : ne jamais le modifier depuis un
    test. Son role `admin` l'exclut du comptage des membres des statistiques.
    """
    with Session(moteur) as session:
        existant = auth_service.get_user_by_email(session, "admin@tests.eslie")
        if existant is None:
            existant = auth_service.create_user(
                session,
                "admin@tests.eslie",
                "motdepasse-admin",
                "Admin des tests",
                role="admin",
            )
        return Compte(existant.id, existant.email, "motdepasse-admin", "admin")


@pytest.fixture
def membre(db) -> Compte:
    """Compte de role `member`, cree dans la transaction du test donc ephemere.

    Sert aux verifications de 403 : authentifie, mais pas administrateur.
    """
    utilisateur = auth_service.create_user(
        db, "membre@tests.eslie", "motdepasse-membre", "Membre des tests", role="member"
    )
    return Compte(utilisateur.id, utilisateur.email, "motdepasse-membre", "member")


@pytest.fixture
def entetes_admin(admin) -> dict[str, str]:
    return admin.entetes


# --- Jeux de donnees -------------------------------------------------------


@pytest.fixture
def activite(db) -> Activity:
    """Activite active, capacite 2 : deux inscriptions suffisent a la remplir."""
    element = Activity(
        name="Musculation",
        slug="musculation",
        description="Renforcement general en salle.",
        category="force",
        level="all",
        duration_minutes=60,
        max_capacity=2,
        is_active=True,
        order=1,
    )
    db.add(element)
    db.commit()
    db.refresh(element)
    return element


@pytest.fixture
def coach(db) -> Coach:
    element = Coach(
        name="Toussaint",
        certifications=["BPJEPS"],
        specialties=["Musculation"],
        bio="Coach musculation, tous les jours.",
        is_active=True,
        order=1,
    )
    db.add(element)
    db.commit()
    db.refresh(element)
    return element


@pytest.fixture
def creneau(db, activite, coach) -> ScheduleSlot:
    """Creneau recurrent du lundi, capacite heritee de l'activite (2 places)."""
    element = ScheduleSlot(
        activity_id=activite.id,
        coach_id=coach.id,
        day_of_week=0,
        start_time="07:00",
        end_time="08:00",
        is_recurring=True,
        is_active=True,
    )
    db.add(element)
    db.commit()
    db.refresh(element)
    return element


@pytest.fixture
def abonnement(db) -> Subscription:
    element = Subscription(
        name="Mensualite",
        price=30000,
        duration_months=1,
        features=["Acces libre", "Suivi coach"],
        is_active=True,
        order=1,
    )
    db.add(element)
    db.commit()
    db.refresh(element)
    return element


@pytest.fixture
def article_publie(db, admin) -> Article:
    from datetime import datetime, timezone

    element = Article(
        title="Bien demarrer la musculation",
        slug="bien-demarrer-la-musculation",
        content="<p>Contenu publie.</p>",
        excerpt="Les bases.",
        status="published",
        published_at=datetime.now(timezone.utc).replace(tzinfo=None),
        author_id=admin.id,
    )
    db.add(element)
    db.commit()
    db.refresh(element)
    return element


@pytest.fixture
def article_brouillon(db, admin) -> Article:
    element = Article(
        title="Note interne non publiee",
        slug="note-interne-non-publiee",
        content="<p>Brouillon.</p>",
        status="draft",
        author_id=admin.id,
    )
    db.add(element)
    db.commit()
    db.refresh(element)
    return element

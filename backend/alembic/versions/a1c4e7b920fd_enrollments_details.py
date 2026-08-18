"""informations de paiement sur les reservations

Ajoute a `enrollments` ce que le registre de la salle collectait et que la
reservation en ligne ne demandait pas : type de seance, formule de paiement,
montant encaisse, remarque du membre. Plus deux colonnes de suivi de la recopie
vers le formulaire Google.

Toutes nullables : les reservations deja enregistrees n'ont aucune de ces
valeurs, et il n'existe pas de defaut honnete a leur inventer.

Revision ID: a1c4e7b920fd
Revises: 091934929730
Create Date: 2026-08-18

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a1c4e7b920fd"
down_revision: Union[str, None] = "091934929730"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("enrollments", sa.Column("session_type", sa.String(50), nullable=True))
    op.add_column("enrollments", sa.Column("payment_type", sa.String(100), nullable=True))
    op.add_column("enrollments", sa.Column("amount_paid", sa.Numeric(10, 2), nullable=True))
    op.add_column("enrollments", sa.Column("feedback", sa.Text(), nullable=True))
    op.add_column(
        "enrollments",
        sa.Column(
            "forwarded_to_google",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )
    op.add_column("enrollments", sa.Column("google_error", sa.Text(), nullable=True))
    # L'export et la liste du back-office trient par date de seance.
    op.create_index("ix_enrollments_specific_date", "enrollments", ["specific_date"])


def downgrade() -> None:
    op.drop_index("ix_enrollments_specific_date", table_name="enrollments")
    for colonne in (
        "google_error",
        "forwarded_to_google",
        "feedback",
        "amount_paid",
        "payment_type",
        "session_type",
    ):
        op.drop_column("enrollments", colonne)

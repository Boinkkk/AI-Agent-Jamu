"""Add order payment fields

Revision ID: 4d8a2e63b917
Revises: 3b7f8c2d91a4
Create Date: 2026-06-17 16:05:00.000000

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "4d8a2e63b917"
down_revision = "3b7f8c2d91a4"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "orders",
        sa.Column(
            "payment_method",
            sa.String(length=50),
            server_default="doku_va",
            nullable=False,
        ),
    )
    op.add_column(
        "orders",
        sa.Column(
            "payment_status",
            sa.String(length=20),
            server_default="unpaid",
            nullable=False,
        ),
    )
    op.add_column("orders", sa.Column("payment_url", sa.Text(), nullable=True))
    op.add_column(
        "orders",
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade():
    op.drop_column("orders", "paid_at")
    op.drop_column("orders", "payment_url")
    op.drop_column("orders", "payment_status")
    op.drop_column("orders", "payment_method")

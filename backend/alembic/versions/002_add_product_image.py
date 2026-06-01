"""Add image_url column to products table

Revision ID: 002
Revises: 001
Create Date: 2024-01-02 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add image_url column — stores a base64 data URI or external URL
    # TEXT type to accommodate large base64 strings
    op.add_column(
        "products",
        sa.Column("image_url", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("products", "image_url")

"""Create initial tables: users, products, customers, orders, order_items

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# Revision identifiers used by Alembic
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── users ──────────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id",              sa.Integer(),     nullable=False),
        sa.Column("name",            sa.String(255),   nullable=False),
        sa.Column("email",           sa.String(255),   nullable=False),
        sa.Column("hashed_password", sa.String(255),   nullable=False),
        sa.Column("is_active",       sa.Boolean(),     nullable=False, server_default=sa.text("true")),
        sa.Column("is_admin",        sa.Boolean(),     nullable=False, server_default=sa.text("false")),
        sa.Column("created_at",      sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("ix_users_id",    "users", ["id"],    unique=False)
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # ── products ───────────────────────────────────────────────────────────────
    op.create_table(
        "products",
        sa.Column("id",             sa.Integer(),          nullable=False),
        sa.Column("name",           sa.String(255),        nullable=False),
        sa.Column("sku",            sa.String(100),        nullable=False),
        sa.Column("description",    sa.Text(),             nullable=True),
        sa.Column("price",          sa.Numeric(10, 2),     nullable=False),
        sa.Column("stock_quantity", sa.Integer(),          nullable=False, server_default=sa.text("0")),
        sa.Column("created_at",     sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("sku", name="uq_products_sku"),
    )
    op.create_index("ix_products_id",   "products", ["id"],   unique=False)
    op.create_index("ix_products_sku",  "products", ["sku"],  unique=True)
    op.create_index("ix_products_name", "products", ["name"], unique=False)

    # ── customers ──────────────────────────────────────────────────────────────
    op.create_table(
        "customers",
        sa.Column("id",         sa.Integer(),     nullable=False),
        sa.Column("name",       sa.String(255),   nullable=False),
        sa.Column("email",      sa.String(255),   nullable=False),
        sa.Column("phone",      sa.String(50),    nullable=True),
        sa.Column("address",    sa.Text(),        nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email", name="uq_customers_email"),
    )
    op.create_index("ix_customers_id",    "customers", ["id"],    unique=False)
    op.create_index("ix_customers_email", "customers", ["email"], unique=True)
    op.create_index("ix_customers_name",  "customers", ["name"],  unique=False)

    # ── orders ─────────────────────────────────────────────────────────────────
    op.create_table(
        "orders",
        sa.Column("id",           sa.Integer(),          nullable=False),
        sa.Column("customer_id",  sa.Integer(),          nullable=False),
        sa.Column("order_date",   sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("total_amount", sa.Numeric(12, 2),     nullable=False, server_default=sa.text("0")),
        sa.Column("status",       sa.String(50),         nullable=False, server_default=sa.text("'pending'")),
        sa.Column("created_at",   sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["customer_id"], ["customers.id"], name="fk_orders_customer_id"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_orders_id",          "orders", ["id"],          unique=False)
    op.create_index("ix_orders_customer_id", "orders", ["customer_id"], unique=False)

    # ── order_items ────────────────────────────────────────────────────────────
    op.create_table(
        "order_items",
        sa.Column("id",         sa.Integer(),      nullable=False),
        sa.Column("order_id",   sa.Integer(),      nullable=False),
        sa.Column("product_id", sa.Integer(),      nullable=False),
        sa.Column("quantity",   sa.Integer(),      nullable=False),
        sa.Column("price",      sa.Numeric(10, 2), nullable=False),
        sa.ForeignKeyConstraint(["order_id"],   ["orders.id"],   name="fk_order_items_order_id"),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], name="fk_order_items_product_id"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_order_items_id",         "order_items", ["id"],         unique=False)
    op.create_index("ix_order_items_order_id",   "order_items", ["order_id"],   unique=False)
    op.create_index("ix_order_items_product_id", "order_items", ["product_id"], unique=False)


def downgrade() -> None:
    # Drop in reverse dependency order
    op.drop_table("order_items")
    op.drop_table("orders")
    op.drop_table("customers")
    op.drop_table("products")
    op.drop_table("users")

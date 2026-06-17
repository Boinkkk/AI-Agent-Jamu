"""Add marketplace tables

Revision ID: 3b7f8c2d91a4
Revises: fe56fa70289e
Create Date: 2026-06-17 15:10:00.000000

"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "3b7f8c2d91a4"
down_revision = "fe56fa70289e"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "categories",
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.Column("slug", sa.String(length=50), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "couriers",
        sa.Column("code", sa.String(length=20), nullable=False),
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.Column("service_type", sa.String(length=50), nullable=True),
        sa.Column("base_cost", sa.Numeric(12, 2), nullable=False),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "addresses",
        sa.Column("label", sa.String(length=50), nullable=True),
        sa.Column("recipient_name", sa.String(length=100), nullable=False),
        sa.Column("phone_number", sa.String(length=20), nullable=False),
        sa.Column("address_line", sa.Text(), nullable=False),
        sa.Column("city", sa.String(length=50), nullable=False),
        sa.Column("province", sa.String(length=50), nullable=False),
        sa.Column("postal_code", sa.String(length=10), nullable=False),
        sa.Column("is_main", sa.Boolean(), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "carts",
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "products",
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("category_id", sa.Integer(), nullable=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("slug", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("price", sa.Numeric(12, 2), nullable=False),
        sa.Column("stock_quantity", sa.Integer(), nullable=False),
        sa.Column("weight_grams", sa.Integer(), nullable=True),
        sa.Column("image_url", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("average_rating", sa.Numeric(3, 2), nullable=False),
        sa.Column("benefit", sa.Text(), nullable=True),
        sa.Column("composition", sa.Text(), nullable=True),
        sa.Column("directions", sa.Text(), nullable=True),
        sa.Column("storage_instructions", sa.Text(), nullable=True),
        sa.Column("manufacturer", sa.String(length=100), nullable=True),
        sa.Column("marketing_location", sa.String(length=100), nullable=True),
        sa.Column("production_location", sa.String(length=50), nullable=True),
        sa.Column("regency", sa.String(length=50), nullable=True),
        sa.Column("licensing", sa.String(length=20), nullable=True),
        sa.Column("licensing_number", sa.String(length=100), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "orders",
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("address_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("courier_id", sa.Integer(), nullable=False),
        sa.Column("total_items_price", sa.Numeric(12, 2), nullable=False),
        sa.Column("shipping_cost", sa.Numeric(12, 2), nullable=False),
        sa.Column("total_amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("tracking_number", sa.String(length=100), nullable=True),
        sa.ForeignKeyConstraint(["address_id"], ["addresses.id"]),
        sa.ForeignKeyConstraint(["courier_id"], ["couriers.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "cart_items",
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("cart_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.CheckConstraint("quantity > 0"),
        sa.ForeignKeyConstraint(["cart_id"], ["carts.id"]),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "order_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("order_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("price_at_purchase", sa.Numeric(12, 2), nullable=False),
        sa.CheckConstraint("quantity > 0"),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"]),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade():
    op.drop_table("order_items")
    op.drop_table("cart_items")
    op.drop_table("orders")
    op.drop_table("products")
    op.drop_table("carts")
    op.drop_table("addresses")
    op.drop_table("couriers")
    op.drop_table("categories")

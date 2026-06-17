import uuid
from datetime import datetime, timezone
from decimal import Decimal

import sqlalchemy as sa
from sqlmodel import Field, SQLModel


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


class TimestampMixin(SQLModel):
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=sa.DateTime(timezone=True),  # type: ignore[arg-type]
    )
    updated_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=sa.DateTime(timezone=True),  # type: ignore[arg-type]
    )


class CategoryBase(SQLModel):
    name: str = Field(max_length=50)
    slug: str = Field(max_length=50)
    description: str | None = None


class Category(CategoryBase, table=True):
    __tablename__ = "categories"

    id: int | None = Field(default=None, primary_key=True)


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=50)
    slug: str | None = Field(default=None, max_length=50)
    description: str | None = None


class CategoryPublic(CategoryBase):
    id: int


class CategoriesPublic(SQLModel):
    data: list[CategoryPublic]
    count: int


class ProductBase(SQLModel):
    category_id: int | None = Field(default=None, foreign_key="categories.id")
    name: str = Field(max_length=100)
    slug: str = Field(max_length=100)
    description: str | None = None
    price: Decimal = Field(sa_column=sa.Column(sa.Numeric(12, 2), nullable=False))
    stock_quantity: int = 0
    weight_grams: int | None = None
    image_url: str | None = None
    is_active: bool = True
    average_rating: Decimal = Field(
        default=Decimal("0.00"),
        sa_column=sa.Column(sa.Numeric(3, 2), nullable=False),
    )
    benefit: str | None = None
    composition: str | None = None
    directions: str | None = None
    storage_instructions: str | None = None
    manufacturer: str | None = Field(default=None, max_length=100)
    marketing_location: str | None = Field(default=None, max_length=100)
    production_location: str | None = Field(default=None, max_length=50)
    regency: str | None = Field(default=None, max_length=50)
    licensing: str | None = Field(default=None, max_length=20)
    licensing_number: str | None = Field(default=None, max_length=100)


class Product(ProductBase, TimestampMixin, table=True):
    __tablename__ = "products"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(SQLModel):
    category_id: int | None = None
    name: str | None = Field(default=None, max_length=100)
    slug: str | None = Field(default=None, max_length=100)
    description: str | None = None
    price: Decimal | None = None
    stock_quantity: int | None = None
    weight_grams: int | None = None
    image_url: str | None = None
    is_active: bool | None = None
    average_rating: Decimal | None = None
    benefit: str | None = None
    composition: str | None = None
    directions: str | None = None
    storage_instructions: str | None = None
    manufacturer: str | None = Field(default=None, max_length=100)
    marketing_location: str | None = Field(default=None, max_length=100)
    production_location: str | None = Field(default=None, max_length=50)
    regency: str | None = Field(default=None, max_length=50)
    licensing: str | None = Field(default=None, max_length=20)
    licensing_number: str | None = Field(default=None, max_length=100)


class ProductPublic(ProductBase):
    id: uuid.UUID
    created_at: datetime | None = None
    updated_at: datetime | None = None


class ProductsPublic(SQLModel):
    data: list[ProductPublic]
    count: int


class AddressBase(SQLModel):
    label: str | None = Field(default=None, max_length=50)
    recipient_name: str = Field(max_length=100)
    phone_number: str = Field(max_length=20)
    address_line: str
    city: str = Field(max_length=50)
    province: str = Field(max_length=50)
    postal_code: str = Field(max_length=10)
    is_main: bool = False


class Address(AddressBase, table=True):
    __tablename__ = "addresses"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)


class AddressCreate(AddressBase):
    pass


class AddressUpdate(SQLModel):
    label: str | None = Field(default=None, max_length=50)
    recipient_name: str | None = Field(default=None, max_length=100)
    phone_number: str | None = Field(default=None, max_length=20)
    address_line: str | None = None
    city: str | None = Field(default=None, max_length=50)
    province: str | None = Field(default=None, max_length=50)
    postal_code: str | None = Field(default=None, max_length=10)
    is_main: bool | None = None


class AddressPublic(AddressBase):
    id: uuid.UUID
    user_id: uuid.UUID


class AddressesPublic(SQLModel):
    data: list[AddressPublic]
    count: int


class CourierBase(SQLModel):
    code: str = Field(max_length=20)
    name: str = Field(max_length=50)
    service_type: str | None = Field(default=None, max_length=50)
    base_cost: Decimal = Field(
        default=Decimal("15000.00"),
        sa_column=sa.Column(sa.Numeric(12, 2), nullable=False),
    )


class Courier(CourierBase, table=True):
    __tablename__ = "couriers"

    id: int | None = Field(default=None, primary_key=True)


class CourierCreate(CourierBase):
    pass


class CourierUpdate(SQLModel):
    code: str | None = Field(default=None, max_length=20)
    name: str | None = Field(default=None, max_length=50)
    service_type: str | None = Field(default=None, max_length=50)
    base_cost: Decimal | None = None


class CourierPublic(CourierBase):
    id: int


class CouriersPublic(SQLModel):
    data: list[CourierPublic]
    count: int


class Cart(TimestampMixin, table=True):
    __tablename__ = "carts"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)


class CartItemBase(SQLModel):
    product_id: uuid.UUID = Field(foreign_key="products.id")
    quantity: int = Field(gt=0)


class CartItem(CartItemBase, TimestampMixin, table=True):
    __tablename__ = "cart_items"
    __table_args__ = (sa.CheckConstraint("quantity > 0"),)

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    cart_id: uuid.UUID = Field(foreign_key="carts.id", nullable=False)


class CartItemCreate(CartItemBase):
    pass


class CartItemUpdate(SQLModel):
    quantity: int = Field(gt=0)


class CartItemPublic(SQLModel):
    id: uuid.UUID
    product_id: uuid.UUID
    quantity: int
    product: ProductPublic
    line_total: Decimal


class CartPublic(SQLModel):
    id: uuid.UUID
    user_id: uuid.UUID
    items: list[CartItemPublic]
    subtotal: Decimal
    count: int


class OrderCreate(SQLModel):
    address_id: uuid.UUID
    courier_id: int
    payment_method: str = Field(default="doku_va", max_length=50)


class Order(TimestampMixin, table=True):
    __tablename__ = "orders"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    address_id: uuid.UUID = Field(foreign_key="addresses.id", nullable=False)
    courier_id: int = Field(foreign_key="couriers.id", nullable=False)
    total_items_price: Decimal = Field(
        sa_column=sa.Column(sa.Numeric(12, 2), nullable=False)
    )
    shipping_cost: Decimal = Field(sa_column=sa.Column(sa.Numeric(12, 2), nullable=False))
    total_amount: Decimal = Field(sa_column=sa.Column(sa.Numeric(12, 2), nullable=False))
    status: str = Field(default="pending", max_length=20)
    payment_method: str = Field(default="doku_va", max_length=50)
    payment_status: str = Field(default="unpaid", max_length=20)
    payment_url: str | None = None
    paid_at: datetime | None = Field(
        default=None,
        sa_type=sa.DateTime(timezone=True),  # type: ignore[arg-type]
    )
    tracking_number: str | None = Field(default=None, max_length=100)


class OrderItem(SQLModel, table=True):
    __tablename__ = "order_items"
    __table_args__ = (sa.CheckConstraint("quantity > 0"),)

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    order_id: uuid.UUID = Field(foreign_key="orders.id", nullable=False)
    product_id: uuid.UUID = Field(foreign_key="products.id", nullable=False)
    quantity: int
    price_at_purchase: Decimal = Field(
        sa_column=sa.Column(sa.Numeric(12, 2), nullable=False)
    )


class OrderItemPublic(SQLModel):
    id: uuid.UUID
    product_id: uuid.UUID
    quantity: int
    price_at_purchase: Decimal
    product_name: str


class OrderPublic(SQLModel):
    id: uuid.UUID
    address_id: uuid.UUID
    courier_id: int
    total_items_price: Decimal
    shipping_cost: Decimal
    total_amount: Decimal
    status: str
    payment_method: str
    payment_status: str
    payment_url: str | None = None
    paid_at: datetime | None = None
    tracking_number: str | None = None
    created_at: datetime | None = None
    items: list[OrderItemPublic]


class OrdersPublic(SQLModel):
    data: list[OrderPublic]
    count: int


class AdminOrderUpdate(SQLModel):
    status: str | None = Field(default=None, max_length=20)
    payment_status: str | None = Field(default=None, max_length=20)
    tracking_number: str | None = Field(default=None, max_length=100)

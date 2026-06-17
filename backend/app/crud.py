import uuid
from decimal import Decimal
from typing import Any

from fastapi import HTTPException
from sqlmodel import Session, func, select

from app.core.security import get_password_hash, verify_password
from app.models import (
    Address,
    AddressCreate,
    AddressesPublic,
    AddressUpdate,
    AdminOrderUpdate,
    Cart,
    CartItem,
    CartItemCreate,
    CartItemPublic,
    CartItemUpdate,
    CartPublic,
    CategoriesPublic,
    Category,
    CategoryCreate,
    Courier,
    CourierCreate,
    CouriersPublic,
    CourierUpdate,
    Order,
    OrderCreate,
    OrderItem,
    OrderItemPublic,
    OrderPublic,
    OrdersPublic,
    Product,
    ProductCreate,
    ProductPublic,
    ProductsPublic,
    ProductUpdate,
)
from app.models.tables import get_datetime_utc
from app.models_old import Item, ItemCreate, User, UserCreate, UserUpdate


def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create, update={"hashed_password": get_password_hash(user_create.password)}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if "password" in user_data:
        password = user_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user


# Dummy hash to use for timing attack prevention when user is not found
# This is an Argon2 hash of a random password, used to ensure constant-time comparison
DUMMY_HASH = "$argon2id$v=19$m=65536,t=3,p=4$MjQyZWE1MzBjYjJlZTI0Yw$YTU4NGM5ZTZmYjE2NzZlZjY0ZWY3ZGRkY2U2OWFjNjk"


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        # Prevent timing attacks by running password verification even when user doesn't exist
        # This ensures the response time is similar whether or not the email exists
        verify_password(password, DUMMY_HASH)
        return None
    verified, updated_password_hash = verify_password(password, db_user.hashed_password)
    if not verified:
        return None
    if updated_password_hash:
        db_user.hashed_password = updated_password_hash
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
    return db_user


def create_item(*, session: Session, item_in: ItemCreate, owner_id: uuid.UUID) -> Item:
    db_item = Item.model_validate(item_in, update={"owner_id": owner_id})
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item


def read_categories(*, session: Session) -> CategoriesPublic:
    statement = select(Category).order_by(Category.name)
    categories = session.exec(statement).all()
    return CategoriesPublic(data=categories, count=len(categories))


def create_category(*, session: Session, category_in: CategoryCreate) -> Category:
    existing_category = session.exec(
        select(Category).where(
            (Category.slug == category_in.slug) | (Category.name == category_in.name)
        )
    ).first()
    if existing_category:
        raise HTTPException(status_code=409, detail="Category name or slug already exists")
    category = Category.model_validate(category_in)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


def update_category(
    *, session: Session, category_id: int, category_in: CategoryCreate
) -> Category:
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    duplicate_category = session.exec(
        select(Category).where(
            Category.id != category_id,
            (Category.slug == category_in.slug) | (Category.name == category_in.name),
        )
    ).first()
    if duplicate_category:
        raise HTTPException(status_code=409, detail="Category name or slug already exists")
    category.sqlmodel_update(category_in.model_dump())
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


def delete_category(*, session: Session, category_id: int) -> None:
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    products = session.exec(
        select(Product).where(Product.category_id == category_id)
    ).first()
    if products:
        raise HTTPException(status_code=409, detail="Category is used by products")
    session.delete(category)
    session.commit()


def read_couriers(*, session: Session) -> CouriersPublic:
    statement = select(Courier).order_by(Courier.name)
    couriers = session.exec(statement).all()
    return CouriersPublic(data=couriers, count=len(couriers))


def create_courier(*, session: Session, courier_in: CourierCreate) -> Courier:
    duplicate_courier = session.exec(
        select(Courier).where(
            (Courier.code == courier_in.code) | (Courier.name == courier_in.name)
        )
    ).first()
    if duplicate_courier:
        raise HTTPException(status_code=409, detail="Courier code or name already exists")
    courier = Courier.model_validate(courier_in)
    session.add(courier)
    session.commit()
    session.refresh(courier)
    return courier


def update_courier(
    *, session: Session, courier_id: int, courier_in: CourierUpdate
) -> Courier:
    courier = session.get(Courier, courier_id)
    if not courier:
        raise HTTPException(status_code=404, detail="Courier not found")
    courier_data = courier_in.model_dump(exclude_unset=True)
    code = courier_data.get("code", courier.code)
    name = courier_data.get("name", courier.name)
    duplicate_courier = session.exec(
        select(Courier).where(
            Courier.id != courier_id,
            (Courier.code == code) | (Courier.name == name),
        )
    ).first()
    if duplicate_courier:
        raise HTTPException(status_code=409, detail="Courier code or name already exists")
    courier.sqlmodel_update(courier_data)
    session.add(courier)
    session.commit()
    session.refresh(courier)
    return courier


def delete_courier(*, session: Session, courier_id: int) -> None:
    courier = session.get(Courier, courier_id)
    if not courier:
        raise HTTPException(status_code=404, detail="Courier not found")
    order = session.exec(select(Order).where(Order.courier_id == courier_id)).first()
    if order:
        raise HTTPException(status_code=409, detail="Courier is used by orders")
    session.delete(courier)
    session.commit()


def read_products(
    *,
    session: Session,
    skip: int = 0,
    limit: int = 20,
    category_id: int | None = None,
    search: str | None = None,
) -> ProductsPublic:
    statement = select(Product).where(Product.is_active == True)  # noqa: E712
    count_statement = select(func.count()).select_from(Product).where(
        Product.is_active == True  # noqa: E712
    )

    if category_id is not None:
        statement = statement.where(Product.category_id == category_id)
        count_statement = count_statement.where(Product.category_id == category_id)

    if search:
        search_pattern = f"%{search}%"
        statement = statement.where(Product.name.ilike(search_pattern))
        count_statement = count_statement.where(Product.name.ilike(search_pattern))

    count = session.exec(count_statement).one()
    products = session.exec(
        statement.order_by(Product.created_at.desc()).offset(skip).limit(limit)
    ).all()
    return ProductsPublic(data=products, count=count)


def read_admin_products(
    *,
    session: Session,
    skip: int = 0,
    limit: int = 100,
) -> ProductsPublic:
    count = session.exec(select(func.count()).select_from(Product)).one()
    products = session.exec(
        select(Product).order_by(Product.created_at.desc()).offset(skip).limit(limit)
    ).all()
    return ProductsPublic(data=products, count=count)


def read_product(*, session: Session, product_id: uuid.UUID) -> Product:
    product = session.get(Product, product_id)
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


def create_product(*, session: Session, product_in: ProductCreate) -> Product:
    duplicate_product = session.exec(
        select(Product).where(
            (Product.slug == product_in.slug) | (Product.name == product_in.name)
        )
    ).first()
    if duplicate_product:
        raise HTTPException(status_code=409, detail="Product name or slug already exists")
    product = Product.model_validate(product_in)
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


def update_product(
    *, session: Session, product: Product, product_in: ProductUpdate
) -> Product:
    product_data = product_in.model_dump(exclude_unset=True)
    name = product_data.get("name", product.name)
    slug = product_data.get("slug", product.slug)
    duplicate_product = session.exec(
        select(Product).where(
            Product.id != product.id,
            (Product.slug == slug) | (Product.name == name),
        )
    ).first()
    if duplicate_product:
        raise HTTPException(status_code=409, detail="Product name or slug already exists")
    product.sqlmodel_update(product_data)
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


def delete_product(*, session: Session, product_id: uuid.UUID) -> Product:
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_active = False
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


def get_or_create_cart(*, session: Session, user_id: uuid.UUID) -> Cart:
    cart = session.exec(select(Cart).where(Cart.user_id == user_id)).first()
    if cart:
        return cart
    cart = Cart(user_id=user_id)
    session.add(cart)
    session.commit()
    session.refresh(cart)
    return cart


def serialize_cart(*, session: Session, cart: Cart) -> CartPublic:
    cart_items = session.exec(select(CartItem).where(CartItem.cart_id == cart.id)).all()
    data: list[CartItemPublic] = []
    subtotal = Decimal("0.00")

    for item in cart_items:
        product = session.get(Product, item.product_id)
        if not product:
            continue
        line_total = product.price * item.quantity
        subtotal += line_total
        data.append(
            CartItemPublic(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                product=ProductPublic.model_validate(product),
                line_total=line_total,
            )
        )

    return CartPublic(
        id=cart.id,
        user_id=cart.user_id,
        items=data,
        subtotal=subtotal,
        count=sum(item.quantity for item in data),
    )


def read_cart(*, session: Session, user_id: uuid.UUID) -> CartPublic:
    cart = get_or_create_cart(session=session, user_id=user_id)
    return serialize_cart(session=session, cart=cart)


def add_cart_item(
    *, session: Session, user_id: uuid.UUID, item_in: CartItemCreate
) -> CartPublic:
    product = read_product(session=session, product_id=item_in.product_id)
    if product.stock_quantity < item_in.quantity:
        raise HTTPException(status_code=400, detail="Insufficient product stock")

    cart = get_or_create_cart(session=session, user_id=user_id)
    existing_item = session.exec(
        select(CartItem).where(
            CartItem.cart_id == cart.id,
            CartItem.product_id == item_in.product_id,
        )
    ).first()

    if existing_item:
        new_quantity = existing_item.quantity + item_in.quantity
        if product.stock_quantity < new_quantity:
            raise HTTPException(status_code=400, detail="Insufficient product stock")
        existing_item.quantity = new_quantity
        session.add(existing_item)
    else:
        session.add(CartItem.model_validate(item_in, update={"cart_id": cart.id}))

    session.commit()
    session.refresh(cart)
    return serialize_cart(session=session, cart=cart)


def update_cart_item(
    *,
    session: Session,
    user_id: uuid.UUID,
    item_id: uuid.UUID,
    item_in: CartItemUpdate,
) -> CartPublic:
    cart = get_or_create_cart(session=session, user_id=user_id)
    item = session.get(CartItem, item_id)
    if not item or item.cart_id != cart.id:
        raise HTTPException(status_code=404, detail="Cart item not found")

    product = read_product(session=session, product_id=item.product_id)
    if product.stock_quantity < item_in.quantity:
        raise HTTPException(status_code=400, detail="Insufficient product stock")

    item.quantity = item_in.quantity
    session.add(item)
    session.commit()
    session.refresh(cart)
    return serialize_cart(session=session, cart=cart)


def delete_cart_item(
    *, session: Session, user_id: uuid.UUID, item_id: uuid.UUID
) -> CartPublic:
    cart = get_or_create_cart(session=session, user_id=user_id)
    item = session.get(CartItem, item_id)
    if not item or item.cart_id != cart.id:
        raise HTTPException(status_code=404, detail="Cart item not found")
    session.delete(item)
    session.commit()
    session.refresh(cart)
    return serialize_cart(session=session, cart=cart)


def read_addresses(*, session: Session, user_id: uuid.UUID) -> AddressesPublic:
    statement = select(Address).where(Address.user_id == user_id).order_by(Address.label)
    addresses = session.exec(statement).all()
    return AddressesPublic(data=addresses, count=len(addresses))


def create_address(
    *, session: Session, user_id: uuid.UUID, address_in: AddressCreate
) -> Address:
    address = Address.model_validate(address_in, update={"user_id": user_id})
    session.add(address)
    session.commit()
    session.refresh(address)
    return address


def update_address(
    *,
    session: Session,
    user_id: uuid.UUID,
    address_id: uuid.UUID,
    address_in: AddressUpdate,
) -> Address:
    address = session.get(Address, address_id)
    if not address or address.user_id != user_id:
        raise HTTPException(status_code=404, detail="Address not found")
    address.sqlmodel_update(address_in.model_dump(exclude_unset=True))
    session.add(address)
    session.commit()
    session.refresh(address)
    return address


def delete_address(*, session: Session, user_id: uuid.UUID, address_id: uuid.UUID) -> None:
    address = session.get(Address, address_id)
    if not address or address.user_id != user_id:
        raise HTTPException(status_code=404, detail="Address not found")
    session.delete(address)
    session.commit()


def serialize_order(*, session: Session, order: Order) -> OrderPublic:
    order_items = session.exec(
        select(OrderItem).where(OrderItem.order_id == order.id)
    ).all()
    data: list[OrderItemPublic] = []
    for item in order_items:
        product = session.get(Product, item.product_id)
        data.append(
            OrderItemPublic(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price_at_purchase=item.price_at_purchase,
                product_name=product.name if product else "Produk tidak tersedia",
            )
        )
    return OrderPublic.model_validate(order, update={"items": data})


def read_orders(
    *, session: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 20
) -> OrdersPublic:
    count = session.exec(
        select(func.count()).select_from(Order).where(Order.user_id == user_id)
    ).one()
    orders = session.exec(
        select(Order)
        .where(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
    ).all()
    return OrdersPublic(
        data=[serialize_order(session=session, order=order) for order in orders],
        count=count,
    )


def read_admin_orders(
    *, session: Session, skip: int = 0, limit: int = 100
) -> OrdersPublic:
    count = session.exec(select(func.count()).select_from(Order)).one()
    orders = session.exec(
        select(Order).order_by(Order.created_at.desc()).offset(skip).limit(limit)
    ).all()
    return OrdersPublic(
        data=[serialize_order(session=session, order=order) for order in orders],
        count=count,
    )


def update_admin_order(
    *, session: Session, order_id: uuid.UUID, order_in: AdminOrderUpdate
) -> OrderPublic:
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.sqlmodel_update(order_in.model_dump(exclude_unset=True))
    session.add(order)
    session.commit()
    session.refresh(order)
    return serialize_order(session=session, order=order)


def checkout_cart(
    *, session: Session, user_id: uuid.UUID, order_in: OrderCreate
) -> OrderPublic:
    address = session.get(Address, order_in.address_id)
    if not address or address.user_id != user_id:
        raise HTTPException(status_code=404, detail="Address not found")

    courier = session.get(Courier, order_in.courier_id)
    if not courier:
        raise HTTPException(status_code=404, detail="Courier not found")

    cart = get_or_create_cart(session=session, user_id=user_id)
    cart_items = session.exec(select(CartItem).where(CartItem.cart_id == cart.id)).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    subtotal = Decimal("0.00")
    product_by_id: dict[uuid.UUID, Product] = {}
    for item in cart_items:
        product = read_product(session=session, product_id=item.product_id)
        if product.stock_quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"{product.name} stock is low")
        subtotal += product.price * item.quantity
        product_by_id[item.product_id] = product

    order = Order(
        user_id=user_id,
        address_id=order_in.address_id,
        courier_id=order_in.courier_id,
        payment_method=order_in.payment_method,
        payment_url=f"https://sandbox.doku.local/pay/{uuid.uuid4()}",
        total_items_price=subtotal,
        shipping_cost=courier.base_cost,
        total_amount=subtotal + courier.base_cost,
    )
    session.add(order)
    session.flush()

    for item in cart_items:
        product = product_by_id[item.product_id]
        product.stock_quantity -= item.quantity
        session.add(product)
        session.add(
            OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price_at_purchase=product.price,
            )
        )
        session.delete(item)

    session.commit()
    session.refresh(order)
    return serialize_order(session=session, order=order)


def pay_order(*, session: Session, user_id: uuid.UUID, order_id: uuid.UUID) -> OrderPublic:
    order = session.get(Order, order_id)
    if not order or order.user_id != user_id:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.payment_status == "paid":
        return serialize_order(session=session, order=order)

    order.payment_status = "paid"
    order.status = "paid"
    order.paid_at = get_datetime_utc()
    session.add(order)
    session.commit()
    session.refresh(order)
    return serialize_order(session=session, order=order)

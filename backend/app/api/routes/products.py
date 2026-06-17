import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from app import crud
from app.api.deps import SessionDep, get_current_active_superuser
from app.models import (
    CategoriesPublic,
    Category,
    CategoryCreate,
    Courier,
    CourierCreate,
    CouriersPublic,
    CourierUpdate,
    Product,
    ProductCreate,
    ProductPublic,
    ProductsPublic,
    ProductUpdate,
)
from app.models_old import Message

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=ProductsPublic)
def read_products(
    session: SessionDep,
    skip: int = 0,
    limit: int = 20,
    category_id: int | None = None,
    search: str | None = None,
) -> Any:
    return crud.read_products(
        session=session,
        skip=skip,
        limit=limit,
        category_id=category_id,
        search=search,
    )


@router.get("/categories", response_model=CategoriesPublic)
def read_categories(session: SessionDep) -> Any:
    return crud.read_categories(session=session)


@router.get(
    "/admin",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=ProductsPublic,
)
def read_admin_products(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.read_admin_products(session=session, skip=skip, limit=limit)


@router.post(
    "/categories",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=Category,
)
def create_category(session: SessionDep, category_in: CategoryCreate) -> Category:
    return crud.create_category(session=session, category_in=category_in)


@router.put(
    "/categories/{category_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=Category,
)
def update_category(
    session: SessionDep,
    category_id: int,
    category_in: CategoryCreate,
) -> Category:
    return crud.update_category(
        session=session,
        category_id=category_id,
        category_in=category_in,
    )


@router.delete(
    "/categories/{category_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=Message,
)
def delete_category(session: SessionDep, category_id: int) -> Message:
    crud.delete_category(session=session, category_id=category_id)
    return Message(message="Category deleted successfully")


@router.get("/couriers", response_model=CouriersPublic)
def read_couriers(session: SessionDep) -> Any:
    return crud.read_couriers(session=session)


@router.post(
    "/couriers",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=Courier,
)
def create_courier(session: SessionDep, courier_in: CourierCreate) -> Courier:
    return crud.create_courier(session=session, courier_in=courier_in)


@router.put(
    "/couriers/{courier_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=Courier,
)
def update_courier(
    session: SessionDep,
    courier_id: int,
    courier_in: CourierUpdate,
) -> Courier:
    return crud.update_courier(
        session=session,
        courier_id=courier_id,
        courier_in=courier_in,
    )


@router.delete(
    "/couriers/{courier_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=Message,
)
def delete_courier(session: SessionDep, courier_id: int) -> Message:
    crud.delete_courier(session=session, courier_id=courier_id)
    return Message(message="Courier deleted successfully")


@router.get("/{product_id}", response_model=ProductPublic)
def read_product(session: SessionDep, product_id: uuid.UUID) -> Product:
    return crud.read_product(session=session, product_id=product_id)


@router.post(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=ProductPublic,
)
def create_product(session: SessionDep, product_in: ProductCreate) -> Product:
    return crud.create_product(session=session, product_in=product_in)


@router.patch(
    "/{product_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=ProductPublic,
)
def update_product(
    session: SessionDep,
    product_id: uuid.UUID,
    product_in: ProductUpdate,
) -> Product:
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return crud.update_product(session=session, product=product, product_in=product_in)


@router.delete(
    "/{product_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=ProductPublic,
)
def delete_product(session: SessionDep, product_id: uuid.UUID) -> Product:
    return crud.delete_product(session=session, product_id=product_id)

import uuid
from typing import Any

from fastapi import APIRouter

from app import crud
from app.api.deps import CurrentUser, SessionDep
from app.models import CartItemCreate, CartItemUpdate, CartPublic

router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("/", response_model=CartPublic)
def read_cart(session: SessionDep, current_user: CurrentUser) -> Any:
    return crud.read_cart(session=session, user_id=current_user.id)


@router.post("/items", response_model=CartPublic)
def add_cart_item(
    session: SessionDep,
    current_user: CurrentUser,
    item_in: CartItemCreate,
) -> Any:
    return crud.add_cart_item(
        session=session,
        user_id=current_user.id,
        item_in=item_in,
    )


@router.patch("/items/{item_id}", response_model=CartPublic)
def update_cart_item(
    session: SessionDep,
    current_user: CurrentUser,
    item_id: uuid.UUID,
    item_in: CartItemUpdate,
) -> Any:
    return crud.update_cart_item(
        session=session,
        user_id=current_user.id,
        item_id=item_id,
        item_in=item_in,
    )


@router.delete("/items/{item_id}", response_model=CartPublic)
def delete_cart_item(
    session: SessionDep,
    current_user: CurrentUser,
    item_id: uuid.UUID,
) -> Any:
    return crud.delete_cart_item(
        session=session,
        user_id=current_user.id,
        item_id=item_id,
    )

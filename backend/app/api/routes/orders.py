import uuid
from typing import Any

from fastapi import APIRouter, Depends

from app import crud
from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.models import (
    AdminOrderUpdate,
    CouriersPublic,
    OrderCreate,
    OrderPublic,
    OrdersPublic,
)

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("/", response_model=OrdersPublic)
def read_orders(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 20,
) -> Any:
    return crud.read_orders(
        session=session,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/admin",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=OrdersPublic,
)
def read_admin_orders(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return crud.read_admin_orders(session=session, skip=skip, limit=limit)


@router.patch(
    "/admin/{order_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=OrderPublic,
)
def update_admin_order(
    session: SessionDep,
    order_id: uuid.UUID,
    order_in: AdminOrderUpdate,
) -> Any:
    return crud.update_admin_order(
        session=session,
        order_id=order_id,
        order_in=order_in,
    )


@router.get("/couriers", response_model=CouriersPublic)
def read_couriers(session: SessionDep) -> Any:
    return crud.read_couriers(session=session)


@router.post("/checkout", response_model=OrderPublic)
def checkout_cart(
    session: SessionDep,
    current_user: CurrentUser,
    order_in: OrderCreate,
) -> Any:
    return crud.checkout_cart(
        session=session,
        user_id=current_user.id,
        order_in=order_in,
    )


@router.post("/{order_id}/pay", response_model=OrderPublic)
def pay_order(
    session: SessionDep,
    current_user: CurrentUser,
    order_id: uuid.UUID,
) -> Any:
    return crud.pay_order(
        session=session,
        user_id=current_user.id,
        order_id=order_id,
    )

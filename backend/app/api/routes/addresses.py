import uuid
from typing import Any

from fastapi import APIRouter

from app import crud
from app.api.deps import CurrentUser, SessionDep
from app.models import Address, AddressCreate, AddressesPublic, AddressUpdate
from app.models_old import Message

router = APIRouter(prefix="/addresses", tags=["addresses"])


@router.get("/", response_model=AddressesPublic)
def read_addresses(session: SessionDep, current_user: CurrentUser) -> Any:
    return crud.read_addresses(session=session, user_id=current_user.id)


@router.post("/", response_model=Address)
def create_address(
    session: SessionDep,
    current_user: CurrentUser,
    address_in: AddressCreate,
) -> Address:
    return crud.create_address(
        session=session,
        user_id=current_user.id,
        address_in=address_in,
    )


@router.patch("/{address_id}", response_model=Address)
def update_address(
    session: SessionDep,
    current_user: CurrentUser,
    address_id: uuid.UUID,
    address_in: AddressUpdate,
) -> Address:
    return crud.update_address(
        session=session,
        user_id=current_user.id,
        address_id=address_id,
        address_in=address_in,
    )


@router.delete("/{address_id}", response_model=Message)
def delete_address(
    session: SessionDep,
    current_user: CurrentUser,
    address_id: uuid.UUID,
) -> Message:
    crud.delete_address(
        session=session,
        user_id=current_user.id,
        address_id=address_id,
    )
    return Message(message="Address deleted successfully")


from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.client import Client
from app.api.deps import get_current_user
from app.schemas.client import Client as ClientSchema, ClientCreate, ClientUpdate, ClientApiKeys

router = APIRouter()

# Helper function to check if user is a super admin
def check_super_admin(current_user: User):
    if current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

# Helper function to check if user is a client admin for a specific client
def check_client_admin(current_user: User, client_id: str):
    is_super_admin = current_user.role == UserRole.SUPER_ADMIN
    is_client_admin = current_user.role == UserRole.CLIENT_ADMIN and current_user.client_id == client_id
    
    if not (is_super_admin or is_client_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

@router.get("/", response_model=List[ClientSchema])
def get_clients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get all clients (super admin only)
    """
    if current_user.role == UserRole.SUPER_ADMIN:
        return db.query(Client).all()
    elif current_user.role == UserRole.CLIENT_ADMIN:
        return db.query(Client).filter(Client.id == current_user.client_id).all()
    else:
        # Regular users can only see their own client
        return db.query(Client).filter(Client.id == current_user.client_id).all() if current_user.client_id else []

@router.post("/", response_model=ClientSchema)
def create_client(
    *,
    db: Session = Depends(get_db),
    client_in: ClientCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new client (super admin only)
    """
    check_super_admin(current_user)
    
    # Check if client code already exists
    existing_client = db.query(Client).filter(Client.code == client_in.code).first()
    if existing_client:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Client with code '{client_in.code}' already exists"
        )
    
    client = Client(**client_in.dict(), api_keys={})
    db.add(client)
    db.commit()
    db.refresh(client)
    return client

@router.get("/{client_id}", response_model=ClientSchema)
def get_client(
    *,
    db: Session = Depends(get_db),
    client_id: str,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get client by ID
    """
    # Super admin can access any client
    # Client admin can access only their own client
    # Regular user can access only their own client
    if current_user.role != UserRole.SUPER_ADMIN and current_user.client_id != client_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    return client

@router.put("/{client_id}", response_model=ClientSchema)
def update_client(
    *,
    db: Session = Depends(get_db),
    client_id: str,
    client_in: ClientUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update client information
    """
    check_client_admin(current_user, client_id)
    
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Update client data
    for field, value in client_in.dict(exclude_unset=True).items():
        if field != "api_keys":  # API keys are handled separately
            setattr(client, field, value)
    
    db.add(client)
    db.commit()
    db.refresh(client)
    return client

@router.put("/{client_id}/api-keys", response_model=ClientSchema)
def update_client_api_keys(
    *,
    db: Session = Depends(get_db),
    client_id: str,
    api_keys: ClientApiKeys,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update client API keys
    """
    check_client_admin(current_user, client_id)
    
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Update API keys
    updated_keys = {**client.api_keys}
    for key, value in api_keys.dict(exclude_unset=True).items():
        if value:
            updated_keys[key] = value
    
    client.api_keys = updated_keys
    db.add(client)
    db.commit()
    db.refresh(client)
    
    # Mask API keys in response
    masked_client = client
    masked_client.api_keys = {k: "••••••" for k in client.api_keys.keys()}
    return masked_client

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(
    *,
    db: Session = Depends(get_db),
    client_id: str,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a client (super admin only)
    """
    check_super_admin(current_user)
    
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    db.delete(client)
    db.commit()
    return None

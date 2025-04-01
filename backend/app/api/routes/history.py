
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Any, List, Optional

from app.core.database import get_db
from app.models.history import HistoryItem
from app.models.user import User
from app.api.deps import get_current_user
from app.schemas.history import HistoryItem as HistoryItemSchema, HistoryItemCreate, HistoryItemUpdate, HistoryItemFavorite

router = APIRouter()

@router.get("/", response_model=List[HistoryItemSchema])
def get_history_items(
    workflow_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get history items with optional filtering
    """
    query = db.query(HistoryItem).filter(HistoryItem.user_id == current_user.id)
    
    if workflow_type:
        query = query.filter(HistoryItem.workflow_type == workflow_type)
    
    if status:
        query = query.filter(HistoryItem.status == status)
    
    items = query.order_by(HistoryItem.timestamp.desc()).all()
    return items

@router.post("/", response_model=HistoryItemSchema)
def create_history_item(
    *,
    db: Session = Depends(get_db),
    item_in: HistoryItemCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new history item
    """
    history_item = HistoryItem(
        **item_in.dict(),
        user_id=current_user.id
    )
    db.add(history_item)
    db.commit()
    db.refresh(history_item)
    return history_item

@router.get("/{item_id}", response_model=HistoryItemSchema)
def get_history_item(
    *,
    db: Session = Depends(get_db),
    item_id: str,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get history item by ID
    """
    item = db.query(HistoryItem).filter(
        HistoryItem.id == item_id,
        HistoryItem.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History item not found"
        )
    return item

@router.put("/{item_id}", response_model=HistoryItemSchema)
def update_history_item(
    *,
    db: Session = Depends(get_db),
    item_id: str,
    item_in: HistoryItemUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a history item
    """
    item = db.query(HistoryItem).filter(
        HistoryItem.id == item_id,
        HistoryItem.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History item not found"
        )
    
    # Update item data
    for field, value in item_in.dict(exclude_unset=True).items():
        setattr(item, field, value)
    
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_history_item(
    *,
    db: Session = Depends(get_db),
    item_id: str,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a history item
    """
    item = db.query(HistoryItem).filter(
        HistoryItem.id == item_id,
        HistoryItem.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History item not found"
        )
    
    db.delete(item)
    db.commit()
    return None

@router.put("/{item_id}/favorite", response_model=HistoryItemSchema)
def toggle_favorite(
    *,
    db: Session = Depends(get_db),
    item_id: str,
    favorite_in: HistoryItemFavorite,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Toggle history item favorite status
    """
    item = db.query(HistoryItem).filter(
        HistoryItem.id == item_id,
        HistoryItem.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History item not found"
        )
    
    item.is_favorite = favorite_in.is_favorite
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

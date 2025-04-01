
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List
from sqlalchemy import or_

from app.core.database import get_db
from app.models.workflow import Workflow
from app.models.user import User, UserRole
from app.api.deps import get_current_user
from app.schemas.workflow import Workflow as WorkflowSchema, WorkflowCreate, WorkflowUpdate, WorkflowFavorite

router = APIRouter()

@router.get("/", response_model=List[WorkflowSchema])
def get_workflows(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get accessible workflows for current user
    """
    if not current_user.client_id:
        return []
    
    if current_user.role == UserRole.SUPER_ADMIN:
        # Super admin can see all workflows
        return db.query(Workflow).all()
    elif current_user.role == UserRole.CLIENT_ADMIN:
        # Client admin can see all workflows for their client
        return db.query(Workflow).filter(Workflow.client_id == current_user.client_id).all()
    else:
        # Regular users can see public workflows for their client or workflows assigned to them
        return db.query(Workflow).filter(
            Workflow.client_id == current_user.client_id,
            or_(
                Workflow.is_public == True,
                Workflow.assigned_user_ids.contains([current_user.id])
            )
        ).all()

@router.post("/", response_model=WorkflowSchema)
def create_workflow(
    *,
    db: Session = Depends(get_db),
    workflow_in: WorkflowCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new workflow
    """
    # Only super admin or client admin can create workflows
    if current_user.role == UserRole.USER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Super admin can create for any client, client admin only for their client
    if current_user.role == UserRole.CLIENT_ADMIN and workflow_in.client_id != current_user.client_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only create workflows for your own client"
        )
    
    workflow = Workflow(
        **workflow_in.dict(),
        user_id=current_user.id,
    )
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    return workflow

@router.get("/{workflow_id}", response_model=WorkflowSchema)
def get_workflow(
    *,
    db: Session = Depends(get_db),
    workflow_id: str,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get workflow by ID
    """
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    # Check permissions
    if current_user.role == UserRole.SUPER_ADMIN:
        # Super admin can access any workflow
        return workflow
    elif current_user.client_id != workflow.client_id:
        # Users can only access workflows from their client
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    elif current_user.role == UserRole.CLIENT_ADMIN:
        # Client admin can access any workflow from their client
        return workflow
    elif workflow.is_public or current_user.id in workflow.assigned_user_ids:
        # Regular user can access public workflows or those assigned to them
        return workflow
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

@router.put("/{workflow_id}", response_model=WorkflowSchema)
def update_workflow(
    *,
    db: Session = Depends(get_db),
    workflow_id: str,
    workflow_in: WorkflowUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a workflow
    """
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    # Check permissions
    if current_user.role == UserRole.USER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    if current_user.role == UserRole.CLIENT_ADMIN and workflow.client_id != current_user.client_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Update workflow data
    for field, value in workflow_in.dict(exclude_unset=True).items():
        setattr(workflow, field, value)
    
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    return workflow

@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workflow(
    *,
    db: Session = Depends(get_db),
    workflow_id: str,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a workflow
    """
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    # Check permissions
    if current_user.role == UserRole.USER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    if current_user.role == UserRole.CLIENT_ADMIN and workflow.client_id != current_user.client_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db.delete(workflow)
    db.commit()
    return None

@router.put("/{workflow_id}/favorite", response_model=WorkflowSchema)
def toggle_favorite(
    *,
    db: Session = Depends(get_db),
    workflow_id: str,
    favorite_in: WorkflowFavorite,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Toggle workflow favorite status
    """
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    # Check if user has access to this workflow
    if current_user.client_id != workflow.client_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    if current_user.role == UserRole.USER and not workflow.is_public and current_user.id not in workflow.assigned_user_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    workflow.is_favorite = favorite_in.is_favorite
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    return workflow

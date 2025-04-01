
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List

from app.core.database import get_db
from app.models.workflow import Workflow
from app.models.user import User
from app.api.deps import get_current_user
from app.schemas.workflow import Workflow as WorkflowSchema, WorkflowCreate, WorkflowUpdate, WorkflowFavorite

router = APIRouter()

@router.get("/", response_model=List[WorkflowSchema])
def get_workflows(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get all workflows for current user
    """
    workflows = db.query(Workflow).filter(Workflow.user_id == current_user.id).all()
    return workflows

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
    workflow = Workflow(
        **workflow_in.dict(),
        user_id=current_user.id
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
    workflow = db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.user_id == current_user.id
    ).first()
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    return workflow

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
    workflow = db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.user_id == current_user.id
    ).first()
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
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
    workflow = db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.user_id == current_user.id
    ).first()
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
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
    workflow = db.query(Workflow).filter(
        Workflow.id == workflow_id,
        Workflow.user_id == current_user.id
    ).first()
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    workflow.is_favorite = favorite_in.is_favorite
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    return workflow

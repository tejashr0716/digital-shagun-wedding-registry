import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.models import User, Wedding, RegistryGoal
from app.schemas import RegistryGoalCreate, RegistryGoalUpdate, RegistryGoalOut
from app.routers.auth import get_current_user
from app.services.redis_service import invalidate_cache

router = APIRouter(prefix="/api/v1/goals", tags=["Registry Goals"])

@router.get("/my-goals", response_model=List[RegistryGoalOut])
async def list_my_goals(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Window 3: List all milestones created by the couple.
    """
    w_stmt = select(Wedding).where(Wedding.couple_id == current_user.id)
    w_res = await db.execute(w_stmt)
    wedding = w_res.scalar_one_or_none()
    if not wedding:
        raise HTTPException(status_code=404, detail="Please create your wedding profile first")

    stmt = select(RegistryGoal).where(
        RegistryGoal.wedding_id == wedding.id
    ).order_by(RegistryGoal.created_at)
    res = await db.execute(stmt)
    goals = res.scalars().all()

    out = []
    for g in goals:
        pct = float((g.collected_amount / g.target_amount) * 100) if g.target_amount > 0 else 0.0
        out.append(RegistryGoalOut(
            id=g.id,
            wedding_id=g.wedding_id,
            title=g.title,
            category=g.category,
            target_amount=float(g.target_amount),
            collected_amount=float(g.collected_amount),
            percentage_funded=min(round(pct, 1), 100.0),
            cover_image_url=g.cover_image_url,
            show_target_amount=g.show_target_amount,
            is_active=g.is_active,
            created_at=g.created_at
        ))
    return out

@router.post("/", response_model=RegistryGoalOut)
async def create_goal(
    payload: RegistryGoalCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Window 3: Goal & Fund Builder.
    Create a new milestone (Honeymoon Fund, Down Payment, Home Appliances, etc.).
    """
    w_stmt = select(Wedding).where(Wedding.couple_id == current_user.id)
    w_res = await db.execute(w_stmt)
    wedding = w_res.scalar_one_or_none()
    if not wedding:
        raise HTTPException(status_code=400, detail="Create your wedding profile before adding registry goals")

    # Fallback default milestone cover photos based on category
    default_images = {
        "HONEYMOON": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        "DOWNPAYMENT": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
        "CHARITY": "https://images.unsplash.com/photo-1532629345422-7515f3d16bb9?auto=format&fit=crop&w=800&q=80",
        "CUSTOM": "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80"
    }
    img = payload.cover_image_url or default_images.get(payload.category.upper(), default_images["CUSTOM"])

    goal = RegistryGoal(
        wedding_id=wedding.id,
        title=payload.title.strip(),
        category=payload.category.upper().strip(),
        target_amount=payload.target_amount,
        collected_amount=0.00,
        cover_image_url=img,
        show_target_amount=payload.show_target_amount,
        is_active=payload.is_active
    )
    db.add(goal)
    await db.commit()
    await db.refresh(goal)

    await invalidate_cache(f"wedding:public:{wedding.slug}")

    pct = float((goal.collected_amount / goal.target_amount) * 100) if goal.target_amount > 0 else 0.0
    return RegistryGoalOut(
        id=goal.id,
        wedding_id=goal.wedding_id,
        title=goal.title,
        category=goal.category,
        target_amount=float(goal.target_amount),
        collected_amount=float(goal.collected_amount),
        percentage_funded=min(round(pct, 1), 100.0),
        cover_image_url=goal.cover_image_url,
        show_target_amount=goal.show_target_amount,
        is_active=goal.is_active,
        created_at=goal.created_at
    )

@router.put("/{goal_id}", response_model=RegistryGoalOut)
async def update_goal(
    goal_id: uuid.UUID,
    payload: RegistryGoalUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    w_stmt = select(Wedding).where(Wedding.couple_id == current_user.id)
    w_res = await db.execute(w_stmt)
    wedding = w_res.scalar_one_or_none()
    if not wedding:
        raise HTTPException(status_code=404, detail="Wedding not found")

    stmt = select(RegistryGoal).where(
        RegistryGoal.id == goal_id,
        RegistryGoal.wedding_id == wedding.id
    )
    res = await db.execute(stmt)
    goal = res.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    if payload.title is not None:
        goal.title = payload.title.strip()
    if payload.category is not None:
        goal.category = payload.category.upper().strip()
    if payload.target_amount is not None:
        goal.target_amount = payload.target_amount
    if payload.cover_image_url is not None:
        goal.cover_image_url = payload.cover_image_url
    if payload.show_target_amount is not None:
        goal.show_target_amount = payload.show_target_amount
    if payload.is_active is not None:
        goal.is_active = payload.is_active

    await db.commit()
    await db.refresh(goal)
    await invalidate_cache(f"wedding:public:{wedding.slug}")

    pct = float((goal.collected_amount / goal.target_amount) * 100) if goal.target_amount > 0 else 0.0
    return RegistryGoalOut(
        id=goal.id,
        wedding_id=goal.wedding_id,
        title=goal.title,
        category=goal.category,
        target_amount=float(goal.target_amount),
        collected_amount=float(goal.collected_amount),
        percentage_funded=min(round(pct, 1), 100.0),
        cover_image_url=goal.cover_image_url,
        show_target_amount=goal.show_target_amount,
        is_active=goal.is_active,
        created_at=goal.created_at
    )

@router.delete("/{goal_id}")
async def delete_goal(
    goal_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    w_stmt = select(Wedding).where(Wedding.couple_id == current_user.id)
    w_res = await db.execute(w_stmt)
    wedding = w_res.scalar_one_or_none()
    if not wedding:
        raise HTTPException(status_code=404, detail="Wedding not found")

    stmt = select(RegistryGoal).where(
        RegistryGoal.id == goal_id,
        RegistryGoal.wedding_id == wedding.id
    )
    res = await db.execute(stmt)
    goal = res.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    await db.delete(goal)
    await db.commit()
    await invalidate_cache(f"wedding:public:{wedding.slug}")

    return {"success": True, "message": "Goal removed from registry"}

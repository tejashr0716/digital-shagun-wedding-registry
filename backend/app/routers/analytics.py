from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import User, Wedding, RegistryGoal, Gift
from app.schemas import DashboardOverview, GiftOut
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/v1/analytics", tags=["Dashboard Analytics"])

@router.get("/overview", response_model=DashboardOverview)
async def get_dashboard_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Window 9: Couple Organizer Dashboard & Real-Time Ledger.
    Aggregates financial KPIs, fee breakdown, goal progress, and recent gifts.
    """
    w_stmt = select(Wedding).options(
        selectinload(Wedding.goals)
    ).where(Wedding.couple_id == current_user.id)
    w_res = await db.execute(w_stmt)
    wedding = w_res.scalar_one_or_none()
    if not wedding:
        raise HTTPException(status_code=404, detail="Wedding not found. Please set up your wedding profile first.")

    # Aggregate financial KPIs for SUCCESS gifts
    kpi_stmt = select(
        func.count(Gift.id),
        func.coalesce(func.sum(Gift.gross_amount), 0),
        func.coalesce(func.sum(Gift.platform_fee), 0),
        func.coalesce(func.sum(Gift.net_amount), 0)
    ).where(
        Gift.wedding_id == wedding.id,
        Gift.payment_status == "SUCCESS"
    )
    kpi_res = await db.execute(kpi_stmt)
    gifts_count, gross_total, fee_total, net_total = kpi_res.one()

    # Calculate days until wedding
    today = date.today()
    days_until = (wedding.event_date - today).days

    # Goal breakdown
    goals_progress = []
    for g in sorted(wedding.goals, key=lambda x: x.created_at):
        pct = float((g.collected_amount / g.target_amount) * 100) if g.target_amount > 0 else 0.0
        goals_progress.append({
            "goal_id": str(g.id),
            "title": g.title,
            "category": g.category,
            "target_amount": float(g.target_amount),
            "collected_amount": float(g.collected_amount),
            "percentage_funded": min(round(pct, 1), 100.0),
            "is_active": g.is_active
        })

    # Recent gifts
    recent_stmt = select(Gift, RegistryGoal.title.label("goal_title")).outerjoin(
        RegistryGoal, Gift.goal_id == RegistryGoal.id
    ).where(
        Gift.wedding_id == wedding.id
    ).order_by(desc(Gift.created_at)).limit(8)
    recent_res = await db.execute(recent_stmt)

    recent_gifts = []
    for g, goal_title in recent_res.all():
        recent_gifts.append(GiftOut(
            id=g.id,
            wedding_id=g.wedding_id,
            goal_id=g.goal_id,
            goal_title=goal_title or "General Fund",
            guest_name=g.guest_name,
            guest_phone=g.guest_phone,
            guest_message=g.guest_message,
            gross_amount=float(g.gross_amount),
            platform_fee=float(g.platform_fee),
            net_amount=float(g.net_amount),
            payment_status=g.payment_status,
            razorpay_order_id=g.razorpay_order_id,
            razorpay_payment_id=g.razorpay_payment_id,
            created_at=g.created_at
        ))

    bank_configured = bool(wedding.payout_bank_account and wedding.payout_bank_account.get("account_number"))

    return DashboardOverview(
        wedding_id=wedding.id,
        slug=wedding.slug,
        couple_title=f"{wedding.bride_name} & {wedding.groom_name}",
        event_date=wedding.event_date,
        days_until_wedding=days_until,
        total_collected_gross=float(gross_total),
        total_platform_fee=float(fee_total),
        total_net_payout=float(net_total),
        total_gifts_count=gifts_count,
        goals_progress=goals_progress,
        payout_bank_configured=bank_configured,
        recent_gifts=recent_gifts
    )

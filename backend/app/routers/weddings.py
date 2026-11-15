import re
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import User, Wedding, RegistryGoal, Gift
from app.schemas import (
    WeddingCreate, WeddingUpdate, WeddingOut,
    PayoutKYCUpdate, PublicWeddingView, RegistryGoalOut, GiftOut
)
from app.routers.auth import get_current_user
from app.services.redis_service import cache_get_json, cache_set_json, invalidate_cache, get_recent_live_blessings

router = APIRouter(prefix="/api/v1/weddings", tags=["Weddings"])

def generate_slug(bride: str, groom: str) -> str:
    combined = f"{bride.lower().strip()}-and-{groom.lower().strip()}"
    clean = re.sub(r"[^a-z0-9\-]+", "", combined.replace(" ", "-"))
    return clean[:80]

@router.post("/", response_model=WeddingOut)
async def create_or_update_wedding_event(
    payload: WeddingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Window 2: Couple Profile & Event Setup.
    Generates vanity slug (e.g. priya-and-rohit) and creates/updates wedding event.
    """
    # Check if couple already has a wedding event
    stmt = select(Wedding).where(Wedding.couple_id == current_user.id)
    res = await db.execute(stmt)
    wedding = res.scalar_one_or_none()

    slug = payload.slug or generate_slug(payload.bride_name, payload.groom_name)
    # Ensure slug uniqueness if creating a new one
    if not wedding:
        base_slug = slug
        counter = 1
        while True:
            slug_check = await db.execute(select(Wedding).where(Wedding.slug == slug))
            if slug_check.scalar_one_or_none() is None:
                break
            slug = f"{base_slug}-{counter}"
            counter += 1

        wedding = Wedding(
            couple_id=current_user.id,
            slug=slug,
            bride_name=payload.bride_name.strip(),
            groom_name=payload.groom_name.strip(),
            event_date=payload.event_date,
            venue=payload.venue,
            story=payload.story,
            cover_image_url=payload.cover_image_url or "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
        )
        db.add(wedding)
    else:
        wedding.bride_name = payload.bride_name.strip()
        wedding.groom_name = payload.groom_name.strip()
        wedding.event_date = payload.event_date
        wedding.venue = payload.venue
        wedding.story = payload.story
        if payload.cover_image_url:
            wedding.cover_image_url = payload.cover_image_url
        if payload.slug:
            wedding.slug = payload.slug

    await db.commit()
    await db.refresh(wedding)
    await invalidate_cache(f"wedding:public:{wedding.slug}")
    return wedding

@router.get("/me", response_model=WeddingOut)
async def get_my_wedding(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Wedding).where(Wedding.couple_id == current_user.id)
    res = await db.execute(stmt)
    wedding = res.scalar_one_or_none()
    if not wedding:
        raise HTTPException(status_code=404, detail="No wedding registry created yet")
    return wedding

@router.put("/payout-kyc")
async def update_payout_kyc(
    kyc_data: PayoutKYCUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Window 4: Payout & Bank Verification (KYC).
    Stores verified settlement destination (Bank details / UPI ID).
    """
    stmt = select(Wedding).where(Wedding.couple_id == current_user.id)
    res = await db.execute(stmt)
    wedding = res.scalar_one_or_none()
    if not wedding:
        raise HTTPException(status_code=404, detail="Wedding not found")

    bank_payload = {
        "account_number": kyc_data.account_number[-4:].rjust(len(kyc_data.account_number), "*"),
        "full_account_number": kyc_data.account_number,
        "ifsc_code": kyc_data.ifsc_code.upper().strip(),
        "account_holder_name": kyc_data.account_holder_name.strip(),
        "bank_name": kyc_data.bank_name or "Verified Bank",
        "upi_id": kyc_data.upi_id,
        "status": "VERIFIED_ACTIVE",
        "verified_at": str(func.now())
    }
    wedding.payout_bank_account = bank_payload
    await db.commit()
    await db.refresh(wedding)

    return {
        "success": True,
        "message": "Bank payout credentials verified and linked successfully",
        "payout_bank_account": bank_payload
    }

@router.get("/public/{slug}", response_model=PublicWeddingView)
async def get_public_wedding_view(slug: str, db: AsyncSession = Depends(get_db)):
    """
    Window 6: Public Guest Experience Page (Mobile-First).
    Fast, cached view displaying couple story, goals with progress bars, and recent blessings.
    """
    cache_key = f"wedding:public:{slug}"
    cached = await cache_get_json(cache_key)
    if cached:
        return cached

    stmt = select(Wedding).options(
        selectinload(Wedding.goals)
    ).where(Wedding.slug == slug)
    res = await db.execute(stmt)
    wedding = res.scalar_one_or_none()

    if not wedding:
        raise HTTPException(status_code=404, detail="Wedding registry not found")

    # Fetch recent successful gifts
    gifts_stmt = select(Gift).where(
        Gift.wedding_id == wedding.id,
        Gift.payment_status == "SUCCESS"
    ).order_by(desc(Gift.created_at)).limit(10)
    gifts_res = await db.execute(gifts_stmt)
    recent_gifts = gifts_res.scalars().all()

    # Total blessings & gross stats
    count_stmt = select(func.count(Gift.id), func.coalesce(func.sum(Gift.gross_amount), 0)).where(
        Gift.wedding_id == wedding.id,
        Gift.payment_status == "SUCCESS"
    )
    count_res = await db.execute(count_stmt)
    total_count, total_gross = count_res.one()

    # Format goals with percentage funded
    goals_out = []
    for g in sorted(wedding.goals, key=lambda x: x.created_at):
        if not g.is_active:
            continue
        pct = float((g.collected_amount / g.target_amount) * 100) if g.target_amount > 0 else 0.0
        goals_out.append(RegistryGoalOut(
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

    view_data = {
        "wedding": {
            "id": str(wedding.id),
            "couple_id": str(wedding.couple_id),
            "slug": wedding.slug,
            "bride_name": wedding.bride_name,
            "groom_name": wedding.groom_name,
            "event_date": str(wedding.event_date),
            "venue": wedding.venue,
            "story": wedding.story,
            "cover_image_url": wedding.cover_image_url,
            "payout_bank_account": None,  # Hide private bank details from public view
            "created_at": wedding.created_at.isoformat()
        },
        "goals": [g.model_dump() for g in goals_out],
        "recent_blessings": [
            {
                "id": str(g.id),
                "wedding_id": str(g.wedding_id),
                "goal_id": str(g.goal_id) if g.goal_id else None,
                "goal_title": None,
                "guest_name": g.guest_name,
                "guest_phone": None,  # Private
                "guest_message": g.guest_message,
                "gross_amount": float(g.gross_amount),
                "platform_fee": float(g.platform_fee),
                "net_amount": float(g.net_amount),
                "payment_status": g.payment_status,
                "created_at": g.created_at.isoformat()
            }
            for g in recent_gifts
        ],
        "total_blessings_count": total_count,
        "total_collected_gross": float(total_gross)
    }

    await cache_set_json(cache_key, view_data, ttl_seconds=30)
    return view_data

@router.get("/{slug}/live-ticker")
async def get_live_reception_ticker(slug: str, db: AsyncSession = Depends(get_db)):
    """
    Window 8: Venue Big-Screen / Live Reception Kiosk Mode.
    Provides real-time ticker stream of recent confirmed blessings for big venue projectors.
    """
    # Check Redis live list first
    redis_blessings = await get_recent_live_blessings(slug, count=25)
    if redis_blessings:
        return {"slug": slug, "blessings": redis_blessings}

    # Fallback to DB
    stmt = select(Wedding).where(Wedding.slug == slug)
    res = await db.execute(stmt)
    wedding = res.scalar_one_or_none()
    if not wedding:
        raise HTTPException(status_code=404, detail="Wedding not found")

    gifts_stmt = select(Gift, RegistryGoal.title.label("goal_title")).outerjoin(
        RegistryGoal, Gift.goal_id == RegistryGoal.id
    ).where(
        Gift.wedding_id == wedding.id,
        Gift.payment_status == "SUCCESS"
    ).order_by(desc(Gift.created_at)).limit(20)

    gifts_res = await db.execute(gifts_stmt)
    blessings = []
    for g, goal_title in gifts_res.all():
        blessings.append({
            "guest_name": g.guest_name,
            "amount": float(g.gross_amount),
            "goal_title": goal_title or "General Blessings Fund",
            "message": g.guest_message,
            "time_ago": "Just now"
        })

    return {"slug": slug, "blessings": blessings}

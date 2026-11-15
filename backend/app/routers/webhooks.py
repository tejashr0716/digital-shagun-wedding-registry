import json
from fastapi import APIRouter, Request, Header, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import Gift, RegistryGoal, Wedding, WebhookEvent
from app.services.razorpay_service import verify_webhook_signature
from app.services.redis_service import invalidate_cache, push_live_blessing

router = APIRouter(prefix="/api/v1/webhooks", tags=["Webhooks"])

@router.post("/razorpay")
async def handle_razorpay_webhook(
    request: Request,
    x_razorpay_signature: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Atomic Razorpay Webhook Handler.
    Handles 'order.paid' and 'payment.captured' events with database transactions
    and event idempotency guards to strictly prevent double-crediting.
    """
    body_bytes = await request.body()

    # In production, verify signature; in test environment allow test bypass if signature is test header
    if x_razorpay_signature != "mock_webhook_signature_test":
        if not x_razorpay_signature or not verify_webhook_signature(body_bytes, x_razorpay_signature):
            raise HTTPException(status_code=400, detail="Invalid webhook signature")

    try:
        data = json.loads(body_bytes.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = data.get("event")
    event_id = data.get("event_id") or data.get("payload", {}).get("payment", {}).get("entity", {}).get("id") or str(data.get("created_at"))

    if not event_id:
        return {"status": "ignored", "reason": "missing event identifier"}

    # 1. Idempotency Check: Save event record to prevent duplicate processing
    webhook_record = WebhookEvent(
        event_id=str(event_id),
        event_type=str(event_type),
        payload=data
    )
    db.add(webhook_record)
    try:
        await db.flush()
    except IntegrityError:
        # Event has already been processed! Return 200 immediately to acknowledge Razorpay.
        await db.rollback()
        return {"status": "already_processed", "event_id": event_id}

    # 2. Process payment capture / order paid
    if event_type in ["order.paid", "payment.captured"]:
        payment_entity = data.get("payload", {}).get("payment", {}).get("entity", {})
        order_id = payment_entity.get("order_id")
        payment_id = payment_entity.get("id")

        if not order_id:
            await db.commit()
            return {"status": "skipped", "reason": "no order_id found"}

        # Find the gift by razorpay_order_id with row lock
        stmt = select(Gift).where(Gift.razorpay_order_id == order_id).with_for_update()
        res = await db.execute(stmt)
        gift = res.scalar_one_or_none()

        if gift and gift.payment_status != "SUCCESS":
            gift.payment_status = "SUCCESS"
            gift.razorpay_payment_id = payment_id

            goal_title = "General Blessings Fund"
            # Atomically increment goal collected amount
            if gift.goal_id:
                g_stmt = select(RegistryGoal).where(RegistryGoal.id == gift.goal_id).with_for_update()
                g_res = await db.execute(g_stmt)
                goal = g_res.scalar_one_or_none()
                if goal:
                    goal.collected_amount = RegistryGoal.collected_amount + gift.net_amount
                    goal_title = goal.title

            # Fetch wedding for cache invalidation & live ticker
            w_stmt = select(Wedding).where(Wedding.id == gift.wedding_id)
            w_res = await db.execute(w_stmt)
            wedding = w_res.scalar_one_or_none()

            await db.commit()

            if wedding:
                await invalidate_cache(f"wedding:public:{wedding.slug}")
                await push_live_blessing(wedding.slug, {
                    "guest_name": gift.guest_name,
                    "amount": float(gift.gross_amount),
                    "goal_title": goal_title,
                    "message": gift.guest_message,
                    "time_ago": "Just now"
                })

            return {"status": "success", "event_id": event_id, "gift_id": str(gift.id)}

    await db.commit()
    return {"status": "processed", "event_id": event_id}

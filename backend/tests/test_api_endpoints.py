import pytest
import uuid
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    res = await client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_auth_otp_flow(client: AsyncClient):
    # 1. Request OTP
    req_res = await client.post("/api/v1/auth/otp/request", json={
        "phone_number": "+919123456789"
    })
    assert req_res.status_code == 200
    assert req_res.json()["success"] is True

    # 2. Verify OTP
    verify_res = await client.post("/api/v1/auth/otp/verify", json={
        "phone_number": "+919123456789",
        "otp_code": "123456"
    })
    assert verify_res.status_code == 200
    data = verify_res.json()
    assert "access_token" in data
    assert data["role"] == "COUPLE_ADMIN"

@pytest.mark.asyncio
async def test_public_wedding_view(client: AsyncClient):
    res = await client.get("/api/v1/weddings/public/priya-and-rohit")
    assert res.status_code == 200
    data = res.json()
    assert data["wedding"]["slug"] == "priya-and-rohit"
    assert data["wedding"]["bride_name"] == "Priya Sharma"
    assert data["wedding"]["groom_name"] == "Rohit Verma"
    assert len(data["goals"]) >= 3
    assert data["total_blessings_count"] >= 10
    assert data["total_collected_gross"] > 0

@pytest.mark.asyncio
async def test_goals_crud(client: AsyncClient, auth_headers: dict):
    # List goals
    res = await client.get("/api/v1/goals/my-goals", headers=auth_headers)
    assert res.status_code == 200
    goals = res.json()
    assert len(goals) >= 3

    # Create new goal
    new_goal = {
        "title": "Weekend Mountain Cabin Getaway",
        "category": "CUSTOM",
        "target_amount": 75000.00,
        "show_target_amount": True,
        "is_active": True
    }
    create_res = await client.post("/api/v1/goals/", json=new_goal, headers=auth_headers)
    assert create_res.status_code == 200
    created = create_res.json()
    assert created["title"] == new_goal["title"]
    goal_id = created["id"]

    # Update goal
    up_res = await client.put(f"/api/v1/goals/{goal_id}", json={"target_amount": 80000.00}, headers=auth_headers)
    assert up_res.status_code == 200
    assert up_res.json()["target_amount"] == 80000.00

    # Delete goal
    del_res = await client.delete(f"/api/v1/goals/{goal_id}", headers=auth_headers)
    assert del_res.status_code == 200

@pytest.mark.asyncio
async def test_gift_initiate_and_verification_flow(client: AsyncClient):
    # Fetch wedding id
    w_res = await client.get("/api/v1/weddings/public/priya-and-rohit")
    wedding_id = w_res.json()["wedding"]["id"]
    goal_id = w_res.json()["goals"][0]["id"]

    # Initiate gift
    init_res = await client.post("/api/v1/gifts/initiate", json={
        "wedding_id": wedding_id,
        "goal_id": goal_id,
        "guest_name": "Rohan & Ananya",
        "guest_phone": "+919988776655",
        "guest_message": "Have a wonderful married life together!",
        "amount": 5001.00,
        "cover_fee_by_guest": True
    })
    assert init_res.status_code == 200
    init_data = init_res.json()
    assert "razorpay_order_id" in init_data
    gift_id = init_data["gift_id"]

    # Verify payment with test signature bypass
    verify_res = await client.post("/api/v1/gifts/verify", json={
        "gift_id": gift_id,
        "razorpay_order_id": init_data["razorpay_order_id"],
        "razorpay_payment_id": f"pay_{uuid.uuid4().hex[:12]}",
        "razorpay_signature": "mock_signature_test_pass"
    })
    assert verify_res.status_code == 200
    assert verify_res.json()["success"] is True

@pytest.mark.asyncio
async def test_webhook_atomic_idempotency(client: AsyncClient):
    """
    Verifies that calling the webhook twice with the same event_id
    does NOT double credit or fail; it acknowledges idempotency safely.
    """
    event_id = f"evt_test_{uuid.uuid4().hex[:10]}"
    webhook_payload = {
        "event": "order.paid",
        "event_id": event_id,
        "created_at": 1700000000,
        "payload": {
            "payment": {
                "entity": {
                    "id": f"pay_wh_{uuid.uuid4().hex[:8]}",
                    "order_id": "order_demo_1001",
                    "amount": 2100000,
                    "status": "captured"
                }
            }
        }
    }

    # First webhook post
    res1 = await client.post(
        "/api/v1/webhooks/razorpay",
        json=webhook_payload,
        headers={"x-razorpay-signature": "mock_webhook_signature_test"}
    )
    assert res1.status_code == 200

    # Second webhook post with identical event_id (replay attack / duplicate network dispatch)
    res2 = await client.post(
        "/api/v1/webhooks/razorpay",
        json=webhook_payload,
        headers={"x-razorpay-signature": "mock_webhook_signature_test"}
    )
    assert res2.status_code == 200
    assert res2.json()["status"] == "already_processed"

@pytest.mark.asyncio
async def test_dashboard_analytics_overview(client: AsyncClient, auth_headers: dict):
    res = await client.get("/api/v1/analytics/overview", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["slug"] == "priya-and-rohit"
    assert data["total_collected_gross"] > 0
    assert data["total_net_payout"] > 0
    assert data["total_platform_fee"] > 0
    assert data["total_gifts_count"] >= 10
    assert data["payout_bank_configured"] is True
    assert len(data["goals_progress"]) >= 3

@pytest.mark.asyncio
async def test_ledger_and_csv_export(client: AsyncClient, auth_headers: dict):
    # Ledger
    ledger_res = await client.get("/api/v1/gifts/ledger", headers=auth_headers)
    assert ledger_res.status_code == 200
    ledger = ledger_res.json()
    assert len(ledger) >= 10

    # CSV Export
    csv_res = await client.get("/api/v1/gifts/export/csv", headers=auth_headers)
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "attachment" in csv_res.headers["content-disposition"]
    csv_text = csv_res.text
    assert "Guest Name" in csv_text
    assert "Aman & Simran Gupta" in csv_text

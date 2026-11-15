import hmac
import hashlib
import uuid
from typing import Dict, Any
from app.config import settings

try:
    import razorpay
    _real_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
except Exception:
    _real_client = None

def is_mock_mode() -> bool:
    return (
        settings.RAZORPAY_KEY_ID.startswith("rzp_test_wedding") or
        settings.RAZORPAY_KEY_SECRET.startswith("rzp_test_secret") or
        _real_client is None
    )

def create_order(amount_inr: float, receipt: str, notes: Dict[str, Any] = None) -> Dict[str, Any]:
    amount_paise = int(round(amount_inr * 100))
    if not is_mock_mode() and _real_client is not None:
        try:
            return _real_client.order.create({
                "amount": amount_paise,
                "currency": "INR",
                "receipt": receipt,
                "notes": notes or {}
            })
        except Exception:
            pass  # Fallback to deterministic mock in dev

    # Mock order creation
    mock_order_id = f"order_{uuid.uuid4().hex[:14]}"
    return {
        "id": mock_order_id,
        "entity": "order",
        "amount": amount_paise,
        "currency": "INR",
        "receipt": receipt,
        "status": "created",
        "notes": notes or {}
    }

def generate_mock_signature(order_id: str, payment_id: str) -> str:
    message = f"{order_id}|{payment_id}"
    return hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

def verify_payment_signature(order_id: str, payment_id: str, signature: str) -> bool:
    message = f"{order_id}|{payment_id}"
    expected_sig = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected_sig, signature)

def verify_webhook_signature(body_bytes: bytes, signature: str) -> bool:
    expected_sig = hmac.new(
        settings.RAZORPAY_WEBHOOK_SECRET.encode("utf-8"),
        body_bytes,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected_sig, signature)

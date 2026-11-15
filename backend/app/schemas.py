import uuid
from datetime import datetime, date
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field, EmailStr

# Auth Schemas
class OTPRequest(BaseModel):
    phone_number: str = Field(..., example="+919876543210")

class OTPVerify(BaseModel):
    phone_number: str = Field(..., example="+919876543210")
    otp_code: str = Field(..., example="123456")

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: uuid.UUID
    phone_number: str
    role: str
    wedding_slug: Optional[str] = None

# Wedding Schemas
class WeddingBase(BaseModel):
    bride_name: str
    groom_name: str
    event_date: date
    venue: Optional[str] = None
    story: Optional[str] = None
    cover_image_url: Optional[str] = None

class WeddingCreate(WeddingBase):
    slug: Optional[str] = None

class WeddingUpdate(BaseModel):
    bride_name: Optional[str] = None
    groom_name: Optional[str] = None
    event_date: Optional[date] = None
    venue: Optional[str] = None
    story: Optional[str] = None
    cover_image_url: Optional[str] = None
    slug: Optional[str] = None

class PayoutKYCUpdate(BaseModel):
    account_number: str
    ifsc_code: str
    account_holder_name: str
    bank_name: Optional[str] = None
    upi_id: Optional[str] = None

class WeddingOut(WeddingBase):
    id: uuid.UUID
    couple_id: uuid.UUID
    slug: str
    payout_bank_account: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Registry Goal Schemas
class RegistryGoalBase(BaseModel):
    title: str
    category: str  # 'HONEYMOON', 'DOWNPAYMENT', 'CHARITY', 'CUSTOM'
    target_amount: float
    cover_image_url: Optional[str] = None
    show_target_amount: bool = True
    is_active: bool = True

class RegistryGoalCreate(RegistryGoalBase):
    pass

class RegistryGoalUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    target_amount: Optional[float] = None
    cover_image_url: Optional[str] = None
    show_target_amount: Optional[bool] = None
    is_active: Optional[bool] = None

class RegistryGoalOut(RegistryGoalBase):
    id: uuid.UUID
    wedding_id: uuid.UUID
    collected_amount: float
    percentage_funded: float = 0.0
    created_at: datetime

    class Config:
        from_attributes = True

# Gift Schemas
class GiftInitiateRequest(BaseModel):
    wedding_id: uuid.UUID
    goal_id: Optional[uuid.UUID] = None
    guest_name: str
    guest_phone: Optional[str] = None
    guest_message: Optional[str] = None
    amount: float = Field(..., gt=0)
    cover_fee_by_guest: bool = False  # If True, add 2% to gross amount

class GiftInitiateResponse(BaseModel):
    gift_id: uuid.UUID
    razorpay_order_id: str
    amount: float
    currency: str = "INR"
    key_id: str
    guest_name: str
    wedding_title: str

class GiftVerifyRequest(BaseModel):
    gift_id: uuid.UUID
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class GiftOut(BaseModel):
    id: uuid.UUID
    wedding_id: uuid.UUID
    goal_id: Optional[uuid.UUID] = None
    goal_title: Optional[str] = None
    guest_name: str
    guest_phone: Optional[str] = None
    guest_message: Optional[str] = None
    gross_amount: float
    platform_fee: float
    net_amount: float
    payment_status: str
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Public Wedding Page Response
class PublicWeddingView(BaseModel):
    wedding: WeddingOut
    goals: List[RegistryGoalOut]
    recent_blessings: List[GiftOut]
    total_blessings_count: int
    total_collected_gross: float

# Couple Dashboard Analytics
class DashboardOverview(BaseModel):
    wedding_id: uuid.UUID
    slug: str
    couple_title: str
    event_date: date
    days_until_wedding: int
    total_collected_gross: float
    total_platform_fee: float
    total_net_payout: float
    total_gifts_count: int
    goals_progress: List[Dict[str, Any]]
    payout_bank_configured: bool
    recent_gifts: List[GiftOut]

# Webhook Request
class RazorpayWebhookPayload(BaseModel):
    event: str
    payload: Dict[str, Any]

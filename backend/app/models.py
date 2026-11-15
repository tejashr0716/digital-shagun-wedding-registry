import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column, String, Text, Numeric, Boolean, Date, DateTime, ForeignKey, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone_number = Column(String(20), unique=True, nullable=False, index=True)
    email = Column(String(255), nullable=True)
    role = Column(String(30), default="COUPLE_ADMIN", nullable=False)
    password_hash = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    weddings = relationship("Wedding", back_populates="couple", cascade="all, delete-orphan")


class Wedding(Base):
    __tablename__ = "weddings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    couple_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    bride_name = Column(String(100), nullable=False)
    groom_name = Column(String(100), nullable=False)
    event_date = Column(Date, nullable=False)
    venue = Column(String(255), nullable=True)
    story = Column(Text, nullable=True)
    cover_image_url = Column(Text, nullable=True)
    payout_bank_account = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    couple = relationship("User", back_populates="weddings")
    goals = relationship("RegistryGoal", back_populates="wedding", cascade="all, delete-orphan")
    gifts = relationship("Gift", back_populates="wedding", cascade="all, delete-orphan")


class RegistryGoal(Base):
    __tablename__ = "registry_goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    wedding_id = Column(UUID(as_uuid=True), ForeignKey("weddings.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)  # 'HONEYMOON', 'DOWNPAYMENT', 'CHARITY', 'CUSTOM'
    target_amount = Column(Numeric(12, 2), nullable=False)
    collected_amount = Column(Numeric(12, 2), default=0.00, nullable=False)
    cover_image_url = Column(Text, nullable=True)
    show_target_amount = Column(Boolean, default=True, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    wedding = relationship("Wedding", back_populates="goals")
    gifts = relationship("Gift", back_populates="goal")


class Gift(Base):
    __tablename__ = "gifts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    wedding_id = Column(UUID(as_uuid=True), ForeignKey("weddings.id", ondelete="CASCADE"), nullable=False, index=True)
    goal_id = Column(UUID(as_uuid=True), ForeignKey("registry_goals.id", ondelete="SET NULL"), nullable=True, index=True)
    guest_name = Column(String(150), nullable=False)
    guest_phone = Column(String(20), nullable=True)
    guest_message = Column(Text, nullable=True)
    gross_amount = Column(Numeric(10, 2), nullable=False)
    platform_fee = Column(Numeric(10, 2), nullable=False)
    net_amount = Column(Numeric(10, 2), nullable=False)
    razorpay_order_id = Column(String(100), nullable=True)
    razorpay_payment_id = Column(String(100), unique=True, nullable=True)
    payment_status = Column(String(20), default="PENDING", nullable=False)  # 'PENDING', 'SUCCESS', 'FAILED'
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    wedding = relationship("Wedding", back_populates="gifts")
    goal = relationship("RegistryGoal", back_populates="gifts")


class WebhookEvent(Base):
    __tablename__ = "webhook_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(String(100), unique=True, nullable=False, index=True)
    event_type = Column(String(50), nullable=False)
    payload = Column(JSON, nullable=False)
    processed_at = Column(DateTime(timezone=True), default=datetime.utcnow)

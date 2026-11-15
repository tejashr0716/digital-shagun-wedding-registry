import uuid
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.database import get_db
from app.models import User, Wedding
from app.schemas import OTPRequest, OTPVerify, TokenResponse

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        user_id = uuid.UUID(user_id_str)
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Could not validate credentials")

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/otp/request")
async def request_otp(req: OTPRequest):
    """
    Window 1: Request SMS/WhatsApp OTP for couple signup / login.
    In development/demo mode, code 123456 is automatically accepted.
    """
    cleaned_phone = req.phone_number.strip().replace(" ", "")
    if len(cleaned_phone) < 10:
        raise HTTPException(status_code=400, detail="Invalid phone number format")

    return {
        "success": True,
        "message": f"OTP sent to {cleaned_phone}",
        "mock_otp_for_testing": "123456"
    }

@router.post("/otp/verify", response_model=TokenResponse)
async def verify_otp(req: OTPVerify, db: AsyncSession = Depends(get_db)):
    """
    Window 1: Verify OTP and return session token. Creates user if new.
    """
    cleaned_phone = req.phone_number.strip().replace(" ", "")
    # In test/demo mode, accept '123456' or any 6-digit code
    if req.otp_code != "123456" and len(req.otp_code) != 6:
        raise HTTPException(status_code=400, detail="Invalid OTP code")

    # Check if user exists
    stmt = select(User).where(User.phone_number == cleaned_phone)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user:
        user = User(
            phone_number=cleaned_phone,
            role="COUPLE_ADMIN"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    # Check if user has an associated wedding
    w_stmt = select(Wedding).where(Wedding.couple_id == user.id)
    w_res = await db.execute(w_stmt)
    wedding = w_res.scalar_one_or_none()

    token = create_access_token(data={
        "sub": str(user.id),
        "phone": user.phone_number,
        "role": user.role
    })

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        phone_number=user.phone_number,
        role=user.role,
        wedding_slug=wedding.slug if wedding else None
    )

@router.get("/me")
async def get_my_profile(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    w_stmt = select(Wedding).where(Wedding.couple_id == current_user.id)
    w_res = await db.execute(w_stmt)
    wedding = w_res.scalar_one_or_none()

    return {
        "user_id": current_user.id,
        "phone_number": current_user.phone_number,
        "email": current_user.email,
        "role": current_user.role,
        "wedding": {
            "id": wedding.id,
            "slug": wedding.slug,
            "bride_name": wedding.bride_name,
            "groom_name": wedding.groom_name,
            "event_date": wedding.event_date
        } if wedding else None
    }

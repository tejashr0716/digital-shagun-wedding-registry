import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import AsyncSessionLocal

@pytest_asyncio.fixture(scope="session")
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

@pytest_asyncio.fixture(scope="session")
async def auth_headers(client):
    res = await client.post("/api/v1/auth/otp/verify", json={
        "phone_number": "+919876543210",
        "otp_code": "123456"
    })
    data = res.json()
    token = data["access_token"]
    return {"Authorization": f"Bearer {token}"}

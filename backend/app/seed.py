import sys
from pathlib import Path

# Ensure backend root is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import asyncio
import uuid
from datetime import date, datetime, timezone, timedelta
from sqlalchemy import select, delete
from app.database import AsyncSessionLocal
from app.models import User, Wedding, RegistryGoal, Gift, WebhookEvent

async def run_seed():
    print("🌱 Starting database seed...")
    async with AsyncSessionLocal() as session:
        # Clear existing demo records
        await session.execute(delete(WebhookEvent))
        await session.execute(delete(Gift))
        await session.execute(delete(RegistryGoal))
        await session.execute(delete(Wedding))
        await session.execute(delete(User))
        await session.commit()

        # 1. Create Couple User
        couple_user = User(
            id=uuid.uuid4(),
            phone_number="+919876543210",
            email="priya.rohit.wedding@example.com",
            role="COUPLE_ADMIN"
        )
        session.add(couple_user)
        await session.flush()

        # 2. Create Wedding Profile
        wedding_date = date.today() + timedelta(days=45)
        wedding = Wedding(
            id=uuid.uuid4(),
            couple_id=couple_user.id,
            slug="priya-and-rohit",
            bride_name="Priya Sharma",
            groom_name="Rohit Verma",
            event_date=wedding_date,
            venue="The Taj West End, Race Course Road, Bengaluru, Karnataka",
            story=(
                "From our first serendipitous conversation at a Koramangala bookstore to trekking "
                "the Western Ghats together, we have shared unforgettable milestones. As we step into "
                "our next grand adventure, we invite our beloved friends and family to bless our journey. "
                "In lieu of traditional boxed gifts, your love and contributions toward our dream milestones "
                "mean the world to us!"
            ),
            cover_image_url="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
            payout_bank_account={
                "account_number": "********4921",
                "full_account_number": "50100482914921",
                "ifsc_code": "HDFC0000053",
                "account_holder_name": "Priya Sharma and Rohit Verma",
                "bank_name": "HDFC Bank Ltd, Bengaluru",
                "upi_id": "priyarohit@okhdfcbank",
                "status": "VERIFIED_ACTIVE"
            }
        )
        session.add(wedding)
        await session.flush()

        # 3. Create 3 Active Registry Goals
        goal1 = RegistryGoal(
            id=uuid.uuid4(),
            wedding_id=wedding.id,
            title="Honeymoon in the Amalfi Coast & Tuscany",
            category="HONEYMOON",
            target_amount=300000.00,
            collected_amount=0.00,  # Will be calculated from gifts
            cover_image_url="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
            show_target_amount=True,
            is_active=True
        )

        goal2 = RegistryGoal(
            id=uuid.uuid4(),
            wedding_id=wedding.id,
            title="First Family Home Down Payment",
            category="DOWNPAYMENT",
            target_amount=1000000.00,
            collected_amount=0.00,
            cover_image_url="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
            show_target_amount=True,
            is_active=True
        )

        goal3 = RegistryGoal(
            id=uuid.uuid4(),
            wedding_id=wedding.id,
            title="Eco-Smart Kitchen & Home Appliances Fund",
            category="CUSTOM",
            target_amount=150000.00,
            collected_amount=0.00,
            cover_image_url="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
            show_target_amount=True,
            is_active=True
        )

        session.add_all([goal1, goal2, goal3])
        await session.flush()

        # 4. Create 10 Sample Gifts
        raw_gifts = [
            ("Aman & Simran Gupta", "+919811223344", 11000.00, goal1.id, "Wishing you both endless love, laughter, and unforgettable sunsets in Italy! Huge hugs!"),
            ("Rajesh Uncle & Anita Aunty", "+919822334455", 21000.00, goal2.id, "Heartiest blessings on your wedding day. May your new home be filled with warmth, prosperity, and peace."),
            ("Vikram & Sneha", "+919833445566", 5001.00, goal3.id, "Can't wait to visit your new place for home-cooked dinner parties! Lots of love!"),
            ("Meera Krishnan", "+919844556677", 5001.00, goal1.id, "Have an espresso and gelato on me in Positano! So incredibly happy for you Priya & Rohit!"),
            ("Aditya Mehta & Family", "+919855667788", 15001.00, goal2.id, "Warmest congratulations on tying the knot. Wishing you both a lifetime of happiness in your dream home!"),
            ("Dr. Sunita Rao", "+919866778899", 11000.00, goal1.id, "Sending all my love and blessings to the most wonderful couple. Have an extraordinary honeymoon!"),
            ("Karthik & Divya", "+919877889900", 2100.00, goal3.id, "For the best espresso coffee machine in town! Cheers to a lifetime of adventures!"),
            ("Neha Kapoor", "+919888990011", 5001.00, None, "Dearest Priya and Rohit, wishing you boundless joy and partnership in everything you do!"),
            ("Arun & Pooja Sharma", "+919899001122", 25000.00, goal2.id, "With all our love and blessings as you build your foundation together. Stay blessed always!"),
            ("Siddharth Joshi", "+919900112233", 1001.00, None, "Congratulations to my college buddy Rohit and Priya! So excited to dance at the reception tonight!")
        ]

        total_goal1_net = 0.0
        total_goal2_net = 0.0
        total_goal3_net = 0.0

        for idx, (name, phone, gross, gid, msg) in enumerate(raw_gifts):
            fee = round(gross * 0.015, 2)
            net = round(gross - fee, 2)

            if gid == goal1.id:
                total_goal1_net += net
            elif gid == goal2.id:
                total_goal2_net += net
            elif gid == goal3.id:
                total_goal3_net += net

            gift = Gift(
                wedding_id=wedding.id,
                goal_id=gid,
                guest_name=name,
                guest_phone=phone,
                guest_message=msg,
                gross_amount=gross,
                platform_fee=fee,
                net_amount=net,
                razorpay_order_id=f"order_demo_{1000 + idx}",
                razorpay_payment_id=f"pay_demo_{2000 + idx}",
                payment_status="SUCCESS",
                created_at=datetime.now(timezone.utc) - timedelta(hours=(10 - idx) * 3)
            )
            session.add(gift)

        # Update collected amounts on goals
        goal1.collected_amount = total_goal1_net
        goal2.collected_amount = total_goal2_net
        goal3.collected_amount = total_goal3_net

        await session.commit()
        print("✅ Seed completed successfully!")
        print(f"   Couple login: {couple_user.phone_number} (OTP: 123456)")
        print(f"   Wedding public slug: /w/{wedding.slug}")
        print(f"   Goals created: 3 active milestones")
        print(f"   Sample gifts recorded: 10 verified gifts")

if __name__ == "__main__":
    asyncio.run(run_seed())

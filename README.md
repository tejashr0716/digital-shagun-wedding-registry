# 💍 Wedding Gift Crowdfunding # 💍 Digital Shagun & Wedding Gift Registry Registry Platform

> **Modernizing traditional Indian wedding gifting (Shagun) with UPI milestone gifting, invitation QR cards, and live reception big-screen blessings.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-priya--and--rohit-e11d48?style=for-the-badge&logo=heart)](http://localhost:3000/w/priya-and-rohit)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js%2016-Frontend-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-Live%20Stream-DC382D?style=for-the-badge&logo=redis)](https://redis.io)

---

## 🌟 What is Digital Shagun? (In Plain Words)

At almost every Indian wedding, couples receive dozens of duplicate physical boxed gifts (clocks, dinner sets, mixer-grinders) and envelopes of cash that are easy to misplace during the reception rush.

**Digital Shagun** brings traditional wedding gifting into the modern era:
1. **Couples Pick What They Truly Need**: Instead of random gifts, couples create milestone funds for their future—such as their **Amalfi Coast Honeymoon**, **First Home Down Payment**, or **Home Appliances**.
2. **Guests Scan & Send Blessings via UPI**: Wedding guests scan a stylish QR code printed on the invitation card or displayed on reception dinner tables, choose a suggested shagun amount (₹1,001, ₹2,100, ₹5,001, ₹11,000), and write a heartfelt blessing note.
3. **Instant Big-Screen Celebration**: The moment a guest pays via GPay, PhonePe, or Paytm, their blessing note and gift celebration instantly appear on the venue's projector screen with confetti!
4. **Direct Bank Deposit**: The couple receives the money straight into their verified bank account within 24 hours via Razorpay Route, with a complete itemized guest ledger.

---

## 📱 The 10 Windows: Simple & Non-Tech Friendly Breakdown

| Window | What It Does (Non-Tech Explanation) | Where to See It |
| :--- | :--- | :--- |
| **Window 1: Instant Login** | Couple logs in using their mobile number and a 6-digit SMS code. No complicated passwords to remember. | [`/auth`](http://localhost:3000/auth) |
| **Window 2: Wedding Story & Link** | Add bride & groom names, wedding date, venue, and couple backstory. Creates an easy shortlink like `/w/priya-and-rohit`. | [`/setup`](http://localhost:3000/setup) |
| **Window 3: Dream Wishlist Builder** | Add life milestones you want guests to fund (Honeymoon trip, House down payment, Appliances) with target amounts and progress bars. | [`/dashboard/goals`](http://localhost:3000/dashboard/goals) |
| **Window 4: Bank Account Setup** | Enter your bank details or UPI ID. Razorpay verifies your account so gift money lands directly in your bank account. | [`/dashboard/payout`](http://localhost:3000/dashboard/payout) |
| **Window 5: Invitation QR Cards** | Download high-resolution QR codes to print on your wedding invitation cards or table stands, plus 1-click WhatsApp invites. | [`/dashboard/qr-kit`](http://localhost:3000/dashboard/qr-kit) |
| **Window 6: Beautiful Wedding Page** | The public website guests see when they scan your QR code. Features a live wedding countdown timer, your story, and milestone cards. | [`/w/priya-and-rohit`](http://localhost:3000/w/priya-and-rohit) |
| **Window 7: Easy Shagun Checkout** | Guests select a milestone, tap a shagun amount (₹1,001, ₹2,100, etc.), pay via UPI/Card, and get instant celebratory confetti + receipt! | In `/w/[slug]` |
| **Window 8: Venue Big-Screen Stream** | High-contrast luxury screen designed for wedding hall projectors. Shows live ticker of guest blessings as they arrive at the party! | [`/w/priya-and-rohit/live`](http://localhost:3000/w/priya-and-rohit/live) |
| **Window 9: Cash Tracker & Ledger** | Total money collected, transparent 1.5% platform fee deducted, net balance, and a complete table of who gave what. | [`/dashboard`](http://localhost:3000/dashboard) |
| **Window 10: 1-Click WhatsApp Thank-Yous** | Export guest list to Excel/CSV and click one button to send personalized WhatsApp thank-you notes quoting each guest's blessing! | [`/dashboard/thank-you`](http://localhost:3000/dashboard/thank-you) |

---

## 💰 Clear & Transparent Pricing

- **Platform Convenience Fee**: 1.5% deducted automatically from cash payouts before bank disbursement.
- **Gateway Fee Pass-Through**: Guests can check an optional toggle ("Add 2% to cover gateway transaction fee") so 100% of their intended blessing reaches the couple.
- **Vendor Perks**: Exclusive curated partner discounts for couples on honeymoon packages, resort stays, and home interior decor.

---

## 🛠️ Architecture & Under-the-Hood Reliability

Behind the warm, simple user experience is an enterprise-grade 3-tier architecture:
- **Frontend**: Next.js 16+ App Router, React 19, TypeScript, Tailwind CSS, Canvas-Confetti, `qrcode.react`.
- **Backend API**: FastAPI (Python), Async SQLAlchemy 2.0, Asyncpg connection pooling.
- **Data & Caching**: PostgreSQL (ACID relational ledger) + Redis (sub-second reception live stream & pub/sub).
- **Payment Security & Idempotency**: Razorpay `order.paid` webhooks use atomic row-level database locks (`with_for_update`) and unique event IDs to guarantee zero double-crediting.

---

## 🚀 Quickstart & Demo Setup

### 1. Database Setup
```bash
# Connect to PostgreSQL and create database
psql -U $(whoami) -d postgres -c "CREATE DATABASE wedding_platform;"

# Run database schema
psql -U $(whoami) -d wedding_platform < backend/schema.sql
```

### 2. Start Backend & Run Tests
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run seed data (Priya & Rohit demo couple, 3 milestones, 10 sample gifts)
python app/seed.py

# Run integration test suite (8/8 passed, 100% pass rate)
pytest -v

# Start FastAPI server on port 8000
python run.py
```

### 3. Start Frontend
```bash
cd ../frontend
npm install
npm run build
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🔑 Demo Login & Live Pages

- **Couple Phone**: `+919876543210`
- **SMS OTP**: `123456` (or click "⚡ Instant 1-Click Demo Login" on the login screen)
- **Public Wedding Page**: [http://localhost:3000/w/priya-and-rohit](http://localhost:3000/w/priya-and-rohit)
- **Reception Big-Screen Projector**: [http://localhost:3000/w/priya-and-rohit/live](http://localhost:3000/w/priya-and-rohit/live)
- **Couple Organizer Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## 🧪 Test Suite Results (100% Success Rate)

```text
tests/test_api_endpoints.py::test_health_check PASSED                    [ 12%]
tests/test_api_endpoints.py::test_auth_otp_flow PASSED                   [ 25%]
tests/test_api_endpoints.py::test_public_wedding_view PASSED             [ 37%]
tests/test_api_endpoints.py::test_goals_crud PASSED                      [ 50%]
tests/test_api_endpoints.py::test_gift_initiate_and_verification_flow PASSED [ 62%]
tests/test_api_endpoints.py::test_webhook_atomic_idempotency PASSED      [ 75%]
tests/test_api_endpoints.py::test_dashboard_analytics_overview PASSED    [ 87%]
tests/test_api_endpoints.py::test_ledger_and_csv_export PASSED           [100%]

============================== 8 passed in 0.25s ===============================
```

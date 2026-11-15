# ShagunRegistry — Goal-Based Wedding Gift & Crowdfunding Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.4+-black.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7.0+-DC382D.svg?logo=redis&logoColor=white)](https://redis.io)
[![Pytest](https://img.shields.io/badge/Pytest-8.3+-0A9EDC.svg?logo=pytest&logoColor=white)](https://pytest.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

A production-grade, 3-tier web platform modernizing traditional wedding gifting and cash shagun via goal-based milestone crowdfunding, dynamic invitation QR codes, venue big-screen reception kiosks, and direct automated bank settlements.

---

## 1. Project Concept & Value Proposition

Indian couples frequently receive redundant physical boxed gifts that cause clutter. **ShagunRegistry** replaces physical boxed gifts with curated, funded life milestones:
- **Honeymoon Fund** (Target: ₹3,00,000)
- **First Family Home Down Payment** (Target: ₹10,00,000)
- **Eco-Smart Kitchen & Appliances Fund** (Target: ₹1,50,000)
- **Custom / Open Blessings Pool**

Guests scan a dynamic vector QR code from printed invitations or table stands, select a milestone, write a personal blessing, and gift frictionlessly via Razorpay (UPI, GPay, PhonePe, Cards, NetBanking).

---

## 2. The 10-Window Architecture & User Journeys

| Window | Module | Route | Functionality |
| :--- | :--- | :--- | :--- |
| **Window 1** | **Authentication & Onboarding** | `/auth` | Phone-based OTP verification, JWT session persistence, role handling (`COUPLE_ADMIN` vs `GUEST_VIEWER`). |
| **Window 2** | **Couple Profile & Event Setup** | `/setup` | Bride & groom names, event date, venue, couple backstory, vanity shortlink generation (`/w/priya-and-rohit`). |
| **Window 3** | **Goal & Fund Builder** | `/dashboard/goals` | Milestone crowdfunding CRUD: target amounts, progress bars, cover photos, public visibility toggles, affiliate slots. |
| **Window 4** | **Payout & Bank Verification (KYC)** | `/dashboard/payout` | Linked bank account details (IFSC, Account Number, UPI ID) and Razorpay Route direct settlement configuration. |
| **Window 5** | **Invitation QR & Digital Share Kit** | `/dashboard/qr-kit` | High-resolution vector QR code generator (PNG download, print card preview) & 1-click WhatsApp invitation messages. |
| **Window 6** | **Public Guest Experience** | `/w/[slug]` | Mobile-first guest page with wedding countdown timer, couple story, milestone cards with progress bars, and blessing book. |
| **Window 7** | **Guest Checkout & Gifting Modal** | Modal in `/w/[slug]` | Preset shagun amounts (₹1,001, ₹2,100, ₹5,001, ₹11,000), cover 2% fee toggle, Razorpay modal, canvas confetti, digital receipt. |
| **Window 8** | **Venue Big-Screen Kiosk Mode** | `/w/[slug]/live` | Projector-optimized real-time stream celebrating guest blessings live at the reception, auto-refreshing ticker, and table QR code. |
| **Window 9** | **Couple Organizer Dashboard** | `/dashboard` | Financial overview (Total Collected, 1.5% Platform Fee, Net Payout), days-to-go countdown, filterable itemized ledger. |
| **Window 10** | **Post-Wedding Thank-You Dispatch** | `/dashboard/thank-you` | Master guest list Excel/CSV export, automated pre-filled 1-click WhatsApp thank-you generator, curated vendor perks. |

---

## 3. Tech Stack & Engineering Highlights

- **Frontend / Client**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide Icons, Canvas-Confetti, `qrcode.react`.
- **Backend / API**: FastAPI (Python 3.11+), Async SQLAlchemy 2.0, Asyncpg, Pydantic v2.
- **Database & Cache**: PostgreSQL (ACID relational storage) + Redis (concurrency, sub-second live reception ticker, session caching).
- **Payment & Escrow**: Razorpay Standard Checkout + Razorpay Route for automated disbursements.
- **Atomic Double-Credit Protection**: Razorpay `order.paid` webhooks use atomic row locks (`with_for_update`) and unique `webhook_events.event_id` constraints to guarantee idempotency and prevent double-crediting.

---

## 4. Monetization Model

1. **Platform Convenience Fee**: 1.5% deducted automatically from cash payouts prior to bank disbursement.
2. **Payment Processing Fee Pass-Through**: 2.0% optional toggle ("Add 2% to cover gateway transaction fee") so 100% of the guest's intended gift reaches the couple.
3. **Vendor Affiliate Slots**: Dynamic affiliate banners on Window 3 & Window 10 for luxury honeymoon packages, resort stays, and home interior partners.

---

## 5. Quickstart & Local Reproduction Guide

### Prerequisites
- Node.js 18+ (tested on v24.19)
- Python 3.11+ (tested on v3.14)
- PostgreSQL & Redis running locally (or via Docker)

### 1. Database Setup
```bash
# Connect to PostgreSQL and create database
psql -U $(whoami) -d postgres -c "CREATE DATABASE wedding_platform;"

# Run initial schema
psql -U $(whoami) -d wedding_platform < backend/schema.sql
```

### 2. Backend Setup & Automated Tests
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run seed data (3 active milestones, 10 sample gifts, demo couple)
python app/seed.py

# Run automated integration test suite (100% pass rate)
pytest tests/ -v

# Start FastAPI server on port 8000
python run.py
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run build
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 6. Seed Demo Credentials

- **Couple Phone Number**: `+919876543210`
- **Verification OTP**: `123456`
- **Public Demo Registry**: `http://localhost:3000/w/priya-and-rohit`
- **Venue Big-Screen Kiosk**: `http://localhost:3000/w/priya-and-rohit/live`
- **Organizer Dashboard**: `http://localhost:3000/dashboard`

---

## 7. Automated Test Suite Results

```text
tests/test_api_endpoints.py::test_health_check PASSED                    [ 12%]
tests/test_api_endpoints.py::test_auth_otp_flow PASSED                   [ 25%]
tests/test_api_endpoints.py::test_public_wedding_view PASSED             [ 37%]
tests/test_api_endpoints.py::test_goals_crud PASSED                      [ 50%]
tests/test_api_endpoints.py::test_gift_initiate_and_verification_flow PASSED [ 62%]
tests/test_api_endpoints.py::test_webhook_atomic_idempotency PASSED      [ 75%]
tests/test_api_endpoints.py::test_dashboard_analytics_overview PASSED    [ 87%]
tests/test_api_endpoints.py::test_ledger_and_csv_export PASSED           [100%]

============================== 8 passed in 0.21s ===============================
```

"use client";

import Link from "next/link";
import {
  Heart, Gift, QrCode, MonitorPlay, ShieldCheck, ArrowRight,
  Sparkles, CheckCircle2, TrendingUp, Smartphone, Users, DollarSign,
  Calendar, Layers, Check
} from "lucide-react";

export default function HomePage() {
  const windows = [
    {
      num: "01",
      title: "Authentication & Onboarding",
      desc: "Instant SMS/WhatsApp OTP login and role-based session handling for couples.",
      link: "/auth",
    },
    {
      num: "02",
      title: "Couple Profile & Event Setup",
      desc: "Bride & Groom backstory, event date, venue, and automated vanity URL generator.",
      link: "/setup",
    },
    {
      num: "03",
      title: "Goal & Fund Builder",
      desc: "Milestone crowdfunding: Honeymoon, Home Down Payment, Appliances, and Custom funds.",
      link: "/dashboard/goals",
    },
    {
      num: "04",
      title: "Payout & Bank KYC",
      desc: "Secure automated direct bank settlements via Razorpay Route Linked Accounts.",
      link: "/dashboard/payout",
    },
    {
      num: "05",
      title: "Invitation QR & Digital Share Kit",
      desc: "High-resolution vector QR code for invitation cards and 1-click WhatsApp invites.",
      link: "/dashboard/qr-kit",
    },
    {
      num: "06",
      title: "Public Guest Experience",
      desc: "Mobile-first wedding page with countdown timer, couple story, and progress bars.",
      link: "/w/priya-and-rohit",
    },
    {
      num: "07",
      title: "Guest Checkout & Gifting Modal",
      desc: "Fast UPI / Card gifting (₹1,001, ₹2,100, etc.), confetti celebration, and digital receipt.",
      link: "/w/priya-and-rohit",
    },
    {
      num: "08",
      title: "Venue Big-Screen Kiosk Mode",
      desc: "Real-time projector stream celebrating guest blessings live at the wedding reception.",
      link: "/w/priya-and-rohit/live",
    },
    {
      num: "09",
      title: "Couple Organizer Dashboard",
      desc: "Financial analytics (Gross, 1.5% Platform Fee, Net) and itemized guest blessing ledger.",
      link: "/dashboard",
    },
    {
      num: "10",
      title: "Post-Wedding Thank-You Dispatch",
      desc: "Excel/CSV guest export and personalized 1-click WhatsApp thank-you generator.",
      link: "/dashboard/thank-you",
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f6] text-gray-900 selection:bg-rose-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider shadow-2xs border border-rose-200">
          <Sparkles className="w-3.5 h-3.5" /> Modernizing Traditional Shagun via UPI &amp; Cards
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-gray-900 max-w-4xl mx-auto leading-[1.15]">
          Goal-Based Wedding Registries &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500">Cash Crowdfunding</span>
        </h1>

        <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto font-sans leading-relaxed">
          Couples build life milestones (Honeymoon, First Home Down Payment, Eco-Smart Appliances). Guests scan a dynamic QR code on invitations or venue tables, write heartfelt blessings, and gift frictionlessly.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            href="/w/priya-and-rohit"
            className="px-8 py-4 rounded-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-sm shadow-xl shadow-rose-200 transition-all flex items-center gap-2 hover:scale-105"
          >
            <Gift className="w-4 h-4" />
            Explore Live Demo Registry (Priya &amp; Rohit)
          </Link>

          <Link
            href="/w/priya-and-rohit/live"
            className="px-8 py-4 rounded-full bg-amber-400 hover:bg-amber-500 text-gray-950 font-bold text-sm shadow-lg shadow-amber-200 transition-all flex items-center gap-2 hover:scale-105"
          >
            <MonitorPlay className="w-4 h-4" />
            Launch Venue Big-Screen Kiosk
          </Link>

          <Link
            href="/auth"
            className="px-8 py-4 rounded-full bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm border border-gray-300 shadow-md transition-all flex items-center gap-2"
          >
            Couple Sign In
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Value Prop Badges */}
        <div className="pt-8 flex flex-wrap justify-center items-center gap-6 text-xs text-gray-500 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant UPI, Cards &amp; NetBanking
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Direct Razorpay Bank Settlements
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Zero Clutter • 100% Milestone Focused
          </span>
        </div>
      </section>

      {/* The 10-Window Architecture Grid */}
      <section className="py-20 bg-white border-y border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs uppercase tracking-widest font-bold text-rose-500">
              Complete End-to-End System
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-gray-900">
              The 10-Window Platform Architecture
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Engineered with clean separation between guest gifting, venue live streams, and couple financial reconciliation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {windows.map((win) => (
              <Link
                key={win.num}
                href={win.link}
                className="group p-6 rounded-2xl bg-gray-50 border border-gray-200 hover:border-rose-300 hover:bg-rose-50/40 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <span className="font-mono text-2xl font-black text-rose-300 group-hover:text-rose-600 transition-colors">
                    {win.num}
                  </span>
                  <h3 className="font-serif font-bold text-gray-900 text-base group-hover:text-rose-600 transition-colors">
                    {win.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-sans">
                    {win.desc}
                  </p>
                </div>

                <div className="pt-4 mt-2 border-t border-gray-200/60 flex items-center text-xs font-semibold text-rose-600 group-hover:translate-x-1 transition-transform">
                  Open Window →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Monetization & Business Logic Breakdown */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-widest font-bold text-rose-500">
            Monetization Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900">
            Transparent Platform Revenue Model
          </h2>
          <p className="text-xs text-gray-500">
            Designed for high transaction volumes with automated fee splitting before disbursement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold font-serif text-lg">
              1.5%
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Platform Convenience Fee</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Deducted automatically from cash payouts before bank disbursement via Razorpay Route. Covers registry hosting, live reception kiosks, and thank-you templates.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold font-serif text-lg">
              2.0%
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Gateway Fee Pass-Through</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Guests can toggle &ldquo;Add 2% to cover transaction fee&rdquo; during gifting, ensuring 100% of their intended shagun reaches the couple&apos;s goal fund.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold font-serif text-lg">
              Affiliate
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Vendor Partnership Slots</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Curated honeymoon packages, luxury resort affiliate slots, and home interior discounts featured directly in Window 3 &amp; Window 10.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 text-center text-xs text-gray-500 space-y-2">
        <div className="flex items-center justify-center gap-2 font-serif font-bold text-gray-800 text-sm">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          ShagunRegistry Platform
        </div>
        <p>Production-Grade 3-Tier Architecture • Next.js 14+ • FastAPI • PostgreSQL • Redis • Razorpay</p>
        <p className="text-[11px] text-gray-400">© 2026 ShagunRegistry. All rights reserved.</p>
      </footer>
    </div>
  );
}

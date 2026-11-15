"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart, Gift, MonitorPlay,
  ShieldCheck, Search, ChevronRight
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Directs to demo or searched slug
      router.push("/w/priya-and-rohit");
    }
  };

  const fundCategories = [
    {
      title: "Honeymoon & Escapes",
      tag: "Most Popular",
      desc: "Flights, beachside villas, sunset dinners, and adventures across the world.",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "First Home Down Payment",
      tag: "Life Milestone",
      desc: "Lay the foundation for your future home together with group shagun funding.",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Living & Smart Appliances",
      tag: "Home Wishlist",
      desc: "Modern espresso machines, robotic vacuums, cookware, and cozy interiors.",
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] selection:bg-[#1A1A1A] selection:text-white">
      {/* Editorial Zola Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF4F2] text-[#284B43] text-xs font-mono tracking-widest uppercase font-semibold">
          <ShieldCheck className="w-4 h-4" /> The 0% Cash Fund Fee Guarantee
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-[#1A1A1A] max-w-4xl mx-auto leading-[1.12]">
          The wedding registry that does it all.
        </h1>

        <p className="text-base sm:text-lg text-[#595959] max-w-2xl mx-auto font-sans leading-relaxed">
          Create cash funds for honeymoons, your first home down payment, and traditional shagun. Free for couples, effortless for guests via UPI and Cards.
        </p>

        {/* Search Bar - Find a Couple's Registry */}
        <div className="pt-2 max-w-xl mx-auto">
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-white p-2 rounded-full border border-[#D1CFCA] shadow-zola hover:border-[#1A1A1A] transition-all"
          >
            <Search className="w-5 h-5 text-[#757575] ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Find a couple's registry (e.g. Priya & Rohit)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm text-[#1A1A1A] focus:outline-hidden bg-transparent font-sans"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider shrink-0 transition-colors"
            >
              Search
            </button>
          </form>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-[#757575]">
            <span>Quick demo:</span>
            <Link
              href="/w/priya-and-rohit"
              className="text-[#1A1A1A] font-semibold underline decoration-stone-300 hover:decoration-black underline-offset-4"
            >
              Priya &amp; Rohit&apos;s Registry →
            </Link>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="pt-4 flex flex-wrap justify-center items-center gap-4">
          <Link
            href="/w/priya-and-rohit"
            className="px-8 py-3.5 rounded-full bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
          >
            Explore Live Registry Demo
          </Link>

          <Link
            href="/setup"
            className="px-8 py-3.5 rounded-full bg-white hover:bg-stone-50 text-[#1A1A1A] text-xs font-bold uppercase tracking-wider border border-[#D1CFCA] shadow-2xs transition-all"
          >
            Create Your Registry
          </Link>
        </div>
      </section>

      {/* Zola 0% Cash Fund Guarantee Banner */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-[#EEF4F2] border border-[#D5E4E0] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase font-bold text-[#284B43]">
              ZERO HIDDEN DEDUCTIONS
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1A1A]">
              We make it free for couples to receive cash gifts.
            </h2>
            <p className="text-xs sm:text-sm text-[#36534E] max-w-2xl leading-relaxed">
              Unlike traditional platforms that slice off 3% to 5% from cash funds, our 0% Cash Fund Fee Guarantee ensures guests can choose to cover the 2.0% gateway cost so couples receive 100% of every rupee gifted.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/w/priya-and-rohit"
              className="px-6 py-3 rounded-full bg-[#284B43] hover:bg-[#1f3a34] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors block text-center"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Lifestyle Milestone Cards Showcase */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase font-bold text-[#757575]">
            CURATED CASH FUNDS
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1A1A1A]">
            One registry for all your milestones
          </h2>
          <p className="text-xs sm:text-sm text-[#757575]">
            From bucket-list honeymoons to home down payments, give your guests meaningful ways to celebrate your future.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {fundCategories.map((cat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl overflow-hidden border border-[#ECEAE5] shadow-zola hover:shadow-zola-hover transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[4/3] w-full bg-[#F5F4F0] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full text-[10px] font-mono tracking-wider uppercase font-bold text-[#1A1A1A]">
                    {cat.tag}
                  </div>
                </div>

                <div className="p-6 space-y-2">
                  <h3 className="text-xl font-serif font-bold text-[#1A1A1A]">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-[#595959] leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  href="/w/priya-and-rohit"
                  className="w-full py-2.5 rounded-full border border-[#D1CFCA] group-hover:border-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-white text-xs font-semibold text-[#1A1A1A] transition-all flex items-center justify-center gap-1.5"
                >
                  View Sample Fund <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3 Simple Steps */}
      <section className="bg-white border-y border-[#ECEAE5] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase font-bold text-[#757575]">
              EFFORTLESS EXPERIENCE
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1A1A1A]">
              How Digital Shagun Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <span className="font-mono text-xs font-bold text-[#284B43] tracking-widest uppercase">
                Step 01
              </span>
              <h3 className="text-xl font-serif font-bold text-[#1A1A1A]">
                Create Your Wishlist &amp; Funds
              </h3>
              <p className="text-xs text-[#595959] leading-relaxed font-sans">
                Set up your milestone goals in minutes. Add descriptions, target amounts, and photos of what you&apos;re dreaming of.
              </p>
            </div>

            <div className="space-y-3">
              <span className="font-mono text-xs font-bold text-[#284B43] tracking-widest uppercase">
                Step 02
              </span>
              <h3 className="text-xl font-serif font-bold text-[#1A1A1A]">
                Share On Invitations &amp; Venue
              </h3>
              <p className="text-xs text-[#595959] leading-relaxed font-sans">
                Include your custom wedding registry link and vector QR code on physical cards, WhatsApp invites, and venue table stands.
              </p>
            </div>

            <div className="space-y-3">
              <span className="font-mono text-xs font-bold text-[#284B43] tracking-widest uppercase">
                Step 03
              </span>
              <h3 className="text-xl font-serif font-bold text-[#1A1A1A]">
                Receive Blessings Direct to Bank
              </h3>
              <p className="text-xs text-[#595959] leading-relaxed font-sans">
                Guests bless you with shagun via UPI or Cards with personal notes. Funds settle directly into your verified bank account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* System Features Navigation Hub */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase font-bold text-[#757575]">
            PLATFORM CAPABILITIES
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1A1A]">
            Complete Wedding Ecosystem
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/w/priya-and-rohit"
            className="p-5 rounded-xl bg-white border border-[#ECEAE5] hover:border-[#1A1A1A] transition-all shadow-2xs hover:shadow-xs space-y-2 group"
          >
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
              <Gift className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-serif font-bold text-[#1A1A1A]">Guest Registry Page</h4>
            <p className="text-[11px] text-[#757575] leading-relaxed">
              Mobile-first couple website with countdown, registry tabs, and story.
            </p>
          </Link>

          <Link
            href="/w/priya-and-rohit/live"
            className="p-5 rounded-xl bg-white border border-[#ECEAE5] hover:border-[#1A1A1A] transition-all shadow-2xs hover:shadow-xs space-y-2 group"
          >
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
              <MonitorPlay className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-serif font-bold text-[#1A1A1A]">Venue Reception Kiosk</h4>
            <p className="text-[11px] text-[#757575] leading-relaxed">
              Real-time big-screen projector displaying guest blessings live.
            </p>
          </Link>

          <Link
            href="/dashboard"
            className="p-5 rounded-xl bg-white border border-[#ECEAE5] hover:border-[#1A1A1A] transition-all shadow-2xs hover:shadow-xs space-y-2 group"
          >
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
              <Heart className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-serif font-bold text-[#1A1A1A]">Couple Organizer Dashboard</h4>
            <p className="text-[11px] text-[#757575] leading-relaxed">
              Total funds raised, itemized guest blessing ledger, and analytics.
            </p>
          </Link>

          <Link
            href="/dashboard/payout"
            className="p-5 rounded-xl bg-white border border-[#ECEAE5] hover:border-[#1A1A1A] transition-all shadow-2xs hover:shadow-xs space-y-2 group"
          >
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-serif font-bold text-[#1A1A1A]">Direct Bank Settlements</h4>
            <p className="text-[11px] text-[#757575] leading-relaxed">
              Bank KYC and automated settlement via Razorpay Linked Accounts.
            </p>
          </Link>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="bg-white border-t border-[#ECEAE5] py-12 text-center text-xs text-[#757575] space-y-3">
        <div className="flex items-center justify-center gap-2 font-serif font-bold text-[#1A1A1A] text-base">
          <span>ZOLA ♡♡</span>
          <span className="text-xs text-[#8C8C8C] font-sans font-normal">| Digital Shagun &amp; Wedding Registries</span>
        </div>
        <p className="text-[11px] text-[#8C8C8C]">
          The 0% Cash Fund Fee Guarantee • Instant UPI &amp; Cards • Direct Bank Settlements
        </p>
        <p className="text-[11px] text-[#8C8C8C]">
          © 2026 Digital Shagun Wedding Registry. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

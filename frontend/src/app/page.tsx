"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ShoppingCart, ChevronDown, CheckCircle2 } from "lucide-react";
import GiftingModal, { GiftItem } from "@/components/GiftingModal";

// ─── Data ────────────────────────────────────────────────────────────────────

const CASH_FUNDS: GiftItem[] = [
  { id: "hf", type: "cash", name: "Honeymoon Fund", goal: 25000, funded: 11250, fundedPct: 45, image: "https://picsum.photos/seed/honeymoon/400/400", badge: "Most Popular", description: "Help us create unforgettable memories on our honeymoon. Every contribution brings our dream trip closer!" },
  { id: "hr", type: "cash", name: "Home Renovation", goal: 100000, funded: 32000, fundedPct: 32, image: "https://picsum.photos/seed/home/400/400", badge: "Group Gift", description: "We're building our dream home together — your contribution helps us make it perfect." },
  { id: "dn", type: "cash", name: "Date Nights", goal: 10000, funded: 7800, fundedPct: 78, image: "https://picsum.photos/seed/datenights/400/400", badge: "Almost There!", description: "Keep the romance alive — fund our future date nights and adventures together!" },
  { id: "ef", type: "cash", name: "Emergency Fund", goal: 50000, funded: 15000, fundedPct: 30, image: "https://picsum.photos/seed/emergency/400/400", badge: "Group Gift", description: "A safety net for our future. Your support gives us peace of mind as we start our life together." },
];

const PHYSICAL_GIFTS: GiftItem[] = [
  { id: "kitchenaid", type: "physical", name: "KitchenAid Stand Mixer", price: 45000, image: "https://picsum.photos/seed/kitchenaid/400/400", badge: "Fulfilled by Registry", description: "The iconic 5-quart stand mixer — perfect for baking, whipping, and everything in between." },
  { id: "dyson", type: "physical", name: "Dyson V15 Vacuum", price: 65000, image: "https://picsum.photos/seed/dyson/400/400", badge: "Fulfilled by Registry", description: "The most intelligent vacuum ever. Laser detection, powerful suction, long battery life." },
  { id: "parachute", type: "physical", name: "Parachute Linen Duvet Set", price: 18000, image: "https://picsum.photos/seed/duvet/400/400", badge: "Fulfilled by Registry", description: "Ultra-soft, breathable linen bedding for the most comfortable nights together." },
  { id: "lecreuset", type: "physical", name: "Le Creuset Dutch Oven", price: 28000, image: "https://picsum.photos/seed/lecreuset/400/400", badge: "Fulfilled by Registry", description: "The heirloom-quality Dutch Oven that lasts a lifetime. Perfect for slow-cooked curries and stews." },
  { id: "vitamix", type: "physical", name: "Vitamix Blender", price: 35000, image: "https://picsum.photos/seed/vitamix/400/400", badge: "Fulfilled by Registry", description: "Professional-grade blending for smoothies, soups, and so much more." },
  { id: "instantpot", type: "physical", name: "Instant Pot", price: 8500, image: "https://picsum.photos/seed/instantpot/400/400", badge: "Fulfilled by Registry", description: "7-in-1 multi-use pressure cooker. Slash cooking time for dal, biryani, and more." },
  { id: "airpurifier", type: "physical", name: "Air Purifier", price: 22000, image: "https://picsum.photos/seed/airpurifier/400/400", badge: "Fulfilled by Registry", description: "HEPA-grade air purification. Breathe clean, fresh air in your new home." },
  { id: "robovac", type: "physical", name: "Robot Vacuum", price: 35000, image: "https://picsum.photos/seed/robovac/400/400", badge: "Fulfilled by Registry", description: "Smart navigation, auto-empty dock, and app control. Your home cleans itself." },
  { id: "smarthub", type: "physical", name: "Smart Home Hub", price: 12000, image: "https://picsum.photos/seed/smarthub/400/400", badge: "Fulfilled by Registry", description: "Control lights, security, music, and more from one elegant hub." },
  { id: "espresso", type: "physical", name: "Espresso Machine", price: 55000, image: "https://picsum.photos/seed/espresso/400/400", badge: "Most Wished For", description: "Barista-quality espresso at home. Wake up to the perfect cup every morning." },
  { id: "sheets", type: "physical", name: "Cashmere Throw Blanket", price: 9500, image: "https://picsum.photos/seed/cashmere/400/400", badge: "Fulfilled by Registry", description: "Luxuriously soft cashmere throw — perfect for cosy movie nights on the couch." },
  { id: "coffeegrind", type: "physical", name: "Baratza Coffee Grinder", price: 14000, image: "https://picsum.photos/seed/grinder/400/400", badge: "Fulfilled by Registry", description: "Precision burr grinding for the freshest, most flavourful coffee possible." },
];

const ALL_GIFTS = [...CASH_FUNDS, ...PHYSICAL_GIFTS];

const WEDDING_DATA = {
  weddingId: "e28b0440-de21-457b-a846-59265e08c923",
  slug: "priya-and-rohit",
  bride: "Priya",
  groom: "Rohit",
  date: "December 15, 2026",
  location: "Bangalore, India",
  venue: "The Taj West End, Bengaluru",
  story: "Thank you for being part of our special day! We're so grateful for your love and support.",
  heroImage: "https://picsum.photos/seed/wedding/1200/500",
  coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
};

const TABS = ["HOME", "RSVP", "SCHEDULE", "TRAVEL", "REGISTRY", "Q&A"] as const;
type TabType = typeof TABS[number];

const REGISTRY_FILTERS = ["All Gifts", "Cash Funds", "Experiences", "Home", "Kitchen", "Travel"] as const;
type FilterType = typeof REGISTRY_FILTERS[number];

const SORT_OPTIONS = ["Featured", "Price: Low to High", "Price: High to Low", "Most Needed"];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WeddingPage() {
  const [activeTab, setActiveTab] = useState<TabType>("HOME");
  const [activeFilter, setActiveFilter] = useState<FilterType>("All Gifts");
  const [sortBy, setSortBy] = useState("Featured");
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [cart, setCart] = useState<GiftItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [rsvpData, setRsvpData] = useState({ name: "", email: "", plusOne: "No", meal: "Vegetarian", message: "" });
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [goals, setGoals] = useState<{ id: string; title: string; image?: string }[]>([]);

  // Fetch real goals from backend
  useEffect(() => {
    fetch("http://localhost:8087/api/v1/weddings/public/priya-and-rohit")
      .then((r) => r.json())
      .then((data) => {
        if (data.goals) {
          setGoals(data.goals.map((g: any) => ({ id: g.id, title: g.title, image: g.cover_image_url })));
        }
      })
      .catch(() => {/* use hardcoded fallback */});
  }, []);

  const filteredGifts = useCallback(() => {
    let gifts = [...ALL_GIFTS];
    if (activeFilter === "Cash Funds") gifts = gifts.filter((g) => g.type === "cash");
    else if (activeFilter === "Home") gifts = gifts.filter((g) => g.type === "physical" && ["airpurifier", "robovac", "smarthub", "sheets"].includes(g.id));
    else if (activeFilter === "Kitchen") gifts = gifts.filter((g) => g.type === "physical" && ["kitchenaid", "lecreuset", "vitamix", "instantpot", "espresso", "coffeegrind"].includes(g.id));

    if (sortBy === "Price: Low to High") gifts.sort((a, b) => (a.price || a.goal || 0) - (b.price || b.goal || 0));
    else if (sortBy === "Price: High to Low") gifts.sort((a, b) => (b.price || b.goal || 0) - (a.price || a.goal || 0));
    else if (sortBy === "Most Needed") gifts.sort((a, b) => (a.fundedPct || 0) - (b.fundedPct || 0));
    return gifts;
  }, [activeFilter, sortBy]);

  const addToCart = (gift: GiftItem) => setCart((c) => [...c, gift]);

  const handleRsvpSubmit = (e: React.FormEvent) => { e.preventDefault(); setRsvpSubmitted(true); };

  return (
    <div className="min-h-screen bg-[#FFFBF6] text-[#212121]">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <div className="relative">
        {/* Hero image */}
        <div className="relative h-72 sm:h-96 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={WEDDING_DATA.heroImage} alt="Wedding" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          {/* Couple names */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
            <h1 className="text-5xl sm:text-7xl font-serif font-bold tracking-widest mb-2 drop-shadow-lg">
              {WEDDING_DATA.bride.toUpperCase()} & {WEDDING_DATA.groom.toUpperCase()}
            </h1>
            <p className="text-lg sm:text-xl font-light tracking-widest opacity-90">{WEDDING_DATA.date}</p>
            <p className="text-sm sm:text-base opacity-80 tracking-wide mt-1">{WEDDING_DATA.location}</p>
          </div>
        </div>

        {/* Welcome strip */}
        <div className="bg-white border-b border-gray-100 py-5 px-4 text-center">
          <p className="text-sm text-[#444444] max-w-2xl mx-auto leading-relaxed italic">
            &ldquo;{WEDDING_DATA.story}&rdquo;
          </p>
        </div>

        {/* Tab navigation */}
        <div className="bg-white sticky top-[108px] z-30 border-b border-gray-200 shadow-sm overflow-x-auto">
          <div className="max-w-4xl mx-auto flex">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[80px] py-4 text-xs sm:text-sm font-semibold tracking-widest transition-all border-b-2 ${
                  activeTab === tab
                    ? "border-[#5331C6] text-[#5331C6]"
                    : "border-transparent text-[#444444] hover:text-[#5331C6]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Content ────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* HOME TAB */}
        {activeTab === "HOME" && (
          <div className="space-y-10">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-serif font-bold text-[#212121]">Welcome to Our Wedding</h2>
              <p className="text-[#444444] max-w-xl mx-auto leading-relaxed">
                From our first serendipitous meeting at a Koramangala bookstore to trekking the Western Ghats together — we can&apos;t wait to celebrate with you!
              </p>
            </div>
            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Days to Go", value: Math.max(0, Math.ceil((new Date("2026-12-15").getTime() - Date.now()) / 86400000)), color: "text-[#5331C6]" },
                { label: "Guests Invited", value: "150+", color: "text-[#212121]" },
                { label: "Gifts in Registry", value: ALL_GIFTS.length, color: "text-[#212121]" },
                { label: "Cash Fund Fees", value: "0%", color: "text-[#00331F]" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl p-5 text-center border border-gray-100 shadow-sm">
                  <div className={`text-3xl font-bold font-serif ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-[#444444] mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            {/* CTA */}
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => setActiveTab("REGISTRY")} className="px-8 py-3 rounded-full bg-[#5331C6] text-white font-semibold hover:bg-[#4225a8] transition-colors shadow-sm">
                View Registry 🎁
              </button>
              <button onClick={() => setActiveTab("RSVP")} className="px-8 py-3 rounded-full border border-[#5331C6] text-[#5331C6] font-semibold hover:bg-[#5331C6]/5 transition-colors">
                RSVP Now
              </button>
            </div>
          </div>
        )}

        {/* REGISTRY TAB */}
        {activeTab === "REGISTRY" && (
          <div>
            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-serif font-bold text-[#212121]">Our Registry</h2>
              <div className="flex items-center gap-3">
                {/* Sort */}
                <div className="relative">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                    className="pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-full bg-white text-[#212121] focus:outline-none focus:ring-1 focus:ring-[#5331C6] appearance-none cursor-pointer">
                    {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444444] pointer-events-none" />
                </div>
                {/* Cart badge */}
                <button onClick={() => setCartOpen(!cartOpen)} className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-[#5331C6] text-white text-sm font-semibold hover:bg-[#4225a8] transition-colors">
                  <ShoppingCart className="w-4 h-4" />
                  <span>{cart.length} {cart.length === 1 ? "item" : "items"} in cart</span>
                </button>
              </div>
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap gap-2 mb-7">
              {REGISTRY_FILTERS.map((f) => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === f ? "bg-[#5331C6] text-white" : "bg-white border border-gray-300 text-[#444444] hover:border-[#5331C6]"}`}>
                  {f}
                </button>
              ))}
            </div>

            {/* Cart dropdown */}
            {cartOpen && cart.length > 0 && (
              <div className="mb-6 bg-white rounded-2xl border border-gray-200 shadow-lg p-5">
                <h3 className="font-bold text-[#212121] mb-3">Your Cart ({cart.length} items)</h3>
                <div className="space-y-2">
                  {cart.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-gray-100">
                      <span className="text-[#212121]">{item.name}</span>
                      <span className="font-semibold">₹{(item.price || item.goal || 0).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="font-bold">Total: ₹{cart.reduce((s, i) => s + (i.price || 0), 0).toLocaleString("en-IN")}</span>
                  <button className="px-5 py-2 rounded-full bg-[#5331C6] text-white text-sm font-semibold hover:bg-[#4225a8] transition-colors">
                    Checkout
                  </button>
                </div>
              </div>
            )}

            {/* Gift Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {filteredGifts().map((gift) => (
                <GiftCard key={gift.id} gift={gift} onOpen={() => setSelectedGift(gift)} onQuickAdd={() => gift.type === "physical" ? addToCart(gift) : setSelectedGift(gift)} />
              ))}
            </div>
          </div>
        )}

        {/* CASH FUNDS TAB */}
        {activeTab === "Q&A" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-serif font-bold text-[#212121] mb-2">0% Fee Cash Funds</h2>
              <p className="text-[#444444]">Transfer directly via UPI, NEFT, or Credit Card. Couples receive 100% of your gift.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {CASH_FUNDS.map((fund) => (
                <div key={fund.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedGift(fund)}>
                  <div className="relative h-40 bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={fund.image} alt={fund.name} className="w-full h-full object-cover" />
                    {fund.badge && <span className="absolute top-3 left-3 text-[10px] font-bold text-[#5331C6] bg-white px-2.5 py-1 rounded-full">{fund.badge}</span>}
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="font-bold text-[#212121]">{fund.name}</h3>
                    <div>
                      <div className="flex justify-between text-xs text-[#444444] mb-1.5">
                        <span className="font-semibold text-[#5331C6]">{fund.fundedPct}% funded</span>
                        <span>Goal: ₹{fund.goal?.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-2 bg-[#5331C6] rounded-full" style={{ width: `${fund.fundedPct}%` }} />
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedGift(fund); }} className="w-full py-2.5 rounded-full bg-[#5331C6] text-white text-sm font-semibold hover:bg-[#4225a8] transition-colors">
                      Contribute
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RSVP TAB */}
        {activeTab === "RSVP" && (
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif font-bold text-[#212121] mb-2">RSVP</h2>
              <p className="text-[#444444]">We&apos;d love to know if you can make it to our special day!</p>
            </div>
            {rsvpSubmitted ? (
              <div className="text-center space-y-4 py-10">
                <div className="w-20 h-20 bg-[#E2FDF3] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-[#00331F]" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#212121]">RSVP Confirmed! 🎉</h3>
                <p className="text-[#444444]">Thank you, {rsvpData.name}! We can&apos;t wait to celebrate with you.</p>
              </div>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#212121] mb-1.5">Your Name *</label>
                  <input required type="text" placeholder="Anand Kumar" value={rsvpData.name} onChange={(e) => setRsvpData((d) => ({ ...d, name: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5331C6]/30 focus:border-[#5331C6]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#212121] mb-1.5">Email *</label>
                  <input required type="email" placeholder="you@example.com" value={rsvpData.email} onChange={(e) => setRsvpData((d) => ({ ...d, email: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5331C6]/30 focus:border-[#5331C6]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#212121] mb-1.5">Bringing a +1?</label>
                  <select value={rsvpData.plusOne} onChange={(e) => setRsvpData((d) => ({ ...d, plusOne: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5331C6]/30 focus:border-[#5331C6] bg-white">
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#212121] mb-1.5">Meal Preference</label>
                  <select value={rsvpData.meal} onChange={(e) => setRsvpData((d) => ({ ...d, meal: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5331C6]/30 focus:border-[#5331C6] bg-white">
                    <option>Vegetarian</option>
                    <option>Non-Vegetarian</option>
                    <option>Vegan</option>
                    <option>Jain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#212121] mb-1.5">Message to the Couple</label>
                  <textarea rows={3} placeholder="Wishing you both a lifetime of happiness..." value={rsvpData.message} onChange={(e) => setRsvpData((d) => ({ ...d, message: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5331C6]/30 focus:border-[#5331C6] resize-none" />
                </div>
                <button type="submit" className="w-full py-3.5 rounded-full bg-[#5331C6] text-white font-semibold hover:bg-[#4225a8] transition-colors shadow-sm">
                  Confirm My RSVP 🎉
                </button>
              </form>
            )}
          </div>
        )}

        {/* SCHEDULE TAB */}
        {activeTab === "SCHEDULE" && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-[#212121] mb-8 text-center">Wedding Events</h2>
            <div className="space-y-6">
              {[
                { date: "Dec 14, 2026", events: [{ time: "7:00 PM", name: "Mehendi & Sangeet", venue: "The Leela Palace, Bangalore", desc: "Join us for a colourful evening of music, dance, and mehndi. Come dressed in festive colours!" }] },
                { date: "Dec 15, 2026", events: [{ time: "10:00 AM", name: "Wedding Ceremony", venue: "The Taj West End Lawn", desc: "The main wedding ceremony — pheras, vows, and blessings. Please be seated by 9:30 AM." }, { time: "7:00 PM", name: "Reception Dinner", venue: "Grand Ballroom, Taj West End", desc: "Celebrate with us! Formal dinner, live music, and dancing into the night." }] },
                { date: "Dec 16, 2026", events: [{ time: "11:00 AM", name: "Farewell Brunch", venue: "The Pool Terrace, Taj West End", desc: "A relaxed brunch to say goodbye and cherish our time together one last time." }] },
              ].map((day) => (
                <div key={day.date}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-[#5331C6]" />
                    <h3 className="text-base font-bold text-[#5331C6] tracking-wide">{day.date}</h3>
                  </div>
                  <div className="ml-6 space-y-4">
                    {day.events.map((ev) => (
                      <div key={ev.name} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-[#212121] text-lg font-serif">{ev.name}</h4>
                          <span className="text-sm font-semibold text-[#5331C6] ml-4 shrink-0">{ev.time}</span>
                        </div>
                        <p className="text-xs text-[#5331C6] font-medium mb-1">📍 {ev.venue}</p>
                        <p className="text-sm text-[#444444] leading-relaxed">{ev.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRAVEL TAB */}
        {activeTab === "TRAVEL" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-serif font-bold text-[#212121] mb-2">Travel & Accommodation</h2>
              <p className="text-[#444444]">Venue: {WEDDING_DATA.venue}</p>
            </div>
            {/* Map placeholder */}
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://picsum.photos/seed/bangalore-map/900/300" alt="Venue map" className="w-full h-52 object-cover" />
              <div className="bg-white px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#212121]">The Taj West End</p>
                  <p className="text-sm text-[#444444]">Race Course Road, Bengaluru, Karnataka 560001</p>
                </div>
                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full bg-[#5331C6] text-white text-xs font-semibold hover:bg-[#4225a8] transition-colors">
                  Get Directions
                </a>
              </div>
            </div>
            {/* Hotel cards */}
            <div>
              <h3 className="text-xl font-serif font-bold text-[#212121] mb-4">Recommended Hotels</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { name: "Taj West End (Venue)", dist: "0 km", rate: "₹18,000/night", img: "https://picsum.photos/seed/taj/400/250", tag: "Venue Hotel" },
                  { name: "ITC Windsor", dist: "2.1 km", rate: "₹12,000/night", img: "https://picsum.photos/seed/itcwindsor/400/250", tag: "5-star" },
                  { name: "Lemon Tree Premier", dist: "3.4 km", rate: "₹5,500/night", img: "https://picsum.photos/seed/lemontree/400/250", tag: "Great Value" },
                ].map((h) => (
                  <div key={h.name} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={h.img} alt={h.name} className="w-full h-40 object-cover" />
                    <div className="p-4 space-y-1.5">
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-[#212121] text-sm leading-tight">{h.name}</h4>
                        <span className="text-[10px] bg-[#E2FDF3] text-[#00331F] font-bold px-2 py-0.5 rounded-full ml-2 shrink-0">{h.tag}</span>
                      </div>
                      <p className="text-xs text-[#444444]">📍 {h.dist} from venue</p>
                      <p className="text-sm font-semibold text-[#5331C6]">{h.rate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-200 py-10 mt-16 text-center">
        <p className="text-2xl font-serif text-[#5331C6] mb-2">With love from Priya & Rohit 💍</p>
        <p className="text-xs text-[#444444]">Powered by Wedding Gift Registry Platform</p>
        <p className="text-xs text-[#888] mt-1">© 2026 Wedding Gift Registry. The 0% Cash Fund Fee Guarantee.</p>
      </footer>

      {/* ── Gift Detail Modal ───────────────────────────────────── */}
      {selectedGift && (
        <GiftingModal
          weddingId={WEDDING_DATA.weddingId}
          weddingSlug={WEDDING_DATA.slug}
          coupleTitle={`${WEDDING_DATA.bride} & ${WEDDING_DATA.groom}`}
          gift={selectedGift}
          goals={goals}
          onClose={() => setSelectedGift(null)}
          onSuccess={() => setSelectedGift(null)}
          onAddToCart={addToCart}
        />
      )}
    </div>
  );
}

// ─── Gift Card Component ───────────────────────────────────────────────────────

function GiftCard({ gift, onOpen, onQuickAdd }: { gift: GiftItem; onOpen: () => void; onQuickAdd: () => void }) {
  return (
    <div onClick={onOpen} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={gift.image} alt={gift.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {gift.badge && (
          <span className="absolute top-2 left-2 text-[9px] font-bold text-white bg-[#5331C6] px-2 py-0.5 rounded-full">
            {gift.badge}
          </span>
        )}
        {gift.type === "cash" && (
          <span className="absolute top-2 right-2 text-[9px] font-bold text-[#00331F] bg-[#E2FDF3] px-2 py-0.5 rounded-full">
            Group Gift
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <p className="text-xs font-medium text-[#5331C6]">Fulfilled by Registry</p>
        <h3 className="text-sm font-semibold text-[#212121] leading-tight line-clamp-2">{gift.name}</h3>

        {gift.type === "physical" && gift.price && (
          <p className="text-sm font-bold text-[#212121]">₹{gift.price.toLocaleString("en-IN")}</p>
        )}

        {gift.type === "cash" && gift.fundedPct !== undefined && (
          <div>
            <div className="flex justify-between text-[10px] text-[#444444] mb-1">
              <span className="text-[#5331C6] font-semibold">{gift.fundedPct}% funded</span>
              <span>₹{gift.goal?.toLocaleString("en-IN")}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-1.5 bg-[#5331C6] rounded-full" style={{ width: `${gift.fundedPct}%` }} />
            </div>
          </div>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onQuickAdd(); }}
          className="w-full py-2 rounded-full border border-[#5331C6] text-[#5331C6] text-xs font-semibold hover:bg-[#5331C6] hover:text-white transition-colors mt-1"
        >
          {gift.type === "cash" ? "Contribute" : "Quick Add"}
        </button>
      </div>
    </div>
  );
}

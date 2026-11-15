"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import {
  Clock, ShieldCheck, ChevronDown, Gift
} from "lucide-react";
import { api } from "@/lib/api";
import GiftingModal from "@/components/GiftingModal";

export default function PublicWeddingPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"registry" | "schedule" | "story" | "travel" | "faqs" | "blessings">("registry");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | undefined>(undefined);
  const [twoDayShipping, setTwoDayShipping] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await api.getPublicWedding(slug);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load wedding registry");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Countdown calculation
  useEffect(() => {
    if (!data?.wedding?.event_date) return;
    const targetDate = new Date(data.wedding.event_date).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [data]);

  const openGiftModal = (goalId?: string) => {
    setSelectedGoalId(goalId);
    setModalOpen(true);
  };

  const handleAddToCart = () => {
    setCartCount((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
        <span className="font-serif text-sm tracking-widest uppercase text-[#757575]">
          Loading Zola Wedding Registry...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto my-24 p-10 rounded-2xl bg-white border border-[#ECEAE5] text-center space-y-4 shadow-zola">
        <span className="font-serif text-3xl">♡♡</span>
        <h2 className="text-2xl font-serif font-bold text-[#1A1A1A]">Wedding Registry Not Found</h2>
        <p className="text-xs text-[#757575]">
          The registry &apos;{slug}&apos; could not be located.
        </p>
      </div>
    );
  }

  const { wedding, goals, recent_blessings, total_blessings_count } = data;

  const samplePhysicalGifts = [
    {
      id: "gift-1",
      brand: "Picnic at Ascot",
      title: "Personalized Acacia Charcuterie Cheese Board Set",
      msrp: 3499,
      price: 2999,
      image: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&w=600&q=80",
      needs: 1,
    },
    {
      id: "gift-2",
      brand: "Libbey",
      title: "Baker's Basics Casserole Glass Dish with Lid",
      msrp: 4200,
      price: 3899,
      image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80",
      needs: 1,
    },
    {
      id: "gift-3",
      brand: "Anolon",
      title: "Pantryware White Marble Salt Cellar with Wooden Lid",
      msrp: 4999,
      price: 3999,
      image: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=600&q=80",
      needs: 1,
    },
    {
      id: "gift-4",
      brand: "Le Creuset",
      title: "Signature Enameled Cast Iron Round Dutch Oven (5.5 Qt)",
      msrp: 28000,
      price: 24500,
      image: "https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?auto=format&fit=crop&w=600&q=80",
      needs: 1,
    },
  ];

  const formatINR = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="min-h-screen bg-white pb-32 text-[#1A1A1A]">
      {/* 1. Top Couple Header (Exact Zola step_94.png layout) */}
      <div className="text-center pt-10 pb-4 bg-white border-b border-[#ECEAE5]">
        <h1 className="text-3xl sm:text-5xl font-serif font-normal tracking-[0.18em] uppercase text-[#1A1A1A]">
          {wedding.bride_name} &amp; {wedding.groom_name}
        </h1>

        {/* Wedding Date & Location */}
        <p className="text-xs sm:text-sm text-[#757575] font-sans mt-2 tracking-wide">
          {new Date(wedding.event_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} • {wedding.venue || "Bengaluru, India"}
        </p>

        {/* Horizontal Navigation Tabs */}
        <div className="flex justify-center space-x-6 sm:space-x-10 text-xs sm:text-sm font-sans tracking-wider text-[#595959] uppercase mt-6 overflow-x-auto px-4">
          <button
            onClick={() => setActiveTab("registry")}
            className={`pb-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "registry" ? "border-[#1A1A1A] font-bold text-[#1A1A1A]" : "border-transparent hover:text-[#1A1A1A]"
            }`}
          >
            Registry ({goals.length + samplePhysicalGifts.length})
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`pb-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "schedule" ? "border-[#1A1A1A] font-bold text-[#1A1A1A]" : "border-transparent hover:text-[#1A1A1A]"
            }`}
          >
            Schedule
          </button>
          <button
            onClick={() => setActiveTab("story")}
            className={`pb-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "story" ? "border-[#1A1A1A] font-bold text-[#1A1A1A]" : "border-transparent hover:text-[#1A1A1A]"
            }`}
          >
            Our Story
          </button>
          <button
            onClick={() => setActiveTab("travel")}
            className={`pb-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "travel" ? "border-[#1A1A1A] font-bold text-[#1A1A1A]" : "border-transparent hover:text-[#1A1A1A]"
            }`}
          >
            Travel &amp; Stay
          </button>
          <button
            onClick={() => setActiveTab("faqs")}
            className={`pb-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "faqs" ? "border-[#1A1A1A] font-bold text-[#1A1A1A]" : "border-transparent hover:text-[#1A1A1A]"
            }`}
          >
            FAQs
          </button>
          <button
            onClick={() => setActiveTab("blessings")}
            className={`pb-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "blessings" ? "border-[#1A1A1A] font-bold text-[#1A1A1A]" : "border-transparent hover:text-[#1A1A1A]"
            }`}
          >
            Guest Book ({total_blessings_count})
          </button>
        </div>
      </div>

      {/* 2. Zola Secondary Utility Bar */}
      <div className="border-b border-[#ECEAE5] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center text-xs text-[#595959]">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-lg text-[#1A1A1A] tracking-wider">ZOLA ♡</span>
          </div>

          <div className="flex items-center gap-5 sm:gap-8 font-sans">
            <span className="hidden md:inline hover:underline cursor-pointer">About Zola</span>
            <span className="hidden sm:inline hover:underline cursor-pointer">1-408-657-ZOLA</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#284B43]">
              <ShieldCheck className="w-4 h-4" /> The 0% Cash Fund Fee Guarantee
            </span>
            {cartCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#1A1A1A] text-white font-mono text-[11px]">
                Cart ({cartCount})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Filter Bar (Dropdowns + Sort) */}
      <div className="border-b border-[#ECEAE5] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setSelectedCategory(selectedCategory === "ALL" ? "HONEYMOON" : "ALL")}
                className="px-4 py-2 rounded-full border border-[#D1CFCA] text-xs font-medium text-[#1A1A1A] bg-white hover:border-[#1A1A1A] transition-colors flex items-center gap-1.5"
              >
                All Categories <ChevronDown className="w-3.5 h-3.5 text-[#757575]" />
              </button>
            </div>

            <button className="px-4 py-2 rounded-full border border-[#D1CFCA] text-xs font-medium text-[#1A1A1A] bg-white hover:border-[#1A1A1A] transition-colors flex items-center gap-1.5">
              Price <ChevronDown className="w-3.5 h-3.5 text-[#757575]" />
            </button>

            <button className="px-4 py-2 rounded-full border border-[#D1CFCA] text-xs font-medium text-[#1A1A1A] bg-white hover:border-[#1A1A1A] transition-colors flex items-center gap-1.5">
              All availability <ChevronDown className="w-3.5 h-3.5 text-[#757575]" />
            </button>

            <button className="px-4 py-2 rounded-full border border-[#D1CFCA] text-xs font-medium text-[#1A1A1A] bg-white hover:border-[#1A1A1A] transition-colors flex items-center gap-1.5">
              All stores <ChevronDown className="w-3.5 h-3.5 text-[#757575]" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#757575] font-sans">
              {goals.length + samplePhysicalGifts.length} gifts
            </span>
            <button className="px-4 py-2 rounded-full border border-[#D1CFCA] text-xs font-medium text-[#1A1A1A] bg-white hover:border-[#1A1A1A] transition-colors flex items-center gap-1.5">
              Featured <ChevronDown className="w-3.5 h-3.5 text-[#757575]" />
            </button>
          </div>
        </div>

        {/* Two-Day Shipping Toggle */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 flex items-center gap-2 text-xs text-[#595959]">
          <span>Two-Day Shipping</span>
          <button
            onClick={() => setTwoDayShipping(!twoDayShipping)}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
              twoDayShipping ? "bg-[#506B70]" : "bg-stone-300"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                twoDayShipping ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {activeTab === "registry" && (
          <div className="space-y-8">
            {/* Countdown Badge Banner */}
            <div className="bg-[#FAF9F6] border border-[#ECEAE5] rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#595959]">
                <Clock className="w-4 h-4 text-[#506B70]" />
                <span>
                  <strong>{timeLeft.days} days</strong> until the wedding celebration!
                </span>
              </div>
              <button
                onClick={() => openGiftModal()}
                className="px-5 py-2 rounded-full bg-[#1A1A1A] text-white text-xs font-semibold hover:bg-black transition-colors"
              >
                Contribute Any Shagun Amount
              </button>
            </div>

            {/* 4-Column Registry Item Grid (Matching step_94.png) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Cash Fund Card 1: Our newlywed fund */}
              {goals.map((g: any) => (
                <div
                  key={g.id}
                  className="bg-white rounded-2xl overflow-hidden border border-[#ECEAE5] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Photo with Group Gift Pill */}
                    <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={g.cover_image_url || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"}
                        alt={g.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-sans font-medium text-[#1A1A1A] shadow-xs flex items-center gap-1.5">
                        <Gift className="w-3 h-3 text-[#506B70]" /> Group gift
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-2">
                      <span className="text-xs text-[#757575] font-sans block">
                        Cash fund
                      </span>
                      <h3 className="font-serif font-bold text-[#1F2937] text-lg leading-snug">
                        {g.title}
                      </h3>
                      {g.target_amount > 0 && (
                        <div className="text-xs text-[#757575] pt-1">
                          Contributed: <strong className="text-[#1A1A1A]">{formatINR(g.collected_amount)}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Action Pill */}
                  <div className="p-5 pt-0">
                    <button
                      onClick={() => openGiftModal(g.id)}
                      className="w-full py-2.5 px-4 rounded-full bg-[#506B70] hover:bg-[#3D5257] text-white text-xs font-semibold tracking-wide transition-all shadow-xs"
                    >
                      Contribute
                    </button>
                    <p className="text-center text-[11px] text-[#757575] mt-1.5 font-sans">
                      Contribute what you wish
                    </p>
                  </div>
                </div>
              ))}

              {/* Sample Physical Registry Items (Matching step_94.png) */}
              {samplePhysicalGifts.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden border border-[#ECEAE5] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Photo */}
                    <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                    </div>

                    {/* Card Details */}
                    <div className="p-5 space-y-1.5">
                      <span className="text-xs text-[#757575] font-sans block">
                        {item.brand}
                      </span>
                      <h3 className="font-sans font-bold text-[#1F2937] text-sm leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="pt-1">
                        <div className="text-[11px] text-[#757575]">
                          MSRP ⓘ <span className="line-through">{formatINR(item.msrp)}</span>
                        </div>
                        <div className="font-bold text-sm text-[#1A1A1A]">
                          Our price {formatINR(item.price)}
                        </div>
                        <div className="text-[11px] text-[#757575]">Free shipping</div>
                      </div>
                    </div>
                  </div>

                  {/* Stepper & Add to Cart Controls */}
                  <div className="p-5 pt-0 space-y-1.5">
                    <div className="flex gap-2">
                      <div className="w-12 h-9 rounded-md border border-[#D1CFCA] flex items-center justify-center text-xs font-semibold text-[#1A1A1A]">
                        1
                      </div>
                      <button
                        onClick={handleAddToCart}
                        className="flex-1 py-2 px-3 rounded-full bg-[#506B70] hover:bg-[#3D5257] text-white text-xs font-semibold tracking-wide transition-all shadow-xs"
                      >
                        Add to cart
                      </button>
                    </div>
                    <p className="text-center text-[11px] text-[#757575] font-sans">
                      Still needs {item.needs}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Schedule & Events */}
        {activeTab === "schedule" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs font-mono uppercase tracking-widest text-[#506B70] font-semibold">
                WEDDING ITINERARY
              </span>
              <h2 className="text-3xl font-serif font-bold text-[#1A1A1A]">
                Schedule of Events
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white border border-[#ECEAE5] shadow-xs space-y-2">
                <span className="text-xs font-mono font-bold text-[#506B70] uppercase">
                  10:00 AM • Mehendi &amp; Sangeet
                </span>
                <h3 className="text-xl font-serif font-bold text-[#1A1A1A]">
                  Traditional Mehendi &amp; Music
                </h3>
                <p className="text-xs text-[#757575]">
                  Courtyard Lawn • Vibrant attire, music, and henna celebration.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#ECEAE5] shadow-xs space-y-2">
                <span className="text-xs font-mono font-bold text-[#506B70] uppercase">
                  4:30 PM • Wedding Ceremony (Pheras)
                </span>
                <h3 className="text-xl font-serif font-bold text-[#1A1A1A]">
                  Auspicious Pheras &amp; Vows
                </h3>
                <p className="text-xs text-[#757575]">
                  Grand Mandap • Sacred vows under the stars.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#ECEAE5] shadow-xs space-y-2">
                <span className="text-xs font-mono font-bold text-[#506B70] uppercase">
                  7:30 PM • Reception &amp; Banquet
                </span>
                <h3 className="text-xl font-serif font-bold text-[#1A1A1A]">
                  Dinner, Toasts &amp; Celebration
                </h3>
                <p className="text-xs text-[#757575]">
                  Main Ballroom • Live blessing kiosk and gala dinner.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Our Story */}
        {activeTab === "story" && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-14 border border-[#ECEAE5] shadow-zola space-y-8 text-center">
            <span className="text-xs font-mono tracking-widest uppercase font-bold text-[#506B70]">
              THE JOURNEY TOGETHER
            </span>
            <h2 className="text-4xl sm:text-5xl font-serif font-bold text-[#1A1A1A]">
              How It All Began
            </h2>

            <div className="font-serif leading-relaxed text-lg sm:text-xl italic text-[#4A4A4A] space-y-4">
              <p>
                &ldquo;{wedding.story || "From our first serendipitous conversation at a bookstore in Bengaluru to trekking the Western Ghats under misty skies, we knew our journey was destined to be shared together."}&rdquo;
              </p>
              <p className="not-italic text-sm font-sans text-[#757575]">
                After five years of shared laughter, travel adventures across India, and countless cups of coffee, we are taking the most meaningful step of our lives surrounded by family and dear friends.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Travel & Stay */}
        {activeTab === "travel" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs font-mono uppercase tracking-widest text-[#506B70] font-semibold">
                GUEST ACCOMMODATIONS
              </span>
              <h2 className="text-3xl font-serif font-bold text-[#1A1A1A]">
                Travel &amp; Stay
              </h2>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#ECEAE5] shadow-xs space-y-3">
              <h3 className="text-lg font-serif font-bold text-[#1A1A1A]">
                Venue: {wedding.venue || "The Leela Palace, Bengaluru"}
              </h3>
              <p className="text-xs text-[#757575] leading-relaxed">
                We have secured special wedding rate blocks for all traveling guests. Complimentary shuttle services will be available from Kempegowda International Airport (BLR).
              </p>
            </div>
          </div>
        )}

        {/* Tab 5: FAQs */}
        {activeTab === "faqs" && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs font-mono uppercase tracking-widest text-[#506B70] font-semibold">
                HELPFUL DETAILS
              </span>
              <h2 className="text-3xl font-serif font-bold text-[#1A1A1A]">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#ECEAE5] shadow-xs space-y-2">
              <h3 className="text-sm font-bold text-[#1A1A1A]">
                What is the dress code?
              </h3>
              <p className="text-xs text-[#757575] leading-relaxed">
                Traditional Indian ethnic (Sherwanis, Kurta Sets, Sarees, Lehengas) or semi-formal Western evening wear.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#ECEAE5] shadow-xs space-y-2">
              <h3 className="text-sm font-bold text-[#1A1A1A]">
                Can I give physical gifts at the venue?
              </h3>
              <p className="text-xs text-[#757575] leading-relaxed">
                To simplify travel for our new home, we kindly encourage digital contributions to our cash funds or wishlist registry here. 100% of contributions transfer directly to our savings.
              </p>
            </div>
          </div>
        )}

        {/* Tab 6: Guest Book */}
        {activeTab === "blessings" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs font-mono uppercase tracking-widest text-[#506B70] font-semibold">
                BLESSINGS &amp; WISHES
              </span>
              <h2 className="text-3xl font-serif font-bold text-[#1A1A1A]">
                The Wedding Guest Book
              </h2>
              <p className="text-xs text-[#757575]">
                {total_blessings_count} heartfelt blessings recorded from family and friends.
              </p>
            </div>

            <div className="space-y-4">
              {recent_blessings && recent_blessings.length > 0 ? (
                recent_blessings.map((b: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-white border border-[#ECEAE5] shadow-xs space-y-2"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#1A1A1A]">{b.guest_name}</span>
                      <span className="font-mono text-[#506B70] font-semibold">
                        Contributed ₹{b.amount?.toLocaleString("en-IN")}
                      </span>
                    </div>
                    {b.message && (
                      <p className="text-xs sm:text-sm text-[#4A4A4A] italic font-serif">
                        &ldquo;{b.message}&rdquo;
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-xs text-[#757575] bg-stone-50 rounded-2xl border border-[#ECEAE5]">
                  Be the first to sign the guest book with a blessing!
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Gifting Modal (Zola Step 104 Layout) */}
      {modalOpen && (
        <GiftingModal
          weddingId={wedding.id}
          weddingSlug={slug}
          coupleTitle={`${wedding.bride_name} & ${wedding.groom_name}`}
          coupleImage={wedding.cover_image_url}
          goals={goals.map((g: any) => ({ id: g.id, title: g.title, image: g.cover_image_url }))}
          selectedGoalId={selectedGoalId}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            fetchData();
          }}
        />
      )}
    </div>
  );
}

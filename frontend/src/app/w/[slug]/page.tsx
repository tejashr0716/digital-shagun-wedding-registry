"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import { Clock, ChevronRight, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import GiftingModal from "@/components/GiftingModal";

export default function PublicWeddingPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"registry" | "story" | "schedule" | "faq" | "blessings">("registry");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | undefined>(undefined);

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

  const filteredGoals = selectedCategory === "ALL"
    ? goals
    : goals.filter((g: any) => g.category === selectedCategory);

  const formatINR = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-32">
      {/* Editorial Luxury Hero Banner */}
      <section className="relative w-full h-[60vh] min-h-[440px] max-h-[620px] bg-[#111111] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={wedding.cover_image_url || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85"}
          alt={`${wedding.bride_name} & ${wedding.groom_name}`}
          className="w-full h-full object-cover object-center opacity-65 filter brightness-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end items-center text-center p-6 sm:p-14 text-white">
          <div className="max-w-3xl space-y-3">
            <span className="inline-block text-[11px] font-mono tracking-[0.3em] uppercase text-amber-200/90 font-semibold">
              CELEBRATE THE WEDDING OF
            </span>
            <h1 className="text-5xl sm:text-7xl font-serif font-bold tracking-tight text-white">
              {wedding.bride_name} &amp; {wedding.groom_name}
            </h1>
            <p className="text-xs sm:text-sm font-mono tracking-[0.15em] uppercase text-gray-200">
              {new Date(wedding.event_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} • {wedding.venue || "Bengaluru, India"}
            </p>

            {/* Countdown Badge */}
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-medium border border-white/20">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                {timeLeft.days} Days • {timeLeft.hours} Hours • {timeLeft.minutes} Mins to the Wedding
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Zola Sticky Tab Navigation */}
      <div className="sticky top-18 z-40 bg-white border-b border-[#ECEAE5] shadow-xs">
        <div className="max-w-5xl mx-auto px-4 flex justify-center space-x-6 sm:space-x-10 text-xs sm:text-sm font-serif font-semibold tracking-wider text-[#595959] uppercase overflow-x-auto py-3">
          <button
            onClick={() => setActiveTab("registry")}
            className={`pb-1 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "registry" ? "border-[#1A1A1A] text-[#1A1A1A] font-bold" : "border-transparent hover:text-[#1A1A1A]"
            }`}
          >
            Registry &amp; Funds ({goals.length})
          </button>
          <button
            onClick={() => setActiveTab("story")}
            className={`pb-1 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "story" ? "border-[#1A1A1A] text-[#1A1A1A] font-bold" : "border-transparent hover:text-[#1A1A1A]"
            }`}
          >
            Our Story
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`pb-1 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "schedule" ? "border-[#1A1A1A] text-[#1A1A1A] font-bold" : "border-transparent hover:text-[#1A1A1A]"
            }`}
          >
            Schedule &amp; Events
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={`pb-1 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "faq" ? "border-[#1A1A1A] text-[#1A1A1A] font-bold" : "border-transparent hover:text-[#1A1A1A]"
            }`}
          >
            Q &amp; A
          </button>
          <button
            onClick={() => setActiveTab("blessings")}
            className={`pb-1 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "blessings" ? "border-[#1A1A1A] text-[#1A1A1A] font-bold" : "border-transparent hover:text-[#1A1A1A]"
            }`}
          >
            Guest Book ({total_blessings_count})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {activeTab === "registry" && (
          <div className="space-y-10">
            {/* Header intro & 0% fee assurance */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#ECEAE5] shadow-zola flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase font-bold text-[#284B43]">
                  WEDDING REGISTRY &amp; CASH FUNDS
                </span>
                <h2 className="text-3xl font-serif font-bold text-[#1A1A1A]">
                  Wishlist &amp; Life Milestones
                </h2>
                <p className="text-xs sm:text-sm text-[#595959] leading-relaxed">
                  We are fortunate to have a home filled with love. In lieu of boxed gifts, your contribution toward our dream milestones means the world to us!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="p-3.5 rounded-xl bg-[#EEF4F2] border border-[#D5E4E0] text-xs text-[#284B43] flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#284B43] shrink-0" />
                  <div>
                    <span className="font-bold block">0% Cash Fund Fee Guarantee</span>
                    <span className="text-[11px] text-[#36534E]">Couples receive 100% of all contributions</span>
                  </div>
                </div>

                <button
                  onClick={() => openGiftModal()}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all shrink-0"
                >
                  Send Any Amount
                </button>
              </div>
            </div>

            {/* Filter Pills Bar */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory("ALL")}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  selectedCategory === "ALL"
                    ? "bg-[#1A1A1A] text-white shadow-xs"
                    : "bg-white text-[#595959] border border-[#ECEAE5] hover:border-[#1A1A1A]"
                }`}
              >
                All Milestones ({goals.length})
              </button>
              <button
                onClick={() => setSelectedCategory("HONEYMOON")}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  selectedCategory === "HONEYMOON"
                    ? "bg-[#1A1A1A] text-white shadow-xs"
                    : "bg-white text-[#595959] border border-[#ECEAE5] hover:border-[#1A1A1A]"
                }`}
              >
                Honeymoon &amp; Travel
              </button>
              <button
                onClick={() => setSelectedCategory("DOWNPAYMENT")}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  selectedCategory === "DOWNPAYMENT"
                    ? "bg-[#1A1A1A] text-white shadow-xs"
                    : "bg-white text-[#595959] border border-[#ECEAE5] hover:border-[#1A1A1A]"
                }`}
              >
                First Home Fund
              </button>
              <button
                onClick={() => setSelectedCategory("CUSTOM")}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  selectedCategory === "CUSTOM"
                    ? "bg-[#1A1A1A] text-white shadow-xs"
                    : "bg-white text-[#595959] border border-[#ECEAE5] hover:border-[#1A1A1A]"
                }`}
              >
                Living &amp; Appliances
              </button>
            </div>

            {/* Zola Product & Milestone Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {filteredGoals.map((g: any) => {
                const pct = g.target_amount > 0 ? Math.min(Math.round((g.collected_amount / g.target_amount) * 100), 100) : 0;
                return (
                  <div
                    key={g.id}
                    className="bg-white rounded-2xl overflow-hidden border border-[#ECEAE5] shadow-zola hover:shadow-zola-hover transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Photo Frame */}
                      <div className="relative aspect-[4/3] w-full bg-[#F5F4F0] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={g.cover_image_url || "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80"}
                          alt={g.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full text-[10px] font-mono tracking-wider uppercase font-bold text-[#1A1A1A] shadow-xs">
                          {g.category === "HONEYMOON" ? "Honeymoon Experience" : g.category === "DOWNPAYMENT" ? "Life Milestone" : "Custom Fund"}
                        </div>
                        <div className="absolute top-3 right-3 bg-[#284B43] text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">
                          Group Gift
                        </div>
                      </div>

                      {/* Card Details */}
                      <div className="p-6 space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono tracking-widest uppercase text-[#8C8C8C]">
                            EXPERIENCE CASH FUND
                          </span>
                          <h3 className="font-serif font-bold text-[#1A1A1A] text-xl leading-snug group-hover:text-[#284B43] transition-colors">
                            {g.title}
                          </h3>
                        </div>

                        {/* Progress Bar & Amount Remaining */}
                        <div className="space-y-2 pt-2 border-t border-[#F0EFEB]">
                          <div className="flex justify-between items-baseline text-xs">
                            <span className="text-[#595959]">
                              Contributed: <strong className="text-[#1A1A1A]">{formatINR(g.collected_amount)}</strong>
                            </span>
                            {g.show_target_amount && (
                              <span className="text-[#8C8C8C] text-[11px]">
                                Target: {formatINR(g.target_amount)}
                              </span>
                            )}
                          </div>

                          <div className="w-full bg-[#EFECE6] rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-[#284B43] h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>

                          <div className="flex justify-between text-[11px] text-[#8C8C8C]">
                            <span>{pct}% Funded</span>
                            {g.show_target_amount && g.target_amount > g.collected_amount && (
                              <span>{formatINR(g.target_amount - g.collected_amount)} to reach goal</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Action Pill */}
                    <div className="p-6 pt-0">
                      <button
                        onClick={() => openGiftModal(g.id)}
                        className="w-full py-3 px-4 rounded-full bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
                      >
                        Contribute to Fund
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Our Story */}
        {activeTab === "story" && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-14 border border-[#ECEAE5] shadow-zola space-y-10 text-center">
            <span className="text-[11px] font-mono tracking-[0.25em] uppercase font-bold text-[#284B43]">
              THE JOURNEY TOGETHER
            </span>
            <h2 className="text-4xl sm:text-5xl font-serif font-bold text-[#1A1A1A]">
              How It All Began
            </h2>

            <div className="prose prose-lg mx-auto text-[#4A4A4A] font-serif leading-relaxed text-lg sm:text-xl italic space-y-6">
              <p>
                &ldquo;{wedding.story || "From our first serendipitous conversation at a Koramangala bookstore in Bengaluru to trekking the Western Ghats under misty skies, we knew our journey was destined to be shared together."}&rdquo;
              </p>
              <p className="not-italic text-sm font-sans text-[#757575] leading-normal">
                After five years of shared laughter, travel adventures across India, and countless cups of South Indian filter coffee, we are taking the most meaningful step of our lives surrounded by the people who mean the most to us.
              </p>
            </div>

            <div className="pt-6 border-t border-[#ECEAE5] flex justify-center items-center gap-8 text-xs font-mono uppercase tracking-widest text-[#8C8C8C]">
              <span>Coffee in Koramangala • 2021</span>
              <span>•</span>
              <span>The Proposal • 2025</span>
              <span>•</span>
              <span>Forever • 2026</span>
            </div>
          </div>
        )}

        {/* Tab 3: Schedule & Events */}
        {activeTab === "schedule" && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="text-[11px] font-mono tracking-[0.25em] uppercase font-bold text-[#284B43]">
                WEDDING CELEBRATIONS
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1A1A1A]">
                Schedule of Events
              </h2>
              <p className="text-xs text-[#757575]">
                All events hosted at The Taj West End, Race Course Road, Bengaluru.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#ECEAE5] shadow-zola flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-rose-600">
                    FRIDAY EVENING • DEC 18
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-[#1A1A1A]">
                    Mehendi &amp; Sangeet Gala
                  </h3>
                  <p className="text-xs text-[#595959]">
                    Grand Ballroom &amp; Terrace Lawn • 6:30 PM onwards
                  </p>
                  <span className="inline-block text-[11px] text-[#284B43] bg-[#EEF4F2] px-3 py-1 rounded-full font-medium mt-2">
                    Attire: Colorful Indian Festive / Cocktail
                  </span>
                </div>
                <button
                  onClick={() => openGiftModal()}
                  className="px-5 py-2.5 rounded-full border border-[#1A1A1A] text-xs font-bold uppercase tracking-wider text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all shrink-0"
                >
                  Send Blessing
                </button>
              </div>

              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#ECEAE5] shadow-zola flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-amber-600">
                    SUNDAY MORNING • DEC 20
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-[#1A1A1A]">
                    Traditional Muhurtham &amp; Pheras
                  </h3>
                  <p className="text-xs text-[#595959]">
                    Prince of Wales Heritage Lawns • 9:30 AM – 1:00 PM
                  </p>
                  <span className="inline-block text-[11px] text-[#284B43] bg-[#EEF4F2] px-3 py-1 rounded-full font-medium mt-2">
                    Attire: Traditional Silk Sarees / Kurtas &amp; Sherwanis
                  </span>
                </div>
                <button
                  onClick={() => openGiftModal()}
                  className="px-5 py-2.5 rounded-full border border-[#1A1A1A] text-xs font-bold uppercase tracking-wider text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all shrink-0"
                >
                  Send Blessing
                </button>
              </div>

              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#ECEAE5] shadow-zola flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-[#284B43]">
                    SUNDAY EVENING • DEC 20
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-[#1A1A1A]">
                    Grand Reception &amp; Dinner Banquet
                  </h3>
                  <p className="text-xs text-[#595959]">
                    Taj Banquet Amphitheatre • 7:00 PM onwards
                  </p>
                  <span className="inline-block text-[11px] text-[#284B43] bg-[#EEF4F2] px-3 py-1 rounded-full font-medium mt-2">
                    Attire: Formal Evening / Black Tie Optional
                  </span>
                </div>
                <a
                  href={`/w/${slug}/live`}
                  target="_blank"
                  className="px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-500 text-gray-950 text-xs font-bold uppercase tracking-wider transition-all shrink-0"
                >
                  Live Kiosk View
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Q & A (FAQ) */}
        {activeTab === "faq" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2 mb-8">
              <span className="text-[11px] font-mono tracking-[0.25em] uppercase font-bold text-[#284B43]">
                GUEST GUIDELINES
              </span>
              <h2 className="text-3xl font-serif font-bold text-[#1A1A1A]">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#ECEAE5] shadow-zola space-y-3">
              <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">
                How does Digital Shagun work?
              </h3>
              <p className="text-xs text-[#595959] leading-relaxed">
                You can choose any milestone fund above (Honeymoon in Italy, New Home Down Payment, or Kitchen Fund), pick a suggested blessing amount or enter your own, and pay frictionlessly via UPI (Google Pay, PhonePe, Paytm) or Card. 100% of your gift goes straight to the couple&apos;s verified bank account.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#ECEAE5] shadow-zola space-y-3">
              <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">
                Are physical boxed gifts accepted?
              </h3>
              <p className="text-xs text-[#595959] leading-relaxed">
                Your presence is our greatest present! Due to upcoming international relocations and travel logistics, we kindly request no physical boxed gifts. Contributions toward our life milestones on this registry are deeply appreciated.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#ECEAE5] shadow-zola space-y-3">
              <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">
                Will my blessing appear on the venue big screen?
              </h3>
              <p className="text-xs text-[#595959] leading-relaxed">
                Yes! When you complete your gift, your blessing message instantly broadcasts onto the venue reception screens in real-time for everyone to celebrate!
              </p>
            </div>
          </div>
        )}

        {/* Tab 5: Guest Book & Blessings */}
        {activeTab === "blessings" && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center border-b border-[#ECEAE5] pb-5">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-[#284B43]">
                  GUEST BOOK
                </span>
                <h3 className="text-3xl font-serif font-bold text-[#1A1A1A]">
                  Warm Blessings ({total_blessings_count})
                </h3>
              </div>
              <button
                onClick={() => openGiftModal()}
                className="px-5 py-2.5 rounded-full bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-all"
              >
                + Write a Blessing
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {recent_blessings.map((b: any) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl p-6 border border-[#ECEAE5] shadow-zola space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-serif font-bold text-lg text-[#1A1A1A]">{b.guest_name}</h4>
                      <span className="text-xs font-mono font-bold text-[#284B43] bg-[#EEF4F2] px-2.5 py-1 rounded-full border border-[#D5E4E0]">
                        ₹{b.gross_amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    {b.guest_message && (
                      <p className="text-xs text-[#595959] italic mt-2 font-serif leading-relaxed">
                        &ldquo;{b.guest_message}&rdquo;
                      </p>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-[#8C8C8C] pt-2 border-t border-[#F0EFEB] flex justify-between">
                    <span>Shagun Blessing</span>
                    <span>{new Date(b.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Sticky Bottom Gifting Bar (Zola Mobile UX) */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#ECEAE5] p-3.5 sm:hidden z-40 flex items-center justify-between px-6 shadow-2xl">
        <div>
          <span className="text-[10px] text-[#8C8C8C] uppercase font-bold block">Registry Fund</span>
          <span className="text-sm font-serif font-bold text-[#1A1A1A]">{wedding.bride_name} &amp; {wedding.groom_name}</span>
        </div>
        <button
          onClick={() => openGiftModal()}
          className="px-6 py-2.5 rounded-full bg-[#1A1A1A] text-white font-bold text-xs uppercase tracking-wider shadow-md"
        >
          Send Shagun
        </button>
      </div>

      {/* Zola Contribution Modal */}
      {modalOpen && (
        <GiftingModal
          weddingId={wedding.id}
          weddingSlug={slug}
          coupleTitle={`${wedding.bride_name} & ${wedding.groom_name}`}
          goals={goals.map((g: any) => ({ id: g.id, title: g.title }))}
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

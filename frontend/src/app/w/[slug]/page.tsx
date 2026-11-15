"use client";

import React, { useState, useEffect, use } from "react";
import { Heart, Calendar, MapPin, Gift, Clock, Sparkles, MessageCircle, ChevronRight, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import ProgressBar from "@/components/ProgressBar";
import GiftingModal from "@/components/GiftingModal";

export default function PublicWeddingPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | undefined>(undefined);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const fetchData = async () => {
    try {
      const res = await api.getPublicWedding(slug);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load wedding registry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

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
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-gray-400">
        Loading wedding registry &amp; milestones...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-white border border-gray-200 text-center space-y-4">
        <Heart className="w-10 h-10 text-rose-300 mx-auto" />
        <h2 className="text-xl font-serif font-bold text-gray-900">Wedding Not Found</h2>
        <p className="text-xs text-gray-500">
          The registry &apos;{slug}&apos; does not exist or has been modified.
        </p>
      </div>
    );
  }

  const { wedding, goals, recent_blessings, total_blessings_count, total_collected_gross } = data;

  return (
    <div className="min-h-screen bg-[#faf8f6] pb-24">
      {/* Hero Section */}
      <div className="relative w-full h-[55vh] min-h-[380px] max-h-[550px] bg-gray-900 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={wedding.cover_image_url || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80"}
          alt={`${wedding.bride_name} & ${wedding.groom_name}`}
          className="w-full h-full object-cover opacity-60 filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-6 sm:p-12 text-white max-w-5xl mx-auto">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-rose-500/90 text-white backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" /> Official Wedding Registry
            </span>
            <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight">
              {wedding.bride_name} &amp; {wedding.groom_name}
            </h1>
            <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-rose-100 font-medium">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-rose-300" />
                <span>{new Date(wedding.event_date).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</span>
              </div>
              {wedding.venue && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-300" />
                  <span>{wedding.venue}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10 space-y-8">
        {/* Countdown Timer Widget */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-rose-100/80">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-600 uppercase tracking-widest mb-4">
            <Clock className="w-3.5 h-3.5" />
            Countdown to The Big Day
          </div>
          <div className="grid grid-cols-4 gap-3 text-center max-w-md mx-auto">
            <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100">
              <span className="block text-2xl sm:text-3xl font-serif font-bold text-gray-900">{timeLeft.days}</span>
              <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Days</span>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100">
              <span className="block text-2xl sm:text-3xl font-serif font-bold text-gray-900">{timeLeft.hours}</span>
              <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Hours</span>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100">
              <span className="block text-2xl sm:text-3xl font-serif font-bold text-gray-900">{timeLeft.minutes}</span>
              <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Mins</span>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100">
              <span className="block text-2xl sm:text-3xl font-serif font-bold text-gray-900">{timeLeft.seconds}</span>
              <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Secs</span>
            </div>
          </div>
        </div>

        {/* Couple Story */}
        {wedding.story && (
          <div className="bg-white rounded-3xl p-8 shadow-xs border border-rose-100/60 space-y-3 text-center">
            <span className="text-xs uppercase tracking-widest font-bold text-rose-500">
              A Note From The Couple
            </span>
            <p className="text-sm sm:text-base text-gray-700 font-serif leading-relaxed italic max-w-2xl mx-auto">
              &ldquo;{wedding.story}&rdquo;
            </p>
          </div>
        )}

        {/* Milestone Goals Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-rose-500 block">
                Window 6: Goal-Based Gifting
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
                Curated Life Milestones
              </h2>
              <p className="text-xs text-gray-500">
                Choose a specific milestone you wish to fund or contribute to the open blessing pool.
              </p>
            </div>

            <button
              onClick={() => openGiftModal()}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200 transition-all shrink-0"
            >
              <Heart className="w-4 h-4 fill-white" />
              Send Blessings / Shagun
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {goals.map((g: any) => (
              <div
                key={g.id}
                className="bg-white rounded-3xl overflow-hidden border border-rose-100 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={g.cover_image_url || "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80"}
                      alt={g.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-800">
                      {g.category}
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <h3 className="font-serif font-bold text-gray-900 text-lg group-hover:text-rose-600 transition-colors">
                      {g.title}
                    </h3>

                    <ProgressBar
                      collected={g.collected_amount}
                      target={g.target_amount}
                      percentage={g.percentage_funded}
                      showTarget={g.show_target_amount}
                    />
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => openGiftModal(g.id)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 hover:border-transparent transition-all flex items-center justify-center gap-1.5"
                  >
                    Fund This Milestone
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Guest Blessings Wall */}
        <div className="bg-white rounded-3xl p-8 shadow-xs border border-rose-100/60 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-rose-500" />
              <div>
                <h3 className="text-lg font-serif font-bold text-gray-900">
                  Blessing Book &amp; Guest Ticker
                </h3>
                <span className="text-xs text-gray-500">
                  {total_blessings_count} blessings shared by friends and family
                </span>
              </div>
            </div>
            <button
              onClick={() => openGiftModal()}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              + Write a Blessing
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recent_blessings.map((b: any) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-900 text-sm">{b.guest_name}</span>
                    <span className="text-xs font-semibold text-rose-600 bg-white px-2 py-0.5 rounded-full border border-rose-100 shadow-2xs">
                      ₹{b.gross_amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {b.guest_message && (
                    <p className="text-xs text-gray-600 italic mt-1.5 font-serif leading-relaxed">
                      &ldquo;{b.guest_message}&rdquo;
                    </p>
                  )}
                </div>
                <div className="text-[10px] text-gray-400 pt-2 flex justify-between">
                  <span>Traditional Shagun</span>
                  <span>{new Date(b.created_at).toLocaleDateString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Mobile Send Blessing CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-rose-200 p-3 sm:hidden z-40 flex items-center justify-between px-6 shadow-2xl">
        <div>
          <span className="text-[10px] text-gray-500 uppercase font-bold block">Contribute</span>
          <span className="text-sm font-serif font-bold text-rose-600">{wedding.bride_name} &amp; {wedding.groom_name}</span>
        </div>
        <button
          onClick={() => openGiftModal()}
          className="px-6 py-2.5 rounded-full bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-200"
        >
          Send Blessings
        </button>
      </div>

      {/* Window 7 Gifting Modal */}
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

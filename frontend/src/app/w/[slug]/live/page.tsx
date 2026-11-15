"use client";

import React, { useState, useEffect, use } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Heart, Sparkles, Trophy, QrCode, Volume2, MonitorPlay } from "lucide-react";
import { api } from "@/lib/api";

export default function LiveReceptionKioskPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [blessings, setBlessings] = useState<any[]>([]);
  const [wedding, setWedding] = useState<any>(null);
  const [latestBlessing, setLatestBlessing] = useState<any>(null);
  const [tickerIndex, setTickerIndex] = useState(0);

  const fetchLiveTicker = async () => {
    try {
      const data = await api.getLiveTicker(slug);
      if (data?.blessings && data.blessings.length > 0) {
        setBlessings(data.blessings);
        setLatestBlessing(data.blessings[0]);
      }
    } catch (e) {}
  };

  useEffect(() => {
    // Initial fetch of public wedding details
    api.getPublicWedding(slug).then((res) => {
      setWedding(res.wedding);
    }).catch(() => {});

    fetchLiveTicker();
    // Real-time polling loop every 4 seconds
    const interval = setInterval(fetchLiveTicker, 4000);
    return () => clearInterval(interval);
  }, [slug]);

  // Rotate blessing carousel
  useEffect(() => {
    if (blessings.length === 0) return;
    const tickerInterval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % blessings.length);
    }, 6000);
    return () => clearInterval(tickerInterval);
  }, [blessings]);

  const bride = wedding ? wedding.bride_name : "Priya";
  const groom = wedding ? wedding.groom_name : "Rohit";
  const registryUrl = typeof window !== "undefined" ? `${window.location.origin}/w/${slug}` : `https://shagunregistry.in/w/${slug}`;

  const currentHighlight = blessings[tickerIndex] || latestBlessing;

  return (
    <div className="min-h-screen bg-radial from-[#1e1428] via-[#0d0914] to-[#050408] text-white flex flex-col justify-between p-6 sm:p-12 overflow-hidden selection:bg-rose-500">
      {/* Top Venue Header */}
      <div className="flex justify-between items-center border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <div>
            <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-amber-400 block">
              Venue Big-Screen • Live Blessings Stream
            </span>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight">
              {bride} &amp; {groom}&apos;s Reception
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-mono tracking-wider font-semibold text-emerald-400">
            LIVE RECEPTION STREAM
          </span>
        </div>
      </div>

      {/* Main Spotlight Centerpiece */}
      <div className="my-auto py-12 flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold tracking-wider uppercase">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Latest Blessing Announced
        </div>

        {currentHighlight ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-4xl sm:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-300 to-amber-100">
              {currentHighlight.guest_name}
            </div>

            <div className="inline-block px-6 py-2 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-mono text-xl sm:text-2xl font-bold shadow-xl shadow-rose-900/40">
              Contributed ₹{currentHighlight.amount?.toLocaleString("en-IN")}
            </div>

            <p className="text-base sm:text-xl text-rose-200/90 font-medium">
              for the <span className="text-white font-bold underline decoration-amber-400 underline-offset-4">{currentHighlight.goal_title}</span>
            </p>

            {currentHighlight.message && (
              <p className="text-lg sm:text-2xl text-gray-300 font-serif italic max-w-2xl mx-auto pt-4 leading-relaxed">
                &ldquo;{currentHighlight.message}&rdquo;
              </p>
            )}
          </div>
        ) : (
          <div className="text-gray-400 font-serif text-xl italic">
            Waiting for first live blessings from our beloved guests...
          </div>
        )}
      </div>

      {/* Bottom Kiosk Footer with Live Marquee & Floating QR Code */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center border-t border-white/10 pt-6">
        {/* Recent Ticker Scroll */}
        <div className="md:col-span-3 space-y-2">
          <span className="text-[10px] tracking-widest uppercase font-bold text-gray-400">
            Recent Blessings Feed
          </span>
          <div className="flex gap-4 overflow-hidden mask-gradient-x">
            {blessings.slice(0, 5).map((b, idx) => (
              <div
                key={idx}
                className="shrink-0 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="font-semibold text-xs text-white">{b.guest_name}</span>
                <span className="font-mono text-xs text-amber-400 font-bold">
                  ₹{b.amount?.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
                  {b.goal_title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Scan QR Badge */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-2xl">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
              Scan to Bless Now
            </span>
            <p className="text-[11px] text-gray-300">
              Appear on the venue big screen instantly!
            </p>
          </div>
          <div className="p-1.5 bg-white rounded-xl shadow-md shrink-0">
            <QRCodeSVG value={registryUrl} size={64} level="M" />
          </div>
        </div>
      </div>
    </div>
  );
}

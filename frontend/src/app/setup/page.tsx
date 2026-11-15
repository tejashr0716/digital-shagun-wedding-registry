"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Calendar, MapPin, Image as ImageIcon, ArrowRight, Check } from "lucide-react";
import { api, getAuthToken } from "@/lib/api";

export default function SetupWeddingPage() {
  const router = useRouter();
  const [brideName, setBrideName] = useState("Priya Sharma");
  const [groomName, setGroomName] = useState("Rohit Verma");
  const [eventDate, setEventDate] = useState("2026-12-20");
  const [venue, setVenue] = useState("The Taj West End, Race Course Road, Bengaluru");
  const [story, setStory] = useState(
    "From coffee dates in Bengaluru to planning our future together, we cannot wait to celebrate our union with everyone we love!"
  );
  const [coverImageUrl, setCoverImageUrl] = useState(
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80"
  );
  const [slug, setSlug] = useState("priya-and-rohit");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/auth");
    }
  }, [router]);

  const handleNamesChange = (bride: string, groom: string) => {
    setBrideName(bride);
    setGroomName(groom);
    const clean = `${bride.toLowerCase().trim()}-and-${groom.toLowerCase().trim()}`
      .replace(/[^a-z0-9\-]+/g, "")
      .replace(/\s+/g, "-");
    setSlug(clean || "our-wedding");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.createOrUpdateWedding({
        bride_name: brideName,
        groom_name: groomName,
        event_date: eventDate,
        venue: venue,
        story: story,
        cover_image_url: coverImageUrl,
        slug: slug,
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to save wedding event profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl border border-rose-100 p-8 sm:p-10 space-y-8">
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <span className="text-xs uppercase tracking-widest font-bold text-rose-500">
            Window 2: Couple Profile &amp; Event Setup
          </span>
          <h1 className="text-3xl font-serif font-bold text-gray-900">
            Design Your Wedding Registry
          </h1>
          <p className="text-xs text-gray-500 max-w-lg mx-auto">
            Set the event date, couple story, and claim your vanity shortlink for invitations.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 text-red-600 text-xs border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Couple Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Bride&apos;s Name *
              </label>
              <input
                type="text"
                required
                value={brideName}
                onChange={(e) => handleNamesChange(e.target.value, groomName)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Groom&apos;s Name *
              </label>
              <input
                type="text"
                required
                value={groomName}
                onChange={(e) => handleNamesChange(brideName, e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Vanity URL Preview */}
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                Personalized Event Shortlink
              </span>
              <p className="text-xs font-mono font-semibold text-gray-800 break-all">
                platform.com/w/<span className="text-rose-600 underline">{slug}</span>
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full self-start sm:self-auto">
              <Check className="w-3.5 h-3.5" /> Vanity URL Available
            </span>
          </div>

          {/* Date & Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Wedding Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Venue &amp; City
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="e.g. The Taj West End, Bengaluru"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Couple Backstory */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Couple Backstory / Message to Guests
            </label>
            <textarea
              rows={3}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Cover Photo */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Cover Photo URL
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl text-white font-bold text-sm bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Saving Profile..." : "Save & Open Organizer Dashboard"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

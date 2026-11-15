"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, Heart, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import ProgressBar from "@/components/ProgressBar";
import VendorBanners from "@/components/VendorBanners";

export default function GoalsBuilderPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  // New goal form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("HONEYMOON");
  const [targetAmount, setTargetAmount] = useState<number>(300000);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [showTarget, setShowTarget] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchGoals = async () => {
    try {
      const data = await api.listMyGoals();
      setGoals(data);
    } catch (err: any) {
      setError(err.message || "Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createGoal({
        title,
        category,
        target_amount: targetAmount,
        cover_image_url: coverImageUrl || undefined,
        show_target_amount: showTarget,
        is_active: true,
      });
      setShowModal(false);
      setTitle("");
      fetchGoals();
    } catch (err: any) {
      alert(err.message || "Failed to add goal");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this milestone fund?")) return;
    try {
      await api.deleteGoal(id);
      fetchGoals();
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-rose-600 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
          </Link>
          <span className="text-xs uppercase tracking-widest font-bold text-rose-500 block">
            Window 3: Milestone Crowdfunding
          </span>
          <h1 className="text-3xl font-serif font-bold text-gray-900">
            Goal &amp; Fund Builder
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Curate meaningful life milestones for your guests to gift toward.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-200 transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Milestone
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-600 text-xs border border-red-200">
          {error}
        </div>
      )}

      {/* Goals Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-gray-400">Loading your registry goals...</div>
      ) : goals.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-gray-200 space-y-3">
          <Heart className="w-10 h-10 text-rose-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No Milestones Added Yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Create milestones such as your Honeymoon Fund, First Home Down Payment, or Home Appliances.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" /> Create Your First Milestone
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={goal.cover_image_url || "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80"}
                    alt={goal.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-800 shadow-xs">
                    {goal.category}
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-1.5 rounded-full bg-white/80 hover:bg-red-50 text-gray-600 hover:text-red-600 shadow-xs transition-colors"
                      title="Remove milestone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <h3 className="font-serif font-bold text-gray-900 text-lg leading-snug">
                    {goal.title}
                  </h3>

                  <ProgressBar
                    collected={goal.collected_amount}
                    target={goal.target_amount}
                    percentage={goal.percentage_funded}
                    showTarget={goal.show_target_amount}
                  />
                </div>
              </div>

              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-[11px] text-gray-500">
                <span className="flex items-center gap-1">
                  {goal.show_target_amount ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-600" /> Target Visible
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-gray-400" /> Target Hidden
                    </>
                  )}
                </span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Window 3 Vendor Affiliate Slots */}
      <VendorBanners />

      {/* Add Milestone Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-rose-100">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                  New Goal
                </span>
                <h3 className="text-xl font-serif font-bold text-gray-900">
                  Add Milestone Fund
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Honeymoon in Italy, New Home Down Payment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 bg-white"
                  >
                    <option value="HONEYMOON">Honeymoon Trip</option>
                    <option value="DOWNPAYMENT">Home Down Payment</option>
                    <option value="CHARITY">Charity Blessing</option>
                    <option value="CUSTOM">Custom Milestone</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Target Amount (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Cover Photo URL (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300"
                />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200">
                <input
                  type="checkbox"
                  id="targetVisible"
                  checked={showTarget}
                  onChange={(e) => setShowTarget(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded-sm"
                />
                <label htmlFor="targetVisible" className="text-xs text-gray-700 font-medium cursor-pointer">
                  Show target amount publicly to guests (Recommended)
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md shadow-rose-200 disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add to Registry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

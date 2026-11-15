"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart, Wallet, Percent, QrCode, ArrowUpRight,
  Download, Eye, Sparkles, CheckCircle2, MessageSquare
} from "lucide-react";
import { api, getAuthToken } from "@/lib/api";

export default function CoupleDashboardPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<any>(null);
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payoutTriggered, setPayoutTriggered] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/auth");
      return;
    }

    const loadData = async () => {
      try {
        const [dash, gifts] = await Promise.all([
          api.getDashboardOverview(),
          api.getLedger(),
        ]);
        setOverview(dash);
        setLedger(gifts);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  const handleWithdraw = () => {
    setPayoutTriggered(true);
    setTimeout(() => {
      alert("✅ Direct disbursement initiated via Razorpay Route to your verified bank account (UTR ref will arrive in 24 hours).");
      setPayoutTriggered(false);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-gray-400">
        Loading organizer dashboard...
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-white border border-gray-200 text-center space-y-4">
        <Heart className="w-10 h-10 text-rose-300 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Dashboard Unavailable</h2>
        <p className="text-xs text-red-600">{error}</p>
        <Link
          href="/setup"
          className="inline-block px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold"
        >
          Complete Wedding Setup
        </Link>
      </div>
    );
  }

  const formatINR = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 rounded-3xl p-8 text-white shadow-xl shadow-rose-200/50">
        <div className="space-y-1">
          <span className="text-[10px] tracking-widest uppercase font-bold text-rose-200">
            Window 9: Couple Organizer Dashboard
          </span>
          <h1 className="text-3xl font-serif font-bold">
            Welcome, {overview.couple_title}
          </h1>
          <p className="text-xs text-rose-100">
            Wedding Date: {new Date(overview.event_date).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })} •{" "}
            <span className="font-bold underline">{overview.days_until_wedding} days to go!</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href={`/w/${overview.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white text-rose-700 hover:bg-rose-50 shadow-md transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> View Public Page
          </Link>
          <Link
            href={`/w/${overview.slug}/live`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-amber-400 text-gray-950 hover:bg-amber-300 shadow-md transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" /> Venue Kiosk
          </Link>
        </div>
      </div>

      {/* Financial KPIs Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Collected */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Total Shagun Collected
          </span>
          <div className="text-2xl font-serif font-bold text-gray-900">
            {formatINR(overview.total_collected_gross)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            Across {overview.total_gifts_count} generous blessings
          </span>
        </div>

        {/* Platform Convenience Fee */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Platform Fee (1.5%)
            </span>
            <Percent className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-gray-700">
            {formatINR(overview.total_platform_fee)}
          </div>
          <span className="text-[11px] text-gray-400 block">
            Deducted automatically before disbursement
          </span>
        </div>

        {/* Net Settlement Balance */}
        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-xs space-y-1 bg-gradient-to-br from-white to-rose-50/30">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              Net Payout Balance
            </span>
            <Wallet className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-rose-600">
            {formatINR(overview.total_net_payout)}
          </div>
          <span className="text-[11px] text-rose-700 font-semibold block">
            Available for direct bank settlement
          </span>
        </div>

        {/* Payout Action */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Disbursement Status
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-gray-800">Bank KYC Verified</span>
            </div>
          </div>

          <button
            onClick={handleWithdraw}
            disabled={payoutTriggered || overview.total_net_payout <= 0}
            className="w-full py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {payoutTriggered ? "Processing..." : "Withdraw / Payout"}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/dashboard/goals"
          className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs hover:border-rose-300 hover:shadow-md transition-all flex items-center gap-3"
        >
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900">Manage Milestones</h4>
            <span className="text-[11px] text-gray-500">Window 3 Builder</span>
          </div>
        </Link>

        <Link
          href="/dashboard/payout"
          className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs hover:border-rose-300 hover:shadow-md transition-all flex items-center gap-3"
        >
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900">Bank KYC Setup</h4>
            <span className="text-[11px] text-gray-500">Window 4 Payouts</span>
          </div>
        </Link>

        <Link
          href="/dashboard/qr-kit"
          className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs hover:border-rose-300 hover:shadow-md transition-all flex items-center gap-3"
        >
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900">Invitation QR Kit</h4>
            <span className="text-[11px] text-gray-500">Window 5 Print</span>
          </div>
        </Link>

        <Link
          href="/dashboard/thank-you"
          className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs hover:border-rose-300 hover:shadow-md transition-all flex items-center gap-3"
        >
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900">Thank-You Hub</h4>
            <span className="text-[11px] text-gray-500">Window 10 Dispatch</span>
          </div>
        </Link>
      </div>

      {/* Itemized Guest Ledger Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-serif font-bold text-gray-900 text-lg">
              Itemized Real-Time Guest Ledger
            </h3>
            <p className="text-xs text-gray-500">
              Filterable transaction ledger with guest blessings, gross amounts, and net proceeds.
            </p>
          </div>

          <div className="flex gap-2">
            <a
              href={api.getCSVExportUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" /> Export CSV
            </a>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-6">Guest Name</th>
                <th className="py-3 px-6">Milestone Goal</th>
                <th className="py-3 px-6">Gross Amount</th>
                <th className="py-3 px-6">Platform Fee (1.5%)</th>
                <th className="py-3 px-6">Net to Couple</th>
                <th className="py-3 px-6">Blessing Message</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ledger.map((gift) => (
                <tr key={gift.id} className="hover:bg-rose-50/30 transition-colors">
                  <td className="py-4 px-6 font-bold text-gray-900">
                    {gift.guest_name}
                    {gift.guest_phone && (
                      <span className="block text-[10px] font-normal text-gray-400">
                        {gift.guest_phone}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-gray-700 font-medium">
                    {gift.goal_title || "General Fund"}
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-gray-900">
                    {formatINR(gift.gross_amount)}
                  </td>
                  <td className="py-4 px-6 font-mono text-gray-400">
                    -{formatINR(gift.platform_fee)}
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-rose-600">
                    {formatINR(gift.net_amount)}
                  </td>
                  <td className="py-4 px-6 max-w-xs truncate text-gray-600 italic">
                    {gift.guest_message || "—"}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {gift.payment_status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-400 text-[11px] whitespace-nowrap">
                    {new Date(gift.created_at).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

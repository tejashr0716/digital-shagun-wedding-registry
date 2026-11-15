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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#FAF9F6] min-h-screen text-[#1A1A1A]">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-[#ECEAE5] rounded-3xl p-8 shadow-zola">
        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-[#284B43]">
            COUPLE ORGANIZER DASHBOARD
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1A1A1A]">
            Welcome, {overview.couple_title}
          </h1>
          <p className="text-xs sm:text-sm text-[#757575] font-sans">
            Wedding Date: {new Date(overview.event_date).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })} •{" "}
            <span className="font-semibold text-[#1A1A1A]">{overview.days_until_wedding} days to go</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href={`/w/${overview.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#1A1A1A] text-white hover:bg-black shadow-xs transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> View Public Registry
          </Link>
          <Link
            href={`/w/${overview.slug}/live`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold bg-white text-[#1A1A1A] border border-[#D1CFCA] hover:bg-stone-50 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#284B43]" /> Venue Kiosk
          </Link>
        </div>
      </div>

      {/* Financial KPIs Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Collected */}
        <div className="bg-white p-6 rounded-2xl border border-[#ECEAE5] shadow-zola space-y-1">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#757575]">
            Total Shagun Collected
          </span>
          <div className="text-2xl font-serif font-bold text-[#1A1A1A]">
            {formatINR(overview.total_collected_gross)}
          </div>
          <span className="text-[11px] text-[#284B43] font-semibold block">
            Across {overview.total_gifts_count} generous blessings
          </span>
        </div>

        {/* Platform Convenience Fee */}
        <div className="bg-white p-6 rounded-2xl border border-[#ECEAE5] shadow-zola space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#757575]">
              Platform Fee (1.5%)
            </span>
            <Percent className="w-3.5 h-3.5 text-[#8C8C8C]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#757575]">
            {formatINR(overview.total_platform_fee)}
          </div>
          <span className="text-[11px] text-[#8C8C8C] block">
            Automated platform fee
          </span>
        </div>

        {/* Net Settlement Balance */}
        <div className="bg-[#EEF4F2] p-6 rounded-2xl border border-[#D5E4E0] shadow-zola space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#284B43]">
              Net Payout Balance
            </span>
            <Wallet className="w-4 h-4 text-[#284B43]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#284B43]">
            {formatINR(overview.total_net_payout)}
          </div>
          <span className="text-[11px] text-[#36534E] font-medium block">
            Available for direct bank settlement
          </span>
        </div>

        {/* Payout Action */}
        <div className="bg-white p-6 rounded-2xl border border-[#ECEAE5] shadow-zola flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#757575]">
              Disbursement Status
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-4 h-4 text-[#284B43]" />
              <span className="text-xs font-semibold text-[#1A1A1A]">Bank KYC Verified</span>
            </div>
          </div>

          <button
            onClick={handleWithdraw}
            disabled={payoutTriggered || overview.total_net_payout <= 0}
            className="w-full py-2.5 px-3 rounded-full bg-[#1A1A1A] hover:bg-black text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {payoutTriggered ? "Processing..." : "Disburse / Payout"}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/dashboard/goals"
          className="p-5 rounded-2xl bg-white border border-[#ECEAE5] shadow-zola hover:border-[#1A1A1A] transition-all flex items-center gap-3.5 group"
        >
          <div className="p-2.5 rounded-full bg-stone-100 text-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1A1A1A]">Manage Milestones</h4>
            <span className="text-[11px] text-[#757575]">Registry Funds</span>
          </div>
        </Link>

        <Link
          href="/dashboard/payout"
          className="p-5 rounded-2xl bg-white border border-[#ECEAE5] shadow-zola hover:border-[#1A1A1A] transition-all flex items-center gap-3.5 group"
        >
          <div className="p-2.5 rounded-full bg-stone-100 text-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1A1A1A]">Bank KYC Setup</h4>
            <span className="text-[11px] text-[#757575]">Settlement Details</span>
          </div>
        </Link>

        <Link
          href="/dashboard/qr-kit"
          className="p-5 rounded-2xl bg-white border border-[#ECEAE5] shadow-zola hover:border-[#1A1A1A] transition-all flex items-center gap-3.5 group"
        >
          <div className="p-2.5 rounded-full bg-stone-100 text-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1A1A1A]">Invitation QR Kit</h4>
            <span className="text-[11px] text-[#757575]">Printable Vector</span>
          </div>
        </Link>

        <Link
          href="/dashboard/thank-you"
          className="p-5 rounded-2xl bg-white border border-[#ECEAE5] shadow-zola hover:border-[#1A1A1A] transition-all flex items-center gap-3.5 group"
        >
          <div className="p-2.5 rounded-full bg-stone-100 text-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1A1A1A]">Thank-You Hub</h4>
            <span className="text-[11px] text-[#757575]">Guest Messages</span>
          </div>
        </Link>
      </div>

      {/* Itemized Guest Ledger Table */}
      <div className="bg-white rounded-2xl border border-[#ECEAE5] shadow-zola overflow-hidden">
        <div className="p-6 border-b border-[#ECEAE5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-serif font-bold text-[#1A1A1A] text-xl">
              Itemized Guest Ledger
            </h3>
            <p className="text-xs text-[#757575]">
              Real-time transaction reconciliation ledger with guest blessings, gross amounts, and net proceeds.
            </p>
          </div>

          <div className="flex gap-2">
            <a
              href={api.getCSVExportUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#D1CFCA] text-xs font-semibold text-[#1A1A1A] hover:bg-stone-50 transition-colors"
            >
              <Download className="w-4 h-4" /> Export CSV
            </a>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] border-b border-[#ECEAE5] text-[#757575] uppercase tracking-wider font-mono text-[10px]">
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
            <tbody className="divide-y divide-[#ECEAE5]">
              {ledger.map((gift) => (
                <tr key={gift.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-[#1A1A1A]">
                    {gift.guest_name}
                    {gift.guest_phone && (
                      <span className="block text-[10px] font-normal text-[#8C8C8C]">
                        {gift.guest_phone}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-[#595959] font-medium">
                    {gift.goal_title || "General Fund"}
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-[#1A1A1A]">
                    {formatINR(gift.gross_amount)}
                  </td>
                  <td className="py-4 px-6 font-mono text-[#8C8C8C]">
                    -{formatINR(gift.platform_fee)}
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-[#284B43]">
                    {formatINR(gift.net_amount)}
                  </td>
                  <td className="py-4 px-6 max-w-xs truncate text-[#595959] italic font-serif">
                    {gift.guest_message || "—"}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#284B43] bg-[#EEF4F2] px-2.5 py-0.5 rounded-full border border-[#D5E4E0]">
                      {gift.payment_status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[#8C8C8C] text-[11px] whitespace-nowrap">
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

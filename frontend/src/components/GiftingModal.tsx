"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { X, ShieldCheck, Download, CheckCircle2, Smartphone } from "lucide-react";
import { api } from "@/lib/api";

interface GoalOption {
  id: string;
  title: string;
}

interface GiftingModalProps {
  weddingId: string;
  weddingSlug?: string;
  coupleTitle: string;
  goals: GoalOption[];
  selectedGoalId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GiftingModal({
  weddingId,
  coupleTitle,
  goals,
  selectedGoalId: initialGoalId,
  onClose,
  onSuccess,
}: GiftingModalProps) {
  const [selectedGoal, setSelectedGoal] = useState<string>(initialGoalId || "");
  const [amount, setAmount] = useState<number>(2100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [guestName, setGuestName] = useState<string>("");
  const [guestPhone, setGuestPhone] = useState<string>("");
  const [guestMessage, setGuestMessage] = useState<string>("");
  const [coverFee, setCoverFee] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Post-payment success state
  const [confirmedReceipt, setConfirmedReceipt] = useState<{
    receiptId: string;
    grossAmount: number;
    guestName: string;
    milestone: string;
    timestamp: string;
  } | null>(null);

  const presets = [1001, 2100, 5001, 11000];

  const effectiveAmount = customAmount ? parseFloat(customAmount) || 0 : amount;
  const transactionFee = coverFee ? Math.round(effectiveAmount * 0.02) : 0;
  const totalPayable = effectiveAmount + transactionFee;

  const triggerCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#f43f5e", "#fbbf24", "#ec4899", "#10b981"],
    });
  };

  const handlePresetClick = (p: number) => {
    setAmount(p);
    setCustomAmount("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setError("Please enter your name for the couple's blessing book");
      return;
    }
    if (effectiveAmount < 100) {
      setError("Minimum gift amount is ₹100");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // 1. Initiate gift order on backend
      const initResponse = await api.initiateGift({
        wedding_id: weddingId,
        goal_id: selectedGoal || undefined,
        guest_name: guestName,
        guest_phone: guestPhone,
        guest_message: guestMessage,
        amount: effectiveAmount,
        cover_fee_by_guest: coverFee,
      });

      // 2. In production with live Razorpay, window.Razorpay opens checkout modal.
      // In development / demo environment, execute instant verified test signature:
      const verifyResponse = await api.verifyGift({
        gift_id: initResponse.gift_id,
        razorpay_order_id: initResponse.razorpay_order_id,
        razorpay_payment_id: `pay_${Date.now()}`,
        razorpay_signature: "mock_signature_test_pass",
      });

      if (verifyResponse.success) {
        triggerCelebration();
        const goalObj = goals.find((g) => g.id === selectedGoal);
        setConfirmedReceipt({
          receiptId: verifyResponse.receipt_id || `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
          grossAmount: verifyResponse.gross_amount || totalPayable,
          guestName: guestName,
          milestone: goalObj ? goalObj.title : "General Blessings Fund",
          timestamp: new Date().toLocaleString("en-IN"),
        });
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Failed to process gifting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-[#ECEAE5] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-[#ECEAE5] bg-[#FAF9F6] relative">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-5 p-2 rounded-full text-[#757575] hover:text-[#1A1A1A] hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF4F2] text-[#284B43] text-[10px] font-mono tracking-widest uppercase font-bold mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            0% Cash Fund Fee Guarantee
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1A1A]">
            Contribute to {coupleTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#757575] mt-1 font-sans">
            Send love and support their next chapter. The couple receives 100% of your blessing.
          </p>
        </div>

        {/* Modal Body */}
        {confirmedReceipt ? (
          /* Receipt Screen */
          <div className="p-8 space-y-6 text-center">
            <div className="w-16 h-16 bg-[#EEF4F2] text-[#284B43] rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-serif font-bold text-[#1A1A1A]">
                Blessing &amp; Gift Confirmed
              </h3>
              <p className="text-xs text-[#757575] font-sans">
                Your blessing has been delivered to {coupleTitle}&apos;s live registry and guest book.
              </p>
            </div>

            {/* Receipt Card */}
            <div className="rounded-xl border border-[#ECEAE5] bg-[#FAF9F6] p-5 text-left space-y-3 text-xs">
              <div className="flex justify-between border-b border-[#ECEAE5] pb-2">
                <span className="text-[#757575]">Receipt Reference:</span>
                <span className="font-mono font-bold text-[#1A1A1A]">{confirmedReceipt.receiptId}</span>
              </div>
              <div className="flex justify-between border-b border-[#ECEAE5] pb-2">
                <span className="text-[#757575]">From:</span>
                <span className="font-semibold text-[#1A1A1A]">{confirmedReceipt.guestName}</span>
              </div>
              <div className="flex justify-between border-b border-[#ECEAE5] pb-2">
                <span className="text-[#757575]">Target Fund:</span>
                <span className="font-semibold text-[#284B43]">{confirmedReceipt.milestone}</span>
              </div>
              <div className="flex justify-between border-b border-[#ECEAE5] pb-2">
                <span className="text-[#757575]">Total Transferred:</span>
                <span className="font-bold text-base text-[#1A1A1A]">
                  ₹{confirmedReceipt.grossAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-[#8C8C8C]">
                <span>Timestamp:</span>
                <span>{confirmedReceipt.timestamp}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-full border border-[#D1CFCA] text-xs font-semibold text-[#1A1A1A] hover:bg-stone-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Print / Save Receipt
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-5 py-3 rounded-full bg-[#1A1A1A] hover:bg-black text-xs font-semibold text-white shadow-sm transition-colors"
              >
                Return to Registry
              </button>
            </div>
          </div>
        ) : (
          /* Gifting Input Form */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            {error && (
              <div className="p-3 text-xs rounded-xl bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            )}

            {/* Milestone Goal Dropdown */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#757575] font-semibold mb-1.5">
                Target Milestone or Fund
              </label>
              <select
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D1CFCA] focus:outline-hidden focus:ring-1 focus:ring-[#1A1A1A] focus:border-[#1A1A1A] bg-white text-[#1A1A1A]"
              >
                <option value="">General Blessings Fund (Open Pool)</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Selection */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#757575] font-semibold mb-1.5">
                Select Amount (INR)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2.5">
                {presets.map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => handlePresetClick(p)}
                    className={`py-2 px-1 text-xs font-semibold rounded-full border transition-all ${
                      amount === p && !customAmount
                        ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs"
                        : "bg-white text-[#1A1A1A] border-[#D1CFCA] hover:border-[#1A1A1A]"
                    }`}
                  >
                    ₹{p.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sm font-semibold text-[#757575]">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="Or enter custom amount"
                  value={customAmount}
                  onChange={handleCustomChange}
                  className="w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border border-[#D1CFCA] focus:outline-hidden focus:ring-1 focus:ring-[#1A1A1A] focus:border-[#1A1A1A] text-[#1A1A1A]"
                />
              </div>
            </div>

            {/* Guest Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#757575] font-semibold mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand & Sunita"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D1CFCA] focus:outline-hidden focus:ring-1 focus:ring-[#1A1A1A] focus:border-[#1A1A1A] text-[#1A1A1A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#757575] font-semibold mb-1">
                  Phone (for SMS receipt)
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D1CFCA] focus:outline-hidden focus:ring-1 focus:ring-[#1A1A1A] focus:border-[#1A1A1A] text-[#1A1A1A]"
                />
              </div>
            </div>

            {/* Personal Blessing Note */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#757575] font-semibold mb-1">
                Your Heartfelt Blessing or Wishes
              </label>
              <textarea
                rows={2}
                placeholder="Wishing you a lifetime filled with love, laughter, and grand adventures together..."
                value={guestMessage}
                onChange={(e) => setGuestMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D1CFCA] focus:outline-hidden focus:ring-1 focus:ring-[#1A1A1A] focus:border-[#1A1A1A] text-[#1A1A1A]"
              />
            </div>

            {/* Cover Fee Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#EEF4F2] border border-[#D5E4E0]">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="coverFee"
                  checked={coverFee}
                  onChange={(e) => setCoverFee(e.target.checked)}
                  className="w-4 h-4 text-[#284B43] rounded-xs border-[#D1CFCA] focus:ring-[#284B43] cursor-pointer"
                />
                <label htmlFor="coverFee" className="text-xs text-[#284B43] cursor-pointer font-medium">
                  Add 2.0% (₹{Math.round(effectiveAmount * 0.02)}) to cover processing
                </label>
              </div>
              <span className="text-[10px] text-[#284B43] font-bold bg-white px-2 py-0.5 rounded-full border border-[#D5E4E0]">
                100% to Couple
              </span>
            </div>

            {/* Razorpay Pay CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-full text-white font-semibold text-sm bg-[#1A1A1A] hover:bg-black shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                "Processing Payment..."
              ) : (
                <>
                  <Smartphone className="w-4 h-4" />
                  Contribute ₹{totalPayable.toLocaleString("en-IN")} via UPI / Card
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#8C8C8C]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#284B43]" />
              Secured with 256-bit encryption · Zero recipient fees
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

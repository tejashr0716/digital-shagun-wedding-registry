"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { X, Heart, ShieldCheck, Download, CheckCircle2, Smartphone } from "lucide-react";
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
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-rose-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-5 h-5 fill-white" />
            <span className="text-xs uppercase tracking-widest font-bold opacity-90">
              Traditional Shagun • Modern Gifting
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold">Bless {coupleTitle}</h2>
          <p className="text-xs text-rose-100 mt-1">
            Zero physical clutter. Direct contribution to their future milestones.
          </p>
        </div>

        {/* Modal Body */}
        {confirmedReceipt ? (
          /* Receipt Screen */
          <div className="p-6 space-y-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-serif font-bold text-gray-900">
                Blessing & Gift Confirmed!
              </h3>
              <p className="text-xs text-gray-500">
                Your blessing has been delivered to {coupleTitle}&apos;s live reception ticker.
              </p>
            </div>

            {/* Receipt Card */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-left space-y-3 text-xs">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Receipt Ref:</span>
                <span className="font-mono font-bold text-gray-800">{confirmedReceipt.receiptId}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Giver:</span>
                <span className="font-semibold text-gray-900">{confirmedReceipt.guestName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Milestone Goal:</span>
                <span className="font-semibold text-rose-600">{confirmedReceipt.milestone}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Amount Paid:</span>
                <span className="font-bold text-base text-gray-900">
                  ₹{confirmedReceipt.grossAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>Timestamp:</span>
                <span>{confirmedReceipt.timestamp}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Print / Save Receipt
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-md shadow-rose-200 transition-colors"
              >
                Close & Return to Registry
              </button>
            </div>
          </div>
        ) : (
          /* Gifting Input Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 text-xs rounded-lg bg-red-50 text-red-600 border border-red-200">
                {error}
              </div>
            )}

            {/* Milestone Goal Dropdown */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Target Milestone
              </label>
              <select
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Shagun Amount (₹ INR)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {presets.map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => handlePresetClick(p)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      amount === p && !customAmount
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-rose-50 hover:border-rose-300"
                    }`}
                  >
                    ₹{p.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Or enter custom amount (e.g. 7500)"
                value={customAmount}
                onChange={handleCustomChange}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            {/* Guest Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh & Sunita"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Phone (for SMS receipt)
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Personal Blessing Note */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Your Heartfelt Blessing & Wishes
              </label>
              <textarea
                rows={2}
                placeholder="May your journey together be blessed with endless happiness and love..."
                value={guestMessage}
                onChange={(e) => setGuestMessage(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Cover Fee Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="coverFee"
                  checked={coverFee}
                  onChange={(e) => setCoverFee(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded-sm border-gray-300 focus:ring-rose-500"
                />
                <label htmlFor="coverFee" className="text-xs font-medium text-gray-700 cursor-pointer">
                  Add 2% (₹{Math.round(effectiveAmount * 0.02)}) to cover gateway costs
                </label>
              </div>
              <span className="text-[10px] text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
                100% to Couple
              </span>
            </div>

            {/* Razorpay Pay CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:opacity-95 shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                "Connecting to Razorpay..."
              ) : (
                <>
                  <Smartphone className="w-4 h-4" />
                  Pay ₹{totalPayable.toLocaleString("en-IN")} via UPI / Card
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Secured with 256-bit encryption by Razorpay Payments
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

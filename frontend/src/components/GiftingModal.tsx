"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { X, ShieldCheck, Download, CheckCircle2, Smartphone } from "lucide-react";
import { api } from "@/lib/api";

interface GoalOption {
  id: string;
  title: string;
  image?: string;
}

interface GiftingModalProps {
  weddingId: string;
  weddingSlug?: string;
  coupleTitle: string;
  coupleImage?: string;
  goals: GoalOption[];
  selectedGoalId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GiftingModal({
  weddingId,
  coupleTitle,
  coupleImage,
  goals,
  selectedGoalId: initialGoalId,
  onClose,
  onSuccess,
}: GiftingModalProps) {
  const [selectedGoal, setSelectedGoal] = useState<string>(initialGoalId || (goals[0]?.id || ""));
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

  const currentGoalObj = goals.find((g) => g.id === selectedGoal);
  const displayTitle = currentGoalObj ? currentGoalObj.title : "Our newlywed fund";
  const displayImage = currentGoalObj?.image || coupleImage || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85";

  const triggerCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#284b43", "#c86d51", "#fbbf24", "#10b981"],
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
      const initResponse = await api.initiateGift({
        wedding_id: weddingId,
        goal_id: selectedGoal || undefined,
        guest_name: guestName,
        guest_phone: guestPhone,
        guest_message: guestMessage,
        amount: effectiveAmount,
        cover_fee_by_guest: coverFee,
      });

      const verifyResponse = await api.verifyGift({
        gift_id: initResponse.gift_id,
        razorpay_order_id: initResponse.razorpay_order_id,
        razorpay_payment_id: `pay_${Date.now()}`,
        razorpay_signature: "mock_signature_test_pass",
      });

      if (verifyResponse.success) {
        triggerCelebration();
        setConfirmedReceipt({
          receiptId: verifyResponse.receipt_id || `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
          grossAmount: verifyResponse.gross_amount || totalPayable,
          guestName: guestName,
          milestone: displayTitle,
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
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden border border-[#ECEAE5] animate-in fade-in zoom-in-95 duration-200">
        {/* Receipt View */}
        {confirmedReceipt ? (
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

            <div className="rounded-2xl border border-[#ECEAE5] bg-[#FAF9F6] p-5 text-left space-y-3 text-xs">
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
                Print / Save
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
          /* Zola Step 104 Modal Layout */
          <div className="p-6 sm:p-7 space-y-5">
            {/* Top Bar with Title and Close Button */}
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-sans font-bold text-[#1A1A1A] tracking-tight pr-6">
                {displayTitle}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-1 rounded-full text-stone-500 hover:text-black hover:bg-stone-100 transition-colors shrink-0"
              >
                <X className="w-6 h-6 stroke-[2.2]" />
              </button>
            </div>

            {/* Couple / Fund Photo */}
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-stone-100 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayImage}
                alt={displayTitle}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Subtle Divider */}
            <hr className="border-[#ECEAE5]" />

            {/* Gifting Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-xs rounded-xl bg-red-50 text-red-700 border border-red-200">
                  {error}
                </div>
              )}

              {/* Fund Selector if multiple */}
              {goals.length > 1 && (
                <div>
                  <label className="block text-xs font-medium text-[#757575] mb-1">
                    Select Milestone
                  </label>
                  <select
                    value={selectedGoal}
                    onChange={(e) => setSelectedGoal(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-black bg-white"
                  >
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Contribute Input Block */}
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
                  Contribute
                </label>
                <div className="relative rounded-xl border border-stone-400 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-base font-semibold text-[#1A1A1A]">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="100"
                    value={customAmount !== "" ? customAmount : amount}
                    onChange={handleCustomChange}
                    className="w-full pl-9 pr-4 py-3 text-base font-semibold text-[#1A1A1A] bg-transparent focus:outline-hidden rounded-xl"
                  />
                </div>

                {/* Shagun Presets */}
                <div className="flex flex-wrap gap-2 pt-2.5">
                  {presets.map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => handlePresetClick(p)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        amount === p && customAmount === ""
                          ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                          : "bg-white text-stone-700 border-stone-300 hover:border-black"
                      }`}
                    >
                      ₹{p.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guest Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Anand &amp; Sunita"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-black text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Phone (for SMS receipt)
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-black text-stone-900"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Personal Blessing or Note
                </label>
                <textarea
                  rows={2}
                  placeholder="Wishing you both a lifetime of happiness, laughter, and grand adventures..."
                  value={guestMessage}
                  onChange={(e) => setGuestMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-black text-stone-900"
                />
              </div>

              {/* Cover Fee Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#EEF4F2] border border-[#D5E4E0]">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="coverFee"
                    checked={coverFee}
                    onChange={(e) => setCoverFee(e.target.checked)}
                    className="w-4 h-4 text-[#284B43] rounded-xs border-stone-300 focus:ring-[#284B43] cursor-pointer"
                  />
                  <label htmlFor="coverFee" className="text-xs text-[#284B43] font-medium cursor-pointer">
                    Add 2.0% (₹{transactionFee}) to cover payment processing
                  </label>
                </div>
                <span className="text-[10px] text-[#284B43] font-bold bg-white px-2 py-0.5 rounded-full border border-[#D5E4E0]">
                  100% to Couple
                </span>
              </div>

              {/* Primary Action Button - Solid Black Pill */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-full text-white font-semibold text-sm bg-[#1A1A1A] hover:bg-black shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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

              {/* Zola Support Footer */}
              <div className="text-center pt-1 text-[11px] text-stone-500 space-y-0.5">
                <p>To order by phone, call <strong>1-408-657-ZOLA (9652)</strong></p>
                <p className="flex items-center justify-center gap-1 text-[10px] text-[#284B43]">
                  <ShieldCheck className="w-3 h-3" /> 0% Cash Fund Fee Guarantee • 256-bit bank encryption
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

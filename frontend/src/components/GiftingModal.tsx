"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { X, ShieldCheck, Download, CheckCircle2, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { api } from "@/lib/api";

export type GiftItem = {
  id: string;
  type: "physical" | "cash";
  name: string;
  price?: number;
  goal?: number;
  funded?: number;
  fundedPct?: number;
  description: string;
  image: string;
  thumbnails?: string[];
  badge?: string;
};

interface GiftingModalProps {
  weddingId: string;
  weddingSlug?: string;
  coupleTitle: string;
  coupleImage?: string;
  gift: GiftItem;
  goals?: { id: string; title: string; image?: string }[];
  onClose: () => void;
  onSuccess: () => void;
  onAddToCart?: (gift: GiftItem) => void;
}

export default function GiftingModal({
  weddingId,
  coupleTitle,
  gift,
  goals = [],
  onClose,
  onSuccess,
  onAddToCart,
}: GiftingModalProps) {
  const [activeThumb, setActiveThumb] = useState(0);
  const [qty, setQty] = useState(1);
  const [amount, setAmount] = useState(2100);
  const [customAmount, setCustomAmount] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestMessage, setGuestMessage] = useState("");
  const [coverFee, setCoverFee] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  const images = [gift.image, ...(gift.thumbnails || [
    `https://picsum.photos/seed/${gift.id}a/400/400`,
    `https://picsum.photos/seed/${gift.id}b/400/400`,
    `https://picsum.photos/seed/${gift.id}c/400/400`,
  ])];
  const displayImg = images[activeThumb] || gift.image;

  const triggerCelebration = () => {
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ["#5331C6", "#C2ADFF", "#fbbf24", "#10b981"] });
  };

  const handleCashContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) { setError("Please enter your name"); return; }
    if (effectiveAmount < 100) { setError("Minimum gift amount is ₹100"); return; }
    setError(""); setLoading(true);
    try {
      const goalId = goals[0]?.id || "";
      const initResponse = await api.initiateGift({
        wedding_id: weddingId,
        goal_id: goalId || undefined,
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
          guestName,
          milestone: gift.name,
          timestamp: new Date().toLocaleString("en-IN"),
        });
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-white/90 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors shadow-sm">
          <X className="w-5 h-5" />
        </button>

        {/* Receipt View */}
        {confirmedReceipt ? (
          <div className="p-8 space-y-6 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-[#E2FDF3] text-[#00331F] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold text-[#212121]">
                {gift.type === "cash" ? "Contribution Confirmed! 🎉" : "Added to Cart! 🎁"}
              </h3>
              <p className="text-sm text-[#444444] mt-1">Your gift has been recorded for {coupleTitle}&apos;s registry.</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-[#FFFBF6] p-4 text-left space-y-2.5 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-[#444444]">Receipt:</span>
                <span className="font-mono font-bold text-[#212121]">{confirmedReceipt.receiptId}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-[#444444]">From:</span>
                <span className="font-semibold">{confirmedReceipt.guestName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-[#444444]">Gift:</span>
                <span className="font-semibold text-[#5331C6]">{confirmedReceipt.milestone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#444444]">Amount:</span>
                <span className="font-bold text-base">₹{confirmedReceipt.grossAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => window.print()} className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full border border-gray-300 text-sm font-medium text-[#212121] hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" /> Save
              </button>
              <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-full bg-[#5331C6] hover:bg-[#4225a8] text-sm font-semibold text-white transition-colors">
                Back to Registry
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row">
            {/* Left: Image Gallery */}
            <div className="sm:w-1/2 bg-[#F6F6F6] p-4 flex flex-col gap-3">
              {/* Main image */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={displayImg} alt={gift.name} className="w-full h-full object-cover" />
                {/* Nav arrows */}
                {images.length > 1 && (
                  <>
                    <button onClick={() => setActiveThumb((p) => (p - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => setActiveThumb((p) => (p + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
              {/* Thumbnails */}
              <div className="flex gap-2">
                {images.slice(0, 4).map((img, i) => (
                  <button key={i} onClick={() => setActiveThumb(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${activeThumb === i ? "border-[#5331C6]" : "border-transparent"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              {/* Trust badges */}
              <div className="flex flex-wrap gap-2 mt-auto">
                {["Free Returns", "Easy Exchange", "Price Match"].map((b) => (
                  <span key={b} className="text-[10px] font-medium text-[#00331F] bg-[#E2FDF3] px-2.5 py-1 rounded-full">{b}</span>
                ))}
              </div>
            </div>

            {/* Right: Details */}
            <div className="sm:w-1/2 p-5 sm:p-6 overflow-y-auto max-h-[80vh]">
              {/* Badge */}
              {gift.badge && (
                <span className="inline-block text-[10px] font-bold text-[#5331C6] bg-[#C2ADFF]/30 px-2.5 py-1 rounded-full mb-3">
                  {gift.badge}
                </span>
              )}
              {gift.type === "cash" && (
                <span className="inline-block text-[10px] font-bold text-[#5331C6] bg-[#C2ADFF]/30 px-2.5 py-1 rounded-full mb-3 mr-2">
                  Group Gift
                </span>
              )}

              <h2 className="text-xl font-bold text-[#212121] leading-snug mb-1">{gift.name}</h2>

              {gift.type === "physical" && gift.price && (
                <p className="text-2xl font-bold text-[#212121] mb-3">₹{gift.price.toLocaleString("en-IN")}</p>
              )}
              {gift.type === "cash" && gift.goal && (
                <p className="text-sm text-[#444444] mb-1">Goal: <span className="font-bold text-[#212121]">₹{gift.goal.toLocaleString("en-IN")}</span></p>
              )}

              <p className="text-sm text-[#444444] leading-relaxed mb-4">{gift.description}</p>

              {/* Cash Fund Section */}
              {gift.type === "cash" && (
                <>
                  {/* Progress bar */}
                  {gift.fundedPct !== undefined && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-[#444444] mb-1.5">
                        <span className="font-semibold text-[#5331C6]">{gift.fundedPct}% funded</span>
                        {gift.funded && <span>₹{gift.funded.toLocaleString("en-IN")} raised</span>}
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-2 bg-[#5331C6] rounded-full transition-all" style={{ width: `${Math.min(gift.fundedPct, 100)}%` }} />
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleCashContribute} className="space-y-3">
                    {error && <div className="p-3 text-xs rounded-lg bg-red-50 text-red-600 border border-red-200">{error}</div>}

                    {/* Amount */}
                    <div>
                      <label className="block text-xs font-semibold text-[#212121] mb-1.5">Contribute Amount</label>
                      <div className="relative rounded-lg border border-gray-300 focus-within:border-[#5331C6] focus-within:ring-1 focus-within:ring-[#5331C6] transition-all">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-base font-semibold text-[#212121]">₹</span>
                        <input
                          type="number"
                          placeholder="Enter amount"
                          value={customAmount !== "" ? customAmount : amount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="w-full pl-8 pr-4 py-2.5 text-base font-semibold text-[#212121] bg-transparent focus:outline-none rounded-lg"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {presets.map((p) => (
                          <button type="button" key={p} onClick={() => { setAmount(p); setCustomAmount(""); }}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${amount === p && customAmount === "" ? "bg-[#5331C6] text-white border-[#5331C6]" : "bg-white text-[#444444] border-gray-300 hover:border-[#5331C6]"}`}>
                            ₹{p.toLocaleString("en-IN")}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Guest details */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-[#444444] mb-1">Your Name *</label>
                        <input type="text" required placeholder="Anand Kumar" value={guestName} onChange={(e) => setGuestName(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#5331C6] focus:border-[#5331C6]" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#444444] mb-1">Phone (optional)</label>
                        <input type="tel" placeholder="+91 98765 43210" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#5331C6] focus:border-[#5331C6]" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#444444] mb-1">Message to couple</label>
                      <textarea rows={2} placeholder="Wishing you a lifetime of happiness..." value={guestMessage} onChange={(e) => setGuestMessage(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#5331C6] focus:border-[#5331C6]" />
                    </div>

                    {/* Fee toggle */}
                    <label className="flex items-center justify-between p-3 rounded-xl bg-[#FFFBF6] border border-[#C2ADFF]/40 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={coverFee} onChange={(e) => setCoverFee(e.target.checked)} className="w-4 h-4 accent-[#5331C6]" />
                        <span className="text-xs text-[#444444]">Cover 2% gateway fee (₹{transactionFee}) — 100% goes to couple</span>
                      </div>
                    </label>

                    <button type="submit" disabled={loading}
                      className="w-full py-3 px-6 rounded-full text-white font-semibold text-sm bg-[#5331C6] hover:bg-[#4225a8] shadow-md transition-all disabled:opacity-50">
                      {loading ? "Processing..." : `Contribute ₹${totalPayable.toLocaleString("en-IN")}`}
                    </button>

                    <p className="text-center text-[11px] text-[#444444]">
                      Contribute via <span className="font-semibold">UPI / Credit Card / Net Banking</span>
                    </p>

                    <div className="flex items-center justify-center gap-1 text-[10px] text-[#444444]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#5331C6]" />
                      <span>256-bit encryption • 0% Cash Fund Fees</span>
                    </div>
                  </form>
                </>
              )}

              {/* Physical Gift Section */}
              {gift.type === "physical" && (
                <div className="space-y-3">
                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-semibold text-[#212121] mb-2">Quantity</label>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#5331C6] transition-colors">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-base font-bold text-[#212121] w-6 text-center">{qty}</span>
                      <button onClick={() => setQty((q) => q + 1)} className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:border-[#5331C6] transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {gift.price && (
                    <p className="text-sm font-medium text-[#444444]">
                      Total: <span className="font-bold text-[#212121]">₹{(gift.price * qty).toLocaleString("en-IN")}</span>
                    </p>
                  )}

                  <button onClick={() => { onAddToCart?.(gift); onClose(); }}
                    className="w-full py-3 rounded-full bg-[#5331C6] hover:bg-[#4225a8] text-white font-semibold text-sm transition-colors shadow-sm">
                    Add to Cart
                  </button>
                  <button className="w-full py-3 rounded-full border border-[#5331C6] text-[#5331C6] font-semibold text-sm hover:bg-[#5331C6]/5 transition-colors">
                    Buy Now
                  </button>
                  <button className="w-full py-2.5 rounded-full border border-gray-300 text-[#444444] font-medium text-sm hover:bg-gray-50 transition-colors">
                    Mark as Purchased
                  </button>

                  <div className="flex items-center justify-center gap-1 text-[11px] text-[#444444] pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#5331C6]" />
                    <span>Fulfilled by Registry • Free Returns • Easy Exchange</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Download, MessageSquare, Check } from "lucide-react";
import { api } from "@/lib/api";
import VendorBanners from "@/components/VendorBanners";

export default function ThankYouDispatchPage() {
  const [ledger, setLedger] = useState<any[]>([]);
  const [wedding, setWedding] = useState<any>(null);
  const [dispatched, setDispatched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [w, gifts] = await Promise.all([
          api.getMyWedding(),
          api.getLedger("SUCCESS"),
        ]);
        setWedding(w);
        setLedger(gifts);
      } catch {
        // Fallback
      }
    };
    loadData();
  }, []);

  const coupleTitle = wedding ? `${wedding.bride_name} & ${wedding.groom_name}` : "Priya & Rohit";

  const generateThankYouMessage = (gift: any) => {
    return `Dearest ${gift.guest_name},\n\nThank you so much from the bottom of our hearts for blessing our wedding and for your generous contribution of ₹${gift.gross_amount.toLocaleString("en-IN")} toward our ${gift.goal_title || "future milestones"}.\n\nYour warm blessing: "${gift.guest_message || "Congratulations!"}" brought immense joy to our special day.\n\nWith all our love and gratitude,\n${coupleTitle}`;
  };

  const handleSendWhatsApp = (gift: any) => {
    const text = generateThankYouMessage(gift);
    const phone = gift.guest_phone ? gift.guest_phone.replace(/[^0-9]/g, "") : "";
    const url = phone
      ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

    window.open(url, "_blank");
    setDispatched((prev) => ({ ...prev, [gift.id]: true }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-rose-600 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <span className="text-xs uppercase tracking-widest font-bold text-rose-500 block">
          Window 10: Post-Wedding &amp; Gratitude Automation
        </span>
        <h1 className="text-3xl font-serif font-bold text-gray-900">
          Automated Thank-You Dispatch &amp; Vendor Perks
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Send 1-click personalized WhatsApp thank-you notes with custom blessing citations and download your complete master guest list.
        </p>
      </div>

      {/* Action Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-serif font-bold text-gray-900 text-lg">
            Master Guest Export &amp; Registry Reconciliation
          </h3>
          <p className="text-xs text-gray-500">
            Export all {ledger.length} verified gifts with contact details, timestamps, and payment reference numbers.
          </p>
        </div>

        <a
          href={api.getCSVExportUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all shadow-md shrink-0"
        >
          <Download className="w-4 h-4" /> Download Guest Excel / CSV
        </a>
      </div>

      {/* 1-Click WhatsApp Dispatch Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-base">
              Personalized WhatsApp Thank-You Generator
            </h3>
            <p className="text-xs text-gray-500">
              Each message auto-injects the guest&apos;s name, gifted amount, milestone funded, and cites their original blessing note!
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            WhatsApp Template Engine
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-6">Guest</th>
                <th className="py-3 px-6">Shagun Contribution</th>
                <th className="py-3 px-6">Milestone</th>
                <th className="py-3 px-6">Blessing Citation</th>
                <th className="py-3 px-6 text-right">Instant Dispatch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ledger.map((gift) => (
                <tr key={gift.id} className="hover:bg-rose-50/20 transition-colors">
                  <td className="py-4 px-6 font-bold text-gray-900">
                    {gift.guest_name}
                    {gift.guest_phone && (
                      <span className="block text-[10px] font-normal text-gray-400">
                        {gift.guest_phone}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-rose-600">
                    ₹{gift.gross_amount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {gift.goal_title || "General Fund"}
                  </td>
                  <td className="py-4 px-6 max-w-sm text-gray-600 italic">
                    &ldquo;{gift.guest_message || "Blessings to Priya & Rohit"}&rdquo;
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleSendWhatsApp(gift)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        dispatched[gift.id]
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                      }`}
                    >
                      {dispatched[gift.id] ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Dispatched
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-3.5 h-3.5" /> Send WhatsApp
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Window 10 Vendor Discount Hub */}
      <VendorBanners />
    </div>
  );
}

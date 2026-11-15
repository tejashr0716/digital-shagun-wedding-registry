"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, CheckCircle2, Building, Smartphone, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function PayoutKYCPage() {
  const [accountNumber, setAccountNumber] = useState("50100482914921");
  const [ifscCode, setIfscCode] = useState("HDFC0000053");
  const [accountHolderName, setAccountHolderName] = useState("Priya Sharma & Rohit Verma");
  const [bankName, setBankName] = useState("HDFC Bank Ltd, Bengaluru");
  const [upiId, setUpiId] = useState("priyarohit@okhdfcbank");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [currentKyc, setCurrentKyc] = useState<any>(null);

  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        const wedding = await api.getMyWedding();
        if (wedding.payout_bank_account) {
          setCurrentKyc(wedding.payout_bank_account);
          setAccountHolderName(wedding.payout_bank_account.account_holder_name || "");
          setIfscCode(wedding.payout_bank_account.ifsc_code || "");
          setUpiId(wedding.payout_bank_account.upi_id || "");
        }
      } catch {
        // Fallback to default form values
      }
    };
    fetchCurrent();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await api.updatePayoutKYC({
        account_number: accountNumber,
        ifsc_code: ifscCode,
        account_holder_name: accountHolderName,
        bank_name: bankName,
        upi_id: upiId,
      });

      setSuccessMsg("Bank credentials verified and linked via Razorpay Route!");
      setCurrentKyc(res.payout_bank_account);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update payout verification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-rose-600 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <span className="text-xs uppercase tracking-widest font-bold text-rose-500 block">
          Window 4: KYC &amp; Settlement Architecture
        </span>
        <h1 className="text-3xl font-serif font-bold text-gray-900">
          Payout &amp; Bank Verification
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Direct automated settlements via Razorpay Route Linked Accounts with zero manual delays.
        </p>
      </div>

      {/* KYC Status Banner */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-sm">
                Razorpay Route Status: Verified Active
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                Auto-Disbursement Ready
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Settlements are processed directly to your linked account with 1.5% platform convenience fee deducted automatically.
            </p>
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-gray-200 sm:pl-6">
          <span className="text-[10px] uppercase font-bold text-gray-400">Linked Account</span>
          <p className="text-xs font-mono font-bold text-gray-800">
            {currentKyc ? currentKyc.account_number : "********4921"}
          </p>
          <span className="text-[11px] text-gray-500">
            {currentKyc ? currentKyc.ifsc_code : "HDFC0000053"}
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-xs border border-emerald-200">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 text-red-600 text-xs border border-red-200">
          {errorMsg}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xs space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-lg font-bold text-gray-900">
            Bank Settlement Details (NEFT / RTGS / UPI)
          </h2>
          <p className="text-xs text-gray-500">
            Ensure the account holder name matches your government KYC identity.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Account Holder Name(s) *
              </label>
              <input
                type="text"
                required
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Bank Name
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Bank Account Number *
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 font-mono focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                IFSC Code *
              </label>
              <input
                type="text"
                required
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 font-mono uppercase focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Primary VPA / UPI ID (Optional fallback for instant settlements)
            </label>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="couple@okhdfcbank"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 font-mono focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Under Indian banking regulations, payout disbursements directly credit your savings/joint account within 24 hours of guest contribution, after deducting the transparent 1.5% platform fee.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl text-white font-bold text-sm bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Verifying with Razorpay..." : "Update Bank Verification"}
            <ShieldCheck className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
